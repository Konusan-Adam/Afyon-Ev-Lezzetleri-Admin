import React, { useState } from 'react';
import { FooterAyar, FooterSosyalMedya } from '../../MasaustuAltBilgi/footerVeritabani';
import { Share2, Plus, Trash2, Globe } from 'lucide-react';

interface Props {
  ayar: FooterAyar;
  guncelle: (yeniAyar: FooterAyar) => void;
}

export const FooterSosyalMedyaYonetimi: React.FC<Props> = ({ ayar, guncelle }) => {
  const [yeniPlatform, setYeniPlatform] = useState<'instagram' | 'facebook' | 'twitter' | 'youtube' | 'tiktok' | 'whatsapp'>('instagram');
  const [yeniUrl, setYeniUrl] = useState('');

  const sil = (id: string) => {
    const filtrelenmis = ayar.sosyalMedya.filter((s) => s.id !== id);
    guncelle({ ...ayar, sosyalMedya: filtrelenmis });
  };

  const guncellePlatform = (id: string, alan: Partial<FooterSosyalMedya>) => {
    const guncel = ayar.sosyalMedya.map((s) => (s.id === id ? { ...s, ...alan } : s));
    guncelle({ ...ayar, sosyalMedya: guncel });
  };

  const ekle = () => {
    if (!yeniUrl.trim()) return;
    const yeni: FooterSosyalMedya = {
      id: 'sos-' + Date.now(),
      platform: yeniPlatform,
      url: yeniUrl.trim(),
      aktif: true,
    };
    guncelle({ ...ayar, sosyalMedya: [...ayar.sosyalMedya, yeni] });
    setYeniUrl('');
  };

  return (
    <div className="p-5 rounded-2xl bg-[#180A1F] border border-[#3E1646] space-y-4">
      <div className="flex items-center justify-between border-b border-purple-950 pb-2">
        <h4 className="font-bold text-white text-sm flex items-center gap-2">
          <Share2 className="w-4 h-4 text-purple-400" />
          <span>Sosyal Medya Hesapları & İkon Linkleri</span>
        </h4>
        <span className="text-[11px] text-purple-300">
          {ayar.sosyalMedya.filter((s) => s.aktif).length} Aktif Platform
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {ayar.sosyalMedya.map((sosyal) => (
          <div
            key={sosyal.id}
            className={`p-3 rounded-xl border flex flex-col justify-between gap-2 transition-all ${
              sosyal.aktif ? 'bg-[#120614] border-purple-900/60' : 'bg-[#0f0410]/50 border-purple-950/40 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold capitalize text-amber-400 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                {sosyal.platform}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => guncellePlatform(sosyal.id, { aktif: !sosyal.aktif })}
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded cursor-pointer ${
                    sosyal.aktif ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  {sosyal.aktif ? 'AÇIK' : 'KAPALI'}
                </button>
                <button
                  type="button"
                  onClick={() => sil(sosyal.id)}
                  className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                  title="Sil"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <input
              type="text"
              value={sosyal.url}
              onChange={(e) => guncellePlatform(sosyal.id, { url: e.target.value })}
              placeholder="https://..."
              className="w-full bg-[#1E0E22] border border-purple-900 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
            />
          </div>
        ))}
      </div>

      {/* Yeni Platform Ekleme */}
      <div className="p-3 rounded-xl bg-[#120614] border border-purple-900/40 flex flex-col md:flex-row items-center gap-3">
        <select
          value={yeniPlatform}
          onChange={(e) => setYeniPlatform(e.target.value as any)}
          className="w-full md:w-1/4 bg-[#1E0E22] border border-purple-900 rounded-xl px-3 py-2 text-xs text-white font-bold"
        >
          <option value="instagram">Instagram</option>
          <option value="facebook">Facebook</option>
          <option value="twitter">Twitter / X</option>
          <option value="youtube">YouTube</option>
          <option value="tiktok">TikTok</option>
          <option value="whatsapp">WhatsApp</option>
        </select>
        <input
          type="text"
          value={yeniUrl}
          onChange={(e) => setYeniUrl(e.target.value)}
          placeholder="Profil veya Kanal Linki (https://...)"
          className="w-full md:flex-1 bg-[#1E0E22] border border-purple-900 rounded-xl px-3 py-2 text-xs text-white"
        />
        <button
          type="button"
          onClick={ekle}
          className="w-full md:w-auto px-4 py-2 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Sosyal Medya Ekle</span>
        </button>
      </div>
    </div>
  );
};
