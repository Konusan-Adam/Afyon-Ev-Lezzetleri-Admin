import React, { useState, useEffect } from 'react';
import { Sliders, Save, CheckCircle2 } from 'lucide-react';
import { HakedisLimitAyarlari } from '@/src/MalzemeCekmeceleri/Finans/hakedisLimitServisi';

interface AyarKutusuProps {
  limitler: HakedisLimitAyarlari;
  onKaydet: (mutfakLimit: number, kuryeLimit: number) => Promise<boolean>;
}

export const HakedisLimitAyarKutusu: React.FC<AyarKutusuProps> = ({ limitler, onKaydet }) => {
  const [mutfakLimit, setMutfakLimit] = useState(String(limitler.mutfakAltLimit));
  const [kuryeLimit, setKuryeLimit] = useState(String(limitler.kuryeAltLimit));
  const [kaydedildi, setKaydedildi] = useState(false);

  useEffect(() => {
    setMutfakLimit(String(limitler.mutfakAltLimit));
    setKuryeLimit(String(limitler.kuryeAltLimit));
  }, [limitler.mutfakAltLimit, limitler.kuryeAltLimit]);

  const gonder = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await onKaydet(Number(mutfakLimit), Number(kuryeLimit));
    if (ok) {
      setKaydedildi(true);
      setTimeout(() => setKaydedildi(false), 3000);
    }
  };

  return (
    <form onSubmit={gonder} className="p-4 rounded-2xl bg-[#180A1F] border border-purple-800/60 flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs">
      <div className="flex items-center gap-2.5">
        <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400">
          <Sliders className="w-4 h-4" />
        </div>
        <div>
          <h4 className="font-bold text-white text-sm">Para Çekme Alt Sınır Ayarları</h4>
          <p className="text-[11px] text-gray-400">Mutfak ve kurye cüzdanlarında geçerli çekim alt limitlerini canlı belirleyin.</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 bg-[#120614] border border-purple-900 rounded-xl px-3 py-1.5">
          <span className="text-gray-400 font-semibold">Mutfak Limiti (₺):</span>
          <input type="number" min="0" step="50" value={mutfakLimit} onChange={e => setMutfakLimit(e.target.value)}
            className="w-20 bg-transparent text-amber-400 font-black outline-none text-right" />
        </label>
        <label className="flex items-center gap-2 bg-[#120614] border border-purple-900 rounded-xl px-3 py-1.5">
          <span className="text-gray-400 font-semibold">Kurye Limiti (₺):</span>
          <input type="number" min="0" step="50" value={kuryeLimit} onChange={e => setKuryeLimit(e.target.value)}
            className="w-20 bg-transparent text-emerald-400 font-black outline-none text-right" />
        </label>
        <button type="submit"
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-purple-950 font-black flex items-center gap-1.5 cursor-pointer">
          {kaydedildi ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{kaydedildi ? 'Kaydedildi' : 'Limitleri Kaydet'}</span>
        </button>
      </div>
    </form>
  );
};
