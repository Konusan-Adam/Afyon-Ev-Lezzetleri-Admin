import React from 'react';
import { CheckSquare, Square, FileSpreadsheet, FileText, Send, AlertTriangle } from 'lucide-react';

interface TopluCubukProps {
  bekleyenSayisi: number;
  seciliSayisi: number;
  seciliTutar: number;
  hataliKayitSayisi: number;
  tumunuSec: () => void;
  csvIndir: () => void;
  txtIndir: () => void;
  topluOdeAc: () => void;
}

export const HakedisTopluIslemCubugu: React.FC<TopluCubukProps> = ({
  bekleyenSayisi,
  seciliSayisi,
  seciliTutar,
  hataliKayitSayisi,
  tumunuSec,
  csvIndir,
  txtIndir,
  topluOdeAc
}) => {
  if (bekleyenSayisi === 0) return null;
  const hepsiSecili = seciliSayisi > 0 && seciliSayisi === bekleyenSayisi;

  return (
    <div className="p-4 rounded-2xl bg-[#1C0922] border border-amber-500/40 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={tumunuSec}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-950/70 hover:bg-purple-900 border border-purple-700 text-white font-bold cursor-pointer"
        >
          {hepsiSecili ? <CheckSquare className="w-4 h-4 text-amber-400" /> : <Square className="w-4 h-4 text-gray-400" />}
          <span>{hepsiSecili ? 'Seçimi Temizle' : `Bekleyenlerin Tümünü Seç (${bekleyenSayisi})`}</span>
        </button>

        {seciliSayisi > 0 && (
          <span className="text-amber-300 font-black">
            {seciliSayisi} Alıcı • {seciliTutar.toLocaleString('tr-TR')} ₺
          </span>
        )}

        {hataliKayitSayisi > 0 && (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-950/80 border border-rose-500/40 text-rose-300 font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{hataliKayitSayisi} kayıtta TCKN/VKN veya geçerli IBAN eksik!</span>
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={seciliSayisi === 0}
          onClick={csvIndir}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-600/50 text-emerald-300 font-bold disabled:opacity-40 cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Banka Excel/CSV</span>
        </button>

        <button
          type="button"
          disabled={seciliSayisi === 0}
          onClick={txtIndir}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-950/70 hover:bg-blue-900 border border-blue-600/50 text-blue-300 font-bold disabled:opacity-40 cursor-pointer"
        >
          <FileText className="w-4 h-4" />
          <span>Banka FAST/TXT</span>
        </button>

        <button
          type="button"
          disabled={seciliSayisi === 0}
          onClick={topluOdeAc}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-purple-950 font-black hover:brightness-110 disabled:opacity-40 cursor-pointer shadow-md"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Seçilenleri Toplu Öde & Pusula Kes</span>
        </button>
      </div>
    </div>
  );
};
