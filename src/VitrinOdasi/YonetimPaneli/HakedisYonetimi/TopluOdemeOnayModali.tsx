import React, { useState } from 'react';
import { Send, X, CheckCircle2 } from 'lucide-react';

interface TopluOnayProps {
  acikMi: boolean;
  partiNo: string;
  seciliSayisi: number;
  seciliTutar: number;
  onKapat: () => void;
  onOnayla: (dekontNotu: string, pusulaKes: boolean) => Promise<void>;
}

export const TopluOdemeOnayModali: React.FC<TopluOnayProps> = ({
  acikMi, partiNo, seciliSayisi, seciliTutar, onKapat, onOnayla
}) => {
  const [dekontNotu, setDekontNotu] = useState(`Toplu Banka EFT/FAST (${partiNo})`);
  const [pusulaKes, setPusulaKes] = useState(true);
  const [isleniyor, setIsleniyor] = useState(false);

  if (!acikMi) return null;

  const gonder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsleniyor(true);
    await onOnayla(dekontNotu, pusulaKes);
    setIsleniyor(false);
    onKapat();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="bg-[#180A1F] border border-amber-500/50 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl text-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Send className="w-5 h-5 text-amber-400" />
            <span>Toplu Banka Ödemesini Onayla</span>
          </h3>
          <button type="button" onClick={onKapat} className="text-gray-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-[#120614] p-3.5 rounded-2xl border border-purple-900 space-y-1.5">
          <div>Parti Numarası: <strong className="font-mono text-blue-300">{partiNo}</strong></div>
          <div>Alıcı Sayısı: <strong className="text-white">{seciliSayisi} Kişi / Mutfak</strong></div>
          <div>Toplam Çıkış Tutarı: <strong className="text-emerald-400 text-sm font-black">{seciliTutar.toLocaleString('tr-TR')} ₺</strong></div>
        </div>

        <form onSubmit={gonder} className="space-y-3">
          <div>
            <label className="text-gray-400 block mb-1">Banka Toplu Referans / Dekont Notu</label>
            <input type="text" value={dekontNotu} onChange={e => setDekontNotu(e.target.value)}
              className="w-full bg-[#120614] border border-purple-900 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400" />
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-gray-200 font-semibold">
            <input type="checkbox" checked={pusulaKes} onChange={e => setPusulaKes(e.target.checked)} className="rounded" />
            <span>Ödenen tüm alıcılar için Fatura Merkezi'ne otomatik Gider Pusulası kes</span>
          </label>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-purple-950">
            <button type="button" onClick={onKapat} className="px-4 py-2 rounded-xl bg-purple-950 text-gray-300 font-bold cursor-pointer">İptal</button>
            <button type="submit" disabled={isleniyor}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-gray-950 font-black cursor-pointer disabled:opacity-50">
              <CheckCircle2 className="w-4 h-4" />
              <span>{isleniyor ? 'İşleniyor...' : 'Toplu Ödendi İşaretle'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
