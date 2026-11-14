import crypto from 'crypto';

export interface PaytrSepetElemani {
  ad: string;
  fiyat: number;
  adet: number;
}

export function paytrSepetKodla(elemanlar: PaytrSepetElemani[]): string {
  const matris = (elemanlar.length > 0 ? elemanlar : [{ ad: 'Afyon Ev Lezzetleri Siparisi', fiyat: 0, adet: 1 }]).map(
    (e) => [String(e.ad || 'Urun').slice(0, 80), Number(e.fiyat || 0).toFixed(2), Math.max(1, Number(e.adet || 1))]
  );
  return Buffer.from(JSON.stringify(matris)).toString('base64');
}

export function tutarKurusaCevir(tutarTl: number): number {
  return Math.max(100, Math.round(Number(tutarTl || 0) * 100));
}

export function paytrTokenImzala(parametreler: {
  merchantId: string;
  merchantKey: string;
  merchantSalt: string;
  kullaniciIp: string;
  merchantOid: string;
  eposta: string;
  tutarKurus: number;
  sepetBase64: string;
  taksitYok: string;
  maxTaksit: string;
  paraBirimi: string;
  testModu: string;
}): string {
  const hamMetin = [
    parametreler.merchantId,
    parametreler.kullaniciIp,
    parametreler.merchantOid,
    parametreler.eposta,
    String(parametreler.tutarKurus),
    parametreler.sepetBase64,
    parametreler.taksitYok,
    parametreler.maxTaksit,
    parametreler.paraBirimi,
    parametreler.testModu
  ].join('');
  return crypto
    .createHmac('sha256', parametreler.merchantKey)
    .update(hamMetin + parametreler.merchantSalt)
    .digest('base64');
}

export function paytrCallbackDogrula(veri: {
  merchantOid: string;
  status: string;
  totalAmount: string;
  hash: string;
  merchantKey: string;
  merchantSalt: string;
}): boolean {
  if (!veri.hash || !veri.merchantKey || !veri.merchantSalt) return false;
  const beklenen = crypto
    .createHmac('sha256', veri.merchantKey)
    .update(veri.merchantOid + veri.merchantSalt + veri.status + veri.totalAmount)
    .digest('base64');
  const a = Buffer.from(beklenen);
  const b = Buffer.from(String(veri.hash));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
