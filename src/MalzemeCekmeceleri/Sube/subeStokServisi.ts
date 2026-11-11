import { useState, useEffect } from 'react';
import { SubeStokTipi } from '@/src/veritabani/VeriTipleri';
import { canliFirebaseAktifMi, belgeKaydet, belgeSil, koleksiyonGetir, koleksiyonuCanliDinle } from '@/src/veritabani/FirebaseKoleksiyonServisi';
import { patronZilSesiCal, patronBildirimiEkle } from '@/src/MalzemeCekmeceleri/PatronBildirimServisi';
import { BASLANGIC_SUBE_STOKLARI } from './subeStokVerileri';

export function subeStokServisi(seciliSubeId?: string) {
  const [stoklar, setStoklar] = useState<SubeStokTipi[]>(BASLANGIC_SUBE_STOKLARI);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    let durdur = () => {};
    if (canliFirebaseAktifMi()) {
      koleksiyonGetir<SubeStokTipi>('sube_stoklari').then((liste) => {
        if (liste?.length) setStoklar(liste);
        else BASLANGIC_SUBE_STOKLARI.forEach(s => belgeKaydet('sube_stoklari', s.id, s));
        setYukleniyor(false);
      });
      durdur = koleksiyonuCanliDinle<SubeStokTipi>('sube_stoklari', (guncel) => {
        if (guncel?.length) setStoklar(guncel);
      });
    } else {
      setYukleniyor(false);
    }
    return () => durdur();
  }, []);

  const stokGuncelle = async (stokId: string, degisim: Partial<SubeStokTipi>) => {
    const eski = stoklar.find(s => s.id === stokId);
    const yeni = { ...eski, ...degisim, guncellenme_tarihi: 'Az önce' } as SubeStokTipi;
    setStoklar(prev => prev.map(s => s.id === stokId ? yeni : s));
    if (canliFirebaseAktifMi()) await belgeKaydet('sube_stoklari', stokId, yeni);

    if (degisim.stok_adedi !== undefined && degisim.stok_adedi <= 0) {
      patronZilSesiCal();
      patronBildirimiEkle('genel', '⚠️ Tezgâh Stoğu Tükendi!', `${yeni.ad || yeni.urun_adi} ürününün stoğu sıfırlandı.`, stokId);
    }
  };

  const stokEkle = async (yeni: Omit<SubeStokTipi, 'id'>) => {
    const id = `sube-urun-${Date.now()}`;
    const veri = { ...yeni, id, marka: 'Afyon Ev Lezzetleri' as const, guncellenme_tarihi: 'Şimdi' };
    setStoklar(prev => [...prev, veri]);
    if (canliFirebaseAktifMi()) await belgeKaydet('sube_stoklari', id, veri);
  };

  const stokSil = async (id: string) => {
    setStoklar(prev => prev.filter(s => s.id !== id));
    if (canliFirebaseAktifMi()) await belgeSil('sube_stoklari', id);
  };

  const filtrelenmisStoklar = seciliSubeId 
    ? stoklar.filter(s => s.sube_id === seciliSubeId) 
    : stoklar;

  return { stoklar: filtrelenmisStoklar, yukleniyor, stokGuncelle, stokEkle, stokSil };
}
