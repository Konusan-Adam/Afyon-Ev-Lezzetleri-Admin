import { useState, useEffect, useMemo } from 'react';
import { koleksiyonGetir, koleksiyonuCanliDinle } from '@/src/veritabani/FirebaseKoleksiyonServisi';
import { HakedisCekimTalebi } from '@/src/veritabani/GercekVeriYardimcisi';
import { KomisyonAyarTipi } from '@/src/veritabani/VeriTipleri';
import { komisyonHesapla } from '@/src/MalzemeCekmeceleri/komisyonServisi';
import { HakedisLimitAyarlari } from './hakedisLimitServisi';

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

  useEffect(() => {
    koleksiyonGetir<any>('mutfaklar').then(setMutfaklar).catch(() => {});
    koleksiyonGetir<any>('kullanicilar').then(setKullanicilar).catch(() => {});
    koleksiyonGetir<any>('siparisler').then(setSiparisler).catch(() => {});
    koleksiyonGetir<KomisyonAyarTipi>('komisyon_ayarlari').then(setKomisyonAyarlari).catch(() => {});

    const d1 = koleksiyonuCanliDinle<any>('mutfaklar', setMutfaklar);
    const d2 = koleksiyonuCanliDinle<any>('kullanicilar', setKullanicilar);
    const d3 = koleksiyonuCanliDinle<any>('siparisler', setSiparisler);
    return () => { d1(); d2(); d3(); };
  }, []);

  return useMemo(() => {
    const satirlar: CuzdanLimitSatiri[] = [];

    for (const m of mutfaklar) {
      const mId = m.id || m.kimlik;
      const mAd = m.ad || m.mutfak_adi || 'Ev Mutfağı';
      const mutfakSip = siparisler.filter(
        (s) => (s.mutfak_id === mId || s.mutfak_adi === mAd) && s.durum !== 'iptal'
      );
      const toplamHakEdilen = mutfakSip.reduce((acc, s) => {
        const tutar = Number(s.toplam_tutar || s.toplamTutar || 0);
        const k = komisyonHesapla(tutar, komisyonAyarlari, mId);
        return acc + (k.komisyonTutari > 0 ? k.netHakedis : Math.round(tutar * 0.9));
      }, 0);
      const ilgiliTalepler = talepler.filter((t) => t.mutfak_id === mId || (t.rol_tipi === 'mutfak' && t.mutfak_adi === mAd));
      const odenenToplam = ilgiliTalepler.filter((t) => t.durum === 'odendi').reduce((a, t) => a + t.tutar, 0);
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
      const kuryeSip = siparisler.filter((s) => (s.kurye_id === kId || s.atananKurye === kAd) && (s.durum === 'teslim_edildi' || s.asama === 'teslim_edildi'));
      const toplamHakEdilen = typeof k.bakiye === 'number' && k.bakiye > 0 ? k.bakiye : (k.tamamlanan_siparis || k.toplam_teslimat || kuryeSip.length) * 45;
      const ilgiliTalepler = talepler.filter((t) => t.kurye_id === kId || (t.rol_tipi === 'kurye' && t.kurye_adi === kAd));
      const odenenToplam = ilgiliTalepler.filter((t) => t.durum === 'odendi').reduce((a, t) => a + t.tutar, 0);
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
  }, [mutfaklar, kullanicilar, siparisler, komisyonAyarlari, talepler, limitler]);
}
