import React, { useState } from 'react';
import { Users, Star } from 'lucide-react';
import { YonetimMusteriler } from './YonetimMusteriler';
import { YonetimDegerlendirmeler } from './YonetimDegerlendirmeler';

export const YonetimMusteriBirlesik: React.FC = () => {
  const [sekme, setSekme] = useState<'musteri' | 'yorum'>('musteri');

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-[#180A1F] border border-[#3E1646] w-fit text-xs font-bold">
        <button type="button" onClick={() => setSekme('musteri')}
          className={`px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer ${sekme === 'musteri' ? 'bg-amber-500 text-purple-950 font-black' : 'text-gray-400 hover:text-white'}`}>
          <Users className="w-3.5 h-3.5" /><span>Kayıtlı Müşteriler & Cüzdan</span>
        </button>
        <button type="button" onClick={() => setSekme('yorum')}
          className={`px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer ${sekme === 'yorum' ? 'bg-amber-500 text-purple-950 font-black' : 'text-gray-400 hover:text-white'}`}>
          <Star className="w-3.5 h-3.5" /><span>Müşteri Yorumları</span>
        </button>
      </div>
      {sekme === 'musteri' ? <YonetimMusteriler /> : <YonetimDegerlendirmeler />}
    </div>
  );
};
