// Android Binary XML (AXML) Olusturucu — SDK olmadan gecerli AndroidManifest.xml ikili ciktisi uretir

const ANDROID_NS = 'http://schemas.android.com/apk/res/android';

const OZ_NITELIK_KIMLIKLERI = [
  { ad: 'label', id: 0x01010001 },
  { ad: 'icon', id: 0x01010002 },
  { ad: 'name', id: 0x01010003 },
  { ad: 'exported', id: 0x01010010 },
  { ad: 'authorities', id: 0x01010018 },
  { ad: 'grantUriPermissions', id: 0x0101001b },
  { ad: 'launchMode', id: 0x0101001d },
  { ad: 'minSdkVersion', id: 0x0101020c },
  { ad: 'versionCode', id: 0x0101021b },
  { ad: 'versionName', id: 0x0101021c },
  { ad: 'targetSdkVersion', id: 0x01010270 },
  { ad: 'usesCleartextTraffic', id: 0x010104ec },
  { ad: 'foregroundServiceType', id: 0x01010599 },
];

function utf16StringKodla(metin) {
  const uzunluk = metin.length;
  const karakterTampon = Buffer.from(metin, 'utf16le');
  const sonuc = Buffer.alloc(2 + karakterTampon.length + 2);
  sonuc.writeUInt16LE(uzunluk, 0);
  karakterTampon.copy(sonuc, 2);
  sonuc.writeUInt16LE(0, 2 + karakterTampon.length);
  return sonuc;
}

function stringHavuzuOlustur(dizgiler) {
  const ofsetler = [];
  const parcalar = [];
  let konum = 0;

  for (const s of dizgiler) {
    ofsetler.push(konum);
    const kodlu = utf16StringKodla(s);
    parcalar.push(kodlu);
    konum += kodlu.length;
  }

  const birlesikVeri = Buffer.concat(parcalar);
  const dolgu = (4 - (birlesikVeri.length % 4)) % 4;
  const veriUzunlugu = birlesikVeri.length + dolgu;

  const baslikBoyutu = 28;
  const ofsetDizisiBoyutu = dizgiler.length * 4;
  const dizgeBaslangici = baslikBoyutu + ofsetDizisiBoyutu;
  const toplamBoyut = dizgeBaslangici + veriUzunlugu;

  const tampon = Buffer.alloc(toplamBoyut);
  tampon.writeUInt16LE(0x0001, 0); // RES_STRING_POOL_TYPE
  tampon.writeUInt16LE(baslikBoyutu, 2);
  tampon.writeUInt32LE(toplamBoyut, 4);
  tampon.writeUInt32LE(dizgiler.length, 8);
  tampon.writeUInt32LE(0, 12); // styleCount
  tampon.writeUInt32LE(0, 16); // UTF-16LE
  tampon.writeUInt32LE(dizgeBaslangici, 20);
  tampon.writeUInt32LE(0, 24); // stylesStart

  for (let i = 0; i < ofsetler.length; i++) {
    tampon.writeUInt32LE(ofsetler[i], baslikBoyutu + i * 4);
  }
  birlesikVeri.copy(tampon, dizgeBaslangici);
  return tampon;
}

function kaynakHaritasiOlustur(kimlikler) {
  const boyut = 8 + kimlikler.length * 4;
  const tampon = Buffer.alloc(boyut);
  tampon.writeUInt16LE(0x0180, 0); // RES_XML_RESOURCE_MAP_TYPE
  tampon.writeUInt16LE(8, 2);
  tampon.writeUInt32LE(boyut, 4);
  for (let i = 0; i < kimlikler.length; i++) {
    tampon.writeUInt32LE(kimlikler[i], 8 + i * 4);
  }
  return tampon;
}

