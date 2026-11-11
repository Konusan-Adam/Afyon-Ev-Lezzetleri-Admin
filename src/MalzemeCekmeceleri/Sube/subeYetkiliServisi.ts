import { canliFirebaseAktifMi, belgeKaydet, belgeSil, koleksiyonGetir } from '@/src/veritabani/FirebaseKoleksiyonServisi';
import { Kullanici } from '@/src/veritabani/VeriTipleri';

export interface SubeYetkiliAtamaGirdisi {
  sube_id: string;
  sube_adi?: string;
  ad_soyad: string;
  telefon: string;
  sifre?: string;
  isletme_adi?: string;
  eski_telefon?: string;
}

export async function subeMudurKullanicisiGetir(telefon: string): Promise<Kullanici | null> {
  if (!canliFirebaseAktifMi() || !telefon) return null;
  try {
    const kullanicilar = await koleksiyonGetir<Kullanici>('kullanicilar');
    const temiz = telefon.replace(/\D/g, '');
    return kullanicilar.find(k => k.telefon?.replace(/\D/g, '') === temiz) || null;
  } catch {
    return null;
  }
}

export async function subeyeMudurAta(girdi: SubeYetkiliAtamaGirdisi): Promise<boolean> {
  const { sube_id, sube_adi, ad_soyad, telefon, sifre, isletme_adi, eski_telefon } = girdi;
  try {
    const isletme = isletme_adi || (sube_adi ? `Afyon Ev Lezzetleri ${sube_adi}` : 'Afyon Ev Lezzetleri Şubesi');
    const kullaniciSifresi = sifre?.trim() || '1234';
    const temizTel = telefon.trim();
    if (canliFirebaseAktifMi()) {
      await belgeKaydet('gel_al_subeleri', sube_id, { yetkili_telefon: temizTel, yetkili_adi: ad_soyad.trim() });
      if (eski_telefon && eski_telefon.trim() !== temizTel) {
        await belgeSil('kullanicilar', `sube_admin_${eski_telefon.replace(/\D/g, '')}`);
      }
      const kullanicilar = await koleksiyonGetir<Kullanici>('kullanicilar');
      const mevcut = kullanicilar.find(k => k.telefon === temizTel);
      const id = mevcut?.id || `sube_admin_${temizTel.replace(/\D/g, '')}`;
      await belgeKaydet('kullanicilar', id, {
        id, kimlik: id, ad_soyad: ad_soyad.trim(), telefon: temizTel,
        rol: 'sube_admin', sube_id, isletme_adi: isletme, onayli_mi: true, sifre: kullaniciSifresi
      });
    }
    return true;
  } catch (hata) {
    console.error('Şube müdürü atama hatası:', hata);
    return false;
  }
}

export async function subedenMudurKaldir(sube_id: string, telefon?: string): Promise<boolean> {
  try {
    if (canliFirebaseAktifMi()) {
      await belgeKaydet('gel_al_subeleri', sube_id, { yetkili_telefon: '', yetkili_adi: '' });
      const kullanicilar = await koleksiyonGetir<Kullanici>('kullanicilar');
      const temiz = telefon ? telefon.replace(/\D/g, '') : '';
      const silinecekler = kullanicilar.filter(k =>
        (k.sube_id === sube_id && k.rol === 'sube_admin') ||
        (temiz && k.telefon && k.telefon.replace(/\D/g, '').includes(temiz.slice(-10)))
      );
      for (const k of silinecekler) {
        const id = k.id || k.kimlik;
        if (id) await belgeSil('kullanicilar', id);
      }
      if (temiz) {
        await belgeSil('kullanicilar', `sube_admin_${temiz}`);
        await belgeSil('kullanicilar', `sube_admin_0${temiz}`);
      }
    }
    return true;
  } catch (hata) {
    console.error('Şube müdürü kaldırma hatası:', hata);
    return false;
  }
}
