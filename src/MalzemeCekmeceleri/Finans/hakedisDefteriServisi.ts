import { canliFirebaseAktifMi } from '@/src/veritabani/FirebaseIstemcisi';
import { belgeGetir, belgeKaydet, koleksiyonGetir } from '@/src/veritabani/FirebaseKoleksiyonServisi';
import { HakedisCekimTalebi } from '@/src/veritabani/GercekVeriYardimcisi';
import { KomisyonAyarTipi } from '@/src/veritabani/VeriTipleri';
import { komisyonHesapla } from '@/src/MalzemeCekmeceleri/komisyonServisi';
import {
  HakedisHareketi,
  belgeIdTemizle,
  hareketlerdenBakiyeHesapla,
  siparisKuryeUcretiBul
} from './hakedisDefteriTipleri';

export type { HakedisHareketi, HakedisHareketTipi, HakedisHareketYon, HakedisRolTipi } from './hakedisDefteriTipleri';
export { hareketlerdenBakiyeHesapla, siparisKuryeUcretiBul } from './hakedisDefteriTipleri';

const VARSAYILAN_KOMISYON_ORANI = 10;

async function tabanKuryeUcretiGetir(): Promise<number> {
  if (!canliFirebaseAktifMi()) return 70;
  const genel = await belgeGetir<any>('genel_ayarlar', 'genel_ayarlar').catch(() => null);
  return Number(genel?.taban_ucret || 70);
}

function mutfakPayiHesapla(
  siparis: any,
  komisyonAyarlari: KomisyonAyarTipi[]
): { brutTutar: number; komisyonOrani: number; komisyonTutari: number; netTutar: number } {
  const toplamTutar = Number(siparis?.toplam_tutar || siparis?.toplamTutar || siparis?.tutar || 0);
  const teslimatUcreti = Number(siparis?.teslimat_ucreti || siparis?.teslimatUcreti || 0);
  const brutTutar =
    teslimatUcreti > 0 && toplamTutar > teslimatUcreti
      ? Number((toplamTutar - teslimatUcreti).toFixed(2))
      : toplamTutar;

  const mutfakId = String(siparis?.mutfak_id || '');
  const aktifAyar =
    komisyonAyarlari.find((a) => a.tip === 'mutfak' && a.hedefId === mutfakId && a.aktif_mi) ||
    komisyonAyarlari.find((a) => a.tip === 'genel' && a.aktif_mi);

  if (aktifAyar) {
    const k = komisyonHesapla(brutTutar, komisyonAyarlari, mutfakId);
    const toplamKomisyon = Number((k.komisyonTutari + k.platformBedeli).toFixed(2));
    return {
      brutTutar,
      komisyonOrani: aktifAyar.oran,
      komisyonTutari: toplamKomisyon,
      netTutar: Math.max(0, Number(k.netHakedis.toFixed(2)))
    };
  }

  const komisyonTutari = Number(((brutTutar * VARSAYILAN_KOMISYON_ORANI) / 100).toFixed(2));
  return {
    brutTutar,
    komisyonOrani: VARSAYILAN_KOMISYON_ORANI,
    komisyonTutari,
    netTutar: Math.max(0, Number((brutTutar - komisyonTutari).toFixed(2)))
  };
}

