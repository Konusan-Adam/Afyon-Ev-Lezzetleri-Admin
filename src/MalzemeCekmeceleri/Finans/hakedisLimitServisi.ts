import { useState, useEffect } from 'react';
import {
  belgeKaydet,
  koleksiyonGetir,
  koleksiyonuCanliDinle
} from '@/src/veritabani/FirebaseKoleksiyonServisi';
import { hukukiDelilDamgalaVeKaydet } from '@/src/MalzemeCekmeceleri/HukukVeSozlesmeler/hukukiDelilServisi';

export interface HakedisLimitAyarlari {
  id?: string;
  mutfakAltLimit: number;
  kuryeAltLimit: number;
  guncellenme_zamani?: string;
}

export const VARSAYILAN_LIMITLER: HakedisLimitAyarlari = {
  id: 'hakedis_limitleri',
  mutfakAltLimit: 500,
  kuryeAltLimit: 300
};

export function useHakedisLimitleri() {
  const [limitler, setLimitler] = useState<HakedisLimitAyarlari>(VARSAYILAN_LIMITLER);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    let aktif = true;
    const uygula = (liste: any[]) => {
      const kayit = liste?.find((x) => x.id === 'hakedis_limitleri');
      if (kayit && aktif) {
        setLimitler({
          id: 'hakedis_limitleri',
          mutfakAltLimit: Number(kayit.mutfakAltLimit) || 500,
          kuryeAltLimit: Number(kayit.kuryeAltLimit) || 300,
          guncellenme_zamani: kayit.guncellenme_zamani
        });
      }
      if (aktif) setYukleniyor(false);
    };

    koleksiyonGetir<HakedisLimitAyarlari>('genel_ayarlar').then(uygula).catch(() => {
      if (aktif) setYukleniyor(false);
    });
    const durdur = koleksiyonuCanliDinle<HakedisLimitAyarlari>('genel_ayarlar', uygula);
    return () => { aktif = false; durdur(); };
  }, []);

  const limitleriKaydet = async (mutfakAltLimit: number, kuryeAltLimit: number): Promise<boolean> => {
    const yeni: HakedisLimitAyarlari = {
      id: 'hakedis_limitleri',
      mutfakAltLimit: Math.max(0, Number(mutfakAltLimit) || 0),
      kuryeAltLimit: Math.max(0, Number(kuryeAltLimit) || 0),
      guncellenme_zamani: new Date().toISOString()
    };
    setLimitler(yeni);
    const sonuc = await belgeKaydet('genel_ayarlar', 'hakedis_limitleri', yeni);
    if (sonuc) {
      void hukukiDelilDamgalaVeKaydet({
        islemTuru: 'ozel_onay',
        sozlesmeTuru: 'finansal_ayar_degisikligi',
        sozlesmeVersiyonu: '1.0.0',
        ilgiliKayitId: 'hakedis_limitleri',
        onaylandiMi: true,
        ekDetay: {
          ayarGrubu: 'hakedis_limitleri',
          mutfakAltLimit: yeni.mutfakAltLimit,
          kuryeAltLimit: yeni.kuryeAltLimit,
        },
      });
    }
    return sonuc;
  };

  return { limitler, yukleniyor, limitleriKaydet };
}
