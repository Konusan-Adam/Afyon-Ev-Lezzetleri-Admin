import crypto from 'crypto';
import type { Request } from 'express';
import { rfc3161IstekOlustur, rfc3161YanitCozumle } from './Rfc3161Asn1Yardimcisi';

const FREETSA_URL = 'https://freetsa.org/tsr';
const FREETSA_ZAMAN_ASIMI_MS = 6500;
const GECICI_IMZA_ANAHTARI = crypto.randomBytes(32);

function sunucuImzaAnahtariAl(): Buffer | string {
  const ortamAnahtari = (process.env.ZAMAN_DAMGASI_IMZA_ANAHTARI || '').trim();
  return ortamAnahtari || GECICI_IMZA_ANAHTARI;
}

export function gercekIpAdresiniAl(req: Request): string {
  const basliklar = [
    req.headers['cf-connecting-ip'],
    req.headers['x-real-ip'],
    req.headers['x-forwarded-for'],
  ];

  for (const aday of basliklar) {
    if (!aday) continue;
    const metin = Array.isArray(aday) ? aday[0] : aday;
    const ilkIp = String(metin).split(',')[0]?.trim();
    if (ilkIp) {
      return ilkIp.replace(/^::ffff:/i, '');
    }
  }

  const soketIp = req.ip || req.socket?.remoteAddress || '127.0.0.1';
  return String(soketIp).replace(/^::ffff:/i, '');
}

export function sha256Hesapla(veri: unknown): string {
  const metin = typeof veri === 'string' ? veri : JSON.stringify(veri ?? {});
  return crypto.createHash('sha256').update(metin, 'utf8').digest('hex');
}

export function sunucuHmacImzala(param: {
  ozetHash: string;
  sunucuUtc: string;
  ipAdresi: string;
}): string {
  const icerik = `${param.ozetHash}|${param.sunucuUtc}|${param.ipAdresi}`;
  return crypto.createHmac('sha256', sunucuImzaAnahtariAl()).update(icerik, 'utf8').digest('hex');
}

export function sunucuHmacDogrula(param: {
  ozetHash: string;
  sunucuUtc: string;
  ipAdresi: string;
  sunucuImzasi: string;
}): boolean {
  if (!param.sunucuImzasi || !param.sunucuUtc || !param.ozetHash) return false;
  const beklenen = sunucuHmacImzala({
    ozetHash: param.ozetHash,
    sunucuUtc: param.sunucuUtc,
    ipAdresi: param.ipAdresi,
  });
  const a = Buffer.from(beklenen, 'utf8');
  const b = Buffer.from(String(param.sunucuImzasi).trim(), 'utf8');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export interface DamgalamaSonucu {
  ozetHash: string;
  sunucuUtc: string;
  tarihSaat: string;
  ipAdresi: string;
  damgaDurumu: 'rfc3161_onayli' | 'sunucu_muhurlu';
  tsaSaglayici: string;
  tsaTokenBase64: string;
  sunucuImzasi: string;
}

async function freetsaDamgasiAl(ozetHash: string): Promise<{
  basarili: boolean;
  tsaSaglayici: string;
  tsaTokenBase64: string;
}> {
  const kontrolcu = new AbortController();
  const zamanlayici = setTimeout(() => kontrolcu.abort(), FREETSA_ZAMAN_ASIMI_MS);

  try {
    const istekDer = rfc3161IstekOlustur(ozetHash);
    const yanit = await fetch(FREETSA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/timestamp-query',
        Accept: 'application/timestamp-reply',
      },
      body: new Uint8Array(istekDer),
      signal: kontrolcu.signal,
    });

    if (!yanit.ok) {
      return { basarili: false, tsaSaglayici: 'Sunucu-HMAC-SHA256', tsaTokenBase64: '' };
    }

    const yanitBuffer = Buffer.from(await yanit.arrayBuffer());
    const analiz = rfc3161YanitCozumle(yanitBuffer, ozetHash);

    if (analiz.onayliMi && analiz.ozetEslesiyorMu) {
      return {
        basarili: true,
        tsaSaglayici: 'FreeTSA',
        tsaTokenBase64: yanitBuffer.toString('base64'),
      };
    }

    return { basarili: false, tsaSaglayici: 'Sunucu-HMAC-SHA256', tsaTokenBase64: '' };
  } catch {
    return { basarili: false, tsaSaglayici: 'Sunucu-HMAC-SHA256', tsaTokenBase64: '' };
  } finally {
    clearTimeout(zamanlayici);
  }
}

