import React, { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import { useMusteriSiparisleri } from '@/src/MalzemeCekmeceleri/useMusteriSiparisleri';
import { useKomisyonYonetimi } from '@/src/MalzemeCekmeceleri/useKomisyonYonetimi';

export const YonetimRaporlar: React.FC = () => {
  const { siparisler } = useMusteriSiparisleri();
  const { komisyonHesapla } = useKomisyonYonetimi();

  const rapor = useMemo(() => {
    let toplamCiro = 0;
    let toplamKomisyon = 0;
    let toplamHakedis = 0;

    siparisler.forEach(siparis => {
      // Sadece teslim edilmiş siparişleri baz al
      if (siparis.durum === 'teslim_edildi') {
        const { komisyonTutari, netHakedis } = komisyonHesapla(siparis.mutfak_id || '', siparis.toplam_tutar);
        toplamCiro += siparis.toplam_tutar;
        toplamKomisyon += komisyonTutari;
        toplamHakedis += netHakedis;
      }
    });

    return { toplamCiro, toplamKomisyon, toplamHakedis };
  }, [siparisler, komisyonHesapla]);

  return (
    <div className="space-y-6">
      <div className="bg-[#1C0722] p-4 rounded-xl border border-purple-900/60">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-amber-400" />
          Finansal Özet (Teslim Edilen Siparişler)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#120415] p-4 rounded-xl border border-purple-900/40">
            <p className="text-purple-300 text-xs">Toplam Brüt Ciro</p>
            <h3 className="text-2xl font-bold text-white">{rapor.toplamCiro.toFixed(2)} ₺</h3>
          </div>
          <div className="bg-[#120415] p-4 rounded-xl border border-purple-900/40">
            <p className="text-purple-300 text-xs">Toplam Komisyon Kesintisi</p>
            <h3 className="text-2xl font-bold text-rose-400">-{rapor.toplamKomisyon.toFixed(2)} ₺</h3>
          </div>
          <div className="bg-[#120415] p-4 rounded-xl border border-purple-900/40">
            <p className="text-purple-300 text-xs">Toplam Net Hakediş</p>
            <h3 className="text-2xl font-bold text-emerald-400">{rapor.toplamHakedis.toFixed(2)} ₺</h3>
          </div>
        </div>
      </div>
    </div>
  );
};
