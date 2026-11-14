import { koleksiyonGetir } from '@/src/veritabani/FirebaseKoleksiyonServisi';
import { HakedisCekimTalebi } from '@/src/veritabani/GercekVeriYardimcisi';
import { KomisyonAyarTipi } from '@/src/veritabani/VeriTipleri';
import { komisyonHesapla } from '@/src/MalzemeCekmeceleri/komisyonServisi';
import { FaturaKaydi, yeniFaturaEkle, belgeNoUret } from './faturaServisi';

export async function hakedistenFaturaKes(
  talep: HakedisCekimTalebi,
  partiNo?: string
): Promise<FaturaKaydi> {
  const kuryeMi = Boolean(talep.kurye_id || talep.rol_tipi === 'kurye');
  const tip = kuryeMi ? 'kurye_makbuz' : 'gider_pusulasi';
  const tutar = Number(talep.tutar || 0);
  const fatura: FaturaKaydi = {
    id: `fat-hak-${talep.id.replace(/[^a-zA-Z0-9_-]/g, '')}`,
    fatura_no: belgeNoUret(tip),
    tip,
    kesen_unvan: talep.hesap_sahibi || talep.mutfak_adi || talep.kurye_adi || 'Hakediş Alıcısı',
    kesen_vergi_no: talep.tckn_vkn || '',
    alan_unvan: 'Afyon Ev Lezzetleri A.Ş.',
    alan_vergi_no: '0123456789',
    vergi_dairesi: 'Afyonkarahisar Tınaztepe V.D.',
    tutar,
    kdv_orani: 0,
    kdv_tutari: 0,
    stopaj_orani: 0,
    stopaj_tutari: 0,
    net_tutar: tutar,
    tarih: new Date().toISOString().split('T')[0],
    olusturma_zamani: new Date().toISOString(),
    durum: 'onaylandi',
    aciklama: kuryeMi
      ? `Kurye Sefer Primi Gider Pusulası (${talep.iban})`
      : `GVK Md. 9/10 Ev Mutfağı Hakediş Pusulası (${talep.iban})`,
    kaynak_hakedis_id: talep.id,
    toplu_parti_no: partiNo || talep.toplu_parti_no
  };
  await yeniFaturaEkle(fatura);
  return fatura;
}

