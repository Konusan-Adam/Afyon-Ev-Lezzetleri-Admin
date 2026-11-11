import React, { useState } from 'react';
import { FooterAyar, FooterAvantaj } from '../../MasaustuAltBilgi/footerVeritabani';
import { ShieldCheck, Plus, Trash2 } from 'lucide-react';

interface Props {
  ayar: FooterAyar;
  guncelle: (yeniAyar: FooterAyar) => void;
}

const IKON_SECENEKLERI = [
  { id: 'ChefHat', etiket: 'Aşçı Şapkası' },
  { id: 'Heart', etiket: 'Kalp (Anne Eli)' },
  { id: 'ShieldCheck', etiket: 'Kalkan (Güvenlik)' },
  { id: 'Sparkles', etiket: 'Pırıltı (Özel Menü)' },
  { id: 'UtensilsCrossed', etiket: 'Çatal Bıçak' },
  { id: 'Bike', etiket: 'Kurye / Motor' },
  { id: 'Flame', etiket: 'Ateş / Sıcak' },
  { id: 'Award', etiket: 'Ödül / Kalite' }
];

const RENK_SECENEKLERI: { id: 'amber' | 'purple' | 'emerald' | 'rose' | 'blue'; etiket: string; stil: string }[] = [
  { id: 'amber', etiket: 'Altın Sarısı', stil: 'bg-amber-500' },
  { id: 'purple', etiket: 'Asil Mor', stil: 'bg-purple-500' },
  { id: 'emerald', etiket: 'Zümrüt Yeşili', stil: 'bg-emerald-500' },
  { id: 'rose', etiket: 'Gül Pembesi', stil: 'bg-rose-500' },
  { id: 'blue', etiket: 'Gök Mavisi', stil: 'bg-blue-500' }
];

