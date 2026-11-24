import { Router } from 'express';
import {
  gercekIpAdresiniAl,
  zamanDamgasiDogrula,
  zamanDamgasiOlustur,
} from './ZamanDamgasi/ZamanDamgasiServisi';

const router = Router();

router.post('/zaman-damgasi/damgala', async (req, res) => {
  try {
    const govde = req.body;
    if (!govde || typeof govde !== 'object' || Array.isArray(govde)) {
      return res.status(400).json({
        basarili: false,
        mesaj: 'Geçersiz istek gövdesi.',
      });
    }

    const ozetHash = typeof govde.ozetHash === 'string' ? govde.ozetHash.trim() : undefined;
    if (ozetHash && !/^[0-9a-fA-F]{64}$/.test(ozetHash)) {
      return res.status(400).json({
        basarili: false,
        mesaj: 'ozetHash 64 karakterli SHA-256 hex formatında olmalıdır.',
      });
    }

    if (!ozetHash && govde.veri === undefined) {
      return res.status(400).json({
        basarili: false,
        mesaj: 'Damgalama için ozetHash veya veri alanı zorunludur.',
      });
    }

    const ipAdresi = gercekIpAdresiniAl(req);
    const sonuc = await zamanDamgasiOlustur({
      ozetHash,
      veri: govde.veri,
      ipAdresi,
    });

    return res.json({
      basarili: true,
      ...sonuc,
    });
  } catch (hata: any) {
    console.error('Zaman damgası oluşturma hatası:', hata);
    return res.status(500).json({
      basarili: false,
      mesaj: 'Zaman damgası üretilirken sunucu hatası oluştu.',
    });
  }
});

router.post('/zaman-damgasi/dogrula', (req, res) => {
  try {
    const govde = req.body;
    if (!govde || typeof govde !== 'object' || Array.isArray(govde)) {
      return res.status(400).json({
        basarili: false,
        mesaj: 'Geçersiz doğrulama isteği.',
      });
    }

    const ozetHash = typeof govde.ozetHash === 'string' ? govde.ozetHash.trim() : '';
    if (!/^[0-9a-fA-F]{64}$/.test(ozetHash)) {
      return res.status(400).json({
        basarili: false,
        mesaj: 'Geçerli bir 64 karakterli SHA-256 ozetHash gereklidir.',
      });
    }

    const sonuc = zamanDamgasiDogrula({
      ozetHash,
      tsaTokenBase64: typeof govde.tsaTokenBase64 === 'string' ? govde.tsaTokenBase64 : undefined,
      sunucuUtc: typeof govde.sunucuUtc === 'string' ? govde.sunucuUtc : undefined,
      ipAdresi: typeof govde.ipAdresi === 'string' ? govde.ipAdresi : undefined,
      sunucuImzasi: typeof govde.sunucuImzasi === 'string' ? govde.sunucuImzasi : undefined,
    });

    return res.json({
      basarili: true,
      ...sonuc,
    });
  } catch (hata: any) {
    console.error('Zaman damgası doğrulama hatası:', hata);
    return res.status(500).json({
      basarili: false,
      mesaj: 'Zaman damgası doğrulanırken sunucu hatası oluştu.',
    });
  }
});

export default router;