async function siparisBelgeleriniYaz(
  s: any,
  mevcutIdler: Set<string>,
  ayarlar: KomisyonAyarTipi[]
): Promise<number> {
  const hamId = s.id || s.siparis_kodu || s.siparisKodu;
  const tutar = Number(s.toplam_tutar || s.toplamTutar || s.tutar || 0);
  if (!hamId || tutar <= 0) return 0;

  const temizId = String(hamId).replace(/[^a-zA-Z0-9_-]/g, '');
  const kod = s.siparis_kodu || s.siparisKodu || hamId;
  const tarih = (s.olusturma_tarihi || new Date().toISOString()).slice(0, 10);
  let eklenen = 0;

  const eArsivId = `fat-sip-${temizId}`;
  const eArsivAnahtar = `earSiv_fatura:${hamId}`;
  if (!mevcutIdler.has(eArsivId) && !mevcutIdler.has(eArsivAnahtar)) {
    const kdv = Number(((tutar * 10) / 110).toFixed(2));
    await yeniFaturaEkle({
      id: eArsivId,
      fatura_no: belgeNoUret('earSiv_fatura'),
      tip: 'earSiv_fatura',
      kesen_unvan: s.sube_adi || s.mutfak_adi || 'Afyon Ev Lezzetleri A.Ş.',
      kesen_vergi_no: '0123456789',
      alan_unvan: s.musteri_adi || s.musteriAdi || 'Perakende Müşteri',
      tutar,
      kdv_orani: 10,
      kdv_tutari: kdv,
      stopaj_orani: 0,
      stopaj_tutari: 0,
      net_tutar: Number((tutar - kdv).toFixed(2)),
      tarih,
      durum: 'onaylandi',
      aciklama: `${kod} nolu teslim edilmiş sipariş E-Arşiv faturası`,
      kaynak_siparis_id: String(hamId)
    });
    mevcutIdler.add(eArsivId);
    mevcutIdler.add(eArsivAnahtar);
    eklenen++;
  }

  const komId = `fat-kom-${temizId}`;
  const komAnahtar = `komisyon_faturasi:${hamId}`;
  if (!s.sube_id && !mevcutIdler.has(komId) && !mevcutIdler.has(komAnahtar)) {
    const kayitliKom = Number(s.komisyon_tutari || 0) + Number(s.platform_bedeli || 0);
    const hesaplanan = kayitliKom > 0 ? kayitliKom : (() => {
      const k = komisyonHesapla(tutar, ayarlar, s.mutfak_id || '');
      return k.komisyonTutari + k.platformBedeli || Number((tutar * 0.1).toFixed(2));
    })();
    if (hesaplanan > 0) {
      const kdvKom = Number(((hesaplanan * 20) / 120).toFixed(2));
      await yeniFaturaEkle({
        id: komId,
        fatura_no: belgeNoUret('komisyon_faturasi'),
        tip: 'komisyon_faturasi',
        kesen_unvan: 'Afyon Ev Lezzetleri A.Ş.',
        kesen_vergi_no: '0123456789',
        alan_unvan: s.mutfak_adi || 'Ev Mutfağı İş Ortağı',
        tutar: hesaplanan,
        kdv_orani: 20,
        kdv_tutari: kdvKom,
        stopaj_orani: 0,
        stopaj_tutari: 0,
        net_tutar: Number((hesaplanan - kdvKom).toFixed(2)),
        tarih,
        durum: 'onaylandi',
        aciklama: `#${kod} nolu sipariş platform aracılık ve hizmet komisyonu`,
        kaynak_siparis_id: String(hamId)
      });
      mevcutIdler.add(komId);
      mevcutIdler.add(komAnahtar);
      eklenen++;
    }
  }
  return eklenen;
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
    const [mevcutFaturalar, ayarlar] = await Promise.all([
      koleksiyonGetir<FaturaKaydi>('faturalar'),
      koleksiyonGetir<KomisyonAyarTipi>('komisyon_ayarlari')
    ]);
    return await siparisBelgeleriniYaz(siparis, mevcutAnahtarlariTopla(mevcutFaturalar || []), ayarlar || []);
  } catch (err) {
    console.warn('Siparişten otomatik belge kesme hatası:', err);
    return 0;
  }
}

export async function siparisVeHakedistenOtomatikUret(
  mevcutFaturalar: FaturaKaydi[]
): Promise<{ eklenenSayi: number }> {
  const [siparisler, subeSiparisleri, hakedisler, ayarlar] = await Promise.all([
    koleksiyonGetir<any>('siparisler'),
    koleksiyonGetir<any>('sube_siparisleri'),
    koleksiyonGetir<HakedisCekimTalebi>('hakedis_talepleri'),
    koleksiyonGetir<KomisyonAyarTipi>('komisyon_ayarlari')
  ]);

  const mevcutIdler = mevcutAnahtarlariTopla(mevcutFaturalar);
  const mevcutHakedisIdler = new Set(mevcutFaturalar.map((f) => f.kaynak_hakedis_id).filter(Boolean));
  let eklenenSayi = 0;

  for (const s of [...siparisler, ...subeSiparisleri]) {
    const tamamlandi = s.durum === 'teslim_edildi' || s.asama === 'teslim_edildi';
    if (!tamamlandi) continue;
    eklenenSayi += await siparisBelgeleriniYaz(s, mevcutIdler, ayarlar || []);
  }

  for (const h of hakedisler) {
    if (h.durum === 'odendi' && !mevcutHakedisIdler.has(h.id)) {
      await hakedistenFaturaKes(h);
      eklenenSayi++;
    }
  }
  return { eklenenSayi };
}
