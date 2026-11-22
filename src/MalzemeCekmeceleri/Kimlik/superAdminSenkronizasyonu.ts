import { canliFirebaseAktifMi } from '@/src/veritabani/FirebaseIstemcisi';
import {
  belgeGetir,
  belgeKaydet,
  belgeSil,
  koleksiyonGetir,
} from '@/src/veritabani/FirebaseKoleksiyonServisi';
import { Kullanici } from '@/src/veritabani/VeriTipleri';
import {
  kullaniciBelgeIdOlustur,
  superAdminMi,
  telefonuOnHaneliyeCevir,
} from './kullaniciAnahtarYardimcisi';

const SUPER_ADMIN_TELEFON = '05304640656';
const SUPER_ADMIN_BASLANGIC_SIFRESI = '1979';
const SUPER_ADMIN_BELGE_ID = kullaniciBelgeIdOlustur(SUPER_ADMIN_TELEFON, 'super_admin');
const SILINECEK_ESKI_TELEFONLAR = ['5325420303', '5301234567', '5051234567'];
const SILINECEK_ESKI_IDLER = ['yonetici_patron_01', 'tel_05304640656', '05304640656_yonetici'];

let senkronizasyonTamamlandi = false;

export async function superAdminHesabiniSenkronizeEt(): Promise<void> {
  if (senkronizasyonTamamlandi || !canliFirebaseAktifMi()) return;
  try {
    const mevcut = await belgeGetir<Kullanici>('kullanicilar', SUPER_ADMIN_BELGE_ID);
    if (!mevcut) {
      await belgeKaydet('kullanicilar', SUPER_ADMIN_BELGE_ID, {
        id: SUPER_ADMIN_BELGE_ID,
        kimlik: SUPER_ADMIN_BELGE_ID,
        ad_soyad: 'Süper Admin (Patron)',
        telefon: SUPER_ADMIN_TELEFON,
        eposta: 'patron@afyonevlezzetleri.com',
        sifre: SUPER_ADMIN_BASLANGIC_SIFRESI,
        rol: 'super_admin',
        isletme_adi: 'Afyon Ev Lezzetleri Genel Merkez',
        ilce: 'Merkez',
        onayli_mi: true,
        onay_durumu: 'onaylandi',
        askida_mi: false,
        olusturma_tarihi: new Date().toISOString(),
      });
    }

    const tumKullanicilar = await koleksiyonGetir<Kullanici>('kullanicilar');
    for (const k of tumKullanicilar) {
      const belgeId = k.id || k.kimlik || '';
      if (!belgeId || belgeId === SUPER_ADMIN_BELGE_ID) continue;

      const onHaneTel = telefonuOnHaneliyeCevir(k.telefon || '');
      const eskiAdminIdMi = SILINECEK_ESKI_IDLER.includes(belgeId);
      const eskiAdminTelefonuMu =
        SILINECEK_ESKI_TELEFONLAR.includes(onHaneTel) &&
        (superAdminMi(k.rol) || belgeId.startsWith('tel_'));
      const baskaSuperAdminMi = superAdminMi(k.rol) && onHaneTel !== '5304640656';

      if (eskiAdminIdMi || eskiAdminTelefonuMu || baskaSuperAdminMi) {
        await belgeSil('kullanicilar', belgeId);
      }
    }
    senkronizasyonTamamlandi = true;
  } catch (hata) {
    console.warn('Süper admin senkronizasyon uyarısı:', hata);
  }
}
