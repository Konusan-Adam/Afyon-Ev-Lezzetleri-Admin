import React from 'react';
import { FooterAyar } from '../../MasaustuAltBilgi/footerVeritabani';
import { Sparkles, ChefHat } from 'lucide-react';

interface Props {
  ayar: FooterAyar;
  guncelle: (yeniAyar: FooterAyar) => void;
}

export const FooterOzelHizmetler: React.FC<Props> = ({ ayar, guncelle }) => {
  const ozel = ayar.ozelHizmetler;

  const guncelleOzel = (alan: Partial<typeof ozel>) => {
    guncelle({
      ...ayar,
      ozelHizmetler: {
        ...ozel,
        ...alan
      }
    });
  };

  return (
    <div className="p-5 rounded-2xl bg-[#180A1F] border border-[#3E1646] space-y-4">
      <div className="flex items-center justify-between border-b border-purple-950 pb-2">
        <h4 className="font-bold text-white text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>3. Kolon: Özel Hizmetler & Ev Aşçısı Kartı</span>
        </h4>
        <div className="flex items-center gap-2">
          <label className="text-[10px] text-gray-400">Nokta Rengi:</label>
          <input
            type="color"
            value={ozel.noktaRengi || '#A855F7'}
            onChange={(e) => guncelleOzel({ noktaRengi: e.target.value })}
            className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Kolon Başlığı */}
        <div className="md:col-span-2">
          <label className="block text-gray-400 mb-1 font-semibold">Kolon Başlığı</label>
          <input
            type="text"
            value={ozel.baslik}
            onChange={(e) => guncelleOzel({ baslik: e.target.value })}
            className="w-full bg-[#120614] border border-purple-900 rounded-xl px-3 py-2 text-white font-bold"
          />
        </div>

        {/* İhale Servisi */}
        <div className="p-3.5 rounded-xl bg-[#120614] border border-purple-900/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white">Özel Menü İhalesi</span>
            <button
              type="button"
              onClick={() => guncelleOzel({ ihaleAktif: !ozel.ihaleAktif })}
              className={`text-[10px] font-extrabold px-2 py-0.5 rounded cursor-pointer ${
                ozel.ihaleAktif ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-gray-800 text-gray-400'
              }`}
            >
              {ozel.ihaleAktif ? 'AÇIK' : 'KAPALI'}
            </button>
          </div>
          <input
            type="text"
            value={ozel.ihaleMetni}
            onChange={(e) => guncelleOzel({ ihaleMetni: e.target.value })}
            className="w-full bg-[#1E0E22] border border-purple-900 rounded-lg px-2.5 py-1.5 text-white"
          />
        </div>

        {/* Abonelik Servisi */}
        <div className="p-3.5 rounded-xl bg-[#120614] border border-purple-900/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white">Ev Yemeği Aboneliği</span>
            <button
              type="button"
              onClick={() => guncelleOzel({ abonelikAktif: !ozel.abonelikAktif })}
              className={`text-[10px] font-extrabold px-2 py-0.5 rounded cursor-pointer ${
                ozel.abonelikAktif ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-gray-800 text-gray-400'
              }`}
            >
              {ozel.abonelikAktif ? 'AÇIK' : 'KAPALI'}
            </button>
          </div>
          <input
            type="text"
            value={ozel.abonelikMetni}
            onChange={(e) => guncelleOzel({ abonelikMetni: e.target.value })}
            className="w-full bg-[#1E0E22] border border-purple-900 rounded-lg px-2.5 py-1.5 text-white"
          />
        </div>

        {/* Hızlı Kombin Servisi */}
        <div className="p-3.5 rounded-xl bg-[#120614] border border-purple-900/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white">Akıllı Hızlı Kombin</span>
            <button
              type="button"
              onClick={() => guncelleOzel({ kombinAktif: !ozel.kombinAktif })}
              className={`text-[10px] font-extrabold px-2 py-0.5 rounded cursor-pointer ${
                ozel.kombinAktif ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-gray-800 text-gray-400'
              }`}
            >
              {ozel.kombinAktif ? 'AÇIK' : 'KAPALI'}
            </button>
          </div>
          <input
            type="text"
            value={ozel.kombinMetni}
            onChange={(e) => guncelleOzel({ kombinMetni: e.target.value })}
            className="w-full bg-[#1E0E22] border border-purple-900 rounded-lg px-2.5 py-1.5 text-white"
          />
        </div>

        {/* Ev Aşçısı mısınız? Davet Kartı */}
        <div className="p-3.5 rounded-xl bg-[#120614] border border-purple-900/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white flex items-center gap-1.5">
              <ChefHat className="w-4 h-4 text-amber-400" />
              Ev Aşçısı Davet Kartı
            </span>
            <button
              type="button"
              onClick={() => guncelleOzel({ davetKutusuAktif: !ozel.davetKutusuAktif })}
              className={`text-[10px] font-extrabold px-2 py-0.5 rounded cursor-pointer ${
                ozel.davetKutusuAktif ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-gray-800 text-gray-400'
              }`}
            >
              {ozel.davetKutusuAktif ? 'AÇIK' : 'KAPALI'}
            </button>
          </div>
          <input
            type="text"
            value={ozel.davetKutusuBaslik}
            onChange={(e) => guncelleOzel({ davetKutusuBaslik: e.target.value })}
            placeholder="Kart Başlığı (Ev Aşçısı mısınız?)"
            className="w-full bg-[#1E0E22] border border-purple-900 rounded-lg px-2.5 py-1.5 text-white font-bold"
          />
          <input
            type="text"
            value={ozel.davetKutusuAltMetin}
            onChange={(e) => guncelleOzel({ davetKutusuAltMetin: e.target.value })}
            placeholder="Alt Açıklama (Dükkanınızı açın, kazanın.)"
            className="w-full bg-[#1E0E22] border border-purple-900 rounded-lg px-2.5 py-1.5 text-purple-300 text-[11px]"
          />
        </div>
      </div>
    </div>
  );
};
