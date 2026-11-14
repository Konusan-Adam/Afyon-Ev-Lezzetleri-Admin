import { koleksiyonGetir } from '@/src/veritabani/FirebaseKoleksiyonServisi';
import { HakedisCekimTalebi } from '@/src/veritabani/GercekVeriYardimcisi';
import { KomisyonAyarTipi } from '@/src/veritabani/VeriTipleri';
import { komisyonHesapla } from '@/src/MalzemeCekmeceleri/komisyonServisi';
import { FaturaKaydi, yeniFaturaEkle, belgeNoUret } from './faturaServisi';

const SIRKET_UNVAN = 'Afyon Ev Lezzetleri A.Ş.';
const SIRKET_VKN = '0123456789';
const VERGI_DAIRESI = 'Afyonkarahisar Tınaztepe V.D.';

function kdvIctenHesapla(brut: number, oran: number): number {
  if (brut <= 0 || oran <= 0) return 0;
  return Number(((brut * oran) / (100 + oran)).toFixed(2));
}

function ticariMutfakMi(s: any, kullanicilarMap: Map<string, any>): boolean {
  if (s.sube_id) return false;
  const mutfakKul = s.mutfak_id ? kullanicilarMap.get(s.mutfak_id) : undefined;
  const rol = mutfakKul?.rol || s.mutfak_rol;
  return rol === 'ticari_restoran' || s.mutfak_tipi === 'ticari';
}

export async function hakedistenFaturaKes(
  talep: HakedisCekimTalebi,
  partiNo?: string
): Promise<FaturaKaydi> {
  const kuryeMi = Boolean(talep.kurye_id || talep.rol_tipi === 'kurye');
  const tutar = Number(talep.tutar || 0);
  const tarih = new Date().toISOString().split('T')[0];

  if (kuryeMi) {
    const kdvTutari = kdvIctenHesapla(tutar, 20);
    const fatura: FaturaKaydi = {
      id: `fat-hak-${talep.id.replace(/[^a-zA-Z0-9_-]/g, '')}`,
      fatura_no: belgeNoUret('kurye_makbuz'),
      tip: 'kurye_makbuz',
      yon: 'gider',
      kesen_unvan: talep.hesap_sahibi || talep.kurye_adi || 'Esnaf Kurye',
      kesen_vergi_no: talep.tckn_vkn || '',
      alan_unvan: SIRKET_UNVAN,
      alan_vergi_no: SIRKET_VKN,
      vergi_dairesi: VERGI_DAIRESI,
      tutar,
      kdv_orani: 20,
      kdv_tutari: kdvTutari,
      stopaj_orani: 0,
      stopaj_tutari: 0,
      net_tutar: Number((tutar - kdvTutari).toFixed(2)),
      tarih,
      olusturma_zamani: new Date().toISOString(),
      durum: 'onaylandi',
      aciklama: `Esnaf Kurye Hakediş Alış Faturası (${talep.iban})`,
      kaynak_hakedis_id: talep.id,
      toplu_parti_no: partiNo || talep.toplu_parti_no
    };
    await yeniFaturaEkle(fatura);
    return fatura;
  }

  const stopajOrani = 2;
  const stopajTutari = Number(((tutar * stopajOrani) / 100).toFixed(2));
  const fatura: FaturaKaydi = {
    id: `fat-hak-${talep.id.replace(/[^a-zA-Z0-9_-]/g, '')}`,
    fatura_no: belgeNoUret('gider_pusulasi'),
    tip: 'gider_pusulasi',
    yon: 'gider',
    kesen_unvan: SIRKET_UNVAN,
    kesen_vergi_no: SIRKET_VKN,
    alan_unvan: talep.hesap_sahibi || talep.mutfak_adi || 'Ev Aşçısı',
    alan_vergi_no: talep.tckn_vkn || '',
    vergi_dairesi: VERGI_DAIRESI,
    tutar,
    kdv_orani: 0,
    kdv_tutari: 0,
    stopaj_orani: stopajOrani,
    stopaj_tutari: stopajTutari,
    net_tutar: Number((tutar - stopajTutari).toFixed(2)),
    tarih,
    olusturma_zamani: new Date().toISOString(),
    durum: 'onaylandi',
    aciklama: `Ev Aşçısı Ürün Alım Gider Pusulası (${talep.iban})`,
    kaynak_hakedis_id: talep.id,
    toplu_parti_no: partiNo || talep.toplu_parti_no
  };
  await yeniFaturaEkle(fatura);
  return fatura;
}

