import React, { useState } from 'react';
import { ShoppingBag, Plus } from 'lucide-react';
import { SubeSiparisKarti } from './SubeSiparisKarti';
import { SubeHizliSiparisModali } from './SubeHizliSiparisModali';
import { subeSiparisServisi } from '@/src/MalzemeCekmeceleri/Sube/subeSiparisServisi';
import { SubeSiparisTipi } from '@/src/veritabani/VeriTipleri';

interface SiparisListesiProps {
  seciliSubeId: string;
  subeAdi: string;
}

export const SubeSiparisListesi: React.FC<SiparisListesiProps> = ({ seciliSubeId, subeAdi }) => {
  const { siparisler, yukleniyor, durumGuncelle, siparisEkle } = subeSiparisServisi(seciliSubeId);
  const [filtre, setFiltre] = useState<'tumu' | SubeSiparisTipi['durum']>('tumu');
  const [modalAcik, setModalAcik] = useState(false);

  const filtrelenmis = filtre === 'tumu' ? siparisler : siparisler.filter(s => s.durum === filtre);
  const teslimEdilenler = siparisler.filter(s => s.durum === 'teslim_edildi');
  const subeCirosu = teslimEdilenler.reduce((toplam, s) => toplam + s.toplam_tutar, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-900/40">
        <div>
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <span>{subeAdi} — İzole Gel-Al Siparişleri</span>
          </h3>
          <p className="text-xs text-purple-300">
            Günlük Teslimat: <span className="text-white font-bold">{teslimEdilenler.length} Adet</span> • Ciro: <span className="text-emerald-400 font-bold">{subeCirosu} ₺</span>
          </p>
        </div>
        <button type="button" onClick={() => setModalAcik(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-purple-950 font-black text-xs hover:brightness-110 self-start sm:self-auto cursor-pointer">
          <Plus className="w-4 h-4" /><span>Hızlı Tezgâh Siparişi</span>
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold">
        {(['tumu', 'hazirlaniyor', 'teslime_hazir', 'teslim_edildi', 'iptal'] as const).map(d => (
          <button key={d} type="button" onClick={() => setFiltre(d)}
            className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
              filtre === d ? 'bg-amber-400 text-purple-950 border-amber-400 shadow' : 'bg-[#1C0922] text-gray-300 border-purple-900/60 hover:text-white'
            }`}>
            {d === 'tumu' ? 'Tümü' : d.replace('_', ' ')} ({d === 'tumu' ? siparisler.length : siparisler.filter(s => s.durum === d).length})
          </button>
        ))}
      </div>

      {yukleniyor ? (
        <div className="p-8 text-center text-xs text-purple-300">Siparişler yükleniyor...</div>
      ) : filtrelenmis.length === 0 ? (
        <div className="p-8 rounded-2xl bg-[#1C0922] border border-purple-900/60 text-center text-xs text-gray-400">
          Bu filtreye uygun sipariş bulunamadı.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtrelenmis.map(siparis => (
            <SubeSiparisKarti key={siparis.id} siparis={siparis} onDurumGuncelle={yeni => durumGuncelle(siparis.id, yeni)} />
          ))}
        </div>
      )}

      {modalAcik && (
        <SubeHizliSiparisModali acikMi={modalAcik} subeId={seciliSubeId} subeAdi={subeAdi} onKapat={() => setModalAcik(false)} onOlustur={siparisEkle} />
      )}
    </div>
  );
};
