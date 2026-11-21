import React, { useState, useEffect, useMemo } from 'react';
import { ChevronRight, Store } from 'lucide-react';
import { AnaAfisOgesi } from '@/src/veritabani/GercekVeriYardimcisi';
import { gorselUrlGuvenliYap } from '@/src/MalzemeCekmeceleri/sunucuGorselYukleyici';
import { useCanliMutfakAfisleri } from '@/src/MalzemeCekmeceleri/useCanliMutfakAfisleri';
import { kullaniciHafizasiKullan } from '@/src/OrtakHavuz/KullaniciHafizasi';
import { RESMI_MUTFAK_LOGOSU } from '@/src/MalzemeCekmeceleri/Mutfak/resmiMutfakLogosu';

interface MobilKampanyaSliderOzellikleri {
  kampanyalar: AnaAfisOgesi[];
  onMutfakSec?: (mutfakId: string) => void;
}

export const MobilKampanyaSlider: React.FC<MobilKampanyaSliderOzellikleri> = ({
  kampanyalar,
  onMutfakSec,
}) => {
  const { vitrinAfisleri } = useCanliMutfakAfisleri();
  const { pencereAc } = kullaniciHafizasiKullan();
  const [aktifSira, setAktifSira] = useState<number>(0);
  const [dokunmaBaslangicX, setDokunmaBaslangicX] = useState<number | null>(null);

  // Yalnızca admin onaylı (onayli_mi === true) ve aktif (aktif_mi === true) mutfak afişleri + aktif kampanyalar
  const aktifListesi = useMemo(() => {
    const mutfakSlaytlari: AnaAfisOgesi[] = vitrinAfisleri.map((afis) => ({
      id: afis.id,
      rozet: afis.rozet || 'ÖZEL LEZZET',
      baslik: afis.baslik,
      aciklama: afis.aciklama || '',
      gorsel_url: afis.gorsel_url,
      gorselUrl: afis.gorsel_url,
      gorselVerisi: afis.gorsel_url,
      butonMetni: afis.butonMetni || (afis.mutfak_id ? 'Mutfağı Gör' : 'Hemen Keşfet!'),
      butonHedefi: afis.butonHedefi || (afis.mutfak_id ? 'mutfak_detay' : 'kesfet'),
      mutfak_id: afis.mutfak_id,
      mutfak_adi: afis.mutfak_adi,
      sira: Number(afis.sira ?? 1),
      aktif: true,
      aktif_mi: true,
    }));

    const kampanyaSlaytlari = (kampanyalar || []).filter(
      (k) => k.aktif !== false && k.aktif_mi !== false
    );

    return [...mutfakSlaytlari, ...kampanyaSlaytlari];
  }, [vitrinAfisleri, kampanyalar]);

  const toplamKampanya = aktifListesi.length;

  useEffect(() => {
    if (toplamKampanya <= 1) return;
    const zamanlayici = setInterval(() => {
      setAktifSira((onceki) => (onceki + 1) % toplamKampanya);
    }, 4500);

    return () => clearInterval(zamanlayici);
  }, [toplamKampanya]);

  if (!aktifListesi || toplamKampanya === 0) return null;

  const guvenliSira = aktifSira % toplamKampanya;
  const aktifKampanya = aktifListesi[guvenliSira] || aktifListesi[0];

  const dokunmaBasladi = (e: React.TouchEvent) => {
    setDokunmaBaslangicX(e.touches[0].clientX);
  };

  const dokunmaBitti = (e: React.TouchEvent) => {
    if (dokunmaBaslangicX === null) return;
    const fark = dokunmaBaslangicX - e.changedTouches[0].clientX;
    if (Math.abs(fark) > 40) {
      if (fark > 0) {
        setAktifSira((onceki) => (onceki + 1) % toplamKampanya);
      } else {
        setAktifSira((onceki) => (onceki - 1 + toplamKampanya) % toplamKampanya);
      }
    }
    setDokunmaBaslangicX(null);
  };

  const slaytTiklandi = (e: React.MouseEvent) => {
    e.preventDefault();
    if (aktifKampanya.butonHedefi === 'kayit') {
      pencereAc('kayit', 'musteri');
      return;
    }
    if (aktifKampanya.mutfak_id && onMutfakSec) {
      onMutfakSec(aktifKampanya.mutfak_id);
      return;
    }
    const hedef = document.getElementById('afyon-mutfaklari') || document.getElementById('kampanyalar');
    hedef?.scrollIntoView({ behavior: 'smooth' });
  };

  const hamUrl =
    aktifKampanya.gorselVerisi ||
    aktifKampanya.gorsel_url ||
    aktifKampanya.gorselUrl ||
    RESMI_MUTFAK_LOGOSU;
  const gorselKaynagi = gorselUrlGuvenliYap(hamUrl);

  return (
    <div className="w-full px-4 select-none">
      <div
        onTouchStart={dokunmaBasladi}
        onTouchEnd={dokunmaBitti}
        onClick={slaytTiklandi}
        className="relative w-full max-w-2xl mx-auto flex items-center justify-between min-h-[145px] py-2 cursor-pointer transition-opacity duration-300 bg-transparent"
      >
        <div className="flex-1 pr-3 z-10 flex flex-col justify-center">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            {aktifKampanya.rozet && (
              <div className="bg-[#431B47] text-amber-300 text-[10px] font-black px-2.5 py-0.5 rounded-md w-fit uppercase tracking-wider">
                {aktifKampanya.rozet}
              </div>
            )}
            {aktifKampanya.mutfak_adi && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-200/90">
                <Store className="w-3 h-3 text-amber-400" />
                <span>{aktifKampanya.mutfak_adi}</span>
              </span>
            )}
          </div>

          <h2 className="text-white text-base sm:text-lg font-bold leading-tight mb-1 max-w-[280px] sm:max-w-md">
            {aktifKampanya.baslik}
          </h2>

          {aktifKampanya.aciklama && (
            <p className="text-purple-200/80 text-[11px] leading-snug mb-2.5 max-w-[260px] sm:max-w-md line-clamp-2">
              {aktifKampanya.aciklama}
            </p>
          )}

          <button
            type="button"
            onClick={slaytTiklandi}
            className="inline-flex items-center gap-1.5 text-white font-bold text-xs hover:opacity-90 transition-opacity w-fit cursor-pointer"
          >
            <span>{aktifKampanya.butonMetni || 'Hemen Keşfet!'}</span>
            <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center shrink-0">
              <ChevronRight size={11} className="text-[#1A0A1D] stroke-[3]" />
            </div>
          </button>
        </div>

        <div className="relative z-10 shrink-0 flex items-center justify-center">
          <img
            src={gorselKaynagi}
            alt={aktifKampanya.baslik}
            onError={(e) => {
              e.currentTarget.src = RESMI_MUTFAK_LOGOSU;
            }}
            className="w-28 h-28 sm:w-36 sm:h-36 object-contain rounded-xl select-none pointer-events-none drop-shadow-none bg-transparent"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      {toplamKampanya > 1 && (
        <div className="flex justify-center mt-2 mb-2">
          <div className="bg-[#2D1233]/90 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
            {aktifListesi.map((_, index) => {
              const aktif = index === guvenliSira;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => setAktifSira(index)}
                  className={`transition-all duration-300 cursor-pointer ${
                    aktif
                      ? 'w-5 h-2 rounded-full bg-[#E59B00]'
                      : 'w-2 h-2 rounded-full bg-white/25 hover:bg-white/40'
                  }`}
                  aria-label={`Kampanya ${index + 1}`}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
