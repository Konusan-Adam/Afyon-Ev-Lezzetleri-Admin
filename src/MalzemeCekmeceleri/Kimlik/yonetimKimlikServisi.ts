import { canliFirebaseAktifMi } from '@/src/veritabani/FirebaseIstemcisi';
import {
  belgeGetir,
  belgeKaydet,
  koleksiyonGetir,
} from '@/src/veritabani/FirebaseKoleksiyonServisi';
import { Kullanici, KullaniciRolu } from '@/src/veritabani/VeriTipleri';
import { telefonGecerliMi } from '@/src/MalzemeCekmeceleri/Dogrulama/telefonDogrulayici';
import {
  kullaniciBelgeIdOlustur,
  superAdminMi,
  telefonuOnBirHaneliyeCevir,
  telefonuOnHaneliyeCevir,
  YETKILI_SUPER_ADMIN_ROLLERI,
} from './kullaniciAnahtarYardimcisi';
import { superAdminHesabiniSenkronizeEt } from './superAdminSenkronizasyonu';

export interface YonetimGirisSonucu {
  basarili: boolean;
  kullanici?: Kullanici;
  hata?: string;
}

export const YETKISIZ_GIRIS_MESAJI = 'Yetkisiz giriş denemesi.';

export async function yonetimKullanicisiBul(
  telefon: string,
  izinliRoller: ReadonlyArray<KullaniciRolu> = YETKILI_SUPER_ADMIN_ROLLERI
): Promise<Kullanici | null> {
  const onBirTel = telefonuOnBirHaneliyeCevir(telefon);
  const onHaneTel = telefonuOnHaneliyeCevir(telefon);
  if (!onBirTel || !canliFirebaseAktifMi()) return null;

  for (const rol of izinliRoller) {
    const belgeId = kullaniciBelgeIdOlustur(onBirTel, rol);
    const dogrudan = await belgeGetir<Kullanici>('kullanicilar', belgeId);
    if (dogrudan && superAdminMi(dogrudan.rol)) {
      return dogrudan;
    }
  }

  const tumKullanicilar = await koleksiyonGetir<Kullanici>('kullanicilar');
  return (
    tumKullanicilar.find(
      (k) =>
        telefonuOnHaneliyeCevir(k.telefon || '') === onHaneTel &&
        superAdminMi(k.rol)
    ) || null
  );
}

export async function yonetimGirisDogrula(
  telefon: string,
  sifre: string
): Promise<YonetimGirisSonucu> {
  const dogrulama = telefonGecerliMi(telefon);
  if (!dogrulama.gecerli) {
    return { basarili: false, hata: dogrulama.hata || 'Geçerli bir telefon numarası giriniz.' };
  }

  const girilenSifre = sifre.trim();
  if (!girilenSifre) {
    return { basarili: false, hata: 'Lütfen şifrenizi giriniz.' };
  }

  await superAdminHesabiniSenkronizeEt();
  const bulunan = await yonetimKullanicisiBul(telefon, YETKILI_SUPER_ADMIN_ROLLERI);

  if (!bulunan || !superAdminMi(bulunan.rol)) {
    return { basarili: false, hata: YETKISIZ_GIRIS_MESAJI };
  }

  if (!bulunan.sifre || bulunan.sifre !== girilenSifre) {
    return { basarili: false, hata: 'Telefon numarası veya şifre hatalı.' };
  }

  return { basarili: true, kullanici: bulunan };
}

export async function yonetimSifreSifirla(
  telefon: string,
  rol: KullaniciRolu,
  yeniSifre: string
): Promise<{ basarili: boolean; hata?: string }> {
  if (!superAdminMi(rol)) {
    return { basarili: false, hata: YETKISIZ_GIRIS_MESAJI };
  }

  const dogrulama = telefonGecerliMi(telefon);
  if (!dogrulama.gecerli) {
    return { basarili: false, hata: dogrulama.hata || 'Geçerli bir telefon numarası giriniz.' };
  }

  const temizSifre = yeniSifre.trim();
  if (temizSifre.length < 4) {
    return { basarili: false, hata: 'Yeni şifre en az 4 karakter olmalıdır.' };
  }

  await superAdminHesabiniSenkronizeEt();
  const bulunan = await yonetimKullanicisiBul(telefon, YETKILI_SUPER_ADMIN_ROLLERI);

  if (!bulunan) {
    return { basarili: false, hata: YETKISIZ_GIRIS_MESAJI };
  }

  const hedefId = bulunan.id || bulunan.kimlik || kullaniciBelgeIdOlustur(telefon, bulunan.rol);
  const kaydedildi = await belgeKaydet('kullanicilar', hedefId, { sifre: temizSifre });

  return kaydedildi
    ? { basarili: true }
    : { basarili: false, hata: 'Şifre güncellenemedi. Lütfen tekrar deneyiniz.' };
}
