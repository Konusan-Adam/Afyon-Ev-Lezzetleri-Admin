import { PaytrOperasyonAyarlari } from './paytrAyarServisi';

export interface PaytrTokenSonucu {
  basarili: boolean;
  demoMod?: boolean;
  yapilandirmaEksik?: boolean;
  merchantOid?: string;
  token?: string;
  iframeUrl?: string;
  tutar?: number;
  mesaj?: string;
}

export interface PaytrSepetSatiri {
  ad: string;
  fiyat: number;
  adet: number;
}

export async function paytrTokenOlustur(veri: {
  tutar: number;
  musteriAdi: string;
  musteriTelefon: string;
  adres: string;
  eposta?: string;
  elemanlar: PaytrSepetSatiri[];
  ayarlar?: Partial<PaytrOperasyonAyarlari>;
}): Promise<PaytrTokenSonucu> {
  try {
    const yanit = await fetch('/api/paytr/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...veri,
        testModu: veri.ayarlar?.testModu,
        taksitAktif: veri.ayarlar?.taksitAktif,
        maksimumTaksit: veri.ayarlar?.maksimumTaksit,
        demoSimulasyonAktif: veri.ayarlar?.demoSimulasyonAktif,
        donusTabanUrl: typeof window !== 'undefined' ? window.location.origin : ''
      })
    });
    return await yanit.json();
  } catch (err: any) {
    return {
      basarili: false,
      mesaj: err?.message || 'PayTR ödeme sunucusuna bağlanılamadı.'
    };
  }
}

export async function paytrDemoSonucBildir(
  merchantOid: string,
  basarili: boolean,
  tutar: number,
  hataNedeni?: string
): Promise<boolean> {
  try {
    const yanit = await fetch('/api/paytr/demo-sonuc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ merchantOid, basarili, tutar, hataNedeni })
    });
    return yanit.ok;
  } catch {
    return false;
  }
}

export async function paytrOdemeDurumuSorgula(merchantOid: string): Promise<{
  durum: 'beklemede' | 'odendi' | 'basarisiz';
  hataNedeni?: string;
}> {
  try {
    const yanit = await fetch(`/api/paytr/durum/${encodeURIComponent(merchantOid)}`);
    if (!yanit.ok) return { durum: 'beklemede' };
    return await yanit.json();
  } catch {
    return { durum: 'beklemede' };
  }
}
