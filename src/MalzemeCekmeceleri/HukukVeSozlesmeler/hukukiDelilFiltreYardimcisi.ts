import { HukukiOnayLogu } from './tipler';
import { logZamanDamgasiMs } from './useCanliHukukiDeliller';

export interface HukukiDelilFiltreDurumu {
  arama: string;
  islemTuru: string;
  damgaDurumu: string;
  baslangicTarihi: string;
  bitisTarihi: string;
}

export interface HukukiDelilOzeti {
  toplamKayit: number;
  rfc3161Sayisi: number;
  siparisSozlesmeSayisi: number;
  teslimatIptalHakedisSayisi: number;
}

export function hukukiDelilleriFiltrele(
  loglar: HukukiOnayLogu[],
  filtre: HukukiDelilFiltreDurumu
): HukukiOnayLogu[] {
  const aranan = filtre.arama.trim().toLocaleLowerCase('tr-TR');
  const baslangicMs = filtre.baslangicTarihi ? new Date(`${filtre.baslangicTarihi}T00:00:00`).getTime() : null;
  const bitisMs = filtre.bitisTarihi ? new Date(`${filtre.bitisTarihi}T23:59:59.999`).getTime() : null;

  return loglar.filter((log) => {
    if (aranan) {
      const alanlar = [
        log.kullaniciAdSoyad,
        log.kullaniciTelefon,
        log.ilgiliKayitId,
        log.ipAdresi,
        log.ozetHash,
        log.kimlik,
      ];
      const eslesme = alanlar.some((a) => (a || '').toLocaleLowerCase('tr-TR').includes(aranan));
      if (!eslesme) return false;
    }

    if (filtre.islemTuru !== 'hepsi' && log.islemTuru !== filtre.islemTuru) return false;
    if (filtre.damgaDurumu !== 'hepsi' && (log.damgaDurumu || 'yerel_ozet') !== filtre.damgaDurumu) return false;

    if (baslangicMs !== null || bitisMs !== null) {
      const kayitMs = logZamanDamgasiMs(log);
      if (baslangicMs !== null && kayitMs < baslangicMs) return false;
      if (bitisMs !== null && kayitMs > bitisMs) return false;
    }

    return true;
  });
}

export function hukukiDelilOzetHesapla(loglar: HukukiOnayLogu[]): HukukiDelilOzeti {
  const rfc3161Sayisi = loglar.filter((l) => l.damgaDurumu === 'rfc3161_onayli').length;
  const siparisSozlesmeSayisi = loglar.filter((l) =>
    ['siparis', 'kayit', 'cerez_onayi', 'sozlesme_guncelleme', 'ozel_onay'].includes(l.islemTuru)
  ).length;
  const teslimatIptalHakedisSayisi = loglar.filter((l) =>
    ['teslimat', 'iptal', 'hakedis'].includes(l.islemTuru)
  ).length;

  return { toplamKayit: loglar.length, rfc3161Sayisi, siparisSozlesmeSayisi, teslimatIptalHakedisSayisi };
}

export function islemTuruEtiketi(tur: string): string {
  const etiketler: Record<string, string> = {
    kayit: 'Üyelik Kaydı',
    siparis: 'Sipariş Onayı',
    cerez_onayi: 'Çerez Onayı',
    teslimat: 'Teslimat Kanıtı',
    iptal: 'İptal Kaydı',
    hakedis: 'Hakediş Onayı',
    sozlesme_guncelleme: 'Sözleşme Güncelleme',
    ozel_onay: 'Özel Onay',
  };
  return etiketler[tur] || tur;
}

export function damgaDurumuEtiketi(durum?: string): { metin: string; sinif: string } {
  if (durum === 'rfc3161_onayli') {
    return { metin: 'RFC 3161 Onaylı', sinif: 'bg-emerald-950/80 text-emerald-300 border-emerald-600/60' };
  }
  if (durum === 'sunucu_muhurlu') {
    return { metin: 'Sunucu Mühürlü', sinif: 'bg-sky-950/80 text-sky-300 border-sky-600/60' };
  }
  return { metin: 'Yerel Özet', sinif: 'bg-amber-950/70 text-amber-300 border-amber-600/50' };
}
