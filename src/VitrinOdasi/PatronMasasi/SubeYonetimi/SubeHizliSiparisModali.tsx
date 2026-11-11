import React, { useState } from 'react';
import { X, ShoppingBag, Plus } from 'lucide-react';
import { SubeSiparisi } from '@/src/veritabani/VeriTipleri';

interface SiparisModaliProps {
  acikMi: boolean;
  subeId: string;
  subeAdi: string;
  onKapat: () => void;
  onOlustur: (veri: Partial<SubeSiparisi> & Pick<SubeSiparisi, 'sube_id' | 'sube_adi' | 'musteri_adi' | 'musteri_telefon' | 'toplam_tutar'>) => Promise<void>;
}

export const SubeHizliSiparisModali: React.FC<SiparisModaliProps> = ({ subeId, subeAdi, onKapat, onOlustur }) => {
  const [musteriAdi, setMusteriAdi] = useState('Ahmet Yılmaz');
  const [musteriTelefon, setMusteriTelefon] = useState('0544 222 33 44');
  const [urunAdi, setUrunAdi] = useState('Taze Çıtır Afyon Mercimekli Bükmesi');
  const [adet, setAdet] = useState(2);
  const [fiyat, setFiyat] = useState(45);
  const [odemeYontemi, setOdemeYontemi] = useState('kapida_nakit');
  const [notlar, setNotlar] = useState('Sıcak paketlensin lütfen');

  const gonder = async (e: React.FormEvent) => {
    e.preventDefault();
    const pin = String(Math.floor(1000 + Math.random() * 9000));
    await onOlustur({
      sube_id: subeId,
      sube_adi: subeAdi,
      musteri_adi: musteriAdi,
      musteri_telefon: musteriTelefon,
      urunler: [{ urun_id: `urun-${Date.now()}`, ad: urunAdi, urun_adi: urunAdi, adet, fiyat, birim_fiyat: fiyat }],
      toplam_tutar: adet * fiyat,
      durum: 'hazirlaniyor',
      odeme_yontemi: odemeYontemi,
      pin_kodu: pin,
      tahmini_hazirlanma_dakika: 15,
      notlar
    });
    onKapat();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#1C0722] border border-amber-500/50 rounded-2xl p-5 shadow-2xl space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-purple-900/60">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span>{subeAdi} — Hızlı Gel-Al Siparişi</span>
          </h3>
          <button type="button" onClick={onKapat} className="text-purple-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={gonder} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-gray-300 font-bold block mb-1">Müşteri Adı *</label>
              <input type="text" required value={musteriAdi} onChange={e => setMusteriAdi(e.target.value)}
                className="w-full bg-[#120415] border border-purple-900/80 rounded-xl px-2.5 py-1.5 text-white" />
            </div>
            <div>
              <label className="text-gray-300 font-bold block mb-1">Telefon (SIFIR E-Posta) *</label>
              <input type="text" required value={musteriTelefon} onChange={e => setMusteriTelefon(e.target.value)}
                className="w-full bg-[#120415] border border-purple-900/80 rounded-xl px-2.5 py-1.5 text-white" />
            </div>
          </div>
          <div>
            <label className="text-gray-300 font-bold block mb-1">Tezgâh Ürünü</label>
            <input type="text" required value={urunAdi} onChange={e => setUrunAdi(e.target.value)}
              className="w-full bg-[#120415] border border-purple-900/80 rounded-xl px-2.5 py-1.5 text-white" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-gray-300 font-bold block mb-1">Adet</label>
              <input type="number" min={1} value={adet} onChange={e => setAdet(Number(e.target.value))}
                className="w-full bg-[#120415] border border-purple-900/80 rounded-xl px-2 py-1.5 text-white" />
            </div>
            <div>
              <label className="text-gray-300 font-bold block mb-1">Fiyat (TL)</label>
              <input type="number" value={fiyat} onChange={e => setFiyat(Number(e.target.value))}
                className="w-full bg-[#120415] border border-purple-900/80 rounded-xl px-2 py-1.5 text-white" />
            </div>
            <div>
              <label className="text-gray-300 font-bold block mb-1">Ödeme</label>
              <select value={odemeYontemi} onChange={e => setOdemeYontemi(e.target.value)}
                className="w-full bg-[#120415] border border-purple-900/80 rounded-xl px-1.5 py-1.5 text-white">
                <option value="kapida_nakit">Nakit</option>
                <option value="kredi_karti">Kredi Kartı</option>
                <option value="online">Online</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-purple-900/50">
            <span className="font-bold text-amber-300">Tutar: {adet * fiyat} ₺</span>
            <button type="submit" className="flex items-center gap-1 px-4 py-2 rounded-xl bg-amber-400 text-purple-950 font-black">
              <Plus className="w-4 h-4" /><span>Siparişi Kaydet & Zil Çal</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
