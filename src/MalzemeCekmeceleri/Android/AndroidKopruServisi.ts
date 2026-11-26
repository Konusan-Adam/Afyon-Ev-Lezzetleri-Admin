import { HazirZilKimligi, webZiliniCal, webZiliniDurdur } from './ZilSesiOynatici';

export interface YerelZilTercihi {
  seciliKimlik: HazirZilKimligi;
  sesSeviyesi: number;
  ozelSesAdi?: string;
  ozelSesVeriUrl?: string;
}

export interface AndroidSurumBilgisi {
  paketKimligi: string;
  surumKodu: number;
  surumAdi: string;
  rol: string;
}

interface NativeKopruArayuzu {
  oturumAyarla?: (
    kullaniciId: string,
    adSoyad: string,
    rol: string,
    telefon: string,
    mutfakId: string,
    subeId: string
  ) => void;
  oturumKapat?: () => void;
  zilAyarla?: (seciliKimlik: string, sesSeviyesi: number, ozelSesVeriUrl: string) => void;
  zilCal?: (baslik: string, detay: string, kesintisiz: boolean, sureSn: number) => void;
  zilSustur?: () => void;
  pilOptimizasyonuIste?: () => void;
  uygulamaSurumu?: () => string;
  apkGuncelleIndirVeKur?: (indirmeUrl: string) => void;
}

const ZIL_TERCIH_ANAHTARI = 'afyon_android_zil_tercihi_v1';

const VARSAYILAN_ZIL_TERCIHI: YerelZilTercihi = {
  seciliKimlik: 'acil_siren',
  sesSeviyesi: 0.9,
};

function kopruAl(): NativeKopruArayuzu | null {
  if (typeof window === 'undefined') return null;
  const aday = (window as unknown as { AfyonAndroidKopru?: NativeKopruArayuzu }).AfyonAndroidKopru;
  return aday || null;
}

export function androidOrtamindaMi(): boolean {
  return Boolean(kopruAl());
}

export function zilAyarlariniGetir(): YerelZilTercihi {
  if (typeof window === 'undefined') return VARSAYILAN_ZIL_TERCIHI;
  try {
    const ham = localStorage.getItem(ZIL_TERCIH_ANAHTARI);
    if (!ham) return VARSAYILAN_ZIL_TERCIHI;
    const ayristirilmis = JSON.parse(ham) as Partial<YerelZilTercihi>;
    return {
      seciliKimlik: ayristirilmis.seciliKimlik || 'acil_siren',
      sesSeviyesi:
        typeof ayristirilmis.sesSeviyesi === 'number'
          ? Math.max(0.2, Math.min(1.0, ayristirilmis.sesSeviyesi))
          : 0.9,
      ozelSesAdi: ayristirilmis.ozelSesAdi,
      ozelSesVeriUrl: ayristirilmis.ozelSesVeriUrl,
    };
  } catch {
    return VARSAYILAN_ZIL_TERCIHI;
  }
}

export function zilAyarlariniKaydetVeSenkronizeEt(tercih: YerelZilTercihi): boolean {
  const guvenliTercih: YerelZilTercihi = {
    seciliKimlik: tercih.seciliKimlik,
    sesSeviyesi: Math.max(0.2, Math.min(1.0, tercih.sesSeviyesi)),
    ozelSesAdi: tercih.ozelSesAdi,
    ozelSesVeriUrl: tercih.ozelSesVeriUrl,
  };

  try {
    localStorage.setItem(ZIL_TERCIH_ANAHTARI, JSON.stringify(guvenliTercih));
  } catch {
    return false;
  }

  const kopru = kopruAl();
  if (kopru?.zilAyarla) {
    try {
      kopru.zilAyarla(
        guvenliTercih.seciliKimlik,
        guvenliTercih.sesSeviyesi,
        guvenliTercih.ozelSesVeriUrl || ''
      );
    } catch {}
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('afyon_zil_ayari_guncellendi', { detail: guvenliTercih }));
  }

  return true;
}

export function androidOturumunuSenkronizeEt(kullanici: {
  id?: string;
  kimlik?: string;
  ad_soyad?: string;
  rol?: string;
  telefon?: string;
  mutfak_id?: string;
  sube_id?: string;
} | null) {
  const kopru = kopruAl();
  if (!kopru) return;

  if (!kullanici) {
    try {
      kopru.oturumKapat?.();
    } catch {}
    return;
  }

  try {
    kopru.oturumAyarla?.(
      kullanici.id || kullanici.kimlik || '',
      kullanici.ad_soyad || '',
      kullanici.rol || 'admin',
      kullanici.telefon || '',
      kullanici.mutfak_id || '',
      kullanici.sube_id || ''
    );
    const mevcutZil = zilAyarlariniGetir();
    kopru.zilAyarla?.(
      mevcutZil.seciliKimlik,
      mevcutZil.sesSeviyesi,
      mevcutZil.ozelSesVeriUrl || ''
    );
  } catch {}
}

export function aktifZilSesiniCal(baslik?: string, detay?: string, nativeZorla = false) {
  const ayar = zilAyarlariniGetir();
  webZiliniCal(ayar.seciliKimlik, ayar.sesSeviyesi, ayar.ozelSesVeriUrl);

  if (nativeZorla) {
    const kopru = kopruAl();
    try {
      kopru?.zilCal?.(
        baslik || 'Afyon Patron Alarmı',
        detay || 'Acil işlem bekliyor.',
        true,
        20
      );
    } catch {}
  }
}

export function aktifZilSesiniSustur() {
  webZiliniDurdur();
  const kopru = kopruAl();
  try {
    kopru?.zilSustur?.();
  } catch {}
}

export function pilKisitlamasiniKaldir() {
  const kopru = kopruAl();
  try {
    kopru?.pilOptimizasyonuIste?.();
  } catch {}
}

export function uygulamaSurumuGetir(): AndroidSurumBilgisi | null {
  const kopru = kopruAl();
  if (!kopru?.uygulamaSurumu) return null;
  try {
    const ham = kopru.uygulamaSurumu();
    return JSON.parse(ham) as AndroidSurumBilgisi;
  } catch {
    return null;
  }
}

export function apkGuncelleIndirVeKur(indirmeUrl: string) {
  const kopru = kopruAl();
  if (kopru?.apkGuncelleIndirVeKur) {
    try {
      kopru.apkGuncelleIndirVeKur(indirmeUrl);
      return true;
    } catch {}
  }
  return false;
}
