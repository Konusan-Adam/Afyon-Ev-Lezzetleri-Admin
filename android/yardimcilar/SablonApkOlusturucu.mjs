import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import JSZip from 'jszip';
import { axmlManifestOlustur } from './AxmlOlusturucu.mjs';

function adler32Hesapla(tampon) {
  let a = 1;
  let b = 0;
  for (let i = 0; i < tampon.length; i++) {
    a = (a + tampon[i]) % 65521;
    b = (b + a) % 65521;
  }
  return ((b << 16) | a) >>> 0;
}

export function gecerliDexOlustur() {
  const dex = Buffer.alloc(112);
  Buffer.from('dex\n035\0', 'ascii').copy(dex, 0);
  dex.writeUInt32LE(112, 32); // file_size
  dex.writeUInt32LE(112, 36); // header_size
  dex.writeUInt32LE(0x12345678, 40); // endian_tag

  const sha1 = crypto.createHash('sha1').update(dex.subarray(32)).digest();
  sha1.copy(dex, 12);

  const adler = adler32Hesapla(dex.subarray(12));
  dex.writeUInt32LE(adler, 8);
  return dex;
}

function utf16Pool(dizgiler) {
  const ofsetler = [];
  const parcalar = [];
  let pos = 0;
  for (const s of dizgiler) {
    ofsetler.push(pos);
    const body = Buffer.from(s, 'utf16le');
    const rec = Buffer.alloc(2 + body.length + 2);
    rec.writeUInt16LE(s.length, 0);
    body.copy(rec, 2);
    parcalar.push(rec);
    pos += rec.length;
  }
  const veri = Buffer.concat(parcalar);
  const dolgu = (4 - (veri.length % 4)) % 4;
  const baslik = 28;
  const dizgeBas = baslik + dizgiler.length * 4;
  const toplam = dizgeBas + veri.length + dolgu;
  const t = Buffer.alloc(toplam);
  t.writeUInt16LE(0x0001, 0);
  t.writeUInt16LE(baslik, 2);
  t.writeUInt32LE(toplam, 4);
  t.writeUInt32LE(dizgiler.length, 8);
  t.writeUInt32LE(0, 12);
  t.writeUInt32LE(0, 16);
  t.writeUInt32LE(dizgeBas, 20);
  t.writeUInt32LE(0, 24);
  for (let i = 0; i < ofsetler.length; i++) {
    t.writeUInt32LE(ofsetler[i], baslik + i * 4);
  }
  veri.copy(t, dizgeBas);
  return t;
}

export function minimalResourcesArscOlustur(paketKimligi, uygulamaAdi) {
  const globalPool = utf16Pool([uygulamaAdi]);
  const typeStrings = utf16Pool(['string']);
  const keyStrings = utf16Pool(['app_name']);

  // TypeSpec (string)
  const typeSpec = Buffer.alloc(20);
  typeSpec.writeUInt16LE(0x0202, 0);
  typeSpec.writeUInt16LE(16, 2);
  typeSpec.writeUInt32LE(20, 4);
  typeSpec.writeUInt8(1, 8); // id=1
  typeSpec.writeUInt32LE(1, 12); // entryCount=1
  typeSpec.writeUInt32LE(0, 16);

  // ResTable_type (default config)
  const typeHeader = 84; // ResTable_config=64 + 20
  const entriesStart = typeHeader + 4;
  const entryLen = 16; // ResTable_entry (8) + Res_value (8)
  const typeTotal = entriesStart + entryLen;
  const typeChunk = Buffer.alloc(typeTotal);
  typeChunk.writeUInt16LE(0x0201, 0);
  typeChunk.writeUInt16LE(typeHeader, 2);
  typeChunk.writeUInt32LE(typeTotal, 4);
  typeChunk.writeUInt8(1, 8); // id=1
  typeChunk.writeUInt32LE(1, 12); // entryCount=1
  typeChunk.writeUInt32LE(entriesStart, 16);
  typeChunk.writeUInt32LE(64, 20); // ResTable_config size
  typeChunk.writeUInt32LE(0, typeHeader); // offset[0] = 0

  typeChunk.writeUInt16LE(8, entriesStart); // entry size
  typeChunk.writeUInt16LE(0, entriesStart + 2);
  typeChunk.writeUInt32LE(0, entriesStart + 4); // key=app_name (0)
  typeChunk.writeUInt16LE(8, entriesStart + 8); // Res_value size
  typeChunk.writeUInt8(0, entriesStart + 10);
  typeChunk.writeUInt8(0x03, entriesStart + 11); // TYPE_STRING
  typeChunk.writeUInt32LE(0, entriesStart + 12); // globalPool[0] = uygulamaAdi

  const pkgGovde = Buffer.concat([typeStrings, keyStrings, typeSpec, typeChunk]);
  const pkgBaslik = Buffer.alloc(288);
  pkgBaslik.writeUInt16LE(0x0200, 0);
  pkgBaslik.writeUInt16LE(288, 2);
  pkgBaslik.writeUInt32LE(288 + pkgGovde.length, 4);
  pkgBaslik.writeUInt32LE(0x7f, 8); // id=0x7f
  Buffer.from(paketKimligi.slice(0, 127), 'utf16le').copy(pkgBaslik, 12);
  pkgBaslik.writeUInt32LE(288, 268); // typeStrings offset
  pkgBaslik.writeUInt32LE(1, 272); // lastPublicType
  pkgBaslik.writeUInt32LE(288 + typeStrings.length, 276); // keyStrings offset
  pkgBaslik.writeUInt32LE(1, 280); // lastPublicKey

  const pkgChunk = Buffer.concat([pkgBaslik, pkgGovde]);
  const tableBaslik = Buffer.alloc(12);
  tableBaslik.writeUInt16LE(0x0002, 0);
  tableBaslik.writeUInt16LE(12, 2);
  tableBaslik.writeUInt32LE(12 + globalPool.length + pkgChunk.length, 4);
  tableBaslik.writeUInt32LE(1, 8); // packageCount

  return Buffer.concat([tableBaslik, globalPool, pkgChunk]);
}

