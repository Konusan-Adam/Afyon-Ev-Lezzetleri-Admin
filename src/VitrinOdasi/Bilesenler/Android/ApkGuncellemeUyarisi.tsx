import React from 'react';
import { DownloadCloud, X } from 'lucide-react';
import { useApkGuncelleme } from '@/src/MalzemeCekmeceleri/Android/useApkGuncelleme';

export const ApkGuncellemeUyarisi: React.FC = () => {
  const { guncellemeVarMi, guncelSurumAdi, kuruluSurum, indirVeKur } = useApkGuncelleme();
  const [gizlendi, setGizlendi] = React.useState(false);

  if (!guncellemeVarMi || gizlendi) return null;

  return (
    <div className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-purple-900/40 border border-amber-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="text-xs font-extrabold text-amber-300">
          Yeni Afyon Patron Android Sürümü Hazır (v{guncelSurumAdi})
        </div>
        <p className="text-[11px] text-purple-200 mt-0.5">
          Mevcut sürüm: v{kuruluSurum?.surumAdi || '1.0.0'} — Hızlı güncelleme için indirip kurabilirsiniz.
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={indirVeKur}
          className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-extrabold text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
        >
          <DownloadCloud className="w-4 h-4" />
          <span>İndir ve Kur</span>
        </button>
        <button
          type="button"
          onClick={() => setGizlendi(true)}
          aria-label="Uyarıyı kapat"
          className="min-w-[36px] min-h-[36px] rounded-xl bg-purple-950/70 text-gray-300 hover:text-white flex items-center justify-center cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
