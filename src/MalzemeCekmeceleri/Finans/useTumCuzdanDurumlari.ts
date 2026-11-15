import { useState, useEffect, useMemo } from 'react';
import { belgeGetir, koleksiyonGetir, koleksiyonuCanliDinle } from '@/src/veritabani/FirebaseKoleksiyonServisi';
import { HakedisCekimTalebi } from '@/src/veritabani/GercekVeriYardimcisi';
import { KomisyonAyarTipi } from '@/src/veritabani/VeriTipleri';
import { komisyonHesapla } from '@/src/MalzemeCekmeceleri/komisyonServisi';
import { HakedisLimitAyarlari } from './hakedisLimitServisi';
import {
  HakedisHareketi,
  hareketlerdenBakiyeHesapla,
  siparisKuryeUcretiBul
} from './hakedisDefteriTipleri';

export interface CuzdanLimitSatiri {
  id: string;
  ad: string;
  rol: 'mutfak' | 'kurye';
  toplamHakEdilen: number;
  odenenToplam: number;
  bekleyenToplam: number;
  cekilebilirBakiye: number;
  altLimit: number;
  siniraUlastiMi: boolean;
  kalanTutar: number;
  dolulukYuzdesi: number;
  iban: string;
  tcknVkn: string;
}

export function useTumCuzdanDurumlari(
  talepler: HakedisCekimTalebi[],
  limitler: HakedisLimitAyarlari
): CuzdanLimitSatiri[] {
  const [mutfaklar, setMutfaklar] = useState<any[]>([]);
  const [kullanicilar, setKullanicilar] = useState<any[]>([]);
  const [siparisler, setSiparisler] = useState<any[]>([]);
  const [komisyonAyarlari, setKomisyonAyarlari] = useState<KomisyonAyarTipi[]>([]);
  const [hareketler, setHareketler] = useState<HakedisHareketi[]>([]);
  const [tabanKuryeUcreti, setTabanKuryeUcreti] = useState<number>(70);

  useEffect(() => {
    koleksiyonGetir<any>('mutfaklar').then(setMutfaklar).catch(() => {});
    koleksiyonGetir<any>('kullanicilar').then(setKullanicilar).catch(() => {});
    koleksiyonGetir<any>('siparisler').then(setSiparisler).catch(() => {});
    koleksiyonGetir<KomisyonAyarTipi>('komisyon_ayarlari').then(setKomisyonAyarlari).catch(() => {});
    koleksiyonGetir<HakedisHareketi>('hakedis_hareketleri').then(setHareketler).catch(() => {});
    belgeGetir<any>('genel_ayarlar', 'genel_ayarlar')
      .then((ayar) => {
        if (Number(ayar?.taban_ucret) > 0) setTabanKuryeUcreti(Number(ayar.taban_ucret));
      })
      .catch(() => {});

    const d1 = koleksiyonuCanliDinle<any>('mutfaklar', setMutfaklar);
    const d2 = koleksiyonuCanliDinle<any>('kullanicilar', setKullanicilar);
    const d3 = koleksiyonuCanliDinle<any>('siparisler', setSiparisler);
    const d4 = koleksiyonuCanliDinle<HakedisHareketi>('hakedis_hareketleri', setHareketler);
    return () => { d1(); d2(); d3(); d4(); };
  }, []);

  return useMemo(() => {
    const satirlar: CuzdanLimitSatiri[] = [];
    const mutfakDefterSiparisIdler = new Set(
      hareketler.filter((h) => h.rol === 'mutfak' && h.hareket_tipi === 'siparis_hakedis' && h.siparis_id).map((h) => h.siparis_id)
    );
    const kuryeDefterSiparisIdler = new Set(
      hareketler.filter((h) => h.rol === 'kurye' && h.hareket_tipi === 'siparis_hakedis' && h.siparis_id).map((h) => h.siparis_id)
    );

    for (const m of mutfaklar) {
      const mId = m.id || m.kimlik;
      const mAd = m.ad || m.mutfak_adi || 'Ev Mutfağı';
      const defter = hareketlerdenBakiyeHesapla(hareketler, mId, 'mutfak');
      const kayitsizMutfakSip = siparisler.filter(
        (s) =>
          (s.mutfak_id === mId || s.mutfak_adi === mAd) &&
          s.durum !== 'iptal' &&
          !mutfakDefterSiparisIdler.has(s.id) &&
          !mutfakDefterSiparisIdler.has(s.siparis_kodu)
      );
      const kayitsizHakEdilen = kayitsizMutfakSip.reduce((acc, s) => {
        const toplam = Number(s.toplam_tutar || s.toplamTutar || 0);
        const teslimat = Number(s.teslimat_ucreti || s.teslimatUcreti || 0);
        const tutar = teslimat > 0 && toplam > teslimat ? toplam - teslimat : toplam;
        const k = komisyonHesapla(tutar, komisyonAyarlari, mId);
        return acc + (k.komisyonTutari > 0 || k.platformBedeli > 0 ? k.netHakedis : Math.round(tutar * 0.9));
      }, 0);

      const toplamHakEdilen = Math.round(defter.netHakEdilen + kayitsizHakEdilen);
      const ilgiliTalepler = talepler.filter((t) => t.mutfak_id === mId || (t.rol_tipi === 'mutfak' && t.mutfak_adi === mAd));
      const talepOdenenToplam = ilgiliTalepler.filter((t) => t.durum === 'odendi').reduce((a, t) => a + t.tutar, 0);
      const odenenToplam = Math.max(defter.odenenCikis, talepOdenenToplam);
      const bekleyenToplam = ilgiliTalepler.filter((t) => t.durum === 'beklemede').reduce((a, t) => a + t.tutar, 0);
      const cekilebilirBakiye = Math.max(0, Math.round(toplamHakEdilen - odenenToplam - bekleyenToplam));
      const altLimit = limitler.mutfakAltLimit;
      satirlar.push({
        id: mId, ad: mAd, rol: 'mutfak', toplamHakEdilen, odenenToplam, bekleyenToplam,
        cekilebilirBakiye, altLimit, siniraUlastiMi: cekilebilirBakiye >= altLimit,
        kalanTutar: Math.max(0, altLimit - cekilebilirBakiye),
        dolulukYuzdesi: altLimit > 0 ? Math.min(100, Math.round((cekilebilirBakiye / altLimit) * 100)) : 100,
        iban: m.iban || ilgiliTalepler[0]?.iban || '', tcknVkn: m.tckn_vkn || ilgiliTalepler[0]?.tckn_vkn || ''
      });
    }

    for (const k of kullanicilar.filter((u) => u.rol === 'kurye')) {
      const kId = k.id || k.kimlik;
      const kAd = k.ad_soyad || k.ad || 'Kurye';
      const defter = hareketlerdenBakiyeHesapla(hareketler, kId, 'kurye');
      const kayitsizKuryeSip = siparisler.filter(
        (s) =>
          (s.kurye_id === kId || s.atananKurye === kAd) &&
          (s.durum === 'teslim_edildi' || s.asama === 'teslim_edildi') &&
          !kuryeDefterSiparisIdler.has(s.id) &&
          !kuryeDefterSiparisIdler.has(s.siparis_kodu)
      );
      const kayitsizHakEdilen = kayitsizKuryeSip.reduce(
        (acc, s) => acc + siparisKuryeUcretiBul(s, tabanKuryeUcreti),
        0
      );
      const toplamHakEdilen =
        defter.netHakEdilen > 0 || kayitsizHakEdilen > 0
          ? Math.round(defter.netHakEdilen + kayitsizHakEdilen)
          : Math.round(Number(k.bakiye || 0));

      const ilgiliTalepler = talepler.filter((t) => t.kurye_id === kId || (t.rol_tipi === 'kurye' && t.kurye_adi === kAd));
      const talepOdenenToplam = ilgiliTalepler.filter((t) => t.durum === 'odendi').reduce((a, t) => a + t.tutar, 0);
      const odenenToplam = Math.max(defter.odenenCikis, talepOdenenToplam);
      const bekleyenToplam = ilgiliTalepler.filter((t) => t.durum === 'beklemede').reduce((a, t) => a + t.tutar, 0);
      const cekilebilirBakiye = Math.max(0, Math.round(toplamHakEdilen - odenenToplam - bekleyenToplam));
      const altLimit = limitler.kuryeAltLimit;
      satirlar.push({
        id: kId, ad: kAd, rol: 'kurye', toplamHakEdilen, odenenToplam, bekleyenToplam,
        cekilebilirBakiye, altLimit, siniraUlastiMi: cekilebilirBakiye >= altLimit,
        kalanTutar: Math.max(0, altLimit - cekilebilirBakiye),
        dolulukYuzdesi: altLimit > 0 ? Math.min(100, Math.round((cekilebilirBakiye / altLimit) * 100)) : 100,
        iban: k.iban || ilgiliTalepler[0]?.iban || '', tcknVkn: k.tckn_vkn || ilgiliTalepler[0]?.tckn_vkn || ''
      });
    }

    return satirlar.sort((a, b) => Number(b.siniraUlastiMi) - Number(a.siniraUlastiMi) || b.cekilebilirBakiye - a.cekilebilirBakiye);
  }, [mutfaklar, kullanicilar, siparisler, komisyonAyarlari, hareketler, tabanKuryeUcreti, talepler, limitler]);
}