function dizinDosyalariniTopla(kokDizin, taban = kokDizin) {
  const sonuclar = [];
  if (!fs.existsSync(kokDizin)) return sonuclar;
  for (const giris of fs.readdirSync(kokDizin, { withFileTypes: true })) {
    const tamYol = path.join(kokDizin, giris.name);
    if (giris.isDirectory()) {
      sonuclar.push(...dizinDosyalariniTopla(tamYol, taban));
    } else if (giris.isFile()) {
      // Kendi icinde APK gomulmesini kesinlikle engelle
      if (giris.name.toLowerCase().endsWith('.apk')) continue;
      sonuclar.push({
        tamYol,
        goreceliYol: path.relative(taban, tamYol).replace(/\\/g, '/'),
      });
    }
  }
  return sonuclar;
}

export async function distVeKaynaklariApkyaylaBirlestir({
  sablonApkYolu,
  distDizini,
  rawDizini,
  ikonYolu,
  manifestXmlYolu,
  dosyaYollariXmlYolu,
  kimlikBilgisi,
  izinler,
}) {
  let zip;
  let mod = 'sablon-uretim';

  if (sablonApkYolu && fs.existsSync(sablonApkYolu)) {
    zip = await JSZip.loadAsync(fs.readFileSync(sablonApkYolu));
    mod = 'mevcut-sablon-guncelleme';
    // Eski imza ve eski web varliklarini temizle
    for (const yol of Object.keys(zip.files)) {
      if (yol.startsWith('META-INF/') || yol.startsWith('assets/www/')) {
        zip.remove(yol);
      }
    }
  } else {
    zip = new JSZip();
    const axml = axmlManifestOlustur({
      paketKimligi: kimlikBilgisi.paketKimligi,
      uygulamaAdi: kimlikBilgisi.uygulamaAdi,
      surumKodu: kimlikBilgisi.surumKodu,
      surumAdi: kimlikBilgisi.surumAdi,
      minSdk: kimlikBilgisi.minSdk,
      targetSdk: kimlikBilgisi.targetSdk,
      izinler,
    });
    zip.file('AndroidManifest.xml', axml, { compression: 'DEFLATE' });
    zip.file('classes.dex', gecerliDexOlustur(), { compression: 'DEFLATE' });
    zip.file(
      'resources.arsc',
      minimalResourcesArscOlustur(kimlikBilgisi.paketKimligi, kimlikBilgisi.uygulamaAdi),
      { compression: 'STORE' }
    );
  }

  // Raw zil seslerini gom (sikistirmasiz STORE — Android MediaPlayer icin gereklidir)
  if (fs.existsSync(rawDizini)) {
    for (const dosya of fs.readdirSync(rawDizini)) {
      if (dosya.toLowerCase().endsWith('.apk')) continue;
      zip.file(`res/raw/${dosya}`, fs.readFileSync(path.join(rawDizini, dosya)), {
        compression: 'STORE',
      });
    }
  }

  // Uygulama ikonu ve FileProvider XML kaynagi
  if (ikonYolu && fs.existsSync(ikonYolu)) {
    zip.file('res/mipmap-xxxhdpi/ic_launcher.png', fs.readFileSync(ikonYolu), {
      compression: 'STORE',
    });
  }
  if (dosyaYollariXmlYolu && fs.existsSync(dosyaYollariXmlYolu)) {
    zip.file('res/xml/dosya_yollari.xml', fs.readFileSync(dosyaYollariXmlYolu), {
      compression: 'DEFLATE',
    });
  }
  if (manifestXmlYolu && fs.existsSync(manifestXmlYolu)) {
    // Kaynak manifest referans kopyasi (Android studio uyumu)
    zip.file('assets/uygulama-kimligi.json', JSON.stringify(kimlikBilgisi, null, 2), {
      compression: 'DEFLATE',
    });
  }

  // dist/ ciktisini assets/www/ icine gom (.apk dosyalarini haric tutarak)
  const webDosyalari = dizinDosyalariniTopla(distDizini);
  for (const dosya of webDosyalari) {
    const uzanti = path.extname(dosya.goreceliYol).toLowerCase();
    const sikistirmasiz = ['.png', '.jpg', '.jpeg', '.webp', '.wav', '.mp3', '.ogg'].includes(uzanti);
    zip.file(`assets/www/${dosya.goreceliYol}`, fs.readFileSync(dosya.tamYol), {
      compression: sikistirmasiz ? 'STORE' : 'DEFLATE',
    });
  }

  const hamTampon = await zip.generateAsync({
    type: 'uint8array',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  return { hamTampon, mod, webDosyaSayisi: webDosyalari.length };
}
