import React, { useState } from 'react';
import { Percent, Plus, Trash2, Edit3, X, Check } from 'lucide-react';
import { useKomisyonYonetimi } from '@/src/MalzemeCekmeceleri/useKomisyonYonetimi';
import { KomisyonAyarTipi } from '@/src/veritabani/VeriTipleri';
import { belgeKaydet, belgeSil } from '@/src/veritabani/FirebaseKoleksiyonServisi';
import { hukukiDelilDamgalaVeKaydet } from '@/src/MalzemeCekmeceleri/HukukVeSozlesmeler/hukukiDelilServisi';

export const YonetimKomisyonlar: React.FC = () => {
  const { ayarlar } = useKomisyonYonetimi();
  const [duzenlenenAyar, setDuzenlenenAyar] = useState<Partial<KomisyonAyarTipi> | null>(null);

  const kaydet = async () => {
    if (!duzenlenenAyar) return;
    const ayarId = duzenlenenAyar.id || 'kom_' + Date.now();
    await belgeKaydet('komisyon_ayarlari', ayarId, {
      ...duzenlenenAyar,
      id: ayarId,
      guncellenme_tarihi: new Date().toISOString()
    });
    void hukukiDelilDamgalaVeKaydet({
      islemTuru: 'ozel_onay',
      sozlesmeTuru: 'finansal_ayar_degisikligi',
      sozlesmeVersiyonu: '1.0.0',
      ilgiliKayitId: ayarId,
      onaylandiMi: true,
      ekDetay: {
        ayarGrubu: 'komisyon_ayarlari',
        aksiyon: duzenlenenAyar.id ? 'guncelleme' : 'ekleme',
        tip: duzenlenenAyar.tip || 'genel',
        oran: duzenlenenAyar.oran ?? 0,
        platformSabitUcret: duzenlenenAyar.platformSabitUcret ?? 0,
        hedefId: duzenlenenAyar.hedefId || null,
      },
    });
    setDuzenlenenAyar(null);
  };

  const sil = async (id: string) => {
    if (confirm('Bu komisyon kuralını silmek istediğinize emin misiniz?')) {
      await belgeSil('komisyon_ayarlari', id);
      void hukukiDelilDamgalaVeKaydet({
        islemTuru: 'ozel_onay',
        sozlesmeTuru: 'finansal_ayar_degisikligi',
        sozlesmeVersiyonu: '1.0.0',
        ilgiliKayitId: id,
        onaylandiMi: true,
        ekDetay: {
          ayarGrubu: 'komisyon_ayarlari',
          aksiyon: 'silme',
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#1C0722] border border-purple-900/60 rounded-2xl p-4 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Percent className="w-5 h-5 text-amber-400" />
            Komisyon ve Hizmet Bedeli Yönetimi
          </h3>
          <button 
            onClick={() => setDuzenlenenAyar({ tip: 'genel', oran: 15, platformSabitUcret: 0, aktif_mi: true })}
            className="bg-amber-500 hover:bg-amber-600 text-[#1C0722] px-3 py-1 rounded-lg font-bold flex items-center gap-1 text-sm"
          >
            <Plus className="w-4 h-4" /> Yeni Kural
          </button>
        </div>
        
        {duzenlenenAyar && (
          <div className="bg-[#2D0A35] p-4 rounded-xl mb-4 border border-purple-800 space-y-3">
            <input 
              type="number" 
              placeholder="Oran (%)" 
              value={duzenlenenAyar.oran || ''}
              onChange={(e) => setDuzenlenenAyar({...duzenlenenAyar, oran: parseFloat(e.target.value)})}
              className="w-full bg-[#120415] border border-purple-700 rounded-lg p-2 text-white"
            />
            <input 
              type="number" 
              placeholder="Sabit Ücret (₺)" 
              value={duzenlenenAyar.platformSabitUcret || ''}
              onChange={(e) => setDuzenlenenAyar({...duzenlenenAyar, platformSabitUcret: parseFloat(e.target.value)})}
              className="w-full bg-[#120415] border border-purple-700 rounded-lg p-2 text-white"
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDuzenlenenAyar(null)} className="text-gray-400"><X className="w-5 h-5" /></button>
              <button onClick={kaydet} className="text-amber-400"><Check className="w-5 h-5" /></button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ayarlar.map((ayar) => (
            <div key={ayar.id} className="bg-[#120415] border border-purple-900/40 rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="text-white font-bold text-xs">{ayar.tip === 'genel' ? 'Genel Platform Komisyonu' : `Mutfak Özel (${ayar.hedefId})`}</p>
                <p className="text-purple-300 text-[11px]">Oran: %{ayar.oran} | Hizmet Bedeli: {ayar.platformSabitUcret || 0} ₺</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setDuzenlenenAyar(ayar)} className="text-gray-400 hover:text-amber-400 cursor-pointer"><Edit3 className="w-4 h-4" /></button>
                <button onClick={() => sil(ayar.id)} className="text-gray-400 hover:text-rose-400 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
