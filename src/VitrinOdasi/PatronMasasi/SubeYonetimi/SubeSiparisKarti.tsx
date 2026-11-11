import React from 'react';
import { ShoppingBag, Clock, Phone, CheckCircle2, ChevronRight, XCircle, KeyRound } from 'lucide-react';
import { SubeSiparisi } from '@/src/veritabani/VeriTipleri';

interface SiparisKartiProps {
  siparis: SubeSiparisi;
  onDurumGuncelle: (durum: SubeSiparisi['durum']) => void;
}

export const SubeSiparisKarti: React.FC<SiparisKartiProps> = ({ siparis, onDurumGuncelle }) => {
  const durumStil = () => {
    switch (siparis.durum) {
      case 'hazirlaniyor': return 'bg-amber-950/60 border-amber-500/40 text-amber-300';
      case 'teslime_hazir': return 'bg-blue-950/60 border-blue-500/40 text-blue-300';
      case 'teslim_edildi': return 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300';
      case 'iptal': return 'bg-red-950/60 border-red-500/40 text-red-300';
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-[#1C0922] border border-purple-900/60 space-y-2.5 shadow-lg">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-purple-900/40 text-amber-300"><ShoppingBag className="w-4 h-4" /></span>
          <div>
            <h4 className="font-extrabold text-sm text-white">#{siparis.siparis_kodu || siparis.siparis_no} • {siparis.musteri_adi}</h4>
            <div className="flex items-center gap-2 text-[11px] text-purple-300">
              <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-purple-400" />{siparis.musteri_telefon}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-amber-400" />{siparis.tahmini_hazirlanma_dakika || 15} dk</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border uppercase ${durumStil()}`}>
            {siparis.durum.replace('_', ' ')}
          </span>
          <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center gap-0.5">
            <KeyRound className="w-2.5 h-2.5" /> PIN: {siparis.pin_kodu || '0000'}
          </span>
        </div>
      </div>

      <div className="bg-[#120415] rounded-xl p-2.5 space-y-1 text-xs">
        {siparis.urunler?.map((u, i) => (
          <div key={i} className="flex justify-between text-gray-300 text-[11px]">
            <span>{u.adet}x {u.ad || u.urun_adi}</span>
            <span className="font-bold text-white">{u.adet * (u.fiyat || u.birim_fiyat || 0)} ₺</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-purple-900/40 text-xs">
        <div className="font-black text-emerald-400 text-sm">{siparis.toplam_tutar} ₺ <span className="text-[10px] font-normal text-purple-300">({siparis.odeme_yontemi})</span></div>
        <div className="flex items-center gap-1">
          {siparis.durum === 'hazirlaniyor' && (
            <button type="button" onClick={() => onDurumGuncelle('teslime_hazir')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500 text-white font-bold cursor-pointer">
              <span>Teslime Hazır</span><ChevronRight className="w-3 h-3" />
            </button>
          )}
          {siparis.durum === 'teslime_hazir' && (
            <button type="button" onClick={() => onDurumGuncelle('teslim_edildi')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500 text-white font-bold cursor-pointer">
              <CheckCircle2 className="w-3 h-3" /><span>Teslim Edildi</span>
            </button>
          )}
          {siparis.durum !== 'teslim_edildi' && siparis.durum !== 'iptal' && (
            <button type="button" onClick={() => onDurumGuncelle('iptal')}
              className="p-1 rounded-lg bg-red-950/40 text-red-400 cursor-pointer" title="İptal Et"><XCircle className="w-4 h-4" /></button>
          )}
        </div>
      </div>
    </div>
  );
};
