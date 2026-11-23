import React from 'react';
import { Layers, ShieldCheck, FileSignature, Truck } from 'lucide-react';
import { HukukiDelilOzeti } from '@/src/MalzemeCekmeceleri/HukukVeSozlesmeler/hukukiDelilFiltreYardimcisi';

interface HukukiDelilOzetKartlariProps {
  ozet: HukukiDelilOzeti;
}

export const HukukiDelilOzetKartlari: React.FC<HukukiDelilOzetKartlariProps> = ({ ozet }) => {
  const kartlar = [
    { baslik: 'Toplam Delil Kaydı', deger: ozet.toplamKayit, ikon: Layers, renk: 'text-amber-300 border-amber-500/40' },
    { baslik: 'RFC 3161 Onaylı', deger: ozet.rfc3161Sayisi, ikon: ShieldCheck, renk: 'text-emerald-300 border-emerald-500/40' },
    { baslik: 'Sipariş / Sözleşme Onayı', deger: ozet.siparisSozlesmeSayisi, ikon: FileSignature, renk: 'text-purple-300 border-purple-500/40' },
    { baslik: 'Teslimat / İptal / Hakediş', deger: ozet.teslimatIptalHakedisSayisi, ikon: Truck, renk: 'text-sky-300 border-sky-500/40' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {kartlar.map((k) => {
        const Ikon = k.ikon;
        return (
          <div key={k.baslik} className={`p-4 rounded-2xl bg-[#180A1F] border ${k.renk} flex items-center justify-between shadow-lg`}>
            <div>
              <p className="text-[11px] font-bold text-gray-400">{k.baslik}</p>
              <p className="text-2xl font-black text-white mt-1 tabular-nums">{k.deger}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
              <Ikon className={`w-5 h-5 ${k.renk.split(' ')[0]}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