export const FooterAvantajRozetleri: React.FC<Props> = ({ ayar, guncelle }) => {
  const [yeniBaslik, setYeniBaslik] = useState('');
  const [yeniAlt, setYeniAlt] = useState('');
  const [yeniIkon, setYeniIkon] = useState('ChefHat');
  const [yeniRenk, setYeniRenk] = useState<'amber' | 'purple' | 'emerald' | 'rose' | 'blue'>('amber');

  const sil = (id: string) => {
    const filtrelenmis = ayar.avantajlar.filter((a) => a.id !== id);
    guncelle({ ...ayar, avantajlar: filtrelenmis });
  };

  const guncelleAvantaj = (index: number, alan: Partial<FooterAvantaj>) => {
    const kopyalar = [...ayar.avantajlar];
    kopyalar[index] = { ...kopyalar[index], ...alan };
    guncelle({ ...ayar, avantajlar: kopyalar });
  };

  const ekle = () => {
    if (!yeniBaslik.trim()) return;
    const yeni: FooterAvantaj = {
      id: 'av-' + Date.now(),
      baslik: yeniBaslik.trim(),
      altBaslik: yeniAlt.trim() || 'Güvenilir lezzet',
      ikonAdi: yeniIkon,
      renk: yeniRenk
    };
    guncelle({ ...ayar, avantajlar: [...ayar.avantajlar, yeni] });
    setYeniBaslik('');
    setYeniAlt('');
  };

  return (
    <div className="p-5 rounded-2xl bg-[#180A1F] border border-[#3E1646] space-y-4">
      <div className="flex items-center justify-between border-b border-purple-950 pb-2">
        <h4 className="font-bold text-white text-sm flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Üst 4'lü Avantaj / Rozet Şeridi</span>
        </h4>
        <span className="text-[11px] text-purple-300">Toplam {ayar.avantajlar.length} Kutu</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {ayar.avantajlar.map((av, index) => (
          <div key={av.id || index} className="p-3.5 rounded-xl bg-[#120614] border border-purple-900/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                Kutu #{index + 1}
              </span>
              <button
                type="button"
                onClick={() => sil(av.id)}
                className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                title="Kutuyu Sil"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <label className="text-[10px] text-gray-400 block mb-0.5">Başlık</label>
                <input
                  type="text"
                  value={av.baslik}
                  onChange={(e) => guncelleAvantaj(index, { baslik: e.target.value })}
                  placeholder="Başlık"
                  className="w-full bg-[#1E0E22] border border-purple-900 rounded-lg px-2.5 py-1.5 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 block mb-0.5">Alt Açıklama</label>
                <input
                  type="text"
                  value={av.altBaslik}
                  onChange={(e) => guncelleAvantaj(index, { altBaslik: e.target.value })}
                  placeholder="Alt Açıklama"
                  className="w-full bg-[#1E0E22] border border-purple-900 rounded-lg px-2.5 py-1.5 text-gray-300 text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-gray-400 block mb-0.5">İkon</label>
                  <select
                    value={av.ikonAdi}
                    onChange={(e) => guncelleAvantaj(index, { ikonAdi: e.target.value })}
                    className="w-full bg-[#1E0E22] border border-purple-900 rounded-lg px-1.5 py-1 text-white text-[10px]"
                  >
                    {IKON_SECENEKLERI.map((ik) => (
                      <option key={ik.id} value={ik.id}>{ik.etiket}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 block mb-0.5">Renk</label>
                  <select
                    value={av.renk || 'amber'}
                    onChange={(e) => guncelleAvantaj(index, { renk: e.target.value as any })}
                    className="w-full bg-[#1E0E22] border border-purple-900 rounded-lg px-1.5 py-1 text-white text-[10px]"
                  >
                    {RENK_SECENEKLERI.map((rk) => (
                      <option key={rk.id} value={rk.id}>{rk.etiket}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Yeni Kutu Ekleme Formu */}
      <div className="p-3.5 rounded-xl bg-[#120614] border border-purple-900/40 grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
        <div>
          <label className="text-[10px] text-gray-400 block mb-1">Yeni Kutu Başlığı</label>
          <input
            type="text"
            value={yeniBaslik}
            onChange={(e) => setYeniBaslik(e.target.value)}
            placeholder="Örn: Hızlı Sıcak Teslimat"
            className="w-full bg-[#1E0E22] border border-purple-900 rounded-xl px-3 py-1.5 text-xs text-white font-bold"
          />
        </div>

        <div>
          <label className="text-[10px] text-gray-400 block mb-1">Alt Açıklama</label>
          <input
            type="text"
            value={yeniAlt}
            onChange={(e) => setYeniAlt(e.target.value)}
            placeholder="Örn: 30 dakikada kapınızda"
            className="w-full bg-[#1E0E22] border border-purple-900 rounded-xl px-3 py-1.5 text-xs text-white"
          />
        </div>

        <div>
          <label className="text-[10px] text-gray-400 block mb-1">İkon Seç</label>
          <select
            value={yeniIkon}
            onChange={(e) => setYeniIkon(e.target.value)}
            className="w-full bg-[#1E0E22] border border-purple-900 rounded-xl px-2 py-1.5 text-xs text-white"
          >
            {IKON_SECENEKLERI.map((ik) => (
              <option key={ik.id} value={ik.id}>{ik.etiket}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] text-gray-400 block mb-1">Renk Seç</label>
          <select
            value={yeniRenk}
            onChange={(e) => setYeniRenk(e.target.value as any)}
            className="w-full bg-[#1E0E22] border border-purple-900 rounded-xl px-2 py-1.5 text-xs text-white"
          >
            {RENK_SECENEKLERI.map((rk) => (
              <option key={rk.id} value={rk.id}>{rk.etiket}</option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={ekle}
          className="w-full px-4 py-2 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer h-9"
        >
          <Plus className="w-4 h-4" />
          <span>Rozet Ekle</span>
        </button>
      </div>
    </div>
  );
};
