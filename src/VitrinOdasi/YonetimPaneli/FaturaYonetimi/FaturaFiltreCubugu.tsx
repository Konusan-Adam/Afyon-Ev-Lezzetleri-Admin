import React from 'react';
import { Plus, Search, Download, RefreshCw } from 'lucide-react';

interface FiltreProps {
  tipFiltresi: string;
  setTipFiltresi: (v: string) => void;
  durumFiltresi: string;
  setDurumFiltresi: (v: string) => void;
  aramaMetni: string;
  setAramaMetni: (v: string) => void;
  baslangicTarih: string;
  setBaslangicTarih: (v: string) => void;
  bitisTarih: string;
  setBitisTarih: (v: string) => void;
  otomatikUretYukleniyor: boolean;
  onOtomatikUret: () => void;
  onCsvIndir: () => void;
  onYeniAc: () => void;
}

export const FaturaFiltreCubugu: React.FC<FiltreProps> = ({
  tipFiltresi, setTipFiltresi, durumFiltresi, setDurumFiltresi,
  aramaMetni, setAramaMetni, baslangicTarih, setBaslangicTarih,
  bitisTarih, setBitisTarih, otomatikUretYukleniyor, onOtomatikUret, onCsvIndir, onYeniAc
}) => (
  <div className="p-4 rounded-2xl bg-[#180A1F] border border-[#3E1646] space-y-3 text-xs">
    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 xl:pb-0">
        {[
          { id: 'hepsi', baslik: 'Tümü' },
          { id: 'gider_pusulasi', baslik: 'Gider Pusulası' },
          { id: 'earSiv_fatura', baslik: 'E-Arşiv' },
          { id: 'komisyon_faturasi', baslik: 'Komisyon' },
          { id: 'kurye_makbuz', baslik: 'Esnaf Kurye' },
          { id: 'sanal_pos_faturasi', baslik: 'Sanal POS' },
          { id: 'iade_iptal', baslik: 'İade / İptal' }
        ].map((t) => (
          <button key={t.id} type="button" onClick={() => setTipFiltresi(t.id)}
            className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer whitespace-nowrap ${
              tipFiltresi === t.id ? 'bg-amber-500 text-purple-950' : 'bg-[#120614] text-gray-400 border border-purple-900/60 hover:text-white'
            }`}>
            {t.baslik}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <button type="button" disabled={otomatikUretYukleniyor} onClick={onOtomatikUret}
          className="px-3 py-2 rounded-xl bg-blue-950/70 hover:bg-blue-900 border border-blue-600/50 text-blue-200 font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50">
          <RefreshCw className={`w-3.5 h-3.5 ${otomatikUretYukleniyor ? 'animate-spin' : ''}`} />
          <span>Sipariş & Hakedişten Üret</span>
        </button>
        <button type="button" onClick={onCsvIndir}
          className="px-3 py-2 rounded-xl bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-600/50 text-emerald-200 font-bold flex items-center gap-1.5 cursor-pointer">
          <Download className="w-3.5 h-3.5" /><span>Excel/CSV</span>
        </button>
        <button type="button" onClick={onYeniAc}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-[#130713] font-black flex items-center gap-1.5 cursor-pointer hover:brightness-110">
          <Plus className="w-4 h-4" /><span>Yeni Belge Kes</span>
        </button>
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2 border-t border-purple-950/70">
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2" />
        <input type="text" value={aramaMetni} onChange={e => setAramaMetni(e.target.value)} placeholder="Belge no, ünvan veya VKN/TCKN ara..."
          className="w-full bg-[#120614] border border-purple-900 rounded-xl pl-9 pr-3 py-1.5 text-white outline-none focus:border-amber-400" />
      </div>
      <select value={durumFiltresi} onChange={e => setDurumFiltresi(e.target.value)}
        className="bg-[#120614] border border-purple-900 rounded-xl px-3 py-1.5 text-white outline-none focus:border-amber-400">
        <option value="hepsi">Durum: Tümü</option>
        <option value="onaylandi">Onaylı Belgeler</option>
        <option value="beklemede">Bekleyen Belgeler</option>
        <option value="iptal">İptal Edilenler</option>
      </select>
      <input type="date" value={baslangicTarih} onChange={e => setBaslangicTarih(e.target.value)} title="Başlangıç Tarihi"
        className="bg-[#120614] border border-purple-900 rounded-xl px-3 py-1.5 text-white outline-none focus:border-amber-400" />
      <input type="date" value={bitisTarih} onChange={e => setBitisTarih(e.target.value)} title="Bitiş Tarihi"
        className="bg-[#120614] border border-purple-900 rounded-xl px-3 py-1.5 text-white outline-none focus:border-amber-400" />
    </div>
  </div>
);
