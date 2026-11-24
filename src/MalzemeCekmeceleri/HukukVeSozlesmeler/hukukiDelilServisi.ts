import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { canliFirebaseAktifMi, firebaseVeritabani } from '@/src/veritabani/FirebaseIstemcisi';
import { firestoreHatasiniYonet, IslemTipi } from '@/src/veritabani/FirebaseHataYoneticisi';
import { sha256MetinOzetiHesapla } from './hukukiDelilCiktiServisi';
import { DamgaDurumu, HukukiIslemTuru, HukukiOnayLogu } from './tipler';

const YEREL_LOGLAR_ANAHTARI = 'afyon_hukuki_onay_loglari_v2';

export interface HukukiDelilOlusturmaGirdisi {
  sozlesmeTuru: string;
  sozlesmeVersiyonu?: string;
  sozlesmeMetin?: string;
  sozlesmeMetinHash?: string;
  islemTuru: HukukiIslemTuru;
  onaylandiMi: boolean;
  ilgiliKayitId?: string;
  kullaniciKimlik?: string;
  kullaniciTelefon?: string;
  kullaniciAdSoyad?: string;
  ekDetay?: Record<string, unknown> | string;
}

export interface SunucuDogrulamaSonucu {
  basarili: boolean;
  gecerli: boolean;
  ozetHashGecerli: boolean;
  rfc3161: {
    mevcut: boolean;
    gecerliDer: boolean;
    pkiDurumu: number | null;
    onayliMi: boolean;
    ozetEslesiyorMu: boolean;
  };
  sunucuImzasiGecerli: boolean | null;
  mesaj?: string;
}

function oturumKullanicisiniOku(): {
  kullaniciKimlik?: string;
  kullaniciTelefon?: string;
  kullaniciAdSoyad?: string;
} {
  if (typeof window === 'undefined') return {};
  try {
    const ham = localStorage.getItem('afyon_oturum_kullanici');
    if (!ham) return {};
    const parsed = JSON.parse(ham);
    return {
      kullaniciKimlik: parsed?.kimlik || parsed?.id || undefined,
      kullaniciTelefon: parsed?.telefon || undefined,
      kullaniciAdSoyad: parsed?.ad_soyad || parsed?.adSoyad || undefined,
    };
  } catch {
    return {};
  }
}

function tanimsizlariTemizle<T extends Record<string, unknown>>(nesne: T): T {
  const sonuc: Record<string, unknown> = {};
  for (const anahtar of Object.keys(nesne)) {
    const deger = nesne[anahtar];
    if (deger !== undefined) {
      sonuc[anahtar] = deger;
    }
  }
  return sonuc as T;
}

function yerelLogaEkle(log: HukukiOnayLogu): void {
  if (typeof window === 'undefined') return;
  try {
    const mevcut: HukukiOnayLogu[] = JSON.parse(localStorage.getItem(YEREL_LOGLAR_ANAHTARI) || '[]');
    const guncel = [log, ...mevcut.filter((m) => m.kimlik !== log.kimlik)].slice(0, 500);
    localStorage.setItem(YEREL_LOGLAR_ANAHTARI, JSON.stringify(guncel));
  } catch {
    // Yerel depolama doluysa sessizce geç
  }
}

/**
 * Verilen işlem için SHA-256 özeti hesaplar, /api/zaman-damgasi/damgala üzerinden
 * gerçek IP + Sunucu UTC + FreeTSA RFC 3161 damgası alır ve hukuki_onay_loglari
 * koleksiyonuna yalnızca setDoc (create) ile yazar.
 */
