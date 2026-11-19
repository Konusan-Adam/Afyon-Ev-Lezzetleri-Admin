import { canliFirebaseAktifMi } from '@/src/veritabani/FirebaseIstemcisi';
import { belgeKaydet, koleksiyonGetir } from '@/src/veritabani/FirebaseKoleksiyonServisi';
import { patronBildirimiEkle } from '@/src/MalzemeCekmeceleri/PatronBildirimServisi';
import { yerelSiparisDurumGuncelle } from '@/src/MalzemeCekmeceleri/useMusteriSiparisleri';
import { siparistenIadeBelgesiKes } from '@/src/MalzemeCekmeceleri/Finans/otomatikFaturaUretici';
import { siparisIptalHakedisGeriAl } from '@/src/MalzemeCekmeceleri/Finans/hakedisDefteriServisi';

export type SiparisIptalKaynagi = 'mutfak' | 'musteri' | 'kurye' | 'admin';

export async function siparisIptalEt(
  siparisKimligi: string,
  gerekceBaslik: string,
  detayNot?: string,
  iptalKaynagi: SiparisIptalKaynagi = 'mutfak'
): Promise<boolean> {
  const gerekceTam = detayNot && detayNot.trim()
    ? `${gerekceBaslik} (${detayNot.trim()})`
    : gerekceBaslik;
  const aciklamaMetni = `Sipariş İptal Edildi: ${gerekceTam}`;

  // 1. Yerel depolama ve localStorage güncellemesi
  yerelSiparisDurumGuncelle(siparisKimligi, 'iptal', aciklamaMetni);

  // 2. Canlı Firebase güncellemesi
  if (canliFirebaseAktifMi()) {
    try {
      await belgeKaydet('siparisler', siparisKimligi, {
        durum: 'iptal',
        asama: 'iptal',
        iptal_kaynagi: iptalKaynagi,
        iptal_gerekcesi: gerekceTam,
        durum_aciklamasi: aciklamaMetni,
        durumAciklamasi: aciklamaMetni,
        sonGuncelleme: new Date().toLocaleTimeString('tr-TR'),
        guncellenme_tarihi: new Date().toISOString()
      });
    } catch (hata) {
      console.warn('Firebase sipariş iptal güncelleme hatası:', hata);
    }
  }

  // 2b. Daha önce kesilmiş belge ve hakediş varsa iptal/kesinti kaydı üret
  siparistenIadeBelgesiKes(siparisKimligi, gerekceBaslik).catch(() => {});
  siparisIptalHakedisGeriAl(siparisKimligi, gerekceBaslik).catch(() => {});

  // 3. Patron Bildirimi Ekle & Ses Çal
  patronBildirimiEkle('iade_talebi', 'Sipariş İptal Edildi ⚠️', `#${siparisKimligi.substring(0, 8)} nolu sipariş iptal edildi. Gerekçe: ${gerekceBaslik}`);

  // 4. Global olay tetikle
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('afyon_siparis_durum_degisti', {
      detail: { siparisKimligi, durum: 'iptal', iptal_kaynagi: iptalKaynagi }
    }));
  }

  return true;
}