export function axmlManifestOlustur({
  paketKimligi,
  uygulamaAdi,
  surumKodu,
  surumAdi,
  minSdk,
  targetSdk,
  izinler,
}) {
  const havuz = [];
  const indeksMap = new Map();

  for (const k of OZ_NITELIK_KIMLIKLERI) {
    indeksMap.set(`attr:${k.ad}`, havuz.length);
    havuz.push(k.ad);
  }

  const strIdx = (metin) => {
    if (indeksMap.has(`str:${metin}`)) return indeksMap.get(`str:${metin}`);
    const idx = havuz.length;
    indeksMap.set(`str:${metin}`, idx);
    havuz.push(metin);
    return idx;
  };

  const attrIdx = (ad) => indeksMap.get(`attr:${ad}`);

  const nsPrefixIdx = strIdx('android');
  const nsUriIdx = strIdx(ANDROID_NS);

  const parcalar = [];
  let satirNo = 1;

  const nsBaslat = () => {
    const t = Buffer.alloc(24);
    t.writeUInt16LE(0x0100, 0);
    t.writeUInt16LE(16, 2);
    t.writeUInt32LE(24, 4);
    t.writeUInt32LE(satirNo++, 8);
    t.writeUInt32LE(0xffffffff, 12);
    t.writeUInt32LE(nsPrefixIdx, 16);
    t.writeUInt32LE(nsUriIdx, 20);
    parcalar.push(t);
  };

  const nsBitir = () => {
    const t = Buffer.alloc(24);
    t.writeUInt16LE(0x0101, 0);
    t.writeUInt16LE(16, 2);
    t.writeUInt32LE(24, 4);
    t.writeUInt32LE(satirNo++, 8);
    t.writeUInt32LE(0xffffffff, 12);
    t.writeUInt32LE(nsPrefixIdx, 16);
    t.writeUInt32LE(nsUriIdx, 20);
    parcalar.push(t);
  };

  const elemanBaslat = (etiketAdi, nitelikler = []) => {
    const boyut = 36 + nitelikler.length * 20;
    const t = Buffer.alloc(boyut);
    t.writeUInt16LE(0x0102, 0);
    t.writeUInt16LE(16, 2);
    t.writeUInt32LE(boyut, 4);
    t.writeUInt32LE(satirNo++, 8);
    t.writeUInt32LE(0xffffffff, 12);
    t.writeUInt32LE(0xffffffff, 16); // ns
    t.writeUInt32LE(strIdx(etiketAdi), 20);
    t.writeUInt16LE(0x0014, 24); // attrStart
    t.writeUInt16LE(0x0014, 26); // attrSize
    t.writeUInt16LE(nitelikler.length, 28);
    t.writeUInt16LE(0, 30);
    t.writeUInt16LE(0, 32);
    t.writeUInt16LE(0, 34);

    for (let i = 0; i < nitelikler.length; i++) {
      const n = nitelikler[i];
      const off = 36 + i * 20;
      const androidMi = n.android !== false;
      t.writeUInt32LE(androidMi ? nsUriIdx : 0xffffffff, off);
      t.writeUInt32LE(androidMi ? attrIdx(n.ad) : strIdx(n.ad), off + 4);
      t.writeUInt32LE(n.tip === 'string' ? strIdx(String(n.deger)) : 0xffffffff, off + 8);
      t.writeUInt16LE(8, off + 12);
      t.writeUInt8(0, off + 14);
      if (n.tip === 'string') {
        t.writeUInt8(0x03, off + 15);
        t.writeUInt32LE(strIdx(String(n.deger)), off + 16);
      } else if (n.tip === 'boolean') {
        t.writeUInt8(0x12, off + 15);
        t.writeUInt32LE(n.deger ? 0xffffffff : 0, off + 16);
      } else if (n.tip === 'int') {
        t.writeUInt8(0x10, off + 15);
        t.writeUInt32LE(Number(n.deger) >>> 0, off + 16);
      } else if (n.tip === 'reference') {
        t.writeUInt8(0x01, off + 15);
        t.writeUInt32LE(Number(n.deger) >>> 0, off + 16);
      }
    }
    parcalar.push(t);
  };

  const elemanBitir = (etiketAdi) => {
    const t = Buffer.alloc(24);
    t.writeUInt16LE(0x0103, 0);
    t.writeUInt16LE(16, 2);
    t.writeUInt32LE(24, 4);
    t.writeUInt32LE(satirNo++, 8);
    t.writeUInt32LE(0xffffffff, 12);
    t.writeUInt32LE(0xffffffff, 16);
    t.writeUInt32LE(strIdx(etiketAdi), 20);
    parcalar.push(t);
  };

  nsBaslat();
  elemanBaslat('manifest', [
    { ad: 'versionCode', tip: 'int', deger: surumKodu },
    { ad: 'versionName', tip: 'string', deger: surumAdi },
    { ad: 'package', tip: 'string', deger: paketKimligi, android: false },
  ]);

  elemanBaslat('uses-sdk', [
    { ad: 'minSdkVersion', tip: 'int', deger: minSdk },
    { ad: 'targetSdkVersion', tip: 'int', deger: targetSdk },
  ]);
  elemanBitir('uses-sdk');

  for (const izin of izinler) {
    elemanBaslat('uses-permission', [{ ad: 'name', tip: 'string', deger: izin }]);
    elemanBitir('uses-permission');
  }

  elemanBaslat('application', [
    { ad: 'label', tip: 'string', deger: uygulamaAdi },
    { ad: 'icon', tip: 'reference', deger: 0x7f020000 },
    { ad: 'usesCleartextTraffic', tip: 'boolean', deger: false },
  ]);

  elemanBaslat('activity', [
    { ad: 'name', tip: 'string', deger: `${paketKimligi}.MainActivity` },
    { ad: 'exported', tip: 'boolean', deger: true },
    { ad: 'launchMode', tip: 'int', deger: 1 }, // singleTop
  ]);
  elemanBaslat('intent-filter', []);
  elemanBaslat('action', [{ ad: 'name', tip: 'string', deger: 'android.intent.action.MAIN' }]);
  elemanBitir('action');
  elemanBaslat('category', [{ ad: 'name', tip: 'string', deger: 'android.intent.category.LAUNCHER' }]);
  elemanBitir('category');
  elemanBitir('intent-filter');
  elemanBitir('activity');

  elemanBaslat('service', [
    { ad: 'name', tip: 'string', deger: `${paketKimligi}.DinleyiciServisi` },
    { ad: 'exported', tip: 'boolean', deger: false },
    { ad: 'foregroundServiceType', tip: 'int', deger: 1 },
  ]);
  elemanBitir('service');

  elemanBaslat('receiver', [
    { ad: 'name', tip: 'string', deger: `${paketKimligi}.BootReceiver` },
    { ad: 'exported', tip: 'boolean', deger: true },
  ]);
  elemanBitir('receiver');

  elemanBaslat('provider', [
    { ad: 'name', tip: 'string', deger: `${paketKimligi}.ApkDosyaSaglayici` },
    { ad: 'authorities', tip: 'string', deger: `${paketKimligi}.dosya` },
    { ad: 'exported', tip: 'boolean', deger: false },
    { ad: 'grantUriPermissions', tip: 'boolean', deger: true },
  ]);
  elemanBitir('provider');

  elemanBitir('application');
  elemanBitir('manifest');
  nsBitir();

  const stringHavuzuTamponu = stringHavuzuOlustur(havuz);
  const kaynakHaritasiTamponu = kaynakHaritasiOlustur(OZ_NITELIK_KIMLIKLERI.map((k) => k.id));
  const govde = Buffer.concat([stringHavuzuTamponu, kaynakHaritasiTamponu, ...parcalar]);
  const baslik = Buffer.alloc(8);
  baslik.writeUInt16LE(0x0003, 0); // RES_XML_TYPE
  baslik.writeUInt16LE(8, 2);
  baslik.writeUInt32LE(8 + govde.length, 4);

  return Buffer.concat([baslik, govde]);
}
