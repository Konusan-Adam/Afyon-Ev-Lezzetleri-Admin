import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import JSZip from 'jszip';
import { ApkSigner, SigningKey } from 'apk_sign_ts';
import { imzaAnahtariniHazirla } from './yardimcilar/ImzaDeposuOlusturucu.mjs';
import { hazirZilSesleriniUret } from './yardimcilar/ZilSesiUretici.mjs';
import { distVeKaynaklariApkyaylaBirlestir } from './yardimcilar/SablonApkOlusturucu.mjs';

const KOK_DIZIN = path.resolve(import.meta.dirname, '..');
const ANDROID_DIZIN = path.join(KOK_DIZIN, 'android');
const DIST_DIZIN = path.join(KOK_DIZIN, 'dist');
const CIKTI_DIZIN = path.join(ANDROID_DIZIN, 'cikti');
const RAW_DIZIN = path.join(ANDROID_DIZIN, 'app', 'src', 'main', 'res', 'raw');
const IKON_KAYNAK = path.join(KOK_DIZIN, 'public', 'favicon.png');
const IKON_HEDEF = path.join(ANDROID_DIZIN, 'app', 'src', 'main', 'res', 'mipmap-xxxhdpi', 'ic_launcher.png');
const MANIFEST_YOLU = path.join(ANDROID_DIZIN, 'app', 'src', 'main', 'AndroidManifest.xml');
const DOSYA_YOLLARI_XML = path.join(ANDROID_DIZIN, 'app', 'src', 'main', 'res', 'xml', 'dosya_yollari.xml');

