import { koleksiyonGetir, koleksiyonuCanliDinle, belgeKaydet } from '@/src/veritabani/FirebaseKoleksiyonServisi';

export interface FaturaKaydi {
  id: string;
  fatura_no: string;
  tip: 'gider_pusulasi' | 'earSiv_fatura' | 'komisyon_faturasi' | 'kurye_makbuz';
  kesen_unvan: string;
  alan_unvan: string;
  tutar: number;
  kdv_orani: number;
  kdv_tutari: number;
  net_tutar: number;
  tarih: string;
  durum: 'onaylandi' | 'beklemede' | 'iptal';
  aciklama: string;
}

export const BASLANGIC_FATURALARI: FaturaKaydi[] = [
  {
    id: 'fat-1',
    fatura_no: 'GPS-2026-001',
    tip: 'gider_pusulasi',
    kesen_unvan: 'Hatice Teyze Mantı Evi (Esnaf Muafiyetli)',
    alan_unvan: 'Afyon Ev Lezzetleri A.Ş.',
    tutar: 1450.00,
    kdv_orani: 0,
    kdv_tutari: 0,
    net_tutar: 1450.00,
    tarih: '2026-09-30',
    durum: 'onaylandi',
    aciklama: 'GVK Md. 9/10 Esnaf Muafiyetli Ev Mutfağı Ürün Alım Gider Pusulası'
  },
  {
    id: 'fat-2',
    fatura_no: 'EAR-2026-889',
    tip: 'earSiv_fatura',
    kesen_unvan: 'Afyon Lezzet Sarayı Ticari Mutfağı',
    alan_unvan: 'Ahmet Yılmaz (Müşteri)',
    tutar: 780.00,
    kdv_orani: 10,
    kdv_tutari: 70.91,
    net_tutar: 709.09,
    tarih: '2026-09-30',
    durum: 'onaylandi',
    aciklama: 'E-Arşiv Yemek Satış Faturası (%10 Gıda KDV Dahil)'
  },
  {
    id: 'fat-3',
    fatura_no: 'KOM-2026-042',
    tip: 'komisyon_faturasi',
    kesen_unvan: 'Afyon Ev Lezzetleri A.Ş.',
    alan_unvan: 'Hatice Teyze Mantı Evi',
    tutar: 145.00,
    kdv_orani: 20,
    kdv_tutari: 24.17,
    net_tutar: 120.83,
    tarih: '2026-09-30',
    durum: 'onaylandi',
    aciklama: '%10 Platform Komisyon ve Hizmet Bedeli Faturası'
  },
  {
    id: 'fat-4',
    fatura_no: 'KUR-2026-105',
    tip: 'kurye_makbuz',
    kesen_unvan: 'Kenan Evren (Motorlu Kurye)',
    alan_unvan: 'Afyon Ev Lezzetleri A.Ş.',
    tutar: 525.00,
    kdv_orani: 0,
    kdv_tutari: 0,
    net_tutar: 525.00,
    tarih: '2026-09-29',
    durum: 'onaylandi',
    aciklama: 'Kurye Sefer Taşıma Primi Gider Pusulası'
  }
];

export async function yeniFaturaEkle(fatura: FaturaKaydi): Promise<boolean> {
  try {
    await belgeKaydet('faturalar', fatura.id, fatura);
    return true;
  } catch (hata) {
    console.warn('Fatura Firestore kaydetme hatası:', hata);
    return false;
  }
}

export function faturalariCanliDinle(geriCagirim: (faturalar: FaturaKaydi[]) => void): () => void {
  // İlk getirme ve tohumlama
  koleksiyonGetir<FaturaKaydi>('faturalar').then((mevcut) => {
    if (!mevcut || mevcut.length === 0) {
      BASLANGIC_FATURALARI.forEach((f) => {
        belgeKaydet('faturalar', f.id, f).catch(() => {});
      });
      geriCagirim(BASLANGIC_FATURALARI);
    } else {
      geriCagirim(mevcut);
    }
  }).catch(() => {
    geriCagirim(BASLANGIC_FATURALARI);
  });

  return koleksiyonuCanliDinle<FaturaKaydi>('faturalar', (guncel) => {
    if (guncel && guncel.length > 0) {
      geriCagirim(guncel);
    }
  });
}