async function siparisBelgeleriniYaz(
  s: any,
  mevcutIdler: Set<string>,
  ayarlar: KomisyonAyarTipi[],
  kullanicilarMap: Map<string, any>
): Promise<number> {
  const hamId = s.id || s.siparis_kodu || s.siparisKodu;
  const tutar = Number(s.toplam_tutar || s.toplamTutar || s.tutar || 0);
  if (!hamId || tutar <= 0) return 0;

  const temizId = String(hamId).replace(/[^a-zA-Z0-9_-]/g, '');
  const kod = s.siparis_kodu || s.siparisKodu || hamId;
  const tarih = (s.olusturma_tarihi || new Date().toISOString()).slice(0, 10);
  const ticariMi = ticariMutfakMi(s, kullanicilarMap);
  let eklenen = 0;

  // 1. Ev mutfağı / Şube satışı -> Müşteriye E-Arşiv Faturası (Yemek %10 KDV + Teslimat %20 KDV)
  const eArsivId = `fat-sip-${temizId}`;
  const eArsivAnahtar = `earSiv_fatura:${hamId}`;
  if (!ticariMi && !mevcutIdler.has(eArsivId) && !mevcutIdler.has(eArsivAnahtar)) {
    const teslimatTutari = Math.min(tutar, Math.max(0, Number(s.teslimat_ucreti || s.teslimatUcreti || 0)));
    const yemekTutari = Number((tutar - teslimatTutari).toFixed(2));
    const yemekKdv = kdvIctenHesapla(yemekTutari, 10);
    const teslimatKdv = kdvIctenHesapla(teslimatTutari, 20);
    const toplamKdv = Number((yemekKdv + teslimatKdv).toFixed(2));

    await yeniFaturaEkle({
      id: eArsivId,
      fatura_no: belgeNoUret('earSiv_fatura'),
      tip: 'earSiv_fatura',
      yon: 'gelir',
      kesen_unvan: SIRKET_UNVAN,
      kesen_vergi_no: SIRKET_VKN,
      alan_unvan: s.musteri_adi || s.musteriAdi || 'Perakende Müşteri',
      vergi_dairesi: VERGI_DAIRESI,
      tutar,
      yemek_tutari: yemekTutari,
      yemek_kdv_tutari: yemekKdv,
      teslimat_tutari: teslimatTutari,
      teslimat_kdv_tutari: teslimatKdv,
      kdv_orani: teslimatTutari > 0 ? 10 : 10,
      kdv_tutari: toplamKdv,
      stopaj_orani: 0,
      stopaj_tutari: 0,
      net_tutar: Number((tutar - toplamKdv).toFixed(2)),
      tarih,
      durum: 'onaylandi',
      aciklama: teslimatTutari > 0
        ? `#${kod} E-Arşiv (Yemek %10 + Teslimat %20 KDV)`
        : `#${kod} teslim edilmiş sipariş E-Arşiv faturası`,
      kaynak_siparis_id: String(hamId)
    });
    mevcutIdler.add(eArsivId);
    mevcutIdler.add(eArsivAnahtar);
    eklenen++;
  }

  // 2. Ticari Mutfak (Pazaryeri Modeli) -> Sen -> Ticari Mutfağa Komisyon Faturası (%20 KDV)
  const komId = `fat-kom-${temizId}`;
  const komAnahtar = `komisyon_faturasi:${hamId}`;
  if (ticariMi && !mevcutIdler.has(komId) && !mevcutIdler.has(komAnahtar)) {
    const kayitliKom = Number(s.komisyon_tutari || 0) + Number(s.platform_bedeli || 0);
    const hesaplanan = kayitliKom > 0 ? kayitliKom : (() => {
      const k = komisyonHesapla(tutar, ayarlar, s.mutfak_id || '');
      return k.komisyonTutari + k.platformBedeli || Number((tutar * 0.1).toFixed(2));
    })();
    if (hesaplanan > 0) {
      const kdvKom = kdvIctenHesapla(hesaplanan, 20);
      await yeniFaturaEkle({
        id: komId,
        fatura_no: belgeNoUret('komisyon_faturasi'),
        tip: 'komisyon_faturasi',
        yon: 'gelir',
        kesen_unvan: SIRKET_UNVAN,
        kesen_vergi_no: SIRKET_VKN,
        alan_unvan: s.mutfak_adi || 'Ticari Mutfak İşletmesi',
        vergi_dairesi: VERGI_DAIRESI,
        tutar: hesaplanan,
        kdv_orani: 20,
        kdv_tutari: kdvKom,
        stopaj_orani: 0,
        stopaj_tutari: 0,
        net_tutar: Number((hesaplanan - kdvKom).toFixed(2)),
        tarih,
        durum: 'onaylandi',
        aciklama: `#${kod} pazaryeri ticari mutfak komisyon faturası`,
        kaynak_siparis_id: String(hamId)
      });
      mevcutIdler.add(komId);
      mevcutIdler.add(komAnahtar);
      eklenen++;
    }
  }
  return eklenen;
}

