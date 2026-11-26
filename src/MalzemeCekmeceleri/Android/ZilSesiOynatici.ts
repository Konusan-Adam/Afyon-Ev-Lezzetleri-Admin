export type HazirZilKimligi =
  | 'acil_siren'
  | 'mutfak_zili'
  | 'kasa_melodisi'
  | 'yumusak_uyari'
  | 'ozel';

export interface HazirZilSecenegi {
  kimlik: Exclude<HazirZilKimligi, 'ozel'>;
  ad: string;
  aciklama: string;
}

export const HAZIR_ZIL_SECENEKLERI: HazirZilSecenegi[] = [
  {
    kimlik: 'acil_siren',
    ad: 'Acil Sipariş Sireni',
    aciklama: 'Ekran kapalıyken bile dikkat çeken yüksek ikaz sireni',
  },
  {
    kimlik: 'mutfak_zili',
    ad: 'Afyon Mutfak Zili',
    aciklama: 'Klasik çift tonlu parlak mutfak zili',
  },
  {
    kimlik: 'kasa_melodisi',
    ad: 'Altın Kasa Melodisi',
    aciklama: 'Yükselen üçlü kasa onay melodisi',
  },
  {
    kimlik: 'yumusak_uyari',
    ad: 'Yumuşak Uyarı',
    aciklama: 'Nazik ve net çift tonlu bildirim',
  },
];

let aktifAudioBaglami: AudioContext | null = null;
let aktifHtmlOynatici: HTMLAudioElement | null = null;

function sesBaglamiAl(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!aktifAudioBaglami) {
    aktifAudioBaglami = new AudioCtx();
  }
  if (aktifAudioBaglami.state === 'suspended') {
    aktifAudioBaglami.resume().catch(() => {});
  }
  return aktifAudioBaglami;
}

function notaCal(
  ctx: AudioContext,
  baslangicGecikmesi: number,
  sure: number,
  frekans: number,
  tip: OscillatorType,
  sesSeviyesi: number
) {
  const t = ctx.currentTime + baslangicGecikmesi;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = tip;
  osc.frequency.setValueAtTime(frekans, t);

  const hedefGenlik = Math.max(0.05, Math.min(0.95, sesSeviyesi * 0.45));
  gain.gain.setValueAtTime(0.001, t);
  gain.gain.linearRampToValueAtTime(hedefGenlik, t + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.001, t + sure);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + sure + 0.02);
}

export function webZiliniDurdur() {
  if (aktifHtmlOynatici) {
    try {
      aktifHtmlOynatici.pause();
      aktifHtmlOynatici.currentTime = 0;
    } catch {}
    aktifHtmlOynatici = null;
  }
}

export function webZiliniCal(
  seciliKimlik: HazirZilKimligi,
  sesSeviyesi: number,
  ozelSesVeriUrl?: string
) {
  if (typeof window === 'undefined') return;
  webZiliniDurdur();

  const kisitliSes = Math.max(0.2, Math.min(1.0, sesSeviyesi));

  if (seciliKimlik === 'ozel' && ozelSesVeriUrl) {
    try {
      const ses = new Audio(ozelSesVeriUrl);
      ses.volume = kisitliSes;
      aktifHtmlOynatici = ses;
      ses.play().catch(() => {
        const ctx = sesBaglamiAl();
        if (ctx) notaCal(ctx, 0, 0.35, 1046.5, 'triangle', kisitliSes);
      });
      return;
    } catch {
      // Fallback Web Audio
    }
  }

  try {
    const ctx = sesBaglamiAl();
    if (!ctx) return;

    if (seciliKimlik === 'acil_siren') {
      notaCal(ctx, 0.0, 0.22, 987.77, 'square', kisitliSes);
      notaCal(ctx, 0.25, 0.22, 1318.51, 'square', kisitliSes);
      notaCal(ctx, 0.52, 0.22, 987.77, 'square', kisitliSes);
      notaCal(ctx, 0.78, 0.32, 1318.51, 'square', kisitliSes);
    } else if (seciliKimlik === 'kasa_melodisi') {
      notaCal(ctx, 0.0, 0.22, 783.99, 'triangle', kisitliSes);
      notaCal(ctx, 0.16, 0.22, 987.77, 'triangle', kisitliSes);
      notaCal(ctx, 0.32, 0.45, 1567.98, 'sine', kisitliSes);
    } else if (seciliKimlik === 'yumusak_uyari') {
      notaCal(ctx, 0.0, 0.3, 659.25, 'sine', kisitliSes);
      notaCal(ctx, 0.2, 0.45, 880.0, 'sine', kisitliSes);
    } else {
      notaCal(ctx, 0.0, 0.35, 1046.5, 'triangle', kisitliSes);
      notaCal(ctx, 0.14, 0.55, 1318.51, 'sine', kisitliSes);
    }
  } catch (hata) {
    console.warn('Web zil sesi oynatma uyarısı:', hata);
  }
}