export async function zamanDamgasiOlustur(girdi: {
  ozetHash?: string;
  veri?: unknown;
  ipAdresi: string;
}): Promise<DamgalamaSonucu> {
  const temizHash = String(girdi.ozetHash || '').trim().toLowerCase();
  const ozetHash = /^[0-9a-f]{64}$/.test(temizHash) ? temizHash : sha256Hesapla(girdi.veri ?? {});

  const simdi = new Date();
  const sunucuUtc = simdi.toISOString();
  const tarihSaat = simdi.toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' });
  const sunucuImzasi = sunucuHmacImzala({
    ozetHash,
    sunucuUtc,
    ipAdresi: girdi.ipAdresi,
  });

  const tsaSonuc = await freetsaDamgasiAl(ozetHash);

  return {
    ozetHash,
    sunucuUtc,
    tarihSaat,
    ipAdresi: girdi.ipAdresi,
    damgaDurumu: tsaSonuc.basarili ? 'rfc3161_onayli' : 'sunucu_muhurlu',
    tsaSaglayici: tsaSonuc.tsaSaglayici,
    tsaTokenBase64: tsaSonuc.tsaTokenBase64,
    sunucuImzasi,
  };
}

export interface DamgaDogrulamaSonucu {
  gecerli: boolean;
  ozetHashGecerli: boolean;
  rfc3161: {
    mevcut: boolean;
    gecerliDer: boolean;
    pkiDurumu: number | null;
    onayliMi: boolean;
    ozetEslesiyorMu: boolean;
  };
  sunucuImzasiGecerli: boolean | null;
}

export function zamanDamgasiDogrula(girdi: {
  ozetHash: string;
  tsaTokenBase64?: string;
  sunucuUtc?: string;
  ipAdresi?: string;
  sunucuImzasi?: string;
}): DamgaDogrulamaSonucu {
  const temizHash = String(girdi.ozetHash || '').trim().toLowerCase();
  const ozetHashGecerli = /^[0-9a-f]{64}$/.test(temizHash);

  let rfc3161 = {
    mevcut: false,
    gecerliDer: false,
    pkiDurumu: null as number | null,
    onayliMi: false,
    ozetEslesiyorMu: false,
  };

  if (girdi.tsaTokenBase64 && typeof girdi.tsaTokenBase64 === 'string') {
    const temizBase64 = girdi.tsaTokenBase64.replace(/^data:[^;]+;base64,/, '').replace(/\s+/g, '');
    if (temizBase64.length > 0 && temizBase64.length <= 128_000) {
      const derBuffer = Buffer.from(temizBase64, 'base64');
      const analiz = rfc3161YanitCozumle(derBuffer, ozetHashGecerli ? temizHash : undefined);
      rfc3161 = {
        mevcut: true,
        gecerliDer: analiz.gecerliDer,
        pkiDurumu: analiz.pkiDurumu,
        onayliMi: analiz.onayliMi,
        ozetEslesiyorMu: analiz.ozetEslesiyorMu,
      };
    }
  }

  let sunucuImzasiGecerli: boolean | null = null;
  if (girdi.sunucuImzasi && girdi.sunucuUtc && girdi.ipAdresi) {
    sunucuImzasiGecerli = sunucuHmacDogrula({
      ozetHash: temizHash,
      sunucuUtc: String(girdi.sunucuUtc),
      ipAdresi: String(girdi.ipAdresi),
      sunucuImzasi: String(girdi.sunucuImzasi),
    });
  }

  const rfcGecerli = rfc3161.mevcut && rfc3161.onayliMi && rfc3161.ozetEslesiyorMu;
  const gecerli = ozetHashGecerli && (rfcGecerli || sunucuImzasiGecerli === true);

  return {
    gecerli,
    ozetHashGecerli,
    rfc3161,
    sunucuImzasiGecerli,
  };
}
