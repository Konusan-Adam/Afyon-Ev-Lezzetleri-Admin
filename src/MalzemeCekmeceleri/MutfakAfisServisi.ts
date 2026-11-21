import { canliFirebaseAktifMi } from '@/src/veritabani/FirebaseIstemcisi';
import { belgeKaydet, belgeSil } from '@/src/veritabani/FirebaseKoleksiyonServisi';
import type { MutfakAfisiKaydi } from './useCanliMutfakAfisleri';

export interface MutfakAfisFormVerisi {
  id?: string;
  mutfak_id: string;
  mutfak_adi: string;
  baslik: string;
  aciklama: string;
  rozet: string;
  gorsel_url: string;
  sira: number;
  aktif_mi: boolean;
  onayli_mi: boolean;
  butonMetni?: string;
  butonHedefi?: string;
  gorselTipi?: 'arka_plan' | 'sag_taraf';
}

export async function afisOnaylaVeYayinla(afisId: string): Promise<boolean> {
  if (!canliFirebaseAktifMi()) return true;
  return belgeKaydet('mutfak_afisleri', afisId, {
    onayli_mi: true,
    aktif_mi: true,
    onay_durumu: 'onaylandi',
    red_nedeni: '',
    red_gerekcesi: '',
    guncelleme_tarihi: new Date().toISOString(),
  });
}

export async function afisReddetVeKaldir(
  afisId: string,
  gerekce: string
): Promise<boolean> {
  const temizGerekce = gerekce.trim() || 'Yönetici tarafından yayından kaldırıldı.';
  if (!canliFirebaseAktifMi()) return true;
  return belgeKaydet('mutfak_afisleri', afisId, {
    onayli_mi: false,
    aktif_mi: false,
    onay_durumu: 'reddedildi',
    red_nedeni: temizGerekce,
    red_gerekcesi: temizGerekce,
    guncelleme_tarihi: new Date().toISOString(),
  });
}

export async function afisSiraGuncelle(
  afisId: string,
  yeniSira: number
): Promise<boolean> {
  if (!canliFirebaseAktifMi()) return true;
  return belgeKaydet('mutfak_afisleri', afisId, {
    sira: Math.max(1, Number(yeniSira) || 1),
    guncelleme_tarihi: new Date().toISOString(),
  });
}

export async function afisKaydetVeyaGuncelle(
  form: MutfakAfisFormVerisi
): Promise<{ basarili: boolean; kayit: MutfakAfisiKaydi }> {
  const hedefId = form.id?.trim() || `vitrin_${form.mutfak_id || 'genel'}_${Date.now()}`;
  const onayliMi = Boolean(form.onayli_mi);
  const aktifMi = onayliMi ? Boolean(form.aktif_mi) : false;

  const kayit: MutfakAfisiKaydi = {
    id: hedefId,
    mutfak_id: form.mutfak_id,
    mutfak_adi: form.mutfak_adi,
    baslik: form.baslik.trim(),
    aciklama: form.aciklama.trim(),
    rozet: form.rozet.trim() || 'ÖZEL LEZZET',
    gorsel_url: form.gorsel_url.trim(),
    sira: Math.max(1, Number(form.sira) || 1),
    aktif_mi: aktifMi,
    onayli_mi: onayliMi,
    onay_durumu: onayliMi ? 'onaylandi' : 'beklemede',
    red_nedeni: '',
    red_gerekcesi: '',
    butonMetni: form.butonMetni?.trim() || 'Mutfağı İncele',
    butonHedefi: form.butonHedefi || 'mutfak_detay',
    gorselTipi: form.gorselTipi || 'arka_plan',
    guncelleme_tarihi: new Date().toISOString(),
  };

  if (!canliFirebaseAktifMi()) {
    return { basarili: true, kayit };
  }

  const basarili = await belgeKaydet('mutfak_afisleri', hedefId, kayit);
  return { basarili, kayit };
}

export async function afisSil(afisId: string): Promise<boolean> {
  if (!canliFirebaseAktifMi()) return true;
  return belgeSil('mutfak_afisleri', afisId);
}
