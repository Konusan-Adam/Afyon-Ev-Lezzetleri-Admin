import {
  belgeGetir,
  belgeKaydet,
  belgeSil,
  canliFirebaseAktifMi,
  koleksiyonGetir,
} from '@/src/veritabani/FirebaseKoleksiyonServisi';
import { Kullanici } from '@/src/veritabani/VeriTipleri';
import {
  kullaniciBelgeIdOlustur,
  subeMuduruMu,
  telefonuOnBirHaneliyeCevir,
  telefonuOnHaneliyeCevir,
} from '@/src/MalzemeCekmeceleri/Kimlik/kullaniciAnahtarYardimcisi';

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
    const onBirTel = telefonuOnBirHaneliyeCevir(telefon);
    const onHaneTel = telefonuOnHaneliyeCevir(telefon);
    const yeniBelge = await belgeGetir<Kullanici>(
      'kullanicilar',
      kullaniciBelgeIdOlustur(onBirTel, 'sube_muduru')
    );
    if (yeniBelge && subeMuduruMu(yeniBelge.rol)) return yeniBelge;

    const kullanicilar = await koleksiyonGetir<Kullanici>('kullanicilar');
    return (
      kullanicilar.find(
        (k) =>
          telefonuOnHaneliyeCevir(k.telefon || '') === onHaneTel &&
          subeMuduruMu(k.rol)
      ) || null
    );
  } catch {
    return null;
  }
}

export async function subeyeMudurAta(girdi: SubeYetkiliAtamaGirdisi): Promise<boolean> {
  const { sube_id, sube_adi, ad_soyad, telefon, sifre, isletme_adi, eski_telefon } = girdi;
  try {
    const isletme =
      isletme_adi || (sube_adi ? `Afyon Ev Lezzetleri ${sube_adi}` : 'Afyon Ev Lezzetleri Şubesi');
    const kullaniciSifresi = sifre?.trim() || '';
    const duzgunTel = telefonuOnBirHaneliyeCevir(telefon);
    if (!duzgunTel || kullaniciSifresi.length < 4) return false;

    if (canliFirebaseAktifMi()) {
      await belgeKaydet('gel_al_subeleri', sube_id, {
        yetkili_telefon: duzgunTel,
        yetkili_adi: ad_soyad.trim(),
      });

      if (eski_telefon && telefonuOnBirHaneliyeCevir(eski_telefon) !== duzgunTel) {
        const eskiOnBir = telefonuOnBirHaneliyeCevir(eski_telefon);
        await belgeSil('kullanicilar', kullaniciBelgeIdOlustur(eskiOnBir, 'sube_muduru'));
        await belgeSil('kullanicilar', `sube_admin_${eski_telefon.replace(/\D/g, '')}`);
      }

      const hedefId = kullaniciBelgeIdOlustur(duzgunTel, 'sube_muduru');
      await belgeSil('kullanicilar', `sube_admin_${duzgunTel.replace(/\D/g, '')}`);
      await belgeKaydet('kullanicilar', hedefId, {
        id: hedefId,
        kimlik: hedefId,
        ad_soyad: ad_soyad.trim(),
        telefon: duzgunTel,
        rol: 'sube_muduru',
        sube_id,
        isletme_adi: isletme,
        onayli_mi: true,
        sifre: kullaniciSifresi,
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
      const onHane = telefon ? telefonuOnHaneliyeCevir(telefon) : '';
      const silinecekler = kullanicilar.filter(
        (k) =>
          subeMuduruMu(k.rol) &&
          (k.sube_id === sube_id ||
            (onHane && telefonuOnHaneliyeCevir(k.telefon || '') === onHane))
      );
      for (const k of silinecekler) {
        const id = k.id || k.kimlik;
        if (id) await belgeSil('kullanicilar', id);
      }
      if (onHane) {
        const onBir = telefonuOnBirHaneliyeCevir(onHane);
        await belgeSil('kullanicilar', kullaniciBelgeIdOlustur(onBir, 'sube_muduru'));
        await belgeSil('kullanicilar', `sube_admin_${onHane}`);
        await belgeSil('kullanicilar', `sube_admin_${onBir}`);
      }
    }
    return true;
  } catch (hata) {
    console.error('Şube müdürü kaldırma hatası:', hata);
    return false;
  }
}
