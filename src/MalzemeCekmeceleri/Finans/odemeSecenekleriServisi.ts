import { useState, useEffect } from 'react';
import { belgeGetir, belgeKaydet, koleksiyonuCanliDinle } from '@/src/veritabani/FirebaseKoleksiyonServisi';

export type OdemeSecenekTipi = 'kapida_nakit' | 'kapida_kart' | 'online_cuzdan';

export interface OdemeSecenekleriAyarlari {
  kapidaNakitAktif: boolean;
  kapidaKartAktif: boolean;
  varsayilanYontem: OdemeSecenekTipi;
  guncelleme_tarihi?: string;
}

export const VARSAYILAN_ODEME_SECENEKLERI: OdemeSecenekleriAyarlari = {
  kapidaNakitAktif: true,
  kapidaKartAktif: true,
  varsayilanYontem: 'kapida_nakit',
};

export async function odemeSecenekleriniGetir(): Promise<OdemeSecenekleriAyarlari> {
  try {
    const kayit = await belgeGetir<OdemeSecenekleriAyarlari>('genel_ayarlar', 'odeme_secenekleri');
    return kayit ? { ...VARSAYILAN_ODEME_SECENEKLERI, ...kayit } : VARSAYILAN_ODEME_SECENEKLERI;
  } catch {
    return VARSAYILAN_ODEME_SECENEKLERI;
  }
}

export async function odemeSecenekleriniKaydet(yeni: OdemeSecenekleriAyarlari): Promise<boolean> {
  return belgeKaydet('genel_ayarlar', 'odeme_secenekleri', {
    ...yeni,
    guncelleme_tarihi: new Date().toISOString(),
  });
}

export function useCanliOdemeSecenekleri() {
  const [secenekler, setSecenekler] = useState<OdemeSecenekleriAyarlari>(VARSAYILAN_ODEME_SECENEKLERI);

  useEffect(() => {
    odemeSecenekleriniGetir().then(setSecenekler);
    const durdur = koleksiyonuCanliDinle<any>('genel_ayarlar', (liste) => {
      const kayit = liste.find((k) => k.id === 'odeme_secenekleri');
      if (kayit) {
        setSecenekler({ ...VARSAYILAN_ODEME_SECENEKLERI, ...kayit });
      }
    });
    return () => durdur();
  }, []);

  return { secenekler, odemeSecenekleriniKaydet };
}
