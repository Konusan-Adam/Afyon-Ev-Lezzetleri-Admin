import { Router } from 'express';
import {
  paytrSepetKodla,
  tutarKurusaCevir,
  paytrTokenImzala,
  paytrCallbackDogrula
} from './Paytr/PaytrImzaYardimcisi';
import { paytrIslemKaydet, paytrIslemDurumuGetir } from './Paytr/PaytrDurumHafizasi';

const router = Router();

function paytrAyarlariniOku(istekTestModu?: boolean) {
  const envTest = (process.env.PAYTR_TEST_MODU || '1').trim() === '0' ? '0' : '1';
  const testModu = typeof istekTestModu === 'boolean' ? (istekTestModu ? '1' : '0') : envTest;
  return {
    merchantId: (process.env.PAYTR_MERCHANT_ID || '').trim(),
    merchantKey: (process.env.PAYTR_MERCHANT_KEY || '').trim(),
    merchantSalt: (process.env.PAYTR_MERCHANT_SALT || '').trim(),
    testModu
  };
}

async function paytrApiTokenAl(param: {
  ayar: ReturnType<typeof paytrAyarlariniOku>;
  kullaniciIp: string;
  merchantOid: string;
  eposta: string;
  tutarKurus: number;
  sepetBase64: string;
  taksitYok: string;
  maxTaksit: string;
  musteriAdi: string;
  adres: string;
  telefon: string;
  tabanUrl: string;
}) {
  const paytrToken = paytrTokenImzala({
    merchantId: param.ayar.merchantId,
    merchantKey: param.ayar.merchantKey,
    merchantSalt: param.ayar.merchantSalt,
    kullaniciIp: param.kullaniciIp,
    merchantOid: param.merchantOid,
    eposta: param.eposta,
    tutarKurus: param.tutarKurus,
    sepetBase64: param.sepetBase64,
    taksitYok: param.taksitYok,
    maxTaksit: param.maxTaksit,
    paraBirimi: 'TL',
    testModu: param.ayar.testModu
  });

  const govde = new URLSearchParams({
    merchant_id: param.ayar.merchantId,
    user_ip: param.kullaniciIp,
    merchant_oid: param.merchantOid,
    email: param.eposta,
    payment_amount: String(param.tutarKurus),
    paytr_token: paytrToken,
    user_basket: param.sepetBase64,
    debug_on: param.ayar.testModu,
    no_installment: param.taksitYok,
    max_installment: param.maxTaksit,
    user_name: param.musteriAdi,
    user_address: param.adres,
    user_phone: param.telefon,
    merchant_ok_url: `${param.tabanUrl}/?paytr=basarili&oid=${param.merchantOid}`,
    merchant_fail_url: `${param.tabanUrl}/?paytr=hata&oid=${param.merchantOid}`,
    timeout_limit: '30',
    currency: 'TL',
    test_mode: param.ayar.testModu,
    lang: 'tr'
  });

  const yanit = await fetch('https://www.paytr.com/odeme/api/get-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: govde.toString()
  });
  return yanit.json();
}

router.get('/paytr/hazirlik', (_req, res) => {
  const ayar = paytrAyarlariniOku();
  return res.json({
    yapilandirildi: Boolean(ayar.merchantId && ayar.merchantKey && ayar.merchantSalt),
    testModu: ayar.testModu === '1'
  });
});

router.post('/paytr/test', async (req, res) => {
  const { testModu, donusTabanUrl } = req.body || {};
  const ayar = paytrAyarlariniOku(typeof testModu === 'boolean' ? testModu : true);
  if (!ayar.merchantId || !ayar.merchantKey || !ayar.merchantSalt) {
    return res.json({
      basarili: false,
      yapilandirmaEksik: true,
      mesaj: 'Sunucu Secrets içinde PAYTR_MERCHANT_ID, PAYTR_MERCHANT_KEY veya PAYTR_MERCHANT_SALT eksik.'
    });
  }

  const merchantOid = `AFYTEST${Date.now()}`;
  const kullaniciIp = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1').split(',')[0].trim();
  const tabanUrl = (donusTabanUrl || process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '');

  try {
    const veri: any = await paytrApiTokenAl({
      ayar,
      kullaniciIp,
      merchantOid,
      eposta: 'test@afyonevlezzetleri.com',
      tutarKurus: 100,
      sepetBase64: paytrSepetKodla([{ ad: 'PayTR Baglanti Testi', fiyat: 1, adet: 1 }]),
      taksitYok: '1',
      maxTaksit: '0',
      musteriAdi: 'Afyon Test',
      adres: 'Afyonkarahisar Merkez',
      telefon: '05000000000',
      tabanUrl
    });

    if (veri?.status === 'success' && veri?.token) {
      return res.json({
        basarili: true,
        testModu: ayar.testModu === '1',
        mesaj: 'PayTR sunucusundan 1,00 TL test iFrame tokenı başarıyla alındı! Anahtarlar ve imza doğrulandı.'
      });
    }
    return res.json({
      basarili: false,
      mesaj: `PayTR API reddetti: ${veri?.reason || 'Bilinmeyen PayTR yanıtı'}`
    });
  } catch (err: any) {
    return res.json({ basarili: false, mesaj: `PayTR sunucusuna ulaşılamadı: ${err?.message || 'Bağlantı hatası'}` });
  }
});