export async function siparisTeslimHakedisKaydet(siparis: any): Promise<{ kuryeHakedis: number; mutfakHakedis: number }> {
  const hamId = String(siparis?.id || siparis?.siparis_kodu || siparis?.siparisKodu || '');
  const temizId = belgeIdTemizle(hamId);
  if (!temizId || !canliFirebaseAktifMi()) return { kuryeHakedis: 0, mutfakHakedis: 0 };

  const [komisyonAyarlari, tabanUcret, mutfaklar] = await Promise.all([
    koleksiyonGetir<KomisyonAyarTipi>('komisyon_ayarlari').catch(() => []),
    tabanKuryeUcretiGetir(),
    koleksiyonGetir<any>('mutfaklar').catch(() => [])
  ]);

  const siparisKodu = String(siparis?.siparis_kodu || siparis?.siparisKodu || hamId);
  const simdi = new Date().toISOString();
  let mutfakHakedis = 0;
  let kuryeHakedis = 0;

  const mutfakId = String(siparis?.mutfak_id || '');
  if (mutfakId && !mutfakId.startsWith('sube-')) {
    const mutfak = mutfaklar.find((m: any) => (m.id || m.kimlik) === mutfakId);
    const aliciAdi = String(siparis?.mutfak_adi || mutfak?.ad || 'Ev Mutfağı');
    const pay = mutfakPayiHesapla(siparis, komisyonAyarlari || []);
    if (pay.netTutar > 0) {
      const hareketId = `hak_mutfak_${temizId}`;
      const kayit: HakedisHareketi = {
        id: hareketId,
        alici_id: mutfakId,
        alici_adi: aliciAdi,
        rol: 'mutfak',
        hareket_tipi: 'siparis_hakedis',
        yon: 'giris',
        brut_tutar: pay.brutTutar,
        komisyon_orani: pay.komisyonOrani,
        komisyon_tutari: pay.komisyonTutari,
        net_tutar: pay.netTutar,
        siparis_id: hamId,
        siparis_kodu: siparisKodu,
        aciklama: `#${siparisKodu} sipariş teslimat mutfak net hakedişi`,
        olusturma_tarihi: simdi
      };
      await belgeKaydet('hakedis_hareketleri', hareketId, kayit);
      mutfakHakedis = pay.netTutar;
    }
  }

  const kuryeId = String(siparis?.kurye_id || '');
  if (kuryeId) {
    const ucret = siparisKuryeUcretiBul(siparis, tabanUcret);
    if (ucret > 0) {
      const hareketId = `hak_kurye_${temizId}`;
      const kayit: HakedisHareketi = {
        id: hareketId,
        alici_id: kuryeId,
        alici_adi: String(siparis?.kurye_adi || 'Kurye'),
        rol: 'kurye',
        hareket_tipi: 'siparis_hakedis',
        yon: 'giris',
        brut_tutar: ucret,
        komisyon_orani: 0,
        komisyon_tutari: 0,
        net_tutar: ucret,
        siparis_id: hamId,
        siparis_kodu: siparisKodu,
        aciklama: `#${siparisKodu} sipariş kurye teslimat hakedişi`,
        olusturma_tarihi: simdi
      };
      await belgeKaydet('hakedis_hareketleri', hareketId, kayit);
      kuryeHakedis = ucret;
    }
  }

  return { kuryeHakedis, mutfakHakedis };
}

export async function siparisIptalHakedisGeriAl(siparisId: string, gerekce: string): Promise<number> {
  const temizId = belgeIdTemizle(siparisId);
  if (!temizId || !canliFirebaseAktifMi()) return 0;

  const hareketler = await koleksiyonGetir<HakedisHareketi>('hakedis_hareketleri').catch(() => []);
  const hedefler = hareketler.filter(
    (h) => h.hareket_tipi === 'siparis_hakedis' && (h.siparis_id === siparisId || h.siparis_kodu === siparisId)
  );
  if (hedefler.length === 0) return 0;

  let yazilan = 0;
  const simdi = new Date().toISOString();
  for (const h of hedefler) {
    const iptalId = `hak_iptal_${h.rol}_${belgeIdTemizle(h.siparis_id || temizId)}`;
    const kesinti: HakedisHareketi = {
      id: iptalId,
      alici_id: h.alici_id,
      alici_adi: h.alici_adi,
      rol: h.rol,
      hareket_tipi: 'iptal_kesintisi',
      yon: 'cikis',
      brut_tutar: h.brut_tutar,
      komisyon_orani: h.komisyon_orani || 0,
      komisyon_tutari: h.komisyon_tutari || 0,
      net_tutar: h.net_tutar,
      siparis_id: h.siparis_id || siparisId,
      siparis_kodu: h.siparis_kodu || siparisId,
      aciklama: `#${h.siparis_kodu || siparisId} iptal kesintisi (${gerekce})`,
      olusturma_tarihi: simdi
    };
    const ok = await belgeKaydet('hakedis_hareketleri', iptalId, kesinti);
    if (ok) yazilan++;
  }
  return yazilan;
}

