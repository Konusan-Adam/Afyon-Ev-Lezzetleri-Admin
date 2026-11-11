import { SubeUrunu } from '@/src/veritabani/VeriTipleri';

export const BASLANGIC_SUBE_STOKLARI: SubeUrunu[] = [
  {
    id: 'sube-urun-1',
    sube_id: 'sube-1',
    ad: 'Taze Çıtır Afyon Mercimekli Bükmesi',
    aciklama: 'Közde haşhaşlı, çıtır el açması sıcak günlük bükme.',
    fiyat: 45,
    stok_adedi: 24,
    kategori: 'Bükmeler & Hamur İşi',
    gorsel_url: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=500&auto=format&fit=crop&q=80',
    marka: 'Afyon Ev Lezzetleri',
    hazir_mi: true,
    gunluk_taze_mi: true,
    kritik_esik: 5,
    birim: 'Adet'
  },
  {
    id: 'sube-urun-2',
    sube_id: 'sube-1',
    ad: 'Kıymalı Afyon Ağzıaçık',
    aciklama: 'Hakiki dana kıymalı ve tereyağlı çıtır tezgâh lezzeti.',
    fiyat: 55,
    stok_adedi: 4, // Kritik
    kategori: 'Bükmeler & Hamur İşi',
    gorsel_url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&auto=format&fit=crop&q=80',
    marka: 'Afyon Ev Lezzetleri',
    hazir_mi: true,
    gunluk_taze_mi: true,
    kritik_esik: 5,
    birim: 'Adet'
  },
  {
    id: 'sube-urun-3',
    sube_id: 'sube-1',
    ad: 'Geleneksel Afyon Mantısı',
    aciklama: 'Sarımsaklı yoğurt ve kızgın tereyağlı kuru nane soslu.',
    fiyat: 140,
    stok_adedi: 0, // Tükendi
    kategori: 'Ev Yemekleri',
    marka: 'Afyon Ev Lezzetleri',
    hazir_mi: false,
    gunluk_taze_mi: true,
    kritik_esik: 3,
    birim: 'Porsiyon'
  },
  {
    id: 'sube-urun-4',
    sube_id: 'sube-2',
    ad: 'Hakiki Manda Kaymaklı Ekmek Kadayıfı',
    aciklama: 'Şerbeti tam kıvamında kabartılmış meşhur Afyon tatlısı.',
    fiyat: 110,
    stok_adedi: 3, // Kritik
    kategori: 'Tatlılar',
    marka: 'Afyon Ev Lezzetleri',
    hazir_mi: true,
    gunluk_taze_mi: true,
    kritik_esik: 5,
    birim: 'Porsiyon'
  }
];
