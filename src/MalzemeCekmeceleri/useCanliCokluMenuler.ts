import { useState, useEffect } from 'react';
import { canliFirebaseAktifMi } from '@/src/veritabani/FirebaseIstemcisi';
import {
  belgeKaydet,
  koleksiyonGetir,
  koleksiyonuCanliDinle,
} from '@/src/veritabani/FirebaseKoleksiyonServisi';

export interface CokluMenuKaydi {
  id: string;
  mutfak_id?: string;
  mutfak_adi?: string;
  baslik?: string;
  ad?: string;
  menu_adi?: string;
  aciklama?: string;
  kategori?: string;
  fiyat?: number;
  toplam_fiyat?: number;
  indirimli_fiyat?: number;
  gorsel_url?: string;
  urunler?: any[];
  yemekler?: any[];
  kalemler?: any[];
  ogeler?: any[];
  aktif_mi?: boolean;
  onay_durumu?: 'beklemede' | 'onaylandi' | 'reddedildi';
  onayli_mi?: boolean;
  red_gerekcesi?: string;
  olusturma_tarihi?: string;
  guncelleme_tarihi?: string;
}

export function useCanliCokluMenuler() {
  const [menuler, setMenuler] = useState<CokluMenuKaydi[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    let aktif = true;
    let durdur = () => {};

    if (canliFirebaseAktifMi()) {
      koleksiyonGetir<CokluMenuKaydi>('coklu_menuler')
        .then((veri) => {
          if (aktif) {
            setMenuler(veri || []);
            setYukleniyor(false);
          }
        })
        .catch(() => {
          if (aktif) setYukleniyor(false);
        });

      durdur = koleksiyonuCanliDinle<CokluMenuKaydi>('coklu_menuler', (veri) => {
        if (aktif) {
          setMenuler(veri || []);
          setYukleniyor(false);
        }
      });
    } else {
      setYukleniyor(false);
    }

    return () => {
      aktif = false;
      durdur();
    };
  }, []);

  const menuOnayGuncelle = async (
    menuId: string,
    onayli: boolean,
    redGerekcesi = ''
  ) => {
    const yeniDurum: 'onaylandi' | 'reddedildi' = onayli ? 'onaylandi' : 'reddedildi';
    const guncelAlanlar = {
      onay_durumu: yeniDurum,
      onayli_mi: onayli,
      red_gerekcesi: onayli ? '' : redGerekcesi,
      guncelleme_tarihi: new Date().toISOString(),
    };

    setMenuler((onceki) =>
      onceki.map((m) => (m.id === menuId ? { ...m, ...guncelAlanlar } : m))
    );

    if (canliFirebaseAktifMi()) {
      try {
        await belgeKaydet('coklu_menuler', menuId, guncelAlanlar);
      } catch (err) {
        console.warn('Çoklu menü onay güncelleme hatası:', err);
      }
    }
  };

  const bekleyenSayisi = menuler.filter(
    (m) => !m.onay_durumu || m.onay_durumu === 'beklemede'
  ).length;

  return { menuler, setMenuler, bekleyenSayisi, yukleniyor, menuOnayGuncelle };
}
