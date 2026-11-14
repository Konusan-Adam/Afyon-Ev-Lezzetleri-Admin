import {
  koleksiyonGetir,
  koleksiyonuCanliDinle,
  belgeKaydet,
  belgeSil
} from '@/src/veritabani/FirebaseKoleksiyonServisi';

export type FaturaTipi = 'gider_pusulasi' | 'earSiv_fatura' | 'komisyon_faturasi' | 'kurye_makbuz';
export type FaturaDurumu = 'onaylandi' | 'beklemede' | 'iptal';

export interface FaturaKaydi {
  id: string;
  fatura_no: string;
  tip: FaturaTipi;
  kesen_unvan: string;
  kesen_vergi_no?: string;
  alan_unvan: string;
  alan_vergi_no?: string;
  vergi_dairesi?: string;
  tutar: number;
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
  toplu_parti_no?: string;
}

export function belgeNoUret(tip: FaturaTipi): string {
  const onekMap: Record<FaturaTipi, string> = {
    gider_pusulasi: 'GPS',
    earSiv_fatura: 'EAR',
    komisyon_faturasi: 'KOM',
    kurye_makbuz: 'KUR'
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
  const kayit = { ...fatura, olusturma_zamani: fatura.olusturma_zamani || new Date().toISOString() };
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
