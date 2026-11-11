import { SubeSiparisi } from '@/src/veritabani/VeriTipleri';

export const BASLANGIC_SUBE_SIPARISLERI: SubeSiparisi[] = [
  {
    id: 'subesip-1',
    siparis_kodu: 'SB-8492',
    siparis_no: 'SB-8492',
    sube_id: 'sube-1',
    sube_adi: 'Zafer Meydanı Gel-Al & Dağıtım Noktası',
    musteri_adi: 'Ahmet Yılmaz',
    musteri_telefon: '0544 222 33 44',
    durum: 'hazirlaniyor',
    toplam_tutar: 135,
    odeme_yontemi: 'kapida_nakit',
    pin_kodu: '4819',
    tahmini_hazirlanma_dakika: 15,
    olusturma_tarihi: '2026-11-07T11:40:00.000Z',
    urunler: [
      { urun_id: 'sube-urun-1', ad: 'Taze Çıtır Afyon Mercimekli Bükmesi', adet: 2, fiyat: 45 },
      { urun_id: 'sube-urun-5', ad: 'Köy Yayık Ayranı', adet: 1, fiyat: 45 }
    ],
    notlar: 'Sıcak paketlensin lütfen'
  },
  {
    id: 'subesip-2',
    siparis_kodu: 'SB-3190',
    siparis_no: 'SB-3190',
    sube_id: 'sube-1',
    sube_adi: 'Zafer Meydanı Gel-Al & Dağıtım Noktası',
    musteri_adi: 'Ayşe Kaya',
    musteri_telefon: '0533 111 22 33',
    durum: 'teslime_hazir',
    toplam_tutar: 140,
    odeme_yontemi: 'kredi_karti',
    pin_kodu: '7254',
    tahmini_hazirlanma_dakika: 10,
    olusturma_tarihi: '2026-11-07T11:25:00.000Z',
    urunler: [
      { urun_id: 'sube-urun-3', ad: 'Geleneksel Afyon Mantısı', adet: 1, fiyat: 140 }
    ],
    notlar: '10 dk içinde alacağım'
  },
  {
    id: 'subesip-3',
    siparis_kodu: 'SB-5521',
    siparis_no: 'SB-5521',
    sube_id: 'sube-2',
    sube_adi: 'Park Afyon AVM Gel-Al Teslimat Masası',
    musteri_adi: 'Ali Can',
    musteri_telefon: '0505 444 55 66',
    durum: 'teslim_edildi',
    toplam_tutar: 220,
    odeme_yontemi: 'online',
    pin_kodu: '1903',
    tahmini_hazirlanma_dakika: 20,
    olusturma_tarihi: '2026-11-07T10:50:00.000Z',
    urunler: [
      { urun_id: 'sube-urun-2', ad: 'Kıymalı Afyon Ağzıaçık', adet: 2, fiyat: 55 },
      { urun_id: 'sube-urun-4', ad: 'Hakiki Manda Kaymaklı Ekmek Kadayıfı', adet: 1, fiyat: 110 }
    ]
  }
];
