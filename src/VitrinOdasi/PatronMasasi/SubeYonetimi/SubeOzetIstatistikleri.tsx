import React from 'react';
import { Store, ShoppingBag, AlertTriangle, Video, TrendingUp } from 'lucide-react';

interface OzetProps {
  toplamSube: number;
  acikSube: number;
  canliYayinSube: number;
  kritikStokSayisi: number;
  gunlukCiro: number;
  gunlukTeslimat: number;
}

export const SubeOzetIstatistikleri: React.FC<OzetProps> = ({
  toplamSube,
  acikSube,
  canliYayinSube,
  kritikStokSayisi,
  gunlukCiro,
  gunlukTeslimat
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      <div className="p-3.5 rounded-2xl bg-[#1C0922] border border-purple-900/60 shadow">
        <div className="flex items-center justify-between text-gray-400 text-xs">
          <span>Şubeler</span>
          <Store className="w-4 h-4 text-amber-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-xl font-black text-white">{toplamSube}</span>
          <span className="text-[10px] text-emerald-400 font-bold">({acikSube} Açık)</span>
        </div>
      </div>

      <div className="p-3.5 rounded-2xl bg-[#1C0922] border border-purple-900/60 shadow">
        <div className="flex items-center justify-between text-gray-400 text-xs">
          <span>Canlı Mutfak</span>
          <Video className="w-4 h-4 text-rose-400" />
        </div>
        <div className="mt-2 text-xl font-black text-rose-300">
          {canliYayinSube} <span className="text-[10px] font-semibold text-gray-400">Aktif Yayın</span>
        </div>
      </div>

      <div className="p-3.5 rounded-2xl bg-[#1C0922] border border-purple-900/60 shadow">
        <div className="flex items-center justify-between text-gray-400 text-xs">
          <span>Kritik Tezgâh</span>
          <AlertTriangle className="w-4 h-4 text-red-400" />
        </div>
        <div className="mt-2 text-xl font-black text-red-400">
          {kritikStokSayisi} <span className="text-[10px] font-semibold text-gray-400">Ürün Azaldı</span>
        </div>
      </div>

      <div className="p-3.5 rounded-2xl bg-[#1C0922] border border-purple-900/60 shadow">
        <div className="flex items-center justify-between text-gray-400 text-xs">
          <span>Günlük Teslimat</span>
          <ShoppingBag className="w-4 h-4 text-blue-400" />
        </div>
        <div className="mt-2 text-xl font-black text-blue-300">
          {gunlukTeslimat} <span className="text-[10px] font-semibold text-gray-400">Paket</span>
        </div>
      </div>

      <div className="p-3.5 rounded-2xl bg-[#1C0922] border border-purple-900/60 shadow col-span-2 md:col-span-1">
        <div className="flex items-center justify-between text-gray-400 text-xs">
          <span>Gel-Al Ciro</span>
          <TrendingUp className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="mt-2 text-xl font-black text-emerald-400">
          {gunlukCiro.toLocaleString('tr-TR')} ₺
        </div>
      </div>
    </div>
  );
};
