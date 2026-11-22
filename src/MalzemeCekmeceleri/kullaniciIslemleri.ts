import { Kullanici, KullaniciRolu } from '@/src/veritabani/VeriTipleri';
import { canliFirebaseAktifMi } from '@/src/veritabani/FirebaseIstemcisi';
import { belgeGetir, belgeKaydet, koleksiyonGetir } from '@/src/veritabani/FirebaseKoleksiyonServisi';
import {
  testKullaniciDogrula,
  testKullaniciEkle,
  TestKullaniciKaydi,
} from '@/src/veritabani/CanliVeriYardimcisi';
import { telefonGecerliMi } from '@/src/MalzemeCekmeceleri';
import { patronBildirimiEkle } from '@/src/MalzemeCekmeceleri/PatronBildirimServisi';
import { RESMI_MUTFAK_LOGOSU } from '@/src/MalzemeCekmeceleri/Mutfak/resmiMutfakLogosu';
import {
  kullaniciBelgeIdOlustur,
  telefonuOnBirHaneliyeCevir,
  telefonuOnHaneliyeCevir,
  yonetimYetkisiVarMi,
} from '@/src/MalzemeCekmeceleri/Kimlik/kullaniciAnahtarYardimcisi';

const VITRIN_ROLLERI: ReadonlyArray<KullaniciRolu> = [
  'musteri',
  'ev_mutfagi',
  'ticari_restoran',
  'kurye',
  'asci',
];

export async function veritabaninaKullaniciKaydet(
  yeniKullanici: Omit<Kullanici, 'kimlik' | 'onayli_mi' | 'olusturma_tarihi'> & { sifre?: string }
): Promise<Kullanici | null> {
  if (yonetimYetkisiVarMi(yeniKullanici.rol)) {
    console.warn('Yönetim rolleri genel kayıt akışından oluşturulamaz.');
    return null;
  }

  const dogrulama = telefonGecerliMi(yeniKullanici.telefon);
  if (!dogrulama.gecerli) {
    console.warn('Geçersiz telefon numarası ile kayıt reddedildi:', yeniKullanici.telefon);
    return null;
  }

  const sifreMetni = yeniKullanici.sifre?.trim() || '';
  if (sifreMetni.length < 4) {
    console.warn('Geçersiz şifre ile kayıt reddedildi.');
    return null;
  }

  const standartTelefon = telefonuOnHaneliyeCevir(yeniKullanici.telefon);
  const duzgunTelefon = telefonuOnBirHaneliyeCevir(yeniKullanici.telefon);
  const kimlikId = kullaniciBelgeIdOlustur(duzgunTelefon, yeniKullanici.rol);

  // Aynı (telefon_numarasi + rol) ikilisiyle ikinci kayıt açılmasını engelle
  if (canliFirebaseAktifMi()) {
    try {
      const dogrudanKayit = await belgeGetir<Kullanici>('kullanicilar', kimlikId);
      if (dogrudanKayit) {
        console.warn('Bu telefon ve rol için zaten kayıtlı bir kullanıcı var:', kimlikId);
        return null;
      }
      const mevcutlar = await koleksiyonGetir<Kullanici>('kullanicilar');
      const ayniRolKaydi = mevcutlar.find(
        (k) =>
          telefonuOnHaneliyeCevir(k.telefon || '') === standartTelefon &&
          k.rol === yeniKullanici.rol
      );
      if (ayniRolKaydi) {
        console.warn('Bu telefon ve rol için zaten kayıtlı bir kullanıcı var:', kimlikId);
        return null;
      }
    } catch {}
  }

  const kullaniciKaydi: any = {
    id: kimlikId,
    kimlik: kimlikId,
    ad_soyad: yeniKullanici.ad_soyad ? yeniKullanici.ad_soyad.trim() : 'İsimsiz',
    telefon: duzgunTelefon,
    eposta: (yeniKullanici as any).eposta || '',
    sifre: sifreMetni,
    rol: yeniKullanici.rol,
    isletme_adi: yeniKullanici.isletme_adi || '',
    arac_tipi: yeniKullanici.arac_tipi || '',
    ilce: yeniKullanici.ilce || 'Merkez',
    onayli_mi: yeniKullanici.rol === 'musteri',
    onay_durumu: yeniKullanici.rol === 'musteri' ? 'onaylandi' : 'beklemede',
    askida_mi: false,
    olusturma_tarihi: new Date().toISOString(),
  };

  testKullaniciEkle(kullaniciKaydi as unknown as TestKullaniciKaydi);

  if (yeniKullanici.rol === 'musteri') {
    patronBildirimiEkle('yeni_musteri', 'Yeni Müşteri Kaydı', `${kullaniciKaydi.ad_soyad} (${kullaniciKaydi.telefon}) sisteme üye oldu.`);
  } else if (yeniKullanici.rol === 'ev_mutfagi' || yeniKullanici.rol === 'ticari_restoran') {
    patronBildirimiEkle('yeni_mutfak', 'Yeni Mutfak Başvurusu ⚠️', `${kullaniciKaydi.isletme_adi || kullaniciKaydi.ad_soyad} mutfak kaydı oluşturdu. Onay bekliyor.`, kimlikId);
    if (!(yeniKullanici as any).hijyen_onayli_mi) {
      patronBildirimiEkle('eksik_belge', 'Mutfak Hijyen Belgesi Eksik ⚠️', `${kullaniciKaydi.isletme_adi || kullaniciKaydi.ad_soyad} mutfağının hijyen / yasal evrakları eksik. İnceleyin.`, kimlikId);
    }
  } else if (yeniKullanici.rol === 'kurye') {
    patronBildirimiEkle('yeni_kurye', 'Yeni Kurye Başvurusu 🛵', `${kullaniciKaydi.ad_soyad} kurye olmak için başvurdu. Onay bekliyor.`, kimlikId);
  }

  if (canliFirebaseAktifMi()) {
    try {
      await belgeKaydet('kullanicilar', kimlikId, kullaniciKaydi);

      if (yeniKullanici.rol === 'ev_mutfagi' || yeniKullanici.rol === 'ticari_restoran') {
        const mutfakIsmi =
          yeniKullanici.isletme_adi && yeniKullanici.isletme_adi.trim() !== ''
            ? yeniKullanici.isletme_adi.trim()
            : yeniKullanici.ad_soyad.trim();

        await belgeKaydet('mutfaklar', kimlikId, {
          id: kimlikId,
          kimlik: kimlikId,
          ad: mutfakIsmi,
          mutfak_adi: mutfakIsmi,
          aciklama: 'Afyonkarahisar anne eliyle taze pişirilen sıcak ev lezzetleri.',
          adres: `${yeniKullanici.ilce || 'Merkez'}, Afyonkarahisar`,
          telefon: standartTelefon,
          min_siparis_tutari: 100,
          teslimat_ucreti: 25,
          puan: 5.0,
          gorsel_url: RESMI_MUTFAK_LOGOSU,
          sahip_id: kimlikId,
          onayli_mi: false,
          onay_durumu: 'beklemede',
          askida_mi: false,
          hijyen_onayli_mi: false,
          esnaf_muafiyet_onayli_mi: false,
          belgeler: (yeniKullanici as any).belgeler || {},
          olusturma_tarihi: new Date().toISOString(),
        });
      }
    } catch (hata) {
      console.warn('Firebase kullanıcı/mutfak kayıt hatası:', hata);
    }
  }

  return kullaniciKaydi;
}

