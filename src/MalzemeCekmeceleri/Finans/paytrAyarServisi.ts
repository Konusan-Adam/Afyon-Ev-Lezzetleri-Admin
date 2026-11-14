import { useState, useEffect } from 'react';
import { belgeGetir, belgeKaydet, koleksiyonuCanliDinle } from '@/src/veritabani/FirebaseKoleksiyonServisi';

export interface PaytrOperasyonAyarlari {
  onlineOdemeAktif: boolean;
  testModu: boolean;
  taksitAktif: boolean;
  maksimumTaksit: number;
  demoSimulasyonAktif: boolean;
  guncelleme_tarihi?: string;
}

export const VARSAYILAN_PAYTR_AYARLARI: PaytrOperasyonAyarlari = {
  onlineOdemeAktif: true,
  testModu: true,
  taksitAktif: true,
  maksimumTaksit: 0,
  demoSimulasyonAktif: true
};

export async function paytrAyarlariniGetir(): Promise<PaytrOperasyonAyarlari> {
  try {
    const kayit = await belgeGetir<PaytrOperasyonAyarlari>('genel_ayarlar', 'paytr_ayarlari');
    return kayit ? { ...VARSAYILAN_PAYTR_AYARLARI, ...kayit } : VARSAYILAN_PAYTR_AYARLARI;
  } catch {
    return VARSAYILAN_PAYTR_AYARLARI;
  }
}

export async function paytrAyarlariniKaydet(yeni: PaytrOperasyonAyarlari): Promise<boolean> {
  return belgeKaydet('genel_ayarlar', 'paytr_ayarlari', {
    ...yeni,
    guncelleme_tarihi: new Date().toISOString()
  });
}

export function useCanliPaytrAyarlari() {
  const [ayarlar, setAyarlar] = useState<PaytrOperasyonAyarlari>(VARSAYILAN_PAYTR_AYARLARI);

  useEffect(() => {
    paytrAyarlariniGetir().then(setAyarlar);
    const durdur = koleksiyonuCanliDinle<any>('genel_ayarlar', (liste) => {
      const kayit = liste.find((k) => k.id === 'paytr_ayarlari');
      if (kayit) setAyarlar({ ...VARSAYILAN_PAYTR_AYARLARI, ...kayit });
    });
    return () => durdur();
  }, []);

  return { ayarlar, paytrAyarlariniKaydet };
}

export async function paytrSunucuHazirlikGetir(): Promise<{ yapilandirildi: boolean; testModu: boolean }> {
  try {
    const yanit = await fetch('/api/paytr/hazirlik');
    return await yanit.json();
  } catch {
    return { yapilandirildi: false, testModu: true };
  }
}

export async function paytrBaglantiTestEt(testModu: boolean): Promise<{
  basarili: boolean;
  yapilandirmaEksik?: boolean;
  mesaj: string;
}> {
  try {
    const yanit = await fetch('/api/paytr/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        testModu,
        donusTabanUrl: typeof window !== 'undefined' ? window.location.origin : ''
      })
    });
    return await yanit.json();
  } catch (err: any) {
    return { basarili: false, mesaj: err?.message || 'Test isteği gönderilemedi.' };
  }
}
