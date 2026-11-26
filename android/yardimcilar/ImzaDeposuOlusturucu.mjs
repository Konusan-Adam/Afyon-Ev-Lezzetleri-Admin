import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import forge from 'node-forge';
import { convertToPEM } from 'apk_sign_ts';

const VARSAYILAN_SIFRE = 'AfyonPatron2026!';
const VARSAYILAN_TAKMA_AD = 'afyonpatron';

function pkcs8PemDonustur(pemMetni) {
  return crypto
    .createPrivateKey(pemMetni)
    .export({ type: 'pkcs8', format: 'pem' })
    .toString();
}

export async function imzaAnahtariniHazirla(androidDizini) {
  const imzaDizini = path.join(androidDizini, 'imza');
  fs.mkdirSync(imzaDizini, { recursive: true });

  const keystoreYolu = path.join(imzaDizini, 'afyon-patron.keystore');
  const ozelAnahtarYolu = path.join(imzaDizini, 'ozel-anahtar.pem');
  const sertifikaYolu = path.join(imzaDizini, 'sertifika.pem');
  const bilgiYolu = path.join(imzaDizini, 'imza-ayarlari.json');

  const storePass = process.env.ANDROID_STORE_PASS || VARSAYILAN_SIFRE;
  const keyPass = process.env.ANDROID_KEY_PASS || storePass;
  const alias = process.env.ANDROID_KEY_ALIAS || VARSAYILAN_TAKMA_AD;

  if (!fs.existsSync(keystoreYolu) || !fs.existsSync(ozelAnahtarYolu) || !fs.existsSync(sertifikaYolu)) {
    const anahtarlar = forge.pki.rsa.generateKeyPair(2048);
    const sertifika = forge.pki.createCertificate();
    sertifika.publicKey = anahtarlar.publicKey;
    sertifika.serialNumber = '01' + Date.now().toString(16);
    sertifika.validity.notBefore = new Date();
    sertifika.validity.notAfter = new Date();
    sertifika.validity.notAfter.setFullYear(sertifika.validity.notBefore.getFullYear() + 25);

    const oznitelikler = [
      { name: 'commonName', value: 'Afyon Ev Lezzetleri' },
      { name: 'organizationName', value: 'Afyon Ev Lezzetleri' },
      { name: 'localityName', value: 'Afyonkarahisar' },
      { name: 'countryName', value: 'TR' },
    ];
    sertifika.setSubject(oznitelikler);
    sertifika.setIssuer(oznitelikler);
    sertifika.setExtensions([
      { name: 'basicConstraints', cA: false },
      { name: 'keyUsage', digitalSignature: true, nonRepudiation: true },
      { name: 'subjectKeyIdentifier' },
    ]);
    sertifika.sign(anahtarlar.privateKey, forge.md.sha256.create());

    const privateKeyPem = pkcs8PemDonustur(forge.pki.privateKeyToPem(anahtarlar.privateKey));
    const certificatePem = forge.pki.certificateToPem(sertifika);

    fs.writeFileSync(ozelAnahtarYolu, privateKeyPem, 'utf8');
    fs.writeFileSync(sertifikaYolu, certificatePem, 'utf8');

    // node-forge ile PKCS#12 keystore olustur
    const p12Asn1 = forge.pkcs12.toPkcs12Asn1(
      anahtarlar.privateKey,
      [sertifika],
      storePass,
      {
        algorithm: '3des',
        friendlyName: alias,
        generateLocalKeyId: true,
      }
    );
    const p12Der = forge.asn1.toDer(p12Asn1).getBytes();
    fs.writeFileSync(keystoreYolu, Buffer.from(p12Der, 'binary'));

    let keystoreTipi = 'PKCS12';
    try {
      execFileSync('which', ['keytool'], { stdio: 'ignore' });
      keystoreTipi = 'PKCS12 (keytool uyumlu)';
    } catch {
      keystoreTipi = 'PKCS12';
    }

    fs.writeFileSync(
      bilgiYolu,
      JSON.stringify(
        {
          keystoreDosyasi: 'afyon-patron.keystore',
          keystoreTipi,
          takmaAd: alias,
          storePass,
          keyPass,
          olusturmaTarihi: new Date().toISOString(),
        },
        null,
        2
      ),
      'utf8'
    );
  }

  // Keystore'u gercekten okuyup apk_sign_ts uyumlulugunu dogrula
  const keystoreBaytlari = new Uint8Array(fs.readFileSync(keystoreYolu));
  try {
    const cikarilan = await convertToPEM(keystoreBaytlari, storePass, 'pkcs12');
    const gecerliOzel =
      typeof cikarilan?.privateKey === 'string' &&
      cikarilan.privateKey.includes('BEGIN');
    const gecerliSertifika =
      typeof cikarilan?.certificate === 'string' &&
      cikarilan.certificate.includes('BEGIN CERTIFICATE');

    if (gecerliOzel && gecerliSertifika) {
      return {
        keystoreYolu,
        storePass,
        keyPass,
        alias,
        privateKey: pkcs8PemDonustur(cikarilan.privateKey),
        certificate: cikarilan.certificate,
      };
    }
  } catch {
    // Fallback PEM dosyalarini kullan
  }

  const dosyaOzelPem = pkcs8PemDonustur(fs.readFileSync(ozelAnahtarYolu, 'utf8'));
  fs.writeFileSync(ozelAnahtarYolu, dosyaOzelPem, 'utf8');

  return {
    keystoreYolu,
    storePass,
    keyPass,
    alias,
    privateKey: dosyaOzelPem,
    certificate: fs.readFileSync(sertifikaYolu, 'utf8'),
  };
}
