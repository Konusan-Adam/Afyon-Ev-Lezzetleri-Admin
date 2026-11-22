export interface MutfakTipi {
  id: string;
  ad: string;
  mutfak_adi?: string;
  aciklama?: string;
  adres?: string;
  ilce?: string;
  mahalle?: string;
  min_siparis_tutari?: number;
  teslimat_ucreti?: number;
  puan: number;
  degerlendirme_sayisi?: number;
  gorsel_url?: string;
  hijyen_onayli_mi?: boolean;
  esnaf_muafiyet_onayli_mi?: boolean;
  onayli_mi?: boolean;
  onay_durumu?: string;
  acik_mi?: boolean;
  calisma_saatleri?: string;
  hazirlanma_suresi?: string;
  belgeler?: any;
  tip?: string;
  askida_mi?: boolean;
}

export interface YemekTipi {
  id: string;
  mutfak_id: string;
  baslik: string;
  aciklama: string;
  fiyat: number;
  birim?: string; // Porsiyon, Adet, Kg, Gram, Litre, Dilim, Tepsi, Kavanoz, Tabak, Paket
  gunluk_stok?: number;
  kalan_stok?: number;
  sinirsiz_stok?: boolean;
  kategori: string;
  alt_kategori?: string;
  gorsel_url: string;
  populer?: boolean;
  puan: number;
  hazirlanma_suresi?: string;
  stokta_var_mi?: boolean;
  secenek_gruplari?: any[];
  tukendi_mi?: boolean;
  onay_durumu?: string;
  onayli_mi?: boolean;
}

export interface KategoriTipi {
  id: string;
  ad: string;
  slug: string;
  ikon: string;
  aciklama?: string;
  sira?: number;
}

export interface KampanyaTipi {
  id: string;
  baslik: string;
  aciklama: string;
  gorsel_url: string;
  gorselTipi?: 'arka_plan' | 'sag_taraf';
  link: string;
  aktif_mi: boolean;
}

export interface SepetElemaniTipi {
  id: string;
  yemek: YemekTipi;
  adet: number;
  birim_fiyat: number;
}

export type Yemek = YemekTipi;
export type Mutfak = MutfakTipi;

export interface OrtakSepet {
  kimlik: string;
  sepet_kodu: string;
  olusturan_musteri_kimligi: string;
  durum: 'aktif' | 'siparis_verildi' | 'iptal';
  olusturulma_tarihi?: string;
}

export interface OrtakSepetKatilimci {
  kimlik: string;
  ortak_sepet_kimligi: string;
  katilimci_adi: string;
  katilma_tarihi?: string;
}

export interface OrtakSepetElemani {
  kimlik: string;
  ortak_sepet_kimligi: string;
  ekleyen_katilimci_adi?: string;
  katilimci_adi?: string;
  katilimci_kimligi?: string;
  yemek_kimligi: string;
  yemek_basligi?: string;
  adet: number;
  birim_fiyat?: number;
  fiyat: number;
  yemek?: YemekTipi;
}

export interface MusteriAdresi {
  id?: string;
  kimlik?: string;
  musteri_kimligi?: string;
  baslik?: string;
  adres_basligi?: string;
  adres_tarifi?: string;
  acik_adres_tarifi?: string;
  mahalle?: string;
  cadde_sokak?: string;
  ilce?: string;
  il?: string;
  bina_no?: string;
  kat?: string;
  daire_no?: string;
  telefon?: string;
  varsayilan_mi?: boolean;
  olusturma_tarihi?: string;
  enlem?: number;
  boylam?: number;
}

export interface GelAlSubesi {
  id: string;                          // Örn: "sube-1", "sube-2"
  kimlik?: string;
  ad: string;                          // Örn: "Zafer Meydanı Gel-Al & Dağıtım Noktası"
  adres: string;                       // Örn: "Zafer Meydanı No:3 Afyon Merkez"
  telefon: string;                     // Örn: "0272 213 00 01"
  ilce?: string;                       // Örn: "Merkez"
  mahalle?: string;                    // Örn: "Cumhuriyet Mah."
  acik_mi: boolean;                    // Şube anlık açık mı? (true / false)
  acilis_saati?: string;               // Örn: "08:30"
  kapanis_saati?: string;              // Örn: "22:00"
  calisma_saatleri?: string;           // "08:30 - 22:00"
  hazirlanma_suresi?: string;          // Örn: "15-20 dk"
  hijyen_puani?: number;               // Örn: 98 (100 üzerinden)
  enlem?: number;                      // Harita enlem koordinatı
  boylam?: number;                     // Harita boylam koordinatı
  gorsel?: string;                     // Şube vitrin kapak fotoğrafı URL
  aciklama?: string;                   // Şube tanıtım metni
  puan?: number;                       // Örn: 4.9
  degerlendirme_sayisi?: number;       // Örn: 142
  youtube_canli_yayin_linki?: string;  // YouTube canlı yayın veya video embed URL
  canli_yayin_aktif_mi?: boolean;      // Canlı yayın şalteri (true / false)
  yetkili_telefon?: string;
  yetkili_adi?: string;
}

