import React, { useState } from 'react';
import { Plus, Minus, Trash2, AlertTriangle, Check, Sparkles } from 'lucide-react';
import { SubeUrunu } from '@/src/veritabani/VeriTipleri';

interface StokKartiProps {
  stok: SubeUrunu;
  onAdetDegistir: (yeniAdet: number) => void;
  onFiyatDegistir: (yeniFiyat: number) => void;
  onSil: () => void;
}

export const SubeStokKarti: React.FC<StokKartiProps> = ({ stok, onAdetDegistir, onFiyatDegistir, onSil }) => {
  const [fiyatDuzenle, setFiyatDuzenle] = useState(false);
  const [geciciFiyat, setGeciciFiyat] = useState(stok.fiyat);
  const kritik = stok.stok_adedi <= (stok.kritik_esik ?? 5);
  const tukendi = stok.stok_adedi <= 0;

  return (
    <div className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-2.5 shadow ${
      tukendi ? 'bg-red-950/20 border-red-800/50' : kritik ? 'bg-amber-950/20 border-amber-600/50' : 'bg-[#1C0922] border-purple-900/60'
    }`}>
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-extrabold text-sm text-white">{stok.ad || stok.urun_adi}</h4>
            <div className="flex items-center gap-1.5 text-[10px] text-purple-300">
              <span>{stok.kategori}</span>
              {stok.hazir_mi !== false && <span className="text-amber-300 font-bold">• 🔥 Sıcak Tezgâh</span>}
              {stok.gunluk_taze_mi && <span className="text-emerald-300 flex items-center gap-0.5"><Sparkles className="w-2.5 h-2.5" />Taze</span>}
            </div>
          </div>
          {tukendi ? (
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-950 border border-red-500 text-red-300">TÜKENDİ</span>
          ) : kritik ? (
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-950 border border-amber-500 text-amber-300 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Kritik ({stok.stok_adedi})
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">Stokta</span>
          )}
        </div>
        {stok.aciklama && <p className="text-[11px] text-purple-200/70 line-clamp-1">{stok.aciklama}</p>}
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-purple-900/40 text-xs">
        {fiyatDuzenle ? (
          <div className="flex items-center gap-1">
            <input type="number" value={geciciFiyat} onChange={e => setGeciciFiyat(Number(e.target.value))}
              className="w-16 bg-[#120415] border border-amber-400 rounded px-1.5 py-0.5 text-xs text-white" />
            <button type="button" onClick={() => { onFiyatDegistir(geciciFiyat); setFiyatDuzenle(false); }}
              className="p-1 rounded bg-amber-400 text-purple-950"><Check className="w-3 h-3" /></button>
          </div>
        ) : (
          <button type="button" onClick={() => setFiyatDuzenle(true)} className="font-black text-amber-400 text-sm hover:underline">
            {stok.fiyat} ₺ <span className="text-[10px] text-gray-400 font-normal">✎</span>
          </button>
        )}

        <div className="flex items-center gap-2">
          <button type="button" onClick={() => onAdetDegistir(Math.max(0, stok.stok_adedi - 1))}
            className="w-7 h-7 rounded-lg bg-purple-900/50 hover:bg-purple-800 text-white font-bold flex items-center justify-center">
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="font-black text-base text-white w-6 text-center">{stok.stok_adedi}</span>
          <button type="button" onClick={() => onAdetDegistir(stok.stok_adedi + 1)}
            className="w-7 h-7 rounded-lg bg-amber-500 hover:bg-amber-400 text-purple-950 font-bold flex items-center justify-center">
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button type="button" onClick={onSil} className="p-1 text-purple-400 hover:text-red-400 ml-1">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
