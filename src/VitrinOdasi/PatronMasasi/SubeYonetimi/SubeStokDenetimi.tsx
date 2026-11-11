import React, { useState } from 'react';
import { Layers, Plus } from 'lucide-react';
import { SubeStokKarti } from './SubeStokKarti';
import { SubeStokEkleModali } from './SubeStokEkleModali';
import { subeStokServisi } from '@/src/MalzemeCekmeceleri/Sube/subeStokServisi';

interface StokDenetimProps {
  seciliSubeId: string;
  subeAdi: string;
}

export const SubeStokDenetimi: React.FC<StokDenetimProps> = ({ seciliSubeId, subeAdi }) => {
  const { stoklar, yukleniyor, stokGuncelle, stokEkle, stokSil } = subeStokServisi(seciliSubeId);
  const [modalAcik, setModalAcik] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-900/40">
        <div>
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <span>{subeAdi} — Tezgâh Stok Denetimi</span>
          </h3>
          <p className="text-xs text-purple-300">
            Hazır vitrin ve tezgâh ürünleri (Bükme, Ağzıaçık vb.). Stok sıfırlandığında Patron zili çalar.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalAcik(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 text-purple-950 font-black text-xs hover:brightness-110 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Tezgâh Ürünü</span>
        </button>
      </div>

      {yukleniyor ? (
        <div className="p-8 text-center text-xs text-purple-300">Stoklar yükleniyor...</div>
      ) : stoklar.length === 0 ? (
        <div className="p-8 rounded-2xl bg-[#1C0922] border border-purple-900/60 text-center text-xs text-gray-400">
          Bu şubeye henüz tezgâh ürünü tanımlanmadı.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {stoklar.map(stok => (
            <SubeStokKarti
              key={stok.id}
              stok={stok}
              onAdetDegistir={adet => stokGuncelle(stok.id, { stok_adedi: adet })}
              onFiyatDegistir={fiyat => stokGuncelle(stok.id, { fiyat })}
              onSil={() => stokSil(stok.id)}
            />
          ))}
        </div>
      )}

      {modalAcik && (
        <SubeStokEkleModali
          acikMi={modalAcik}
          subeId={seciliSubeId}
          onKapat={() => setModalAcik(false)}
          onEkle={stokEkle}
        />
      )}
    </div>
  );
};
