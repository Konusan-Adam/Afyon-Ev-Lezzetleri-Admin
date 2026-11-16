import { canliFirebaseAktifMi } from '@/src/veritabani/FirebaseIstemcisi';
import { belgeGetir, belgeKaydet, koleksiyonGetir } from '@/src/veritabani/FirebaseKoleksiyonServisi';

export interface YedeklemeAyarlari {
  hedefUrl: string;
  otomatikYedekleme: boolean;
  otomatikPeriyot?: 'saatlik' | 'gunluk' | 'haftalik';
  sonYedeklemeZamani?: string;
  sonYedeklemeZamaniDamgasi?: number;
  apiKey?: string;
}

export const YEDEKLENECEK_KOLEKSIYONLAR = [
  'mutfaklar',
  'yemekler',
  'kullanicilar',
  'siparisler',
  'faturalar',
  'hakedis_talepleri',
  'hakedis_hareketleri',
  'mutfak_afisleri',
  'sube_siparisleri',
  'sube_stoklari',
  'gel_al_subeleri',
  'kategoriler',
  'komisyon_ayarlari',
  'kampanyalar',
  'genel_ayarlar',
  'reklam_ayarlari',
  'sistem_ayarlari',
  'hukuki_onay_loglari',
  'sozlesmeler'
] as const;

const YEREL_YEDEK_AYARLARI_KEY = 'afyon_yedekleme_ayarlari_v1';
const VARSAYILAN_URL = 'https://yedek.pazarafyon.com.tr/arsivle.php';

export const yedeklemeAyarlariniGetir = (): YedeklemeAyarlari => {
  try {
    const kayitli = localStorage.getItem(YEREL_YEDEK_AYARLARI_KEY);
    if (kayitli) {
      const parsed = JSON.parse(kayitli);
      if (parsed.hedefUrl && (parsed.hedefUrl.includes('afyonevlezzetleri.com.tr') || parsed.hedefUrl.startsWith('http://yedek'))) {
        parsed.hedefUrl = VARSAYILAN_URL;
        localStorage.setItem(YEREL_YEDEK_AYARLARI_KEY, JSON.stringify(parsed));
      }
      return parsed;
    }
  } catch {}
  return { hedefUrl: VARSAYILAN_URL, otomatikYedekleme: true, otomatikPeriyot: 'gunluk' };
};

export const bulutYedeklemeAyarlariniGetir = async (): Promise<YedeklemeAyarlari> => {
  const yerel = yedeklemeAyarlariniGetir();
  if (!canliFirebaseAktifMi()) return yerel;
  try {
    const fbAyar = await belgeGetir<YedeklemeAyarlari>('genel_ayarlar', 'yedekleme_ayarlari');
    if (fbAyar && fbAyar.hedefUrl) {
      const birlesik: YedeklemeAyarlari = {
        ...yerel,
        ...fbAyar,
        sonYedeklemeZamaniDamgasi: Math.max(yerel.sonYedeklemeZamaniDamgasi || 0, fbAyar.sonYedeklemeZamaniDamgasi || 0) || undefined,
        sonYedeklemeZamani: (fbAyar.sonYedeklemeZamaniDamgasi || 0) >= (yerel.sonYedeklemeZamaniDamgasi || 0)
          ? (fbAyar.sonYedeklemeZamani || yerel.sonYedeklemeZamani)
          : yerel.sonYedeklemeZamani
      };
      localStorage.setItem(YEREL_YEDEK_AYARLARI_KEY, JSON.stringify(birlesik));
      return birlesik;
    }
  } catch {}
  return yerel;
};

export const yedeklemeAyarlariniKaydet = (ayarlar: YedeklemeAyarlari): void => {
  localStorage.setItem(YEREL_YEDEK_AYARLARI_KEY, JSON.stringify(ayarlar));
  if (canliFirebaseAktifMi()) {
    belgeKaydet('genel_ayarlar', 'yedekleme_ayarlari', {
      hedefUrl: ayarlar.hedefUrl,
      otomatikYedekleme: ayarlar.otomatikYedekleme,
      otomatikPeriyot: ayarlar.otomatikPeriyot || 'gunluk',
      sonYedeklemeZamani: ayarlar.sonYedeklemeZamani || '',
      sonYedeklemeZamaniDamgasi: ayarlar.sonYedeklemeZamaniDamgasi || 0
    }).catch(() => {});
  }
};