router.post('/paytr/token', async (req, res) => {
  const {
    tutar, musteriAdi, musteriTelefon, adres, eposta, elemanlar, donusTabanUrl,
    testModu, taksitAktif, maksimumTaksit, demoSimulasyonAktif
  } = req.body || {};

  const ayar = paytrAyarlariniOku(typeof testModu === 'boolean' ? testModu : undefined);
  const tutarKurus = tutarKurusaCevir(Number(tutar || 0));
  const merchantOid = `AFYPAY${Date.now()}${Math.floor(100 + Math.random() * 900)}`;

  if (!ayar.merchantId || !ayar.merchantKey || !ayar.merchantSalt) {
    if (demoSimulasyonAktif) {
      paytrIslemKaydet({ merchantOid, durum: 'beklemede', toplamKurus: tutarKurus, guncellemeZamani: Date.now() });
      return res.json({ basarili: true, demoMod: true, merchantOid, tutar: Number(tutar || 0) });
    }
    return res.status(503).json({
      basarili: false,
      yapilandirmaEksik: true,
      mesaj: 'PayTR mağaza bilgileri sunucuda tanımlı değil. Patron Masası → Sanal POS sekmesinden Demo Simülasyonu açabilirsiniz.'
    });
  }

  const temizEposta = (eposta && String(eposta).includes('@') ? String(eposta) : 'musteri@afyonevlezzetleri.com').slice(0, 100);
  const kullaniciIp = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1').split(',')[0].trim();
  const tabanUrl = (donusTabanUrl || process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '');

  try {
    const veri: any = await paytrApiTokenAl({
      ayar,
      kullaniciIp,
      merchantOid,
      eposta: temizEposta,
      tutarKurus,
      sepetBase64: paytrSepetKodla(Array.isArray(elemanlar) ? elemanlar : []),
      taksitYok: taksitAktif === false ? '1' : '0',
      maxTaksit: taksitAktif === false ? '0' : String(Number(maksimumTaksit || 0)),
      musteriAdi: String(musteriAdi || 'Afyon Musteri').slice(0, 60),
      adres: String(adres || 'Afyonkarahisar').slice(0, 350),
      telefon: String(musteriTelefon || '05000000000').slice(0, 20),
      tabanUrl
    });

    if (veri?.status === 'success' && veri?.token) {
      paytrIslemKaydet({ merchantOid, durum: 'beklemede', toplamKurus: tutarKurus, guncellemeZamani: Date.now() });
      return res.json({
        basarili: true,
        merchantOid,
        token: veri.token,
        iframeUrl: `https://www.paytr.com/odeme/guvenli/${veri.token}`
      });
    }
    return res.status(400).json({ basarili: false, mesaj: veri?.reason || 'PayTR token oluşturulamadı.' });
  } catch (err: any) {
    return res.status(502).json({ basarili: false, mesaj: `PayTR bağlantı hatası: ${err?.message || 'Bilinmeyen hata'}` });
  }
});

router.post('/paytr/demo-sonuc', (req, res) => {
  const { merchantOid, basarili, tutar, hataNedeni } = req.body || {};
  if (!merchantOid) return res.status(400).json({ basarili: false });
  paytrIslemKaydet({
    merchantOid: String(merchantOid),
    durum: basarili ? 'odendi' : 'basarisiz',
    toplamKurus: tutarKurusaCevir(Number(tutar || 0)),
    hataNedeni: basarili ? undefined : String(hataNedeni || 'Demo kart ödemesi reddedildi.'),
    guncellemeZamani: Date.now()
  });
  return res.json({ basarili: true });
});

router.post('/paytr/callback', (req, res) => {
  const ayar = paytrAyarlariniOku();
  const { merchant_oid, status, total_amount, hash, failed_reason_msg } = req.body || {};

  if (!paytrCallbackDogrula({
    merchantOid: String(merchant_oid || ''),
    status: String(status || ''),
    totalAmount: String(total_amount || ''),
    hash: String(hash || ''),
    merchantKey: ayar.merchantKey,
    merchantSalt: ayar.merchantSalt
  })) {
    return res.status(400).send('PAYTR notification failed: bad hash');
  }

  paytrIslemKaydet({
    merchantOid: String(merchant_oid),
    durum: status === 'success' ? 'odendi' : 'basarisiz',
    toplamKurus: Number(total_amount || 0),
    hataNedeni: failed_reason_msg ? String(failed_reason_msg) : undefined,
    guncellemeZamani: Date.now()
  });

  return res.send('OK');
});

router.get('/paytr/durum/:merchantOid', (req, res) => {
  const kayit = paytrIslemDurumuGetir(req.params.merchantOid);
  if (!kayit) return res.json({ durum: 'beklemede' });
  return res.json(kayit);
});

export default router;