function komutVarMi(komut) {
  try {
    execFileSync('which', [komut], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function androidJarBul() {
  const sdkKok = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
  if (!sdkKok || !fs.existsSync(sdkKok)) return null;
  const adaylar = [
    path.join(sdkKok, 'platforms', 'android-34', 'android.jar'),
    path.join(sdkKok, 'platforms', 'android-35', 'android.jar'),
    path.join(sdkKok, 'platforms', 'android-33', 'android.jar'),
  ];
  return adaylar.find((p) => fs.existsSync(p)) || null;
}

function rolIzinleriniGetir(konumIzniGerekliMi) {
  const temelIzinler = [
    'android.permission.INTERNET',
    'android.permission.ACCESS_NETWORK_STATE',
    'android.permission.WAKE_LOCK',
    'android.permission.VIBRATE',
    'android.permission.POST_NOTIFICATIONS',
    'android.permission.FOREGROUND_SERVICE',
    'android.permission.FOREGROUND_SERVICE_DATA_SYNC',
    'android.permission.RECEIVE_BOOT_COMPLETED',
    'android.permission.USE_FULL_SCREEN_INTENT',
    'android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS',
    'android.permission.REQUEST_INSTALL_PACKAGES',
  ];
  if (konumIzniGerekliMi) {
    temelIzinler.push(
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.ACCESS_COARSE_LOCATION',
      'android.permission.FOREGROUND_SERVICE_LOCATION'
    );
  }
  return temelIzinler;
}

async function nativeSdkIleDerle({ androidJar, kimlikBilgisi }) {
  const gecici = path.join(ANDROID_DIZIN, 'gecici_derleme');
  fs.rmSync(gecici, { recursive: true, force: true });
  fs.mkdirSync(path.join(gecici, 'res_compiled'), { recursive: true });
  fs.mkdirSync(path.join(gecici, 'java_gen'), { recursive: true });
  fs.mkdirSync(path.join(gecici, 'classes'), { recursive: true });
  fs.mkdirSync(path.join(gecici, 'dex'), { recursive: true });

  const resDizini = path.join(ANDROID_DIZIN, 'app', 'src', 'main', 'res');
  execFileSync('aapt2', ['compile', '--dir', resDizini, '-o', path.join(gecici, 'res.zip')], { stdio: 'inherit' });

  const bazApk = path.join(gecici, 'baz.apk');
  execFileSync(
    'aapt2',
    [
      'link',
      '-o',
      bazApk,
      '-I',
      androidJar,
      '--manifest',
      MANIFEST_YOLU,
      '--java',
      path.join(gecici, 'java_gen'),
      '--min-sdk-version',
      String(kimlikBilgisi.minSdk),
      '--target-sdk-version',
      String(kimlikBilgisi.targetSdk),
      '--version-code',
      String(kimlikBilgisi.surumKodu),
      '--version-name',
      kimlikBilgisi.surumAdi,
      '-R',
      path.join(gecici, 'res.zip'),
      '--auto-add-overlay',
    ],
    { stdio: 'inherit' }
  );

  const javaDizini = path.join(ANDROID_DIZIN, 'app', 'src', 'main', 'java');
  const javaDosyalari = [];
  const topla = (d) => {
    for (const g of fs.readdirSync(d, { withFileTypes: true })) {
      const tam = path.join(d, g.name);
      if (g.isDirectory()) topla(tam);
      else if (g.name.endsWith('.java')) javaDosyalari.push(tam);
    }
  };
  topla(javaDizini);
  topla(path.join(gecici, 'java_gen'));

  execFileSync(
    'javac',
    [
      '--release',
      '11',
      '-cp',
      androidJar,
      '-d',
      path.join(gecici, 'classes'),
      ...javaDosyalari,
    ],
    { stdio: 'inherit' }
  );

  const classDosyalari = [];
  const classTopla = (d) => {
    for (const g of fs.readdirSync(d, { withFileTypes: true })) {
      const tam = path.join(d, g.name);
      if (g.isDirectory()) classTopla(tam);
      else if (g.name.endsWith('.class')) classDosyalari.push(tam);
    }
  };
  classTopla(path.join(gecici, 'classes'));

  execFileSync(
    'd8',
    ['--lib', androidJar, '--min-api', String(kimlikBilgisi.minSdk), '--output', path.join(gecici, 'dex'), ...classDosyalari],
    { stdio: 'inherit' }
  );

  const zip = await JSZip.loadAsync(fs.readFileSync(bazApk));
  zip.file('classes.dex', fs.readFileSync(path.join(gecici, 'dex', 'classes.dex')));

  const ham = await distVeKaynaklariApkyaylaBirlestir({
    sablonApkYolu: bazApk,
    distDizini: DIST_DIZIN,
    rawDizini: RAW_DIZIN,
    ikonYolu: IKON_HEDEF,
    manifestXmlYolu: MANIFEST_YOLU,
    dosyaYollariXmlYolu: DOSYA_YOLLARI_XML,
    kimlikBilgisi,
    izinler: rolIzinleriniGetir(kimlikBilgisi.konumIzniGerekliMi),
  });

  fs.rmSync(gecici, { recursive: true, force: true });
  return { hamTampon: ham.hamTampon, mod: 'native-android-sdk', webDosyaSayisi: ham.webDosyaSayisi };
}

async function calistir() {
  if (!fs.existsSync(DIST_DIZIN)) {
    throw new Error('dist/ klasoru bulunamadi. Once `npm run build` calistirin.');
  }

  // 1. Kimlik bilgisi oku
  const kimlikDosyasi = JSON.parse(
    fs.readFileSync(path.join(ANDROID_DIZIN, 'uygulama-kimligi.json'), 'utf8')
  );
  const aktifRol = process.env.AFYON_APK_ROL || kimlikDosyasi.aktifRol || 'admin';
  const rolDetay = kimlikDosyasi.roller[aktifRol];
  if (!rolDetay) {
    throw new Error(`Gecersiz APK rol tanimi: ${aktifRol}`);
  }

  const kimlikBilgisi = {
    rol: aktifRol,
    paketKimligi: rolDetay.paketKimligi,
    uygulamaAdi: rolDetay.uygulamaAdi,
    apkDosyaAdi: rolDetay.apkDosyaAdi,
    konumIzniGerekliMi: Boolean(rolDetay.konumIzniGerekliMi),
    surumKodu: Number(kimlikDosyasi.surumKodu || 1),
    surumAdi: String(kimlikDosyasi.surumAdi || '1.0.0'),
    minSdk: Number(kimlikDosyasi.minSdk || 24),
    targetSdk: Number(kimlikBilgisiOrDefault(kimlikDosyasi.targetSdk, 34)),
  };

  // 2. Hazir zil seslerini ve ikonu garantile
  hazirZilSesleriniUret(RAW_DIZIN);
  if (fs.existsSync(IKON_KAYNAK)) {
    fs.mkdirSync(path.dirname(IKON_HEDEF), { recursive: true });
    fs.copyFileSync(IKON_KAYNAK, IKON_HEDEF);
  }

  // 3. Keystore / imza anahtarini hazirla
  const imza = await imzaAnahtariniHazirla(ANDROID_DIZIN);

  // 4. Native SDK varsa native derle, yoksa mevcut sablon veya node sablonu ile olustur
  const androidJar = androidJarBul();
  const nativeAraclarTam = androidJar && komutVarMi('aapt2') && komutVarMi('d8') && komutVarMi('javac');

  let paket;
  if (nativeAraclarTam) {
    console.log('[APK Derleyici] Android SDK tespit edildi — tam native derleme baslatiliyor...');
    paket = await nativeSdkIleDerle({ androidJar, kimlikBilgisi });
  } else {
    const sablonAday1 = path.join(ANDROID_DIZIN, 'sablon', kimlikBilgisi.apkDosyaAdi);
    const sablonAday2 = path.join(ANDROID_DIZIN, 'sablon', 'sablon.apk');
    const seciliSablon = fs.existsSync(sablonAday1) ? sablonAday1 : fs.existsSync(sablonAday2) ? sablonAday2 : null;

    console.log(
      seciliSablon
        ? `[APK Derleyici] Mevcut sablon guncelleniyor: ${path.basename(seciliSablon)}`
        : '[APK Derleyici] Android SDK bulunamadi — Node.js APK paketleyici ile imzali APK uretiliyor...'
    );

    paket = await distVeKaynaklariApkyaylaBirlestir({
      sablonApkYolu: seciliSablon,
      distDizini: DIST_DIZIN,
      rawDizini: RAW_DIZIN,
      ikonYolu: IKON_HEDEF,
      manifestXmlYolu: MANIFEST_YOLU,
      dosyaYollariXmlYolu: DOSYA_YOLLARI_XML,
      kimlikBilgisi,
      izinler: rolIzinleriniGetir(kimlikBilgisi.konumIzniGerekliMi),
    });
  }

  // 5. apk_sign_ts ile JAR v1 + APK v2 + APK v3 imzala
  const signingKey = SigningKey.fromPEM(imza.privateKey, imza.certificate);
  const signer = new ApkSigner({ signingKey, jarKeyName: 'AFYON' });
  const { signedApk, signatureSize } = await signer.sign(paket.hamTampon);

  // 6. Ciktiyi android/cikti/ icine yaz (ASLA public/ veya dist/ icine yazma!)
  fs.mkdirSync(CIKTI_DIZIN, { recursive: true });
  const ciktiApkYolu = path.join(CIKTI_DIZIN, kimlikBilgisi.apkDosyaAdi);
  fs.writeFileSync(ciktiApkYolu, signedApk);

  // 7. Icinde baska .apk gomulu olmadigini dogrula
  const kontrolZip = await JSZip.loadAsync(signedApk);
  const gomuluApkler = Object.keys(kontrolZip.files).filter((ad) => ad.toLowerCase().endsWith('.apk'));
  if (gomuluApkler.length > 0) {
    throw new Error(`Guvenlik ihlali: APK icinde baska APK bulundu: ${gomuluApkler.join(', ')}`);
  }

  const sha256 = crypto.createHash('sha256').update(signedApk).digest('hex');
  const meta = {
    rol: kimlikBilgisi.rol,
    paketKimligi: kimlikBilgisi.paketKimligi,
    uygulamaAdi: kimlikBilgisi.uygulamaAdi,
    apkDosyaAdi: kimlikBilgisi.apkDosyaAdi,
    surumKodu: kimlikBilgisi.surumKodu,
    surumAdi: kimlikBilgisi.surumAdi,
    minSdk: kimlikBilgisi.minSdk,
    targetSdk: kimlikBilgisi.targetSdk,
    boyutByte: signedApk.length,
    boyutMb: Number((signedApk.length / (1024 * 1024)).toFixed(2)),
    sha256,
    imzaliMi: true,
    imzaYontemleri: ['JAR v1', 'APK Signature Scheme v2', 'APK Signature Scheme v3'],
    imzaBlokBoyutu: signatureSize,
    derlemeModu: paket.mod,
    webDosyaSayisi: paket.webDosyaSayisi,
    gomuluApkSayisi: gomuluApkler.length,
    indirmeYolu: `/api/apk/indir/${kimlikBilgisi.apkDosyaAdi}`,
    olusturmaTarihi: new Date().toISOString(),
  };

  fs.writeFileSync(path.join(CIKTI_DIZIN, 'apk-meta.json'), JSON.stringify(meta, null, 2), 'utf8');

  console.log(`[APK Hazir] ${ciktiApkYolu} (${meta.boyutMb} MB) | Imza: JAR v1 + v2 + v3 | Gomulu APK: 0`);
}

function kimlikBilgisiOrDefault(deger, varsayilan) {
  return deger !== undefined && deger !== null ? deger : varsayilan;
}

calistir().catch((hata) => {
  console.error('[APK Derleme Hatasi]:', hata);
  process.exit(1);
});
