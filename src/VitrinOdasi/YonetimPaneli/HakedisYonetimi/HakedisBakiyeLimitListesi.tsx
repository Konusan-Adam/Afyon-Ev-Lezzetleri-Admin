import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, ChefHat, Bike } from 'lucide-react';
import { CuzdanLimitSatiri } from '@/src/MalzemeCekmeceleri/Finans/useTumCuzdanDurumlari';

interface ListeProps {
  satirlar: CuzdanLimitSatiri[];
  arama: string;
}

export const HakedisBakiyeLimitListesi: React.FC<ListeProps> = ({ satirlar, arama }) => {
  const [durumSecim, setDurumSecim] = useState<'hepsi' | 'ulasan' | 'sinir_alti'>('hepsi');
  const [rolSecim, setRolSecim] = useState<'hepsi' | 'mutfak' | 'kurye'>('hepsi');

  const suzulmus = satirlar.filter((s) => {
    const aramaUyumu = !arama.trim() || `${s.ad} ${s.iban} ${s.tcknVkn}`.toLowerCase().includes(arama.toLowerCase());
    const durumUyumu = durumSecim === 'hepsi' || (durumSecim === 'ulasan' ? s.siniraUlastiMi : !s.siniraUlastiMi);
    const rolUyumu = rolSecim === 'hepsi' || s.rol === rolSecim;
    return aramaUyumu && durumUyumu && rolUyumu;
  });

  const yesilSayi = satirlar.filter(s => s.siniraUlastiMi).length;
  const kirmiziSayi = satirlar.length - yesilSayi;

  return (
    <div className="space-y-4 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#180A1F] border border-[#3E1646]">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'hepsi', ad: `Tümü (${satirlar.length})`, sinif: 'bg-amber-500 text-purple-950' },
            { id: 'ulasan', ad: `Sınıra Ulaşanlar (${yesilSayi})`, sinif: 'bg-emerald-500 text-purple-950' },
            { id: 'sinir_alti', ad: `Sınır Altında (${kirmiziSayi})`, sinif: 'bg-rose-500 text-white' }
          ].map(b => (
            <button key={b.id} type="button" onClick={() => setDurumSecim(b.id as any)}
              className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer ${durumSecim === b.id ? b.sinif : 'bg-[#120614] text-gray-400 border border-purple-900/60'}`}>
              {b.ad}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          {(['hepsi', 'mutfak', 'kurye'] as const).map(r => (
            <button key={r} type="button" onClick={() => setRolSecim(r)}
              className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer ${rolSecim === r ? 'bg-purple-700 text-white' : 'bg-[#120614] text-gray-400 border border-purple-900/60'}`}>
              {r === 'hepsi' ? 'Tüm Roller' : r === 'mutfak' ? 'Mutfaklar' : 'Kuryeler'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2.5">
        {suzulmus.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#180A1F] border border-[#3E1646] text-center text-gray-400">
            Kritere uygun mutfak veya kurye kaydı bulunamadı.
          </div>
        ) : suzulmus.map((s) => (
          <div key={`${s.rol}-${s.id}`}
            className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
              s.siniraUlastiMi
                ? 'bg-emerald-950/20 border-emerald-500/50'
                : 'bg-rose-950/20 border-rose-500/50'
            }`}>
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className={`p-2.5 rounded-xl shrink-0 ${s.siniraUlastiMi ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                {s.rol === 'mutfak' ? <ChefHat className="w-5 h-5" /> : <Bike className="w-5 h-5" />}
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-white text-sm truncate">{s.ad}</span>
                  <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-200 border border-purple-800 text-[10px] font-bold uppercase">
                    {s.rol === 'mutfak' ? 'Mutfak' : 'Kurye'}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 ${
                    s.siniraUlastiMi ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/25 text-rose-300 border border-rose-500/40'
                  }`}>
                    {s.siniraUlastiMi ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                    <span>{s.siniraUlastiMi ? 'Sınıra Ulaştı (Çekime Hazır)' : `Sınır Altı (${s.kalanTutar.toLocaleString('tr-TR')} ₺ kaldı)`}</span>
                  </span>
                </div>
                <div className="w-full max-w-md h-2 rounded-full bg-[#120614] overflow-hidden border border-white/5">
                  <div className={`h-full transition-all ${s.siniraUlastiMi ? 'bg-emerald-500' : 'bg-rose-500'}`}
                    style={{ width: `${s.dolulukYuzdesi}%` }} />
                </div>
                <div className="text-[11px] text-gray-400 flex flex-wrap gap-3">
                  <span>Toplam Kazanç: <strong className="text-gray-200">{s.toplamHakEdilen.toLocaleString('tr-TR')} ₺</strong></span>
                  <span>Ödenen: <strong className="text-emerald-300">{s.odenenToplam.toLocaleString('tr-TR')} ₺</strong></span>
                  {s.bekleyenToplam > 0 && <span>Bekleyen Talep: <strong className="text-amber-300">{s.bekleyenToplam.toLocaleString('tr-TR')} ₺</strong></span>}
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className={`text-xl font-black ${s.siniraUlastiMi ? 'text-emerald-400' : 'text-rose-400'}`}>
                {s.cekilebilirBakiye.toLocaleString('tr-TR')} ₺
              </div>
              <div className="text-[10px] text-gray-400">
                Alt Sınır: <strong className="text-white">{s.altLimit.toLocaleString('tr-TR')} ₺</strong> • %{s.dolulukYuzdesi}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