export async function siparistenIadeBelgesiKes(siparisId: string, gerekce: string): Promise<number> {
  if (!siparisId) return 0;
  try {
    const [faturalar, siparisler] = await Promise.all([
      koleksiyonGetir<FaturaKaydi>('faturalar'),
      koleksiyonGetir<any>('siparisler')
    ]);
    const ilgiliBelgeler = (faturalar || []).filter(
      (f) => f.kaynak_siparis_id === siparisId && f.tip !== 'iade_iptal' && f.durum !== 'iptal'
    );
    const zatenIadeVar = (faturalar || []).some(
      (f) => f.kaynak_siparis_id === siparisId && f.tip === 'iade_iptal'
    );
    if (zatenIadeVar) return 0;

    const kaynakBelge = ilgiliBelgeler[0];
    const siparis = (siparisler || []).find((s) => s.id === siparisId || s.siparis_kodu === siparisId);
    const tutar = Number(kaynakBelge?.tutar || siparis?.toplam_tutar || 0);
    if (!kaynakBelge && tutar <= 0) return 0;

    const kdvOrani = kaynakBelge?.kdv_orani ?? 10;
    const kdvTutari = kaynakBelge?.kdv_tutari ?? kdvIctenHesapla(tutar, kdvOrani);
    const temizId = String(siparisId).replace(/[^a-zA-Z0-9_-]/g, '');

    await yeniFaturaEkle({
      id: `fat-iade-${temizId}`,
      fatura_no: belgeNoUret('iade_iptal'),
      tip: 'iade_iptal',
      yon: 'iade',
      kesen_unvan: kaynakBelge?.alan_unvan || siparis?.musteri_adi || 'Müşteri / Karşı Taraf',
      alan_unvan: kaynakBelge?.kesen_unvan || SIRKET_UNVAN,
      alan_vergi_no: SIRKET_VKN,
      vergi_dairesi: VERGI_DAIRESI,
      tutar,
      yemek_tutari: kaynakBelge?.yemek_tutari,
      yemek_kdv_tutari: kaynakBelge?.yemek_kdv_tutari,
      teslimat_tutari: kaynakBelge?.teslimat_tutari,
      teslimat_kdv_tutari: kaynakBelge?.teslimat_kdv_tutari,
      kdv_orani: kdvOrani,
      kdv_tutari: kdvTutari,
      stopaj_orani: 0,
      stopaj_tutari: 0,
      net_tutar: Number((tutar - kdvTutari).toFixed(2)),
      tarih: new Date().toISOString().split('T')[0],
      durum: 'onaylandi',
      aciklama: `İade/İptal: ${gerekce}${kaynakBelge ? ` (İlgili Belge: ${kaynakBelge.fatura_no})` : ''}`,
      kaynak_siparis_id: String(siparisId),
      bagli_fatura_no: kaynakBelge?.fatura_no
    });
    return 1;
  } catch (err) {
    console.warn('İade/iptal belgesi kesme hatası:', err);
    return 0;
  }
}

function mevcutAnahtarlariTopla(faturalar: FaturaKaydi[]): Set<string> {
  const set = new Set<string>();
  for (const f of faturalar) {
    set.add(f.id);
    if (f.kaynak_siparis_id) set.add(`${f.tip}:${f.kaynak_siparis_id}`);
  }
  return set;
}

export async function siparistenOtomatikBelgeKes(siparis: any): Promise<number> {
  if (!siparis) return 0;
  try {
    const [mevcutFaturalar, ayarlar, kullanicilar] = await Promise.all([
      koleksiyonGetir<FaturaKaydi>('faturalar'),
      koleksiyonGetir<KomisyonAyarTipi>('komisyon_ayarlari'),
      koleksiyonGetir<any>('kullanicilar')
    ]);
    const kullanicilarMap = new Map((kullanicilar || []).map((k: any) => [k.id, k]));
    return await siparisBelgeleriniYaz(siparis, mevcutAnahtarlariTopla(mevcutFaturalar || []), ayarlar || [], kullanicilarMap);
  } catch (err) {
    console.warn('Siparişten otomatik belge kesme hatası:', err);
    return 0;
  }
}

export async function siparisVeHakedistenOtomatikUret(
  mevcutFaturalar: FaturaKaydi[]
): Promise<{ eklenenSayi: number }> {
  const [siparisler, subeSiparisleri, hakedisler, ayarlar, kullanicilar] = await Promise.all([
    koleksiyonGetir<any>('siparisler'),
    koleksiyonGetir<any>('sube_siparisleri'),
    koleksiyonGetir<HakedisCekimTalebi>('hakedis_talepleri'),
    koleksiyonGetir<KomisyonAyarTipi>('komisyon_ayarlari'),
    koleksiyonGetir<any>('kullanicilar')
  ]);

  const kullanicilarMap = new Map((kullanicilar || []).map((k: any) => [k.id, k]));
  const mevcutIdler = mevcutAnahtarlariTopla(mevcutFaturalar);
  const mevcutHakedisIdler = new Set(mevcutFaturalar.map((f) => f.kaynak_hakedis_id).filter(Boolean));
  let eklenenSayi = 0;

  for (const s of [...siparisler, ...subeSiparisleri]) {
    const tamamlandi = s.durum === 'teslim_edildi' || s.asama === 'teslim_edildi';
    if (tamamlandi) {
      eklenenSayi += await siparisBelgeleriniYaz(s, mevcutIdler, ayarlar || [], kullanicilarMap);
    }
  }

  for (const h of hakedisler) {
    if (h.durum === 'odendi' && !mevcutHakedisIdler.has(h.id)) {
      await hakedistenFaturaKes(h);
      eklenenSayi++;
    }
  }
  return { eklenenSayi };
}
