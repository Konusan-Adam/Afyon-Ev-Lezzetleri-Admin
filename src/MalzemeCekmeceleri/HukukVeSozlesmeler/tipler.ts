/**
 * Afyon Ev Lezzetleri — Hukuki Sözleşmeler, Delil ve Zaman Damgası Tipleri
 */

export type SozlesmeTuru =
  | 'mesafeli_satis'
  | 'on_bilgilendirme'
  | 'kvkk_aydinlatma'
  | 'kullanici_sozlesmesi'
  | 'cerez_politikasi'
  | 'iptal_iade_kosullari'
  | string;

export type SozlesmeKonumu = 'kayit' | 'siparis' | 'asci_basvuru' | 'kurye_basvuru' | 'genel';

export type HukukiIslemTuru =
  | 'kayit'
  | 'siparis'
  | 'cerez_onayi'
  | 'teslimat'
  | 'iptal'
  | 'hakedis'
  | 'sozlesme_guncelleme'
  | 'ozel_onay'
  | string;

export type DamgaDurumu = 'rfc3161_onayli' | 'sunucu_muhurlu' | 'yerel_ozet' | string;

export interface HukukiSozlesme {
  id?: string;
  tur: SozlesmeTuru;
  baslik: string;
  kisaBaslik: string;
  versiyon: string;
  guncellenmeTarihi: string;
  icerik: string;
  zorunluMu: boolean;
  konum?: SozlesmeKonumu;
  silinebilirMi?: boolean;
}

export interface HukukiOnayLogu {
  id?: string;
  kimlik: string;
  ilgiliKayitId?: string;
  sozlesmeTuru: string;
  sozlesmeVersiyonu: string;
  kullaniciKimlik?: string;
  kullaniciTelefon?: string;
  kullaniciAdSoyad?: string;
  islemTuru: HukukiIslemTuru;
  tarihSaat: string;
  sunucuUtc?: string;
  sunucuKayitZamani?: unknown;
  ipAdresi: string;
  cihazBilgisi: string;
  onaylandiMi: boolean;
  damgaDurumu?: DamgaDurumu;
  ozetHash?: string;
  sozlesmeMetinHash?: string;
  tsaSaglayici?: string;
  tsaTokenBase64?: string;
  sunucuImzasi?: string;
  ekDetay?: Record<string, unknown> | string;
}

export interface CerezTercihleri {
  zorunlu: boolean;
  analitik: boolean;
  pazarlama: boolean;
  onaylandi: boolean;
  tarih: string;
}
