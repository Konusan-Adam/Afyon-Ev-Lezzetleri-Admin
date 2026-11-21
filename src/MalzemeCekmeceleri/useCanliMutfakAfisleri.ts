import { useState, useEffect, useMemo } from 'react';
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
  sira?: number;
  red_nedeni?: string;
  red_gerekcesi?: string;
  butonMetni?: string;
  butonHedefi?: string;
  gorselTipi?: 'arka_plan' | 'sag_taraf';
  guncelleme_tarihi?: string;
}

export type AfisDurumKodu = 'yayinda' | 'onayli_pasif' | 'reddedildi' | 'beklemede';

export function afisDurumunuGetir(afis: MutfakAfisiKaydi): AfisDurumKodu {
  if (afis.onayli_mi === true) {
    return afis.aktif_mi === true ? 'yayinda' : 'onayli_pasif';
  }
  const redSebebi = afis.red_nedeni || afis.red_gerekcesi || '';
  if (afis.onay_durumu === 'reddedildi' || redSebebi.trim().length > 0) {
    return 'reddedildi';
  }
  return 'beklemede';
}

export function afisleriSirala(liste: MutfakAfisiKaydi[]): MutfakAfisiKaydi[] {
  return [...liste].sort((a, b) => {
    const siraA = Number(a.sira ?? 999);
    const siraB = Number(b.sira ?? 999);
    if (siraA !== siraB) return siraA - siraB;
    return (b.guncelleme_tarihi || '').localeCompare(a.guncelleme_tarihi || '');
  });
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
            setAfisler(afisleriSirala(veri || []));
            setYukleniyor(false);
          }
        })
        .catch(() => {
          if (aktif) setYukleniyor(false);
        });

      durdur = koleksiyonuCanliDinle<MutfakAfisiKaydi>('mutfak_afisleri', (veri) => {
        if (aktif) {
          setAfisler(afisleriSirala(veri || []));
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

  const bekleyenSayisi = useMemo(
    () => afisler.filter((a) => afisDurumunuGetir(a) === 'beklemede').length,
    [afisler]
  );

  // Vitrinde yalnızca admin onaylı (onayli_mi === true) ve aktif (aktif_mi === true) afişler görünür
  const vitrinAfisleri = useMemo(
    () =>
      afisleriSirala(
        afisler.filter((a) => a.onayli_mi === true && a.aktif_mi === true)
      ),
    [afisler]
  );

  return { afisler, setAfisler, vitrinAfisleri, bekleyenSayisi, yukleniyor };
}
