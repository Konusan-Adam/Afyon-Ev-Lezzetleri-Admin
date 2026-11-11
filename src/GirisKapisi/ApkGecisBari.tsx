import React, { useState } from 'react';
import { ChefHat, Bike, ShoppingBag, ShieldCheck, ChevronUp, ChevronDown } from 'lucide-react';
import { kullaniciHafizasiKullan, PanelTipi } from '@/src/OrtakHavuz/KullaniciHafizasi';

export const ApkGecisBari: React.FC = () => {
  const { goruntulenenPanel, panelDegistir } = kullaniciHafizasiKullan();
  const [acik, setAcik] = useState(false);

  const portallar: Array<{ id: PanelTipi; etiket: string; ikon: React.ElementType; renk: string }> = [
    { id: 'vitrin', etiket: 'Müşteri', ikon: ShoppingBag, renk: 'bg-emerald-600 text-white' },
    { id: 'mutfak', etiket: 'Mutfak', ikon: ChefHat, renk: 'bg-amber-600 text-white' },
    { id: 'kurye', etiket: 'Kurye', ikon: Bike, renk: 'bg-blue-600 text-white' },
    { id: 'patron', etiket: 'Admin', ikon: ShieldCheck, renk: 'bg-purple-600 text-white' },
  ];

  return (
    <div className="fixed bottom-3 right-3 z-50 select-none">
      <div className="bg-white/95 backdrop-blur-md shadow-2xl border border-gray-200 rounded-2xl p-1.5 flex flex-col items-end transition-all">
        {acik && (
          <div className="flex items-center gap-1.5 mb-1.5 p-1 bg-gray-50 rounded-xl border border-gray-100">
            {portallar.map((p) => {
              const Ikon = p.ikon;
              const aktif = goruntulenenPanel === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => panelDegistir(p.id)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    aktif ? p.renk + ' shadow-sm' : 'text-gray-600 hover:bg-gray-200/60'
                  }`}
                  title={`${p.etiket} Terminali`}
                >
                  <Ikon className="w-3.5 h-3.5" />
                  <span>{p.etiket}</span>
                </button>
              );
            })}
          </div>
        )}

        <button
          onClick={() => setAcik(!acik)}
          className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <span>4 APK Seçici</span>
          {acik ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
        </button>
      </div>
    </div>
  );
};
