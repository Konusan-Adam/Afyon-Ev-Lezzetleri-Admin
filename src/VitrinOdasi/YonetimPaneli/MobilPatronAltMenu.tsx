import React from 'react';
import { Store, ShoppingBag, Bike, UtensilsCrossed, LayoutGrid } from 'lucide-react';

export type MobilAnaSekmeKimligi =
  | 'mutfaklar'
  | 'mutfak_afisleri'
  | 'siparisler'
  | 'kuryeler'
  | 'yemekler'
  | 'fatura'
  | 'komisyonlar'
  | 'ozet'
  | 'gel_al_subeleri'
  | 'musteriler'
  | 'hukuki_delil'
  | 'sistem_ayarlari'
  | 'lezzet_danismani';

interface MobilPatronAltMenuProps {
  aktifSekme: MobilAnaSekmeKimligi;
  gorunurMu: boolean;
  tumMenuAcikMi: boolean;
  bekleyenHakedisSayisi: number;
  bekleyenCokluMenuSayisi: number;
  onSekmeSec: (sekme: MobilAnaSekmeKimligi) => void;
  onTumMenuDegistir: () => void;
}

const ANA_SEKMELER: MobilAnaSekmeKimligi[] = ['mutfaklar', 'siparisler', 'kuryeler', 'yemekler'];

export const MobilPatronAltMenu: React.FC<MobilPatronAltMenuProps> = ({
  aktifSekme,
  gorunurMu,
  tumMenuAcikMi,
  bekleyenHakedisSayisi,
  bekleyenCokluMenuSayisi,
  onSekmeSec,
  onTumMenuDegistir,
}) => {
  const digerSekmeAktifMi = !ANA_SEKMELER.includes(aktifSekme);

  const ogeler: {
    kimlik: MobilAnaSekmeKimligi;
    etiket: string;
    ikon: React.ComponentType<{ className?: string }>;
    rozetSayisi?: number;
  }[] = [
    {
      kimlik: 'mutfaklar',
      etiket: 'Mutfaklar',
      ikon: Store,
      rozetSayisi: bekleyenHakedisSayisi,
    },
    {
      kimlik: 'siparisler',
      etiket: 'Sipariş',
      ikon: ShoppingBag,
    },
    {
      kimlik: 'kuryeler',
      etiket: 'Kurye',
      ikon: Bike,
    },
    {
      kimlik: 'yemekler',
      etiket: 'Yemekler',
      ikon: UtensilsCrossed,
      rozetSayisi: bekleyenCokluMenuSayisi,
    },
  ];

  return (
    <nav
      aria-label="Mobil Patron Alt Menü"
      className={`lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#180A1F]/95 backdrop-blur-md border-t border-[#3E1646] shadow-[0_-8px_24px_rgba(0,0,0,0.45)] transition-transform duration-200 ease-out will-change-transform ${
        gorunurMu ? 'translate-y-0' : 'translate-y-full pointer-events-none'
      }`}
    >
      <div className="grid grid-cols-5 items-center h-[60px] px-1">
        {ogeler.map((oge) => {
          const Ikon = oge.ikon;
          const aktif = !tumMenuAcikMi && aktifSekme === oge.kimlik;
          const sayi = oge.rozetSayisi || 0;

          return (
            <button
              key={oge.kimlik}
              type="button"
              onClick={() => onSekmeSec(oge.kimlik)}
              className={`relative min-h-[44px] flex flex-col items-center justify-center gap-0.5 rounded-xl px-1 transition-colors cursor-pointer whitespace-nowrap ${
                aktif ? 'text-amber-300' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Ikon className={`w-5 h-5 ${aktif ? 'text-amber-300' : 'text-gray-400'}`} />
                {sayi > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-amber-500 text-purple-950 text-[9px] font-black flex items-center justify-center tabular-nums">
                    {sayi > 9 ? '9+' : sayi}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-semibold tracking-tight leading-none">
                {oge.etiket}
              </span>
              {aktif && (
                <span className="w-1 h-1 rounded-full bg-amber-400 mt-0.5" aria-hidden="true" />
              )}
            </button>
          );
        })}

        <button
          type="button"
          onClick={onTumMenuDegistir}
          className={`relative min-h-[44px] flex flex-col items-center justify-center gap-0.5 rounded-xl px-1 transition-colors cursor-pointer whitespace-nowrap ${
            tumMenuAcikMi || digerSekmeAktifMi
              ? 'text-amber-300'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <LayoutGrid
            className={`w-5 h-5 ${
              tumMenuAcikMi || digerSekmeAktifMi ? 'text-amber-300' : 'text-gray-400'
            }`}
          />
          <span className="text-[10px] font-semibold tracking-tight leading-none">Tümü</span>
          {(tumMenuAcikMi || digerSekmeAktifMi) && (
            <span className="w-1 h-1 rounded-full bg-amber-400 mt-0.5" aria-hidden="true" />
          )}
        </button>
      </div>
    </nav>
  );
};
