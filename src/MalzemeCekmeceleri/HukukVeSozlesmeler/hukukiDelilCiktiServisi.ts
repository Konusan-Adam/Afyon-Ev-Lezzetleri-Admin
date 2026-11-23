import { HukukiOnayLogu, HukukiSozlesme } from './tipler';
import { sunucuZamaniBicimlendir } from './useCanliHukukiDeliller';

export interface MetinUyumSonucu {
  durum: 'eslesti' | 'farkli' | 'bilinmiyor';
  guncelHash: string;
}

export async function sha256MetinOzetiHesapla(metin: string): Promise<string> {
  if (!metin || typeof window === 'undefined' || !window.crypto?.subtle) return '';
  const bayt = new TextEncoder().encode(metin);
  const ozetBuffer = await window.crypto.subtle.digest('SHA-256', bayt);
  return Array.from(new Uint8Array(ozetBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function sozlesmeMetinUyumuDogrula(
  log: HukukiOnayLogu,
  sozlesme?: HukukiSozlesme
): Promise<MetinUyumSonucu> {
  if (!sozlesme?.icerik) return { durum: 'bilinmiyor', guncelHash: '' };
  const guncelHash = await sha256MetinOzetiHesapla(sozlesme.icerik);
  if (!log.sozlesmeMetinHash || !guncelHash) {
    return { durum: 'bilinmiyor', guncelHash };
  }
  const eslestiMi = log.sozlesmeMetinHash.trim().toLowerCase() === guncelHash.toLowerCase();
  return { durum: eslestiMi ? 'eslesti' : 'farkli', guncelHash };
}

function csvHucre(deger: unknown): string {
  const metin = deger === undefined || deger === null ? '' : String(deger);
  return `"${metin.replace(/"/g, '""')}"`;
}

export function delilCsvIndir(loglar: HukukiOnayLogu[]): void {
  if (loglar.length === 0) return;
  const basliklar = [
    'Kimlik',
    'İlgili Kayıt ID',
    'İşlem Türü',
    'Sözleşme Türü',
    'Versiyon',
    'Ad Soyad',
    'Telefon',
    'Kullanıcı Kimlik',
    'Tarih Saat (Yerel)',
    'Sunucu UTC',
    'Firestore Sunucu Kayıt Zamanı',
    'IP Adresi',
    'Cihaz Bilgisi',
    'Damga Durumu',
    'TSA Sağlayıcı',
    'Özet Hash (SHA-256)',
    'Sözleşme Metin Hash (SHA-256)',
    'Sunucu İmzası',
    'Onay Durumu',
  ];

  const satirlar = loglar.map((l) => [
    csvHucre(l.kimlik),
    csvHucre(l.ilgiliKayitId || '-'),
    csvHucre(l.islemTuru),
    csvHucre(l.sozlesmeTuru),
    csvHucre(l.sozlesmeVersiyonu),
    csvHucre(l.kullaniciAdSoyad || 'Misafir'),
    csvHucre(l.kullaniciTelefon || '-'),
    csvHucre(l.kullaniciKimlik || '-'),
    csvHucre(l.tarihSaat),
    csvHucre(l.sunucuUtc || '-'),
    csvHucre(sunucuZamaniBicimlendir(l.sunucuKayitZamani)),
    csvHucre(l.ipAdresi),
    csvHucre(l.cihazBilgisi),
    csvHucre(l.damgaDurumu || 'yerel_ozet'),
    csvHucre(l.tsaSaglayici || '-'),
    csvHucre(l.ozetHash || '-'),
    csvHucre(l.sozlesmeMetinHash || '-'),
    csvHucre(l.sunucuImzasi || '-'),
    csvHucre(l.onaylandiMi ? 'ONAYLANDI' : 'REDDEDİLDİ'),
  ]);

  const icerik = '\uFEFF' + [basliklar.join(','), ...satirlar.map((s) => s.join(','))].join('\n');
  dosyaIndir(new Blob([icerik], { type: 'text/csv;charset=utf-8;' }), `hukuki_deliller_${tarihDamgasi()}.csv`);
}

export function delilJsonIndir(loglar: HukukiOnayLogu[]): void {
  if (loglar.length === 0) return;
  const icerik = JSON.stringify(loglar, null, 2);
  dosyaIndir(new Blob([icerik], { type: 'application/json;charset=utf-8;' }), `hukuki_delil_arsivi_${tarihDamgasi()}.json`);
}

export function tsrJetonunuIndir(log: HukukiOnayLogu): boolean {
  if (!log.tsaTokenBase64) return false;
  try {
    const temizBase64 = log.tsaTokenBase64.replace(/^data:[^;]+;base64,/, '').replace(/\s+/g, '');
    const ikili = atob(temizBase64);
    const baytlar = new Uint8Array(ikili.length);
    for (let i = 0; i < ikili.length; i++) {
      baytlar[i] = ikili.charCodeAt(i);
    }
    const guvenliKimlik = (log.kimlik || 'kayit').replace(/[^a-zA-Z0-9_-]/g, '_');
    dosyaIndir(new Blob([baytlar], { type: 'application/timestamp-reply' }), `delil_${guvenliKimlik}.tsr`);
    return true;
  } catch (hata) {
    console.error('RFC 3161 .tsr dönüştürme hatası:', hata);
    return false;
  }
}

function tarihDamgasi(): string {
  return new Date().toISOString().split('T')[0];
}

function dosyaIndir(blob: Blob, dosyaAdi: string): void {
  const url = URL.createObjectURL(blob);
  const baglanti = document.createElement('a');
  baglanti.href = url;
  baglanti.download = dosyaAdi;
  document.body.appendChild(baglanti);
  baglanti.click();
  document.body.removeChild(baglanti);
  URL.revokeObjectURL(url);
}
