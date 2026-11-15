import { useState, useEffect } from 'react';
import { SubeSiparisi } from '@/src/veritabani/VeriTipleri';
import { canliFirebaseAktifMi, belgeKaydet, koleksiyonGetir, koleksiyonuCanliDinle } from '@/src/veritabani/FirebaseKoleksiyonServisi';
import { patronZilSesiCal, patronBildirimiEkle } from '@/src/MalzemeCekmeceleri/PatronBildirimServisi';
import { BASLANGIC_SUBE_SIPARISLERI } from './subeSiparisVerileri';
import { siparistenOtomatikBelgeKes } from '@/src/MalzemeCekmeceleri/Finans/otomatikFaturaUretici';

export function subeSiparisServisi(seciliSubeId?: string) {
  const [siparisler, setSiparisler] = useState<SubeSiparisi[]>(BASLANGIC_SUBE_SIPARISLERI);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    let durdur = () => {};
    if (canliFirebaseAktifMi()) {
      koleksiyonGetir<SubeSiparisi>('sube_siparisleri').then((liste) => {
        if (liste?.length) setSiparisler(liste);
        else BASLANGIC_SUBE_SIPARISLERI.forEach(s => belgeKaydet('sube_siparisleri', s.id, s));
        setYukleniyor(false);
      });
      durdur = koleksiyonuCanliDinle<SubeSiparisi>('sube_siparisleri', (guncel) => {
        if (guncel?.length) setSiparisler(guncel);
      });
    } else {
      setYukleniyor(false);
    }
    return () => durdur();
  }, []);

  const durumGuncelle = async (siparisId: string, durum: SubeSiparisi['durum']) => {
    setSiparisler(prev => prev.map(s => s.id === siparisId ? { ...s, durum } : s));
    if (canliFirebaseAktifMi()) await belgeKaydet('sube_siparisleri', siparisId, { durum });
    if (durum === 'teslim_edildi') {
      const hedef = siparisler.find(s => s.id === siparisId);
      if (hedef) siparistenOtomatikBelgeKes({ ...hedef, durum: 'teslim_edildi' }).catch(() => {});
    }
  };

  const siparisEkle = async (yeni: Partial<SubeSiparisi> & Pick<SubeSiparisi, 'sube_id' | 'sube_adi' | 'musteri_adi' | 'musteri_telefon' | 'toplam_tutar'>) => {
    const id = `subesip-${Date.now()}`;
    const kod = `SB-${Math.floor(1000 + Math.random() * 9000)}`;
    const pin = String(Math.floor(1000 + Math.random() * 9000));
    const veri: SubeSiparisi = {
      id,
      siparis_kodu: kod,
      siparis_no: kod,
      sube_id: yeni.sube_id,
      sube_adi: yeni.sube_adi,
      musteri_adi: yeni.musteri_adi,
      musteri_telefon: yeni.musteri_telefon,
      durum: yeni.durum || 'hazirlaniyor',
      toplam_tutar: yeni.toplam_tutar,
      odeme_yontemi: yeni.odeme_yontemi || 'kapida_nakit',
      pin_kodu: yeni.pin_kodu || pin,
      tahmini_hazirlanma_dakika: yeni.tahmini_hazirlanma_dakika || 15,
      olusturma_tarihi: new Date().toISOString(),
      urunler: yeni.urunler || []
    };
    setSiparisler(prev => [veri, ...prev]);
    if (canliFirebaseAktifMi()) await belgeKaydet('sube_siparisleri', id, veri);

    patronZilSesiCal();
    patronBildirimiEkle(
      'yeni_siparis',
      `🛍️ Yeni Şube Siparişi: #${kod}`,
      `${veri.sube_adi} için ${veri.toplam_tutar} ₺ sipariş alındı.`,
      id,
      { hedefSekme: 'sube_siparisleri', subeId: veri.sube_id }
    );
  };

  const filtrelenmis = seciliSubeId 
    ? siparisler.filter(s => s.sube_id === seciliSubeId) 
    : siparisler;

  return { siparisler: filtrelenmis, yukleniyor, durumGuncelle, siparisEkle };
}
