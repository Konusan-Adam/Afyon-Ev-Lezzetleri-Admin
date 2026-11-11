import React, { useState } from 'react';
import { Store, User, ChefHat, Bike, ShieldCheck, Layers, ChevronRight, X } from 'lucide-react';
import { kullaniciHafizasiKullan, PanelTipi } from '@/src/OrtakHavuz/KullaniciHafizasi';

export const HizliPanelCubugu: React.FC = () => {
  const { goruntulenenPanel, panelDegistir, aktifKullanici } = kullaniciHafizasiKullan();
  const [acik, setAcik] = useState(false);

  const paneller: { id: PanelTipi; baslik: string; kisaAd: string; ikon: any; renk: string }[] = [
    { id: 'vitrin', baslik: 'Ana Vitrin (Müşteri Pazaryeri)', kisaAd: 'Vitrin', ikon: Store, renk: 'text-amber-400' },
    { id: 'musteri', baslik: 'Müşteri Sipariş Takip Paneli', kisaAd: 'Müşteri', ikon: User, renk: 'text-blue-400' },
    { id: 'mutfak', baslik: 'Ev Mutfağı & Aşçı Paneli', kisaAd: 'Mutfak', ikon: ChefHat, renk: 'text-purple-400' },
    { id: 'kurye', baslik: 'Kurye Dağıtım Masası', kisaAd: 'Kurye', ikon: Bike, renk: 'text-emerald-400' },
    { id: 'patron', baslik: 'Patron Yönetim Masası (Admin)', kisaAd: 'Admin', ikon: ShieldCheck, renk: 'text-rose-400' },
  ];

  const aktifPanelBilgisi = paneller.find((p) => p.id === goruntulenenPanel) || paneller[0];
  const AktifIkon = aktifPanelBilgisi.ikon;

  return (
    <aside aria-label="Hızlı Panel Geçişi" className="fixed bottom-4 left-4 z-40 select-none font-sans">
      {!acik ? (
        <button
          type="button"
          onClick={() => setAcik(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#14061A]/95 text-white border border-[#521E5C] shadow-2xl backdrop-blur-md hover:border-amber-400/60 transition-all cursor-pointer group active:scale-95"
          title="Paneller Arası Geçiş"
        >
          <div className="w-7 h-7 rounded-xl bg-[#2D0F34] flex items-center justify-center text-amber-400 border border-purple-800/50 group-hover:scale-105 transition-transform">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div className="text-left text-xs leading-tight pr-1">
            <div className="text-[10px] text-gray-400 font-medium">Panel Değiştir</div>
            <div className="font-extrabold text-amber-300 flex items-center gap-1">
              <AktifIkon className={`w-3 h-3 ${aktifPanelBilgisi.renk}`} />
              <span>{aktifPanelBilgisi.kisaAd}</span>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      ) : (
        <div className="bg-[#14061A]/98 border border-[#521E5C] rounded-2xl p-3 shadow-2xl backdrop-blur-md w-72 text-white animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#3E1646]">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-black tracking-wide text-gray-200">ROL & PANEL SEÇİCİ</span>
            </div>
            <button
              type="button"
              onClick={() => setAcik(false)}
              className="w-6 h-6 rounded-lg bg-[#2A102E] hover:bg-[#3D1843] flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1.5">
            {paneller.map((panel) => {
              const Ikon = panel.ikon;
              const secili = goruntulenenPanel === panel.id;
              return (
                <button
                  key={panel.id}
                  type="button"
                  onClick={() => {
                    panelDegistir(panel.id);
                    setAcik(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    secili
                      ? 'bg-gradient-to-r from-[#6D237A] to-[#45124E] text-white border border-[#9633A7] shadow-md'
                      : 'bg-[#1E0926]/70 hover:bg-[#2B0E33] text-gray-300 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Ikon className={`w-4 h-4 ${panel.renk}`} />
                    <span>{panel.kisaAd}</span>
                  </div>
                  {secili && (
                    <span className="text-[10px] bg-amber-400 text-black px-1.5 py-0.5 rounded-full font-black">
                      Aktif
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-3 pt-2 border-t border-[#3E1646] text-[10px] text-gray-400 flex items-center justify-between">
            <span className="truncate max-w-[170px]">
              {aktifKullanici ? aktifKullanici.ad_soyad : 'Misafir Kullanıcı'}
            </span>
            <span className="text-amber-400/90 font-mono">?panel=</span>
          </div>
        </div>
      )}
    </aside>
  );
};
