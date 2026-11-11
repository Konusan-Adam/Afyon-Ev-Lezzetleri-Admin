import React, { useState } from 'react';
import { FooterAyar, FooterAltSozlesme } from '../../MasaustuAltBilgi/footerVeritabani';
import { FileText, Plus, Trash2 } from 'lucide-react';

interface Props {
  ayar: FooterAyar;
  guncelle: (yeniAyar: FooterAyar) => void;
}

const SOZLESME_TURLERI = [
  { tur: 'kullanim_kosullari', ad: 'Kullanım Koşulları' },
  { tur: 'kvkk_aydinlatma', ad: 'Gizlilik & KVKK Aydınlatma' },
  { tur: 'hijyen_sozlesmesi', ad: 'Aşçı Hijyen Sözleşmesi' },
  { tur: 'mesafeli_satis', ad: 'Mesafeli Satış Sözleşmesi' },
  { tur: 'iptal_iade', ad: 'İptal ve İade Şartları' },
  { tur: 'cerez_politikasi', ad: 'Çerez Politikası' }
];

export const FooterSozlesmeLinkleri: React.FC<Props> = ({ ayar, guncelle }) => {
  const [yeniBaslik, setYeniBaslik] = useState('');
  const [yeniTur, setYeniTur] = useState('kullanim_kosullari');

  const sil = (id: string) => {
    const kopyalar = ayar.altSozlesmeLinkleri.filter((s) => s.id !== id);
    guncelle({ ...ayar, altSozlesmeLinkleri: kopyalar });
  };

  const ekle = () => {
    if (!yeniBaslik.trim()) return;
    const yeni: FooterAltSozlesme = {
      id: 'soz-' + Date.now(),
      baslik: yeniBaslik.trim(),
      tur: yeniTur
    };
    guncelle({ ...ayar, altSozlesmeLinkleri: [...ayar.altSozlesmeLinkleri, yeni] });
    setYeniBaslik('');
  };

  const guncelleSozlesme = (index: number, alan: Partial<FooterAltSozlesme>) => {
    const kopyalar = [...ayar.altSozlesmeLinkleri];
    kopyalar[index] = { ...kopyalar[index], ...alan };
    guncelle({ ...ayar, altSozlesmeLinkleri: kopyalar });
  };

  return (
    <div className="p-5 rounded-2xl bg-[#180A1F] border border-[#3E1646] space-y-4">
      <div className="flex items-center justify-between border-b border-purple-950 pb-2">
        <h4 className="font-bold text-white text-sm flex items-center gap-2">
          <FileText className="w-4 h-4 text-purple-400" />
          <span>En Alt Yasal Sözleşme & KVKK Linkleri</span>
        </h4>
        <span className="text-[11px] text-purple-300">
          Toplam {ayar.altSozlesmeLinkleri.length} Sözleşme Linki
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {ayar.altSozlesmeLinkleri.map((sozlesme, index) => (
          <div key={sozlesme.id || index} className="p-3 rounded-xl bg-[#120614] border border-purple-900/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-400">#{index + 1}</span>
              <button
                type="button"
                onClick={() => sil(sozlesme.id)}
                className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                title="Sil"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <input
              type="text"
              value={sozlesme.baslik}
              onChange={(e) => guncelleSozlesme(index, { baslik: e.target.value })}
              className="w-full bg-[#1E0E22] border border-purple-900 rounded-lg px-2.5 py-1.5 text-xs text-white font-medium"
            />

            <select
              value={sozlesme.tur}
              onChange={(e) => guncelleSozlesme(index, { tur: e.target.value })}
              className="w-full bg-[#1E0E22] border border-purple-900 rounded-lg px-2 py-1 text-[11px] text-purple-300"
            >
              {SOZLESME_TURLERI.map((st) => (
                <option key={st.tur} value={st.tur}>{st.ad}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Yeni Sözleşme Linki Ekle */}
      <div className="p-3.5 rounded-xl bg-[#120614] border border-purple-900/40 flex flex-col md:flex-row items-center gap-3">
        <input
          type="text"
          value={yeniBaslik}
          onChange={(e) => setYeniBaslik(e.target.value)}
          placeholder="Yeni Sözleşme Başlığı (Örn: Çerez Politikası)"
          className="flex-1 w-full bg-[#1E0E22] border border-purple-900 rounded-xl px-3 py-2 text-xs text-white"
        />
        <select
          value={yeniTur}
          onChange={(e) => setYeniTur(e.target.value)}
          className="w-full md:w-auto bg-[#1E0E22] border border-purple-900 rounded-xl px-3 py-2 text-xs text-purple-300"
        >
          {SOZLESME_TURLERI.map((st) => (
            <option key={st.tur} value={st.tur}>{st.ad}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={ekle}
          className="w-full md:w-auto px-4 py-2 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Sözleşme Linki Ekle</span>
        </button>
      </div>
    </div>
  );
};
