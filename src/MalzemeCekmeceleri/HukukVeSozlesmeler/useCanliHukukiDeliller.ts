import { useState, useEffect } from 'react';
import { canliFirebaseAktifMi } from '@/src/veritabani/FirebaseIstemcisi';
import { koleksiyonuCanliDinle } from '@/src/veritabani/FirebaseKoleksiyonServisi';
import { hukukiLoglariGetir, hukukiSozlesmeleriGetir } from './hukukDeposu';
import { HukukiOnayLogu, HukukiSozlesme } from './tipler';

export function logZamanDamgasiMs(log: HukukiOnayLogu): number {
  const ham = log.sunucuKayitZamani as any;
  if (ham && typeof ham?.toDate === 'function') {
    return ham.toDate().getTime();
  }
  if (ham && typeof ham?.seconds === 'number') {
    return ham.seconds * 1000;
  }
  if (typeof ham === 'number') return ham;
  if (typeof ham === 'string' && !Number.isNaN(Date.parse(ham))) {
    return Date.parse(ham);
  }
  if (log.sunucuUtc && !Number.isNaN(Date.parse(log.sunucuUtc))) {
    return Date.parse(log.sunucuUtc);
  }
  const trEslesme = (log.tarihSaat || '').match(
    /(\d{2})\.(\d{2})\.(\d{4})(?:[\s,]+(\d{2}):(\d{2})(?::(\d{2}))?)?/
  );
  if (trEslesme) {
    const [, gun, ay, yil, saat = '00', dakika = '00', saniye = '00'] = trEslesme;
    return new Date(`${yil}-${ay}-${gun}T${saat}:${dakika}:${saniye}`).getTime();
  }
  const kimlikZaman = (log.kimlik || '').match(/(\d{13})/);
  return kimlikZaman ? Number(kimlikZaman[1]) : 0;
}

export function sunucuZamaniBicimlendir(deger: unknown): string {
  if (!deger) return 'Bekleniyor / Yok';
  const ham = deger as any;
  let tarih: Date | null = null;
  if (typeof ham?.toDate === 'function') tarih = ham.toDate();
  else if (typeof ham?.seconds === 'number') tarih = new Date(ham.seconds * 1000);
  else if (typeof ham === 'number' || typeof ham === 'string') {
    const d = new Date(ham);
    if (!Number.isNaN(d.getTime())) tarih = d;
  }
  return tarih ? `${tarih.toLocaleString('tr-TR')} (${tarih.toISOString()})` : String(deger);
}

export function useCanliHukukiDeliller(): {
  loglar: HukukiOnayLogu[];
  sozlesmeHaritasi: Record<string, HukukiSozlesme>;
  yukleniyor: boolean;
} {
  const [loglar, setLoglar] = useState<HukukiOnayLogu[]>(() => hukukiLoglariGetir());
  const [sozlesmeHaritasi, setSozlesmeHaritasi] = useState<Record<string, HukukiSozlesme>>(() =>
    hukukiSozlesmeleriGetir()
  );
  const [yukleniyor, setYukleniyor] = useState<boolean>(canliFirebaseAktifMi());

  useEffect(() => {
    if (!canliFirebaseAktifMi()) {
      setYukleniyor(false);
      return;
    }

    const logDurdur = koleksiyonuCanliDinle<HukukiOnayLogu>('hukuki_onay_loglari', (veriler) => {
      const sirali = [...veriler]
        .map((l) => ({ ...l, kimlik: l.kimlik || l.id || '' }))
        .sort((a, b) => logZamanDamgasiMs(b) - logZamanDamgasiMs(a));
      setLoglar(sirali);
      setYukleniyor(false);
    });

    const sozlesmeDurdur = koleksiyonuCanliDinle<HukukiSozlesme>('sozlesmeler', (veriler) => {
      const harita: Record<string, HukukiSozlesme> = { ...hukukiSozlesmeleriGetir() };
      veriler.forEach((s) => {
        const anahtar = s.tur || s.id;
        if (anahtar) harita[anahtar] = s;
      });
      setSozlesmeHaritasi(harita);
    });

    return () => {
      logDurdur();
      sozlesmeDurdur();
    };
  }, []);

  return { loglar, sozlesmeHaritasi, yukleniyor };
}
