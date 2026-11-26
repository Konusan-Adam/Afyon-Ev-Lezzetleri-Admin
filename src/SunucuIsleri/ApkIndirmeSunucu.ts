import express from 'express';
import fs from 'node:fs';
import path from 'node:path';

const router = express.Router();

const CIKTI_DIZINI = path.resolve('android', 'cikti');
const META_YOLU = path.join(CIKTI_DIZINI, 'apk-meta.json');

router.get('/apk/meta', (_req, res) => {
  try {
    if (!fs.existsSync(META_YOLU)) {
      return res.status(404).json({
        hata: 'APK henüz derlenmedi. Önce npm run build && npm run build:apk çalıştırın.',
      });
    }
    const ham = fs.readFileSync(META_YOLU, 'utf8');
    res.setHeader('Cache-Control', 'no-store');
    return res.json(JSON.parse(ham));
  } catch (hata) {
    return res.status(500).json({
      hata: hata instanceof Error ? hata.message : 'APK meta bilgisi okunamadı.',
    });
  }
});

function apkDosyasiGonder(res: express.Response, istenenAd?: string) {
  try {
    let hedefDosya = istenenAd ? path.basename(istenenAd) : 'afyon-admin.apk';
    if (!hedefDosya.toLowerCase().endsWith('.apk') && fs.existsSync(META_YOLU)) {
      const meta = JSON.parse(fs.readFileSync(META_YOLU, 'utf8'));
      hedefDosya = meta.apkDosyaAdi || 'afyon-admin.apk';
    }

    const tamYol = path.join(CIKTI_DIZINI, hedefDosya);
    if (!fs.existsSync(tamYol)) {
      return res.status(404).json({
        hata: 'APK dosyası bulunamadı. Önce npm run build:apk çalıştırın.',
      });
    }

    const istatistik = fs.statSync(tamYol);
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.setHeader('Content-Disposition', `attachment; filename="${hedefDosya}"`);
    res.setHeader('Content-Length', String(istatistik.size));
    res.setHeader('Cache-Control', 'no-store');
    return res.sendFile(tamYol);
  } catch (hata) {
    return res.status(500).json({
      hata: hata instanceof Error ? hata.message : 'APK indirilemedi.',
    });
  }
}

router.get('/apk/indir', (_req, res) => apkDosyasiGonder(res));
router.get('/apk/indir/:dosyaAdi', (req, res) => apkDosyasiGonder(res, req.params.dosyaAdi));

export default router;
