import { PanelTipi } from '@/src/OrtakHavuz/KullaniciHafizasi';

/**
 * Tarayıcı adres çubuğundaki yolu, hash veya arama parametresini
 * analiz ederek ilgili APK / Panel tipini tespit eder.
 */
export function mevcutUrlPaneliniBul(): PanelTipi {
  if (typeof window === 'undefined') return 'vitrin';
  const yol = window.location.pathname.toLowerCase();
  const etiket = window.location.hash.toLowerCase();
  const parametre = new URLSearchParams(window.location.search).get('panel');

  if (
    yol.includes('admin') ||
    yol.includes('patron') ||
    etiket.includes('admin') ||
    etiket.includes('patron') ||
    parametre === 'admin' ||
    parametre === 'patron'
  ) {
    return 'patron';
  }
  if (yol.includes('mutfak') || etiket.includes('mutfak') || parametre === 'mutfak') {
    return 'mutfak';
  }
  if (yol.includes('kurye') || etiket.includes('kurye') || parametre === 'kurye') {
    return 'kurye';
  }
  if (yol.includes('musteri') || etiket.includes('musteri') || parametre === 'musteri') {
    return 'musteri';
  }
  return 'vitrin';
}

/**
 * Sayfa yenilenmeden adres çubuğunu ve başlığı ilgili APK rotasına eşitler.
 */
export function urlVeBasligiGuncelle(panel: PanelTipi): void {
  if (typeof window === 'undefined') return;

  const hedefYol = panel === 'vitrin' ? '/' : panel === 'patron' ? '/admin' : `/${panel}`;
  if (window.location.pathname !== hedefYol && !window.location.hash) {
    window.history.pushState({ panel }, '', hedefYol);
  }

  const basliklar: Record<PanelTipi, string> = {
    vitrin: 'Afyon Ev Lezzetleri — Müşteri Vitrini',
    musteri: 'Afyon Ev Lezzetleri — Müşteri Hesabım',
    mutfak: 'Afyon Ev Lezzetleri — Aşçı & Mutfak Terminali',
    kurye: 'Afyon Ev Lezzetleri — Kurye Teslimat Kokpiti',
    patron: 'Afyon Ev Lezzetleri — Yönetim & Patron Paneli',
  };

  document.title = basliklar[panel] || 'Afyon Ev Lezzetleri';
}
