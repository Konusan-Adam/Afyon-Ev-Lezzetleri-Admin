/**
 * RFC 3161 ASN.1 DER Zaman Damgası İstek Oluşturucu ve Yanıt Çözümleyici
 */

function derUzunlukKodla(uzunluk: number): Buffer {
  if (uzunluk < 128) {
    return Buffer.from([uzunluk]);
  }
  const baytlar: number[] = [];
  let kalan = uzunluk;
  while (kalan > 0) {
    baytlar.unshift(kalan & 0xff);
    kalan >>= 8;
  }
  return Buffer.from([0x80 | baytlar.length, ...baytlar]);
}

function derDugum(etiket: number, icerik: Buffer): Buffer {
  return Buffer.concat([Buffer.from([etiket]), derUzunlukKodla(icerik.length), icerik]);
}

function derPozitifTamsayi(tamSayiBaytlari: Buffer): Buffer {
  const kirpilmis = tamSayiBaytlari.length > 0 ? tamSayiBaytlari : Buffer.from([0]);
  const ilkBayt = kirpilmis[0];
  const icerik = ilkBayt >= 0x80 ? Buffer.concat([Buffer.from([0x00]), kirpilmis]) : kirpilmis;
  return derDugum(0x02, icerik);
}

export function sha256HexBuffer(ozetHex: string): Buffer {
  const temiz = String(ozetHex || '').trim().toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(temiz)) {
    throw new Error('Geçersiz SHA-256 hex özeti.');
  }
  return Buffer.from(temiz, 'hex');
}

/**
 * RFC 3161 TimeStampReq DER paketi oluşturur (SHA-256 OID: 2.16.840.1.101.3.4.2.1).
 */
export function rfc3161IstekOlustur(ozetHex: string, nonceBaytlari?: Buffer): Buffer {
  const ozetBuffer = sha256HexBuffer(ozetHex);

  // Version = 1 (INTEGER)
  const versiyon = derDugum(0x02, Buffer.from([0x01]));

  // SHA-256 OID: 2.16.840.1.101.3.4.2.1 + NULL
  const sha256Oid = derDugum(0x06, Buffer.from([0x60, 0x86, 0x48, 0x01, 0x65, 0x03, 0x04, 0x02, 0x01]));
  const nullDugumu = derDugum(0x05, Buffer.alloc(0));
  const algoritmaSecici = derDugum(0x30, Buffer.concat([sha256Oid, nullDugumu]));

  // MessageImprint
  const mesajOzeti = derDugum(0x04, ozetBuffer);
  const messageImprint = derDugum(0x30, Buffer.concat([algoritmaSecici, mesajOzeti]));

  // Nonce (64-bit pozitif tamsayı)
  const hamNonce =
    nonceBaytlari && nonceBaytlari.length > 0
      ? nonceBaytlari
      : Buffer.from(Array.from({ length: 8 }, () => Math.floor(Math.random() * 256)));
  const nonce = derPozitifTamsayi(hamNonce);

  // certReq = TRUE (0x01 0x01 0xff)
  const certReq = derDugum(0x01, Buffer.from([0xff]));

  return derDugum(0x30, Buffer.concat([versiyon, messageImprint, nonce, certReq]));
}

interface DerOkumaSonucu {
  etiket: number;
  icerikBaslangic: number;
  icerikUzunluk: number;
  sonrakiKonum: number;
}

