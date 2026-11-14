import {
  koleksiyonGetir,
  koleksiyonuCanliDinle,
  belgeKaydet,
  belgeSil
} from '@/src/veritabani/FirebaseKoleksiyonServisi';

export type FaturaTipi =
  | 'gider_pusulasi'
  | 'earSiv_fatura'
  | 'komisyon_faturasi'
  | 'kurye_makbuz'
  | 'sanal_pos_faturasi'
  | 'iade_iptal';

export type FaturaDurumu = 'onaylandi' | 'beklemede' | 'iptal';
export type FaturaYonu = 'gelir' | 'gider' | 'iade';

export interface FaturaKaydi {
  id: string;
  fatura_no: string;
  ettn?: string;
  tip: FaturaTipi;
  yon?: FaturaYonu;
  kesen_unvan: string;
  kesen_vergi_no?: string;
  alan_unvan: string;
  alan_vergi_no?: string;
  vergi_dairesi?: string;
  tutar: number;
  yemek_tutari?: number;
  yemek_kdv_tutari?: number;
  teslimat_tutari?: number;
  teslimat_kdv_tutari?: number;
  kdv_orani: number;
  kdv_tutari: number;
  stopaj_orani?: number;
  stopaj_tutari?: number;
  net_tutar: number;
  tarih: string;
  olusturma_zamani?: string;
  durum: FaturaDurumu;
  iptal_nedeni?: string;
  aciklama: string;
  kaynak_siparis_id?: string;
  kaynak_hakedis_id?: string;
  bagli_fatura_no?: string;
  toplu_parti_no?: string;
}

export const FATURA_TIP_META: Record<
  FaturaTipi,
  { ad: string; kisaAd: string; yon: FaturaYonu; kimKime: string }
> = {
  gider_pusulasi: {
    ad: 'Gider Pusulası',
    kisaAd: 'Gider Pusulası',
    yon: 'gider',
    kimKime: 'Sen → Ev Aşçısı'
  },
  earSiv_fatura: {
    ad: 'E-Arşiv Satış Faturası',
    kisaAd: 'E-Arşiv',
    yon: 'gelir',
    kimKime: 'Sen → Müşteri'
  },
  komisyon_faturasi: {
    ad: 'Komisyon Faturası',
    kisaAd: 'Komisyon',
    yon: 'gelir',
    kimKime: 'Sen → Ticari Mutfak'
  },
  kurye_makbuz: {
    ad: 'Esnaf Kurye Faturası',
    kisaAd: 'Esnaf Kurye',
    yon: 'gider',
    kimKime: 'Kurye → Sana'
  },
  sanal_pos_faturasi: {
    ad: 'Sanal POS Faturası',
    kisaAd: 'Sanal POS',
    yon: 'gider',
    kimKime: 'Ödeme Kuruluşu → Sana'
  },
  iade_iptal: {
    ad: 'İade / İptal Belgesi',
    kisaAd: 'İade / İptal',
    yon: 'iade',
    kimKime: 'Karşılıklı'
  }
};

export function faturaYonuGetir(fatura: Pick<FaturaKaydi, 'tip' | 'yon'>): FaturaYonu {
  return fatura.yon || FATURA_TIP_META[fatura.tip]?.yon || 'gelir';
}

export function belgeNoUret(tip: FaturaTipi): string {
  const onekMap: Record<FaturaTipi, string> = {
    gider_pusulasi: 'GPS',
    earSiv_fatura: 'EAR',
    komisyon_faturasi: 'KOM',
    kurye_makbuz: 'KUR',
    sanal_pos_faturasi: 'POS',
    iade_iptal: 'IAD'
  };
  const yil = new Date().getFullYear();
  const kod = Math.floor(1000 + Math.random() * 9000);
  return `${onekMap[tip]}-${yil}-${kod}`;
}

function faturalariSirala(liste: FaturaKaydi[]): FaturaKaydi[] {
  return [...liste].sort((a, b) => {
    const za = a.olusturma_zamani || a.tarih || '';
    const zb = b.olusturma_zamani || b.tarih || '';
    if (zb !== za) return zb.localeCompare(za);
    return b.id.localeCompare(a.id);
  });
}

export async function yeniFaturaEkle(fatura: FaturaKaydi): Promise<boolean> {
  const otomatikEttn =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : undefined;
  const kayit = {
    ...fatura,
    ettn: fatura.ettn || otomatikEttn,
    yon: faturaYonuGetir(fatura),
    olusturma_zamani: fatura.olusturma_zamani || new Date().toISOString()
  };
  return belgeKaydet('faturalar', kayit.id, kayit);
}

export async function faturaGuncelle(id: string, guncel: Partial<FaturaKaydi>): Promise<boolean> {
  return belgeKaydet('faturalar', id, guncel);
}

export async function faturaIptalEt(id: string, iptal_nedeni: string): Promise<boolean> {
  return belgeKaydet('faturalar', id, { durum: 'iptal', iptal_nedeni });
}

export async function faturaSil(id: string): Promise<boolean> {
  return belgeSil('faturalar', id);
}

export function faturalariCanliDinle(geriCagirim: (faturalar: FaturaKaydi[]) => void): () => void {
  koleksiyonGetir<FaturaKaydi>('faturalar')
    .then((mevcut) => geriCagirim(faturalariSirala(mevcut || [])))
    .catch(() => geriCagirim([]));

  return koleksiyonuCanliDinle<FaturaKaydi>('faturalar', (guncel) => {
    geriCagirim(faturalariSirala(guncel || []));
  });
}
