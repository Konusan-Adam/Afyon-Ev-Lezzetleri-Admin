import { useState, useEffect } from 'react';
import { HakedisCekimTalebi } from '@/src/veritabani/GercekVeriYardimcisi';
import {
  koleksiyonuCanliDinle,
  koleksiyonGetir,
  belgeKaydet,
  belgeSil
} from '@/src/veritabani/FirebaseKoleksiyonServisi';
import { patronBildirimiEkle } from './PatronBildirimServisi';
import { hakedistenFaturaKes } from './Finans/otomatikFaturaUretici';
import { talepOdemeHareketiKaydet } from './Finans/hakedisDefteriServisi';

export const BASLANGIC_HAKEDIS_TALEPLERI: HakedisCekimTalebi[] = [];

export function useCanliHakedisTalepleri() {
  const [talepler, setTalepler] = useState<HakedisCekimTalebi[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    let aktif = true;
    const abonelikDurdur = koleksiyonuCanliDinle<HakedisCekimTalebi>('hakedis_talepleri', (guncel) => {
      if (!aktif) return;
      setTalepler((guncel || []).filter(t => t.id !== 'hak-1' && t.id !== 'hak-2'));
      setYukleniyor(false);
    });

    koleksiyonGetir<HakedisCekimTalebi>('hakedis_talepleri').then((mevcut) => {
      if (!aktif) return;
      if (mevcut?.some(t => t.id === 'hak-1' || t.id === 'hak-2')) {
        belgeSil('hakedis_talepleri', 'hak-1').catch(() => {});
        belgeSil('hakedis_talepleri', 'hak-2').catch(() => {});
      }
      setTalepler((mevcut || []).filter(t => t.id !== 'hak-1' && t.id !== 'hak-2'));
      setYukleniyor(false);
    }).catch(() => { if (aktif) setYukleniyor(false); });

    return () => { aktif = false; abonelikDurdur(); };
  }, []);

  const talepDurumGuncelle = async (
    talepId: string,
    yeniDurum: 'odendi' | 'reddedildi' | 'beklemede',
    not?: string,
    otomatikPusulaKes = true
  ): Promise<boolean> => {
    const guncel = talepler.find(t => t.id === talepId);
    if (!guncel) return false;

    const paket: HakedisCekimTalebi = {
      ...guncel,
      durum: yeniDurum,
      odeme_tarihi: yeniDurum === 'odendi' ? new Date().toLocaleString('tr-TR') : guncel.odeme_tarihi,
      dekont_notu: yeniDurum === 'odendi' ? (not || guncel.dekont_notu) : guncel.dekont_notu,
      red_gerekcesi: yeniDurum === 'reddedildi' ? not : undefined
    };

    if (yeniDurum === 'odendi' && otomatikPusulaKes) {
      const fatura = await hakedistenFaturaKes(paket);
      paket.otomatik_fatura_id = fatura.id;
    }

    setTalepler(onceki => onceki.map(t => t.id === talepId ? paket : t));
    try {
      await belgeKaydet('hakedis_talepleri', talepId, paket);
      if (yeniDurum === 'odendi') {
        talepOdemeHareketiKaydet(paket).catch(() => {});
      }
      return true;
    } catch (err) {
      console.warn('Hakediş durum güncelleme hatası:', err);
      return false;
    }
  };

  const topluTalepOde = async (
    seciliIdler: string[],
    partiNo: string,
    dekontNotu: string,
    otomatikPusulaKes = true
  ): Promise<number> => {
    const tarihMetni = new Date().toLocaleString('tr-TR');
    let islenenSayi = 0;

    for (const id of seciliIdler) {
      const hedef = talepler.find(t => t.id === id && t.durum === 'beklemede');
      if (!hedef) continue;

      const paket: HakedisCekimTalebi = {
        ...hedef,
        durum: 'odendi',
        odeme_tarihi: tarihMetni,
        toplu_parti_no: partiNo,
        dekont_notu: dekontNotu || `Toplu Banka Ödemesi (${partiNo})`
      };

      if (otomatikPusulaKes) {
        const fatura = await hakedistenFaturaKes(paket, partiNo);
        paket.otomatik_fatura_id = fatura.id;
      }

      await belgeKaydet('hakedis_talepleri', id, paket);
      talepOdemeHareketiKaydet(paket).catch(() => {});
      setTalepler(onceki => onceki.map(t => t.id === id ? paket : t));
      islenenSayi++;
    }
    return islenenSayi;
  };

  const yeniTalepOlustur = async (yeni: HakedisCekimTalebi): Promise<boolean> => {
    setTalepler(onceki => [yeni, ...onceki]);
    try {
      await belgeKaydet('hakedis_talepleri', yeni.id, yeni);
      patronBildirimiEkle(
        'hakedis_talebi',
        'Yeni Hakediş Çekim Talebi 💰',
        `${yeni.mutfak_adi || yeni.kurye_adi || 'Mutfak / Kurye'} tarafından ${yeni.tutar} ₺ çekim talebi iletildi.`,
        yeni.id
      );
      return true;
    } catch (err) {
      console.warn('Yeni hakediş talebi kaydetme hatası:', err);
      return false;
    }
  };

  return { talepler, yukleniyor, talepDurumGuncelle, topluTalepOde, yeniTalepOlustur };
}