export const otomatikYedeklemeGerekiyorMu = (ayarlar: YedeklemeAyarlari): boolean => {
  if (!ayarlar.otomatikYedekleme || !ayarlar.hedefUrl || !ayarlar.hedefUrl.startsWith('http')) return false;
  if (!ayarlar.sonYedeklemeZamaniDamgasi) return true;
  const gecenSureMs = Date.now() - ayarlar.sonYedeklemeZamaniDamgasi;
  const periyot = ayarlar.otomatikPeriyot || 'gunluk';
  if (periyot === 'saatlik') return gecenSureMs >= 1000 * 60 * 60;
  if (periyot === 'gunluk') return gecenSureMs >= 1000 * 60 * 60 * 24;
  if (periyot === 'haftalik') return gecenSureMs >= 1000 * 60 * 60 * 24 * 7;
  return false;
};

export const tumVeritabaniPaketiniOlustur = async () => {
  const paket: Record<string, any[]> = {};
  const ozet: Record<string, number> = {};
  if (canliFirebaseAktifMi()) {
    const sonuclar = await Promise.all(
      YEDEKLENECEK_KOLEKSIYONLAR.map(async (kol) => [kol, await koleksiyonGetir<any>(kol)] as const)
    );
    for (const [kol, veriler] of sonuclar) {
      paket[kol] = veriler || [];
      ozet[kol] = (veriler || []).length;
    }
  }
  return {
    platform: 'Afyon Ev Lezzetleri',
    yedek_tarihi: new Date().toISOString(),
    veriPaketi: paket,
    kayitIstatistikleri: ozet
  };
};

export const yedekDosyasindanGeriYukle = async (
  paket: any
): Promise<{ yuklenenKoleksiyon: number; yuklenenKayit: number }> => {
  const kaynak = paket?.veriPaketi;
  if (!kaynak || typeof kaynak !== 'object') throw new Error('Geçersiz yedek JSON formatı.');
  let yuklenenKoleksiyon = 0;
  let yuklenenKayit = 0;
  for (const kol of Object.keys(kaynak)) {
    if (!Array.isArray(kaynak[kol])) continue;
    yuklenenKoleksiyon++;
    for (const kayit of kaynak[kol]) {
      const temizId = String(kayit?.id || '').replace(/[^a-zA-Z0-9_-]/g, '');
      if (!temizId) continue;
      const basarili = await belgeKaydet(kol, temizId, kayit);
      if (basarili) yuklenenKayit++;
    }
  }
  return { yuklenenKoleksiyon, yuklenenKayit };
};

export const bulutaYedekGonder = async (hedefUrl: string, apiKey?: string): Promise<{ basarili: boolean; mesaj: string }> => {
  if (!hedefUrl || !hedefUrl.startsWith('http')) {
    return { basarili: false, mesaj: 'Lütfen geçerli bir hedef URL adresi giriniz.' };
  }
  const veriPaketi = await tumVeritabaniPaketiniOlustur();
  const zamaniIsaretle = () => {
    const ayarlar = yedeklemeAyarlariniGetir();
    yedeklemeAyarlariniKaydet({
      ...ayarlar,
      sonYedeklemeZamani: new Date().toLocaleString('tr-TR'),
      sonYedeklemeZamaniDamgasi: Date.now()
    });
  };

  try {
    const yanit = await fetch('/api/arsivle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hedefUrl: hedefUrl.trim(), apiKey: apiKey?.trim() || '', veriPaketi })
    });
    if (yanit.ok && (yanit.headers.get('content-type') || '').includes('application/json')) {
      const sonuc = await yanit.json();
      if (sonuc.basarili) {
        zamaniIsaretle();
        return { basarili: true, mesaj: sonuc.mesaj || 'Yedek başarıyla DirectAdmin sunucunuza aktarıldı!' };
      }
    }
  } catch {}

  try {
    const basliklar: Record<string, string> = { 'Content-Type': 'application/json' };
    if (apiKey?.trim()) basliklar['X-Api-Key'] = apiKey.trim();
    const dogrudanYanit = await fetch(hedefUrl.trim(), { method: 'POST', headers: basliklar, body: JSON.stringify(veriPaketi) });
    if (dogrudanYanit.ok) {
      zamaniIsaretle();
      return { basarili: true, mesaj: 'Yedek doğrudan DirectAdmin / Bulut sunucunuza başarıyla iletildi!' };
    }
    return { basarili: false, mesaj: `Hedef sunucu yanıtı: HTTP ${dogrudanYanit.status}` };
  } catch (err: any) {
    return { basarili: false, mesaj: `Yedekleme iletilemedi: ${err?.message || 'Bağlantı hatası'}` };
  }
};
