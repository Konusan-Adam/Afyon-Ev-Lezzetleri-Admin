import { useState, useEffect } from 'react';
import { canliFirebaseAktifMi } from '@/src/veritabani/FirebaseIstemcisi';
import { koleksiyonGetir, koleksiyonuCanliDinle } from '@/src/veritabani/FirebaseKoleksiyonServisi';

export interface MutfakAfisiKaydi {
  id: string;
  mutfak_id: string;
  mutfak_adi?: string;
  baslik: string;
  aciklama?: string;
  rozet?: string;
  gorsel_url: string;
  aktif_mi?: boolean;
  onay_durumu?: 'beklemede' | 'onaylandi' | 'reddedildi';
  onayli_mi?: boolean;
  red_gerekcesi?: string;
  guncelleme_tarihi?: string;
}

export function useCanliMutfakAfisleri() {
  const [afisler, setAfisler] = useState<MutfakAfisiKaydi[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    let aktif = true;
    let durdur = () => {};

    if (canliFirebaseAktifMi()) {
      koleksiyonGetir<MutfakAfisiKaydi>('mutfak_afisleri')
        .then((veri) => {
          if (aktif) {
            setAfisler(veri || []);
            setYukleniyor(false);
          }
        })
        .catch(() => {
          if (aktif) setYukleniyor(false);
        });

      durdur = koleksiyonuCanliDinle<MutfakAfisiKaydi>('mutfak_afisleri', (veri) => {
        if (aktif) {
          setAfisler(veri || []);
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

  const bekleyenSayisi = afisler.filter(
    (a) => !a.onay_durumu || a.onay_durumu === 'beklemede'
  ).length;

  return { afisler, setAfisler, bekleyenSayisi, yukleniyor };
}
