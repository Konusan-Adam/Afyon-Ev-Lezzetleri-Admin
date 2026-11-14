import React, { useState } from 'react';
import { Printer, Edit3, Ban, Trash2 } from 'lucide-react';
import { FaturaKaydi } from './faturaVeritabani';

interface SatirProps {
  fatura: FaturaKaydi;
  onGoruntule: (f: FaturaKaydi) => void;
  onDuzenle: (f: FaturaKaydi) => void;
  onIptalEt: (id: string) => void;
  onSil: (id: string) => void;
}

export const FaturaSatirKarti: React.FC<SatirProps> = ({
  fatura, onGoruntule, onDuzenle, onIptalEt, onSil
}) => {
  const [silmeOnay, setSilmeOnay] = useState(false);
  const [iptalOnay, setIptalOnay] = useState(false);
  const iptalMi = fatura.durum === 'iptal';

  return (
    <div className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs ${
      iptalMi ? 'bg-[#140718] border-rose-900/50 opacity-75' : 'bg-[#180A1F] border-[#3E1646] hover:border-purple-700'
    }`}>
      <div className="space-y-1.5 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`font-mono font-bold text-sm px-2 py-0.5 rounded border ${
            iptalMi ? 'text-rose-400 bg-rose-500/10 border-rose-500/20 line-through' : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
          }`}>
            {fatura.fatura_no}
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-950 text-purple-200 border border-purple-800">
            {fatura.tip.replace('_', ' ')}
          </span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            iptalMi ? 'bg-rose-950 text-rose-300' : fatura.durum === 'beklemede' ? 'bg-amber-950 text-amber-300' : 'bg-emerald-950 text-emerald-300'
          }`}>
            {iptalMi ? 'İPTAL' : fatura.durum === 'beklemede' ? 'BEKLEMEDE' : 'ONAYLI'}
          </span>
          {fatura.toplu_parti_no && (
            <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 font-mono text-[10px]">Parti: {fatura.toplu_parti_no}</span>
          )}
          <span className="text-gray-400 text-[11px]">• {fatura.tarih}</span>
        </div>

        <div className="text-white font-bold flex flex-wrap items-center gap-2">
          <span>{fatura.kesen_unvan} {fatura.kesen_vergi_no ? `(${fatura.kesen_vergi_no})` : ''}</span>
          <span className="text-gray-500">→</span>
          <span>{fatura.alan_unvan} {fatura.alan_vergi_no ? `(${fatura.alan_vergi_no})` : ''}</span>
        </div>
        <p className="text-gray-300 text-[11px]">{fatura.aciklama}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 shrink-0">
        <div className="text-right mr-1">
          <div className={`text-base font-black ${iptalMi ? 'text-rose-400 line-through' : 'text-white'}`}>
            {fatura.tutar.toLocaleString('tr-TR')} ₺
          </div>
          <div className="text-[10px] text-gray-400">
            KDV: {fatura.kdv_tutari.toLocaleString('tr-TR')} ₺ (%{fatura.kdv_orani})
            {(fatura.stopaj_tutari || 0) > 0 && ` • Stopaj: ${fatura.stopaj_tutari} ₺`}
          </div>
        </div>

        <button type="button" onClick={() => onGoruntule(fatura)} title="Görüntüle / Yazdır"
          className="px-2.5 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-800 border border-purple-700 text-purple-200 font-bold flex items-center gap-1 cursor-pointer">
          <Printer className="w-3.5 h-3.5 text-amber-400" /><span>Yazdır</span>
        </button>
        <button type="button" onClick={() => onDuzenle(fatura)} title="Düzenle"
          className="p-2 rounded-xl bg-blue-950/60 hover:bg-blue-900 border border-blue-800 text-blue-300 cursor-pointer">
          <Edit3 className="w-3.5 h-3.5" />
        </button>
        {!iptalMi && (
          iptalOnay ? (
            <button type="button" onClick={() => { onIptalEt(fatura.id); setIptalOnay(false); }}
              className="px-2.5 py-2 rounded-xl bg-amber-600 text-black font-black cursor-pointer">İptali Onayla</button>
          ) : (
            <button type="button" onClick={() => setIptalOnay(true)} title="Faturayı İptal Et"
              className="p-2 rounded-xl bg-amber-950/60 hover:bg-amber-900 border border-amber-800 text-amber-300 cursor-pointer">
              <Ban className="w-3.5 h-3.5" />
            </button>
          )
        )}
        {silmeOnay ? (
          <button type="button" onClick={() => { onSil(fatura.id); setSilmeOnay(false); }}
            className="px-2.5 py-2 rounded-xl bg-rose-600 text-white font-black cursor-pointer">Eminim, Sil</button>
        ) : (
          <button type="button" onClick={() => setSilmeOnay(true)} title="Belgeyi Sil"
            className="p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 cursor-pointer">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