function derEtiketOku(veri: Buffer, konum: number): DerOkumaSonucu | null {
  if (konum >= veri.length) return null;
  const etiket = veri[konum];
  if (konum + 1 >= veri.length) return null;
  const uzunlukBayt = veri[konum + 1];

  if ((uzunlukBayt & 0x80) === 0) {
    const icerikBaslangic = konum + 2;
    const sonrakiKonum = icerikBaslangic + uzunlukBayt;
    if (sonrakiKonum > veri.length) return null;
    return { etiket, icerikBaslangic, icerikUzunluk: uzunlukBayt, sonrakiKonum };
  }

  const uzunlukBaytSayisi = uzunlukBayt & 0x7f;
  if (uzunlukBaytSayisi === 0 || uzunlukBaytSayisi > 4 || konum + 2 + uzunlukBaytSayisi > veri.length) {
    return null;
  }

  let icerikUzunluk = 0;
  for (let i = 0; i < uzunlukBaytSayisi; i++) {
    icerikUzunluk = (icerikUzunluk << 8) | veri[konum + 2 + i];
  }
  const icerikBaslangic = konum + 2 + uzunlukBaytSayisi;
  const sonrakiKonum = icerikBaslangic + icerikUzunluk;
  if (sonrakiKonum > veri.length) return null;

  return { etiket, icerikBaslangic, icerikUzunluk, sonrakiKonum };
}

export interface Rfc3161YanitAnalizi {
  gecerliDer: boolean;
  pkiDurumu: number | null;
  onayliMi: boolean;
  jetonMevcutMu: boolean;
  ozetEslesiyorMu: boolean;
}

/**
 * RFC 3161 TimeStampResp DER yanıtını analiz eder ve SHA-256 özet eşleşmesini denetler.
 */
export function rfc3161YanitCozumle(derBuffer: Buffer, beklenenOzetHex?: string): Rfc3161YanitAnalizi {
  const bos: Rfc3161YanitAnalizi = {
    gecerliDer: false,
    pkiDurumu: null,
    onayliMi: false,
    jetonMevcutMu: false,
    ozetEslesiyorMu: false,
  };

  if (!Buffer.isBuffer(derBuffer) || derBuffer.length < 10) return bos;

  const disSekans = derEtiketOku(derBuffer, 0);
  if (!disSekans || disSekans.etiket !== 0x30) return bos;

  // 1. PKIStatusInfo (SEQUENCE)
  const durumBilgisi = derEtiketOku(derBuffer, disSekans.icerikBaslangic);
  if (!durumBilgisi || durumBilgisi.etiket !== 0x30) return bos;

  // PKIStatus (INTEGER)
  const pkiDurumDugumu = derEtiketOku(derBuffer, durumBilgisi.icerikBaslangic);
  if (!pkiDurumDugumu || pkiDurumDugumu.etiket !== 0x02 || pkiDurumDugumu.icerikUzunluk === 0) {
    return bos;
  }

  let pkiDurumu = 0;
  for (let i = 0; i < pkiDurumDugumu.icerikUzunluk; i++) {
    pkiDurumu = (pkiDurumu << 8) | derBuffer[pkiDurumDugumu.icerikBaslangic + i];
  }

  // 2. Opsiyonel TimeStampToken (ContentInfo SEQUENCE)
  let jetonMevcutMu = false;
  if (durumBilgisi.sonrakiKonum < disSekans.icerikBaslangic + disSekans.icerikUzunluk) {
    const jetonDugumu = derEtiketOku(derBuffer, durumBilgisi.sonrakiKonum);
    if (jetonDugumu && jetonDugumu.etiket === 0x30 && jetonDugumu.icerikUzunluk > 20) {
      jetonMevcutMu = true;
    }
  }

  let ozetEslesiyorMu = false;
  if (beklenenOzetHex && /^[0-9a-f]{64}$/i.test(beklenenOzetHex.trim())) {
    const ozetBuffer = Buffer.from(beklenenOzetHex.trim().toLowerCase(), 'hex');
    ozetEslesiyorMu = derBuffer.includes(ozetBuffer);
  }

  const onayliMi = (pkiDurumu === 0 || pkiDurumu === 1) && jetonMevcutMu;

  return {
    gecerliDer: true,
    pkiDurumu,
    onayliMi,
    jetonMevcutMu,
    ozetEslesiyorMu,
  };
}