export async function hukukiDelilDamgalaVeKaydet(
  girdi: HukukiDelilOlusturmaGirdisi
): Promise<HukukiOnayLogu> {
  const kimlik = `delil_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const oturum = oturumKullanicisiniOku();

  const kullaniciKimlik = girdi.kullaniciKimlik || oturum.kullaniciKimlik;
  const kullaniciTelefon = girdi.kullaniciTelefon || oturum.kullaniciTelefon;
  const kullaniciAdSoyad = girdi.kullaniciAdSoyad || oturum.kullaniciAdSoyad;

  const sozlesmeVersiyonu = girdi.sozlesmeVersiyonu || '1.0.0';
  const cihazBilgisi =
    typeof navigator !== 'undefined' ? String(navigator.userAgent || '').slice(0, 160) : 'Sunucu/Bilinmiyor';
  const yerelTarih = new Date().toLocaleString('tr-TR');

  const sozlesmeMetinHash =
    girdi.sozlesmeMetinHash ||
    (girdi.sozlesmeMetin ? await sha256MetinOzetiHesapla(girdi.sozlesmeMetin) : undefined);

  const kanonikVeri = {
    kimlik,
    islemTuru: girdi.islemTuru,
    sozlesmeTuru: girdi.sozlesmeTuru,
    sozlesmeVersiyonu,
    sozlesmeMetinHash: sozlesmeMetinHash || '',
    ilgiliKayitId: girdi.ilgiliKayitId || '',
    kullaniciKimlik: kullaniciKimlik || '',
    kullaniciTelefon: kullaniciTelefon || '',
    kullaniciAdSoyad: kullaniciAdSoyad || '',
    onaylandiMi: Boolean(girdi.onaylandiMi),
    ekDetay: girdi.ekDetay ?? null,
    olusturmaZamani: new Date().toISOString(),
  };

  let ozetHash = await sha256MetinOzetiHesapla(JSON.stringify(kanonikVeri));
  let tarihSaat = yerelTarih;
  let sunucuUtc: string | undefined;
  let ipAdresi = 'Bilinmiyor';
  let damgaDurumu: DamgaDurumu = 'yerel_ozet';
  let tsaSaglayici: string | undefined = 'Yerel-SHA256';
  let tsaTokenBase64: string | undefined;
  let sunucuImzasi: string | undefined;

  if (typeof fetch !== 'undefined') {
    try {
      const yanit = await fetch('/api/zaman-damgasi/damgala', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ozetHash: ozetHash || undefined,
          veri: kanonikVeri,
        }),
      });
      if (yanit.ok) {
        const sonuc = await yanit.json();
        if (sonuc?.basarili) {
          ozetHash = sonuc.ozetHash || ozetHash;
          sunucuUtc = sonuc.sunucuUtc || undefined;
          tarihSaat = sonuc.tarihSaat || yerelTarih;
          ipAdresi = sonuc.ipAdresi || 'Bilinmiyor';
          damgaDurumu = sonuc.damgaDurumu || 'sunucu_muhurlu';
          tsaSaglayici = sonuc.tsaSaglayici || 'Sunucu-HMAC-SHA256';
          tsaTokenBase64 = sonuc.tsaTokenBase64 || undefined;
          sunucuImzasi = sonuc.sunucuImzasi || undefined;
        }
      }
    } catch {
      // Sunucuya erişilemezse yerel SHA-256 özeti ile devam et
    }
  }

  const yerelLog: HukukiOnayLogu = tanimsizlariTemizle({
    kimlik,
    sozlesmeTuru: girdi.sozlesmeTuru,
    sozlesmeVersiyonu,
    islemTuru: girdi.islemTuru,
    tarihSaat,
    ipAdresi,
    cihazBilgisi,
    onaylandiMi: Boolean(girdi.onaylandiMi),
    sunucuUtc,
    ozetHash: ozetHash || undefined,
    sozlesmeMetinHash,
    tsaSaglayici,
    tsaTokenBase64,
    damgaDurumu,
    sunucuImzasi,
    ilgiliKayitId: girdi.ilgiliKayitId,
    kullaniciKimlik,
    kullaniciTelefon,
    kullaniciAdSoyad,
    ekDetay: girdi.ekDetay,
  });

  yerelLogaEkle(yerelLog);

  if (canliFirebaseAktifMi()) {
    const firestoreBelgesi = tanimsizlariTemizle({
      ...yerelLog,
      sunucuKayitZamani: serverTimestamp(),
    });
    try {
      const docRef = doc(firebaseVeritabani, 'hukuki_onay_loglari', kimlik);
      await setDoc(docRef, firestoreBelgesi);
    } catch (hata: any) {
      const mesaj = hata instanceof Error ? hata.message : String(hata);
      if (mesaj.includes('permission') || hata?.code === 'permission-denied') {
        try {
          firestoreHatasiniYonet(hata, IslemTipi.CREATE, `hukuki_onay_loglari/${kimlik}`);
        } catch (logHata) {
          console.warn('Firestore hukuki_onay_loglari yetki uyarısı:', logHata);
        }
      } else {
        console.warn('Firestore hukuki_onay_loglari yazma uyarısı:', hata);
      }
    }
  }

  return yerelLog;
}

/**
 * Bir log kaydındaki RFC 3161 (.tsr) jetonunu ve sunucu HMAC imzasını backend üzerinden doğrular.
 */
export async function sunucudaZamanDamgasiDogrula(
  log: HukukiOnayLogu
): Promise<SunucuDogrulamaSonucu> {
  if (!log.ozetHash) {
    return {
      basarili: false,
      gecerli: false,
      ozetHashGecerli: false,
      rfc3161: {
        mevcut: false,
        gecerliDer: false,
        pkiDurumu: null,
        onayliMi: false,
        ozetEslesiyorMu: false,
      },
      sunucuImzasiGecerli: null,
      mesaj: 'Kayıtta ozetHash alanı bulunmadığı için doğrulama yapılamadı.',
    };
  }

  try {
    const yanit = await fetch('/api/zaman-damgasi/dogrula', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ozetHash: log.ozetHash,
        tsaTokenBase64: log.tsaTokenBase64,
        sunucuUtc: log.sunucuUtc,
        ipAdresi: log.ipAdresi,
        sunucuImzasi: log.sunucuImzasi,
      }),
    });
    const veri = await yanit.json();
    return veri;
  } catch (hata: any) {
    return {
      basarili: false,
      gecerli: false,
      ozetHashGecerli: false,
      rfc3161: {
        mevcut: false,
        gecerliDer: false,
        pkiDurumu: null,
        onayliMi: false,
        ozetEslesiyorMu: false,
      },
      sunucuImzasiGecerli: null,
      mesaj: hata?.message || 'Doğrulama sunucusuna ulaşılamadı.',
    };
  }
}