export interface SubeUrunu {
  id: string;                          // Örn: "sube-urun-1"
  sube_id: string;                     // Bağlı olduğu şube: "sube-1"
  ad: string;                          // Örn: "Taze Çıtır Afyon Mercimekli Bükmesi"
  aciklama?: string;                   // Örn: "Közde haşhaşlı, çıtır el açması sıcak günlük bükme."
  fiyat: number;                       // Satış fiyatı (TL): 45
  stok_adedi: number;                  // Anlık tezgah stoğu: 24
  kategori: string;                    // "Bükmeler & Hamur İşi" | "Ev Yemekleri" | "Tatlılar"
  gorsel_url?: string;                 // Ürün fotoğrafı URL
  marka: 'Afyon Ev Lezzetleri';        // Marka adı sabit
  hazir_mi: boolean;                   // Sıcak tezgâhta teslime hazır mı? (true)
  gunluk_taze_mi?: boolean;            // Günlük taze üretim mi? (true)
  urun_adi?: string;                   // Uyumluluk için
  kritik_esik?: number;
  birim?: string;
  guncellenme_tarihi?: string;
}

export type SubeStokTipi = SubeUrunu;

export interface SubeSiparisi {
  id: string;                          // Sipariş benzersiz ID'si
  siparis_kodu: string;                // Örn: "SB-8492"
  siparis_no?: string;                 // Uyumluluk için
  sube_id: string;                     // Siparişin verildiği şube ID'si
  sube_adi: string;                    // "Zafer Meydanı Gel-Al & Dağıtım Noktası"
  musteri_id?: string;                 // Müşteri ID'si
  musteri_adi: string;                 // "Ahmet Yılmaz"
  musteri_telefon: string;             // Sadece Telefon: "05XXXXXXXXX" (E-posta YOK)
  durum: 'hazirlaniyor' | 'teslime_hazir' | 'teslim_edildi' | 'iptal';
  toplam_tutar: number;                // Örn: 135 (TL)
  odeme_yontemi: string;               // "kapida_nakit" | "kredi_karti" | "online"
  pin_kodu: string;                    // Gel-Al teslimat güvenlik PIN kodu (Örn: "4819")
  tahmini_hazirlanma_dakika?: number;  // Örn: 15
  olusturma_tarihi: string;            // ISO Tarih: "2026-11-07T14:30:00.000Z"
  notlar?: string;
  urunler?: Array<{                    // Sipariş edilen tezgah ürünleri listesi
    urun_id?: string;
    ad?: string;
    urun_adi?: string;
    adet: number;
    fiyat?: number;
    birim_fiyat?: number;
  }>;
}

export type SubeSiparisTipi = SubeSiparisi;
export type SubeSiparisElemani = NonNullable<SubeSiparisi['urunler']>[number];

export interface Kullanici {
  id?: string;
  kimlik?: string;
  ad_soyad: string;
  telefon: string;                     // Giriş için tek anahtar: "05XXXXXXXXX"
  rol: 'sube_muduru' | 'super_admin' | 'sube_admin' | KullaniciRolu;   // Yetkili rolü
  sube_id?: string;                    // Atandığı şube ID'si (Örn: "sube-1")
  isletme_adi?: string;                // "Afyon Ev Lezzetleri Zafer Meydanı"
  onayli_mi?: boolean;                 // true
  sifre?: string;                      // Yönetici ve kullanıcı şifresi
  eposta?: string;
  arac_tipi?: string;
  plaka?: string;
  ilce?: string;
  olusturma_tarihi?: string;
}

export type KullaniciRolu =
  | 'super_admin'
  | 'sube_muduru'
  | 'musteri'
  | 'asci'
  | 'kurye'
  | 'yonetici'
  | 'sube_admin'
  | 'ev_mutfagi'
  | 'ticari_restoran'
  | string;

export interface SepetElemani {
  id: string;
  musteri_id?: string;
  yemek_id?: string;
  yemek?: YemekTipi;
  adet: number;
  birim_fiyat: number;
  secilen_ekstralar?: any[];
  mutfak_id?: string;
  mutfak?: MutfakTipi;
  eklenme_tarihi?: string;
}

export interface FiltreKriterleri {
  aramaMetni?: string;
  kategori?: string;
  altKategori?: string;
  minPuan?: number;
  minFiyat?: number;
  maxFiyat?: number;
  maksFiyat?: number;
  sadecePopuler?: boolean;
  siralama?: 'varsayilan' | 'fiyat_artan' | 'fiyat_azalan' | 'puan_azalan';
}

export interface KuryeCanliKonumVerisi {
  kimlik?: string;
  siparis_id: string;
  kurye_id?: string;
  enlem: number;
  boylam: number;
  kurye_adi: string;
  kurye_telefon: string;
  arac_tipi?: string;
  plaka?: string;
  tahmini_dakika?: number;
  kalan_dakika?: number;
  kalan_metre?: number;
  anlik_hiz_kmh?: number;
  tamamlandi_mi?: boolean;
  guncellenme_zamani?: string;
  guncellenme_tarihi?: string;
}
export interface KuryeAyarlari {
  id: string; // 'genel_ayarlar' ID'si olacak
  taban_ucret: number;
  km_basi_ucret: number;
  elektrikli_bonusu: number;
  yagmurlu_hava_carpani: number;
  gece_vardiyasi_primi: number;
  ucretsiz_teslimat_aktif?: boolean;
  ucretsiz_teslimat_esigi?: number;
}

export interface KomisyonAyarTipi {
  id: string; // 'genel_komisyon' veya mutfakId bazlı
  tip: 'genel' | 'mutfak' | 'kategori' | 'urun';
  hedefId?: string; // Mutfak ID, Kategori ID veya Yemek ID
  oran: number; // Yüzde oranı (örneğin 15 için %15)
  platformSabitUcret?: number; // Ek hizmet bedeli
  aktif_mi: boolean;
  olusturma_tarihi?: string;
  guncellenme_tarihi?: string;
}