export async function talepOdemeHareketiKaydet(talep: HakedisCekimTalebi): Promise<boolean> {
  if (!talep?.id || talep.durum !== 'odendi' || !canliFirebaseAktifMi()) return false;
  const temizId = belgeIdTemizle(talep.id);
  const kuryeMi = talep.rol_tipi === 'kurye' || Boolean(talep.kurye_id);
  const aliciId = String(kuryeMi ? talep.kurye_id : talep.mutfak_id) || temizId;
  const aliciAdi = String(kuryeMi ? talep.kurye_adi || talep.hesap_sahibi : talep.mutfak_adi || talep.hesap_sahibi) || 'Alıcı';
  const tutar = Math.max(0, Number(talep.tutar || 0));
  if (!aliciId || tutar <= 0) return false;

  const hareketId = `hak_odeme_${temizId}`;
  const kayit: HakedisHareketi = {
    id: hareketId,
    alici_id: aliciId,
    alici_adi: aliciAdi,
    rol: kuryeMi ? 'kurye' : 'mutfak',
    hareket_tipi: 'odeme_cikisi',
    yon: 'cikis',
    brut_tutar: tutar,
    komisyon_orani: 0,
    komisyon_tutari: 0,
    net_tutar: tutar,
    talep_id: talep.id,
    aciklama: talep.toplu_parti_no
      ? `Banka EFT/FAST ödemesi (${talep.toplu_parti_no})`
      : `Banka EFT/FAST ödemesi (${talep.iban})`,
    olusturma_tarihi: new Date().toISOString()
  };
  return belgeKaydet('hakedis_hareketleri', hareketId, kayit);
}

export async function gecmisKayitlariDeftereSenkronizeEt(): Promise<number> {
  if (!canliFirebaseAktifMi()) return 0;
  const [siparisler, talepler, mevcutHareketler] = await Promise.all([
    koleksiyonGetir<any>('siparisler').catch(() => []),
    koleksiyonGetir<HakedisCekimTalebi>('hakedis_talepleri').catch(() => []),
    koleksiyonGetir<HakedisHareketi>('hakedis_hareketleri').catch(() => [])
  ]);

  const mevcutIdler = new Set(mevcutHareketler.map((h) => h.id));
  let eklenen = 0;

  for (const s of siparisler) {
    const teslim = s.durum === 'teslim_edildi' || s.asama === 'teslim_edildi';
    if (!teslim) continue;
    const temiz = belgeIdTemizle(String(s.id || s.siparis_kodu || ''));
    if (!temiz) continue;
    const eksikMutfak = s.mutfak_id && !String(s.mutfak_id).startsWith('sube-') && !mevcutIdler.has(`hak_mutfak_${temiz}`);
    const eksikKurye = s.kurye_id && !mevcutIdler.has(`hak_kurye_${temiz}`);
    if (eksikMutfak || eksikKurye) {
      const sonuc = await siparisTeslimHakedisKaydet(s);
      if (sonuc.mutfakHakedis > 0 && eksikMutfak) eklenen++;
      if (sonuc.kuryeHakedis > 0 && eksikKurye) eklenen++;
    }
  }

  for (const t of talepler) {
    const temiz = belgeIdTemizle(t.id);
    if (t.durum === 'odendi' && temiz && !mevcutIdler.has(`hak_odeme_${temiz}`)) {
      if (await talepOdemeHareketiKaydet(t)) eklenen++;
    }
  }

  return eklenen;
}
