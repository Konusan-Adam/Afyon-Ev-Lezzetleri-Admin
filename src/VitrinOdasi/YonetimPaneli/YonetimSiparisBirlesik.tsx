import React, { useState } from 'react';
import { ShoppingBag, ClipboardList } from 'lucide-react';
import { YonetimSiparisler } from './YonetimSiparisler';
import { YonetimAkilliSiparisTakip } from './YonetimAkilliSiparisTakip';

export const YonetimSiparisBirlesik: React.FC = () => {
  const [sekme, setSekme] = useState<'sevk' | 'analiz'>('sevk');

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-[#180A1F] border border-[#3E1646] w-fit text-xs font-bold">
        <button type="button" onClick={() => setSekme('sevk')}
          className={`px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer ${sekme === 'sevk' ? 'bg-amber-500 text-purple-950 font-black' : 'text-gray-400 hover:text-white'}`}>
          <ShoppingBag className="w-3.5 h-3.5" /><span>Canlı Sevk Masası</span>
        </button>
        <button type="button" onClick={() => setSekme('analiz')}
          className={`px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer ${sekme === 'analiz' ? 'bg-amber-500 text-purple-950 font-black' : 'text-gray-400 hover:text-white'}`}>
          <ClipboardList className="w-3.5 h-3.5" /><span>Detaylı Ciro & İptal Raporu</span>
        </button>
      </div>
      {sekme === 'sevk' ? <YonetimSiparisler /> : <YonetimAkilliSiparisTakip />}
    </div>
  );
};
