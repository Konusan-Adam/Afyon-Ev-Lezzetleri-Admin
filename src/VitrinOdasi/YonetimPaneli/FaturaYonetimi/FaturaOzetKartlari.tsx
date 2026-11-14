import React from 'react';
import { FileText, Receipt, Building, Wallet } from 'lucide-react';
import { FaturaKaydi } from './faturaVeritabani';

export const FaturaOzetKartlari: React.FC<{ faturalar: FaturaKaydi[] }> = ({ faturalar }) => {
  const gecerliler = faturalar.filter((f) => f.durum !== 'iptal');
  const toplamCiro = gecerliler.reduce((acc, f) => acc + f.tutar, 0);
  const toplamKdv = gecerliler.reduce((acc, f) => acc + (f.kdv_tutari || 0), 0);
  const toplamStopaj = gecerliler.reduce((acc, f) => acc + (f.stopaj_tutari || 0), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="p-4 rounded-2xl bg-[#180A1F] border border-amber-500/40">
        <div className="flex items-center justify-between text-xs text-amber-200">
          <span>Geçerli Fatura Hacmi</span>
          <FileText className="w-4 h-4 text-amber-400" />
        </div>
        <div className="text-2xl font-black text-amber-400 mt-2">{toplamCiro.toLocaleString('tr-TR')} ₺</div>
        <p className="text-[10px] text-gray-400 mt-1">
          İptal edilenler ({faturalar.filter((f) => f.durum === 'iptal').length}) hariç toplam
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-[#180A1F] border border-purple-500/40">
        <div className="flex items-center justify-between text-xs text-purple-200">
          <span>Gider Pusulası & Kurye</span>
          <Receipt className="w-4 h-4 text-purple-400" />
        </div>
        <div className="text-2xl font-black text-white mt-2">
          {gecerliler.filter((f) => f.tip === 'gider_pusulasi' || f.tip === 'kurye_makbuz').length} Adet
        </div>
        <p className="text-[10px] text-gray-400 mt-1">GVK 9/10 & Hakediş belgeleri</p>
      </div>

      <div className="p-4 rounded-2xl bg-[#180A1F] border border-emerald-500/40">
        <div className="flex items-center justify-between text-xs text-emerald-200">
          <span>E-Arşiv & Komisyon</span>
          <Building className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="text-2xl font-black text-emerald-400 mt-2">
          {gecerliler.filter((f) => f.tip === 'earSiv_fatura' || f.tip === 'komisyon_faturasi').length} Adet
        </div>
        <p className="text-[10px] text-gray-400 mt-1">Satış ve komisyon faturaları</p>
      </div>

      <div className="p-4 rounded-2xl bg-[#180A1F] border border-[#3E1646]">
        <div className="flex items-center justify-between text-xs text-gray-300">
          <span>KDV & Stopaj Toplamı</span>
          <Wallet className="w-4 h-4 text-purple-300" />
        </div>
        <div className="text-2xl font-black text-white mt-2">{toplamKdv.toLocaleString('tr-TR')} ₺</div>
        <p className="text-[10px] text-gray-400 mt-1">Stopaj Kesintisi: {toplamStopaj.toLocaleString('tr-TR')} ₺</p>
      </div>
    </div>
  );
};
