export type PaytrOdemeDurumu = 'beklemede' | 'odendi' | 'basarisiz';

export interface PaytrIslemKaydi {
  merchantOid: string;
  durum: PaytrOdemeDurumu;
  toplamKurus: number;
  hataNedeni?: string;
  guncellemeZamani: number;
}

const islemHavuzu = new Map<string, PaytrIslemKaydi>();

export function paytrIslemKaydet(kayit: PaytrIslemKaydi): void {
  islemHavuzu.set(kayit.merchantOid, kayit);
  if (islemHavuzu.size > 500) {
    const enEski = islemHavuzu.keys().next().value;
    if (enEski) islemHavuzu.delete(enEski);
  }
}

export function paytrIslemDurumuGetir(merchantOid: string): PaytrIslemKaydi | null {
  return islemHavuzu.get(merchantOid) || null;
}
