import React from 'react';
import { Store, Layers, ShoppingBag, Plus } from 'lucide-react';

export type SubeAltSekme = 'genel_bakis' | 'stoklar' | 'siparisler';

interface NavProps {
  aktifAltSekme: SubeAltSekme;
  onSekmeDegistir: (s: SubeAltSekme) => void;
  seciliSubeAdi: string;
  onYeniSubeAc: () => void;
}

export const SubeAltNavigasyon: React.FC<NavProps> = ({
  aktifAltSekme,
  onSekmeDegistir,
  seciliSubeAdi,
  onYeniSubeAc
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-900/40">
    <div className="flex items-center gap-1.5 p-1 bg-[#180A1F] rounded-xl border border-purple-900/60 overflow-x-auto text-xs font-bold">
      <button
        type="button"
        onClick={() => onSekmeDegistir('genel_bakis')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
          aktifAltSekme === 'genel_bakis' ? 'bg-amber-400 text-purple-950 shadow' : 'text-gray-300 hover:text-white'
        }`}
      >
        <Store className="w-3.5 h-3.5" />
        <span>Tüm Şubeler</span>
      </button>

      <button
        type="button"
        onClick={() => onSekmeDegistir('stoklar')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
          aktifAltSekme === 'stoklar' ? 'bg-amber-400 text-purple-950 shadow' : 'text-gray-300 hover:text-white'
        }`}
      >
        <Layers className="w-3.5 h-3.5" />
        <span>Tezgâh Stoğu ({seciliSubeAdi})</span>
      </button>

      <button
        type="button"
        onClick={() => onSekmeDegistir('siparisler')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
          aktifAltSekme === 'siparisler' ? 'bg-amber-400 text-purple-950 shadow' : 'text-gray-300 hover:text-white'
        }`}
      >
        <ShoppingBag className="w-3.5 h-3.5" />
        <span>Şube Siparişleri ({seciliSubeAdi})</span>
      </button>
    </div>

    <button
      type="button"
      onClick={onYeniSubeAc}
      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-purple-950 font-black text-xs hover:brightness-110 shadow-lg cursor-pointer shrink-0"
    >
      <Plus className="w-4 h-4" />
      <span>Yeni Şube Tanımla</span>
    </button>
  </div>
);