export async function veritabanindanKullaniciGirisYaptir(
  telefon: string,
  sifre: string,
  izinliRoller: ReadonlyArray<KullaniciRolu> = VITRIN_ROLLERI
): Promise<Kullanici | null> {
  const dogrulama = telefonGecerliMi(telefon);
  if (!dogrulama.gecerli) {
    console.warn('Geçersiz telefon formatı ile giriş denemesi:', telefon);
    return null;
  }

  const standartTelefon = telefonuOnHaneliyeCevir(telefon);
  const duzgunTelefon = telefonuOnBirHaneliyeCevir(telefon);
  const girilenSifre = sifre.trim();
  if (!girilenSifre) return null;

  if (canliFirebaseAktifMi()) {
    try {
      for (const rol of izinliRoller) {
        const belgeId = kullaniciBelgeIdOlustur(duzgunTelefon, rol);
        const dogrudan = await belgeGetir<Kullanici>('kullanicilar', belgeId);
        if (dogrudan && izinliRoller.includes(dogrudan.rol) && dogrudan.sifre === girilenSifre) {
          return dogrudan;
        }
      }

      const tumKullanicilar = await koleksiyonGetir<Kullanici>('kullanicilar');
      const bulunan = tumKullanicilar.find(
        (k) =>
          telefonuOnHaneliyeCevir(k.telefon || '') === standartTelefon &&
          izinliRoller.includes(k.rol) &&
          k.sifre === girilenSifre
      );
      if (bulunan) {
        return bulunan;
      }

      console.warn('Yetkili kullanıcı bulunamadı veya şifre hatalı:', standartTelefon);
      return null;
    } catch (hata) {
      console.warn('Firebase kullanıcı giriş okuma hatası:', hata);
    }
  }

  return testKullaniciDogrula(standartTelefon, girilenSifre);
}
