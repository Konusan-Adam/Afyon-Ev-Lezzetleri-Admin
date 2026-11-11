import React from 'react';
import { Eye, Sparkles, ArrowRight } from 'lucide-react';
import { AnaAfisAyari } from '@/src/veritabani/CanliVeriYardimcisi';

interface AfisCanliOnizlemeProps {
  ayar: AnaAfisAyari;
}

export const AfisCanliOnizleme: React.FC<AfisCanliOnizlemeProps> = ({ ayar }) => {
  return (
    <div className="space-y-2 pt-2">
      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
        <Eye className="w-4 h-4" />
        <span>Vitrindeki Canlı Önizleme (Müşteri Nasıl Görecek?)</span>
      </div>

      <div className="relative w-full rounded-xl overflow-hidden border border-amber-500/40 shadow-lg min-h-[140px] flex items-center p-4">
        {/* Arka Plan */}
        <div className="absolute inset-0 z-0">
          <img
            src={ayar.gorselVerisi}
            alt={ayar.baslik}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-950/95 via-purple-950/80 to-purple-950/30" />
        </div>

        {/* Metinler */}
        <div className="relative z-10 space-y-1.5 max-w-sm">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400 text-purple-950 text-[10px] font-black uppercase shadow">
            <Sparkles className="w-2.5 h-2.5 fill-current" />
            <span>{ayar.rozet}</span>
          </span>

          <h4 className="text-sm sm:text-base font-black text-white leading-tight">
            {ayar.baslik}
          </h4>

          <p className="text-[11px] text-purple-200/90 line-clamp-2">
            {ayar.aciklama}
          </p>

          <div className="pt-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 text-purple-950 font-black text-[11px]">
              <span>{ayar.butonMetni}</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
