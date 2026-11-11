import React from 'react';
import { Tag, ShieldCheck } from 'lucide-react';
import { useAdminKuponu, AdminKuponAyarTipi } from '@/src/MalzemeCekmeceleri/useAdminKuponu';

export const KuponAyarKarti: React.FC = () => {
  const { kupon, kuponGuncelle } = useAdminKuponu();

  const degistir = (alan: keyof AdminKuponAyarTipi, deger: any) => {
    kuponGuncelle({ ...kupon, [alan]: deger });
  };

  return (
    <div className="bg-[#1C0722] border border-purple-900/60 rounded-2xl p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-purple-900/40 pb-2">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
          <Tag className="w-4 h-4" />
          <span>Vitrin Kupon ve Hoş Geldin Kampanyası</span>
        </div>
        <label className="text-xs text-purple-200 flex items-center gap-2 cursor-pointer font-bold">
          <input
            type="checkbox"
            checked={kupon.aktif}
            onChange={(e) => degistir('aktif', e.target.checked)}
            className="w-4 h-4 accent-amber-500 rounded"
          />
          <span className={kupon.aktif ? 'text-emerald-400' : 'text-gray-400'}>
            {kupon.aktif ? 'Kampanya Aktif' : 'Kampanya Kapalı'}
          </span>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div>
          <label className="text-purple-300 font-medium block mb-1">Kupon Başlığı</label>
          <input
            type="text"
            value={kupon.baslik}
            onChange={(e) => degistir('baslik', e.target.value)}
            className="w-full bg-[#120415] border border-purple-900/80 rounded-xl px-3 py-2 text-white"
          />
        </div>

        <div>
          <label className="text-purple-300 font-medium block mb-1">Kupon Kodu</label>
          <input
            type="text"
            value={kupon.kod}
            onChange={(e) => degistir('kod', e.target.value.toUpperCase())}
            className="w-full bg-[#120415] border border-purple-900/80 rounded-xl px-3 py-2 text-white font-mono uppercase font-bold"
          />
        </div>

        <div>
          <label className="text-purple-300 font-medium block mb-1">İndirim Türü</label>
          <select
            value={kupon.indirimTipi || 'yuzde'}
            onChange={(e) => degistir('indirimTipi', e.target.value)}
            className="w-full bg-[#120415] border border-purple-900/80 rounded-xl px-3 py-2 text-amber-300 font-bold"
          >
            <option value="yuzde">Yüzdelik İndirim (%)</option>
            <option value="tutar">Sabit Tutar İndirimi (₺)</option>
          </select>
        </div>

        <div>
          <label className="text-purple-300 font-medium block mb-1">
            {kupon.indirimTipi === 'tutar' ? 'İndirim Tutarı (₺)' : 'İndirim Oranı (%)'}
          </label>
          <input
            type="number"
            value={kupon.indirimOrani}
            onChange={(e) => degistir('indirimOrani', parseFloat(e.target.value) || 0)}
            className="w-full bg-[#120415] border border-purple-900/80 rounded-xl px-3 py-2 text-white font-bold"
          />
        </div>

        <div>
          <label className="text-purple-300 font-medium block mb-1">Min. Sepet Tutarı (₺)</label>
          <input
            type="number"
            value={kupon.minSepetTutari}
            onChange={(e) => degistir('minSepetTutari', parseFloat(e.target.value) || 0)}
            className="w-full bg-[#120415] border border-purple-900/80 rounded-xl px-3 py-2 text-white font-bold"
          />
        </div>

        <div>
          <label className="text-purple-300 font-medium block mb-1">Maksimum İndirim Limiti (₺)</label>
          <input
            type="number"
            value={kupon.maksimumIndirim}
            onChange={(e) => degistir('maksimumIndirim', parseFloat(e.target.value) || 0)}
            placeholder="Sınırsız için 0 bırakın"
            className="w-full bg-[#120415] border border-purple-900/80 rounded-xl px-3 py-2 text-white font-bold"
          />
        </div>
      </div>

      <div className="pt-2 border-t border-purple-900/40 flex items-center justify-between">
        <label className="text-xs text-purple-300 flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={kupon.tekKullanimlikMi}
            onChange={(e) => degistir('tekKullanimlikMi', e.target.checked)}
            className="w-4 h-4 accent-amber-500 rounded"
          />
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Kişi / Telefon Başına 1 Kez Kullanım Limiti (Suistimal Engeli)</span>
          </div>
        </label>
      </div>
    </div>
  );
};
