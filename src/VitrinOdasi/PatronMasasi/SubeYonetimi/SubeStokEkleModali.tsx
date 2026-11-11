import React, { useState } from 'react';
import { X, Plus, PackagePlus } from 'lucide-react';
import { SubeUrunu } from '@/src/veritabani/VeriTipleri';

interface EkleModaliProps {
  acikMi: boolean;
  subeId: string;
  onKapat: () => void;
  onEkle: (veri: Omit<SubeUrunu, 'id'>) => Promise<void>;
}

export const SubeStokEkleModali: React.FC<EkleModaliProps> = ({ subeId, onKapat, onEkle }) => {
  const [ad, setAd] = useState('');
  const [aciklama, setAciklama] = useState('');
  const [kategori, setKategori] = useState('Bükmeler & Hamur İşi');
  const [fiyat, setFiyat] = useState(45);
  const [stokAdedi, setStokAdedi] = useState(24);
  const [hazirMi, setHazirMi] = useState(true);
  const [gunlukTazeMi, setGunlukTazeMi] = useState(true);
  const [kaydediliyor, setKaydediliyor] = useState(false);

  const kaydet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ad.trim()) return;
    setKaydediliyor(true);
    await onEkle({
      sube_id: subeId,
      ad,
      urun_adi: ad,
      aciklama,
      kategori,
      fiyat,
      stok_adedi: stokAdedi,
      marka: 'Afyon Ev Lezzetleri',
      hazir_mi: hazirMi,
      gunluk_taze_mi: gunlukTazeMi,
      kritik_esik: 5,
      birim: 'Adet'
    });
    setKaydediliyor(false);
    onKapat();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#1C0722] border border-amber-500/50 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-purple-900/60">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <PackagePlus className="w-4 h-4 text-amber-400" />
            <span>Yeni Tezgâh Ürünü Ekle</span>
          </h3>
          <button type="button" onClick={onKapat} className="text-purple-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={kaydet} className="space-y-3 text-xs">
          <div>
            <label className="text-gray-300 font-bold block mb-1">Ürün Adı *</label>
            <input type="text" required value={ad} onChange={e => setAd(e.target.value)} placeholder="Taze Çıtır Afyon Mercimekli Bükmesi"
              className="w-full bg-[#120415] border border-purple-900/80 rounded-xl px-3 py-2 text-white" />
          </div>
          <div>
            <label className="text-gray-300 font-bold block mb-1">Açıklama</label>
            <input type="text" value={aciklama} onChange={e => setAciklama(e.target.value)} placeholder="Közde haşhaşlı, çıtır el açması sıcak günlük bükme."
              className="w-full bg-[#120415] border border-purple-900/80 rounded-xl px-3 py-2 text-white" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-300 font-bold block mb-1">Kategori</label>
              <select value={kategori} onChange={e => setKategori(e.target.value)}
                className="w-full bg-[#120415] border border-purple-900/80 rounded-xl px-3 py-2 text-white">
                <option value="Bükmeler & Hamur İşi">Bükmeler & Hamur İşi</option>
                <option value="Ev Yemekleri">Ev Yemekleri</option>
                <option value="Tatlılar">Tatlılar</option>
              </select>
            </div>
            <div>
              <label className="text-gray-300 font-bold block mb-1">Fiyat (TL)</label>
              <input type="number" value={fiyat} onChange={e => setFiyat(Number(e.target.value))}
                className="w-full bg-[#120415] border border-purple-900/80 rounded-xl px-3 py-2 text-white" />
            </div>
            <div>
              <label className="text-gray-300 font-bold block mb-1">Tezgâh Stoğu</label>
              <input type="number" value={stokAdedi} onChange={e => setStokAdedi(Number(e.target.value))}
                className="w-full bg-[#120415] border border-purple-900/80 rounded-xl px-3 py-2 text-white" />
            </div>
            <div className="flex flex-col justify-center gap-1 pt-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={hazirMi} onChange={e => setHazirMi(e.target.checked)} className="rounded" />
                <span className="text-gray-200 font-semibold">Tezgâhta Hazır</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={gunlukTazeMi} onChange={e => setGunlukTazeMi(e.target.checked)} className="rounded" />
                <span className="text-gray-200 font-semibold">Günlük Taze</span>
              </label>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-purple-900/50">
            <button type="button" onClick={onKapat} className="px-4 py-2 rounded-xl bg-purple-900/40 text-gray-300 font-bold">İptal</button>
            <button type="submit" disabled={kaydediliyor} className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-400 text-purple-950 font-black hover:brightness-110 disabled:opacity-50">
              <Plus className="w-4 h-4" /><span>{kaydediliyor ? 'Ekleniyor...' : 'Stoğa Ekle'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
