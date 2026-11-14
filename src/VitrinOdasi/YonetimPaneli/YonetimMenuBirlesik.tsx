import React, { useState } from 'react';
import { UtensilsCrossed, Layers, Sliders } from 'lucide-react';
import { YonetimYemekler } from './YonetimYemekler';
import { YonetimKategoriler } from './YonetimKategoriler';
import { YonetimVaryasyonlar } from './YonetimVaryasyonlar';

export const YonetimMenuBirlesik: React.FC = () => {
  const [sekme, setSekme] = useState<'yemek' | 'kategori' | 'varyasyon'>('yemek');

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-[#180A1F] border border-[#3E1646] w-fit text-xs font-bold">
        <button type="button" onClick={() => setSekme('yemek')}
          className={`px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer ${sekme === 'yemek' ? 'bg-amber-500 text-purple-950 font-black' : 'text-gray-400 hover:text-white'}`}>
          <UtensilsCrossed className="w-3.5 h-3.5" /><span>Yemekler & Onaylar</span>
        </button>
        <button type="button" onClick={() => setSekme('kategori')}
          className={`px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer ${sekme === 'kategori' ? 'bg-amber-500 text-purple-950 font-black' : 'text-gray-400 hover:text-white'}`}>
          <Layers className="w-3.5 h-3.5" /><span>Kategori & Alt Gruplar</span>
        </button>
        <button type="button" onClick={() => setSekme('varyasyon')}
          className={`px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer ${sekme === 'varyasyon' ? 'bg-amber-500 text-purple-950 font-black' : 'text-gray-400 hover:text-white'}`}>
          <Sliders className="w-3.5 h-3.5" /><span>Varyasyon Şablonları</span>
        </button>
      </div>
      {sekme === 'yemek' && <YonetimYemekler />}
      {sekme === 'kategori' && <YonetimKategoriler />}
      {sekme === 'varyasyon' && <YonetimVaryasyonlar />}
    </div>
  );
};
