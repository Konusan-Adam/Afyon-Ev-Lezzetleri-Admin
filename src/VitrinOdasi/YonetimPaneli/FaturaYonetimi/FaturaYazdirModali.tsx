import React from 'react';
import { Printer } from 'lucide-react';
import { FaturaKaydi } from './faturaVeritabani';

interface YazdirProps {
  fatura: FaturaKaydi;
  onKapat: () => void;
}

export const FaturaYazdirModali: React.FC<YazdirProps> = ({ fatura, onKapat }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
    <div className="yazdirilabilir-fatura bg-white text-gray-900 rounded-3xl w-full max-w-lg p-8 space-y-5 shadow-2xl relative text-xs">
      {fatura.durum === 'iptal' && (
        <div className="text-center py-1.5 rounded-lg bg-rose-100 text-rose-700 font-black tracking-widest border border-rose-300">
          BU BELGE İPTAL EDİLMİŞTİR
        </div>
      )}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-lg font-black text-[#180A1F]">AFYON EV LEZZETLERİ A.Ş.</h2>
          <p className="text-[10px] text-gray-500">
            {fatura.vergi_dairesi || 'Afyonkarahisar Tınaztepe V.D.'} • VKN: 0123456789
          </p>
        </div>
        <div className="text-right">
          <span className="px-3 py-1 rounded-lg bg-purple-100 text-purple-900 font-mono font-bold text-sm">{fatura.fatura_no}</span>
          <p className="text-[10px] text-gray-500 mt-1">{fatura.tarih}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
        <div>
          <span className="text-[10px] text-gray-500 block font-bold uppercase">Kesen / Düzenleyen:</span>
          <strong className="text-sm block">{fatura.kesen_unvan}</strong>
          {fatura.kesen_vergi_no && <span className="text-[10px] font-mono text-gray-600">TC/VKN: {fatura.kesen_vergi_no}</span>}
        </div>
        <div>
          <span className="text-[10px] text-gray-500 block font-bold uppercase">Alıcı / Muhatap:</span>
          <strong className="text-sm block">{fatura.alan_unvan}</strong>
          {fatura.alan_vergi_no && <span className="text-[10px] font-mono text-gray-600">TC/VKN: {fatura.alan_vergi_no}</span>}
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-gray-600 font-medium">Açıklama: {fatura.aciklama}</div>
        <div className="flex justify-between py-1.5 border-b"><span>Belge Türü:</span><strong className="uppercase">{fatura.tip.replace('_', ' ')}</strong></div>
        <div className="flex justify-between py-1.5 border-b"><span>Matrah / Net Tutar:</span><strong className="font-mono">{fatura.net_tutar.toLocaleString('tr-TR')} ₺</strong></div>
        <div className="flex justify-between py-1.5 border-b"><span>KDV (%{fatura.kdv_orani}):</span><strong className="font-mono">{fatura.kdv_tutari.toLocaleString('tr-TR')} ₺</strong></div>
        {(fatura.stopaj_tutari || 0) > 0 && (
          <div className="flex justify-between py-1.5 border-b text-rose-700"><span>Stopaj Kesintisi (%{fatura.stopaj_orani}):</span><strong className="font-mono">-{fatura.stopaj_tutari?.toLocaleString('tr-TR')} ₺</strong></div>
        )}
        <div className="flex justify-between py-3 text-base font-black text-[#180A1F] border-t-2">
          <span>Genel Toplam:</span><span className="font-mono">{fatura.tutar.toLocaleString('tr-TR')} ₺</span>
        </div>
      </div>

      <div className="yazdirma-gizle flex items-center justify-end gap-3 pt-3 border-t">
        <button type="button" onClick={() => window.print()} className="px-4 py-2 rounded-xl bg-purple-900 text-white font-bold flex items-center gap-1.5 cursor-pointer hover:bg-purple-800">
          <Printer className="w-4 h-4" /><span>Yazdır / PDF İndir</span>
        </button>
        <button type="button" onClick={onKapat} className="px-5 py-2 rounded-xl bg-gray-200 text-gray-800 font-bold cursor-pointer hover:bg-gray-300">Kapat</button>
      </div>
    </div>
  </div>
);
