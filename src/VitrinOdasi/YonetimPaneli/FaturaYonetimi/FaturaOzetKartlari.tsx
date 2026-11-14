import React from 'react';
import { FileText, Receipt, Building, Wallet } from 'lucide-react';
import { FaturaKaydi, faturaYonuGetir } from './faturaVeritabani';

export const FaturaOzetKartlari: React.FC<{ faturalar: FaturaKaydi[] }> = ({ faturalar }) => {
  const gecerliler = faturalar.filter((f) => f.durum !== 'iptal');
  const gelirBelgeleri = gecerliler.filter((f) => faturaYonuGetir(f) === 'gelir');
  const giderBelgeleri = gecerliler.filter((f) => faturaYonuGetir(f) === 'gider');
  const iadeBelgeleri = gecerliler.filter((f) => faturaYonuGetir(f) === 'iade');

  const toplamGelir = gelirBelgeleri.reduce((acc, f) => acc + f.tutar, 0);
  const toplamGider = giderBelgeleri.reduce((acc, f) => acc + f.tutar, 0);
  const hesaplananKdv = gelirBelgeleri.reduce((acc, f) => acc + (f.kdv_tutari || 0), 0);
  const indirilecekKdv = giderBelgeleri.reduce((acc, f) => acc + (f.kdv_tutari || 0), 0);
  const toplamStopaj = gecerliler.reduce((acc, f) => acc + (f.stopaj_tutari || 0), 0);
  const netKdv = Number((hesaplananKdv - indirilecekKdv).toFixed(2));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <div className="p-4 rounded-2xl bg-[#180A1F] border border-emerald-500/40">
        <div className="flex items-center justify-between text-xs text-emerald-200">
          <span>Satış & Komisyon Geliri</span>
          <Building className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="text-2xl font-black text-emerald-400 mt-2">{toplamGelir.toLocaleString('tr-TR')} ₺</div>
        <p className="text-[10px] text-gray-400 mt-1">
          {gelirBelgeleri.length} adet E-Arşiv & Ticari Komisyon faturası
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-[#180A1F] border border-purple-500/40">
        <div className="flex items-center justify-between text-xs text-purple-200">
          <span>Gider Belgeleri Toplamı</span>
          <Receipt className="w-4 h-4 text-purple-400" />
        </div>
        <div className="text-2xl font-black text-white mt-2">{toplamGider.toLocaleString('tr-TR')} ₺</div>
        <p className="text-[10px] text-gray-400 mt-1">
          {giderBelgeleri.length} belge (Gider Pusulası, Kurye, Sanal POS)
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-[#180A1F] border border-amber-500/40">
        <div className="flex items-center justify-between text-xs text-amber-200">
          <span>İade & İptal Belgeleri</span>
          <FileText className="w-4 h-4 text-amber-400" />
        </div>
        <div className="text-2xl font-black text-amber-400 mt-2">{iadeBelgeleri.length} Adet</div>
        <p className="text-[10px] text-gray-400 mt-1">
          İptal edilenler: {faturalar.filter((f) => f.durum === 'iptal').length} belge
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-[#180A1F] border border-[#3E1646]">
        <div className="flex items-center justify-between text-xs text-gray-300">
          <span>Net KDV & Stopaj Dengesi</span>
          <Wallet className="w-4 h-4 text-purple-300" />
        </div>
        <div className="text-2xl font-black text-white mt-2">{netKdv.toLocaleString('tr-TR')} ₺</div>
        <p className="text-[10px] text-gray-400 mt-1">
          İndirilecek KDV: {indirilecekKdv.toLocaleString('tr-TR')} ₺ • Stopaj: {toplamStopaj.toLocaleString('tr-TR')} ₺
        </p>
      </div>
    </div>
  );
};
