import React, { useState } from 'react';
import { Bike, Navigation } from 'lucide-react';
import { YonetimKuryeler } from './YonetimKuryeler';
import { YonetimAkilliKurye } from './YonetimAkilliKurye';

export const YonetimKuryeBirlesik: React.FC = () => {
  const [sekme, setSekme] = useState<'ekip' | 'rota'>('ekip');

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-[#180A1F] border border-[#3E1646] w-fit text-xs font-bold">
        <button type="button" onClick={() => setSekme('ekip')}
          className={`px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer ${sekme === 'ekip' ? 'bg-amber-500 text-purple-950 font-black' : 'text-gray-400 hover:text-white'}`}>
          <Bike className="w-3.5 h-3.5" /><span>Kurye Ekibi & Seferler</span>
        </button>
        <button type="button" onClick={() => setSekme('rota')}
          className={`px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer ${sekme === 'rota' ? 'bg-amber-500 text-purple-950 font-black' : 'text-gray-400 hover:text-white'}`}>
          <Navigation className="w-3.5 h-3.5" /><span>Akıllı Rota & KM Fiyatlandırma</span>
        </button>
      </div>
      {sekme === 'ekip' ? <YonetimKuryeler /> : <YonetimAkilliKurye />}
    </div>
  );
};
