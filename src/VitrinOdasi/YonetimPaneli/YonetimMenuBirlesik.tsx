import React, { useState, useEffect } from 'react';
import { UtensilsCrossed, Layers, Sliders, PackageCheck } from 'lucide-react';
import { YonetimYemekler } from './YonetimYemekler';
import { YonetimKategoriler } from './YonetimKategoriler';
import { YonetimVaryasyonlar } from './YonetimVaryasyonlar';
import { YonetimCokluMenuler } from './YonetimCokluMenuler';
import { useCanliCokluMenuler } from '@/src/MalzemeCekmeceleri/useCanliCokluMenuler';

export interface MenuYonlendirmeBilgisi {
  altSekme?: 'yemek' | 'kategori' | 'varyasyon' | 'coklu_menuler';
  anahtar: number;
}

interface YonetimMenuBirlesikProps {
  menuYonlendirme?: MenuYonlendirmeBilgisi | null;
}

export const YonetimMenuBirlesik: React.FC<YonetimMenuBirlesikProps> = ({ menuYonlendirme }) => {
  const [sekme, setSekme] = useState<'yemek' | 'coklu_menuler' | 'kategori' | 'varyasyon'>('yemek');
  const { bekleyenSayisi: bekleyenCokluMenuSayisi } = useCanliCokluMenuler();

  useEffect(() => {
    if (menuYonlendirme?.altSekme) {
      setSekme(menuYonlendirme.altSekme);
    }
  }, [menuYonlendirme]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-[#180A1F] border border-[#3E1646] w-fit text-xs font-bold">
        <button type="button" onClick={() => setSekme('yemek')}
          className={`px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer ${sekme === 'yemek' ? 'bg-amber-500 text-purple-950 font-black' : 'text-gray-400 hover:text-white'}`}>
          <UtensilsCrossed className="w-3.5 h-3.5" /><span>Yemekler & Onaylar</span>
        </button>
        <button type="button" onClick={() => setSekme('coklu_menuler')}
          className={`px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer ${sekme === 'coklu_menuler' ? 'bg-amber-500 text-purple-950 font-black' : 'text-gray-400 hover:text-white'}`}>
          <PackageCheck className="w-3.5 h-3.5" />
          <span>Çoklu Menü Onayları</span>
          {bekleyenCokluMenuSayisi > 0 && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${sekme === 'coklu_menuler' ? 'bg-purple-950 text-amber-300' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'}`}>
              {bekleyenCokluMenuSayisi}
            </span>
          )}
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
      {sekme === 'coklu_menuler' && <YonetimCokluMenuler />}
      {sekme === 'kategori' && <YonetimKategoriler />}
      {sekme === 'varyasyon' && <YonetimVaryasyonlar />}
    </div>
  );
};
