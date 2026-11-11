import React from 'react';
import { FooterAyar } from '../../MasaustuAltBilgi/footerVeritabani';
import { PhoneCall, Clock, MapPin, Radio } from 'lucide-react';

interface Props {
  ayar: FooterAyar;
  guncelle: (yeniAyar: FooterAyar) => void;
}

export const FooterIletisimVeDurum: React.FC<Props> = ({ ayar, guncelle }) => {
  const iletisim = ayar.iletisim;

  const guncelleIletisim = (alan: Partial<typeof iletisim>) => {
    guncelle({
      ...ayar,
      iletisim: {
        ...iletisim,
        ...alan
      }
    });
  };

  return (
    <div className="p-5 rounded-2xl bg-[#180A1F] border border-[#3E1646] space-y-4">
      <div className="flex items-center justify-between border-b border-purple-950 pb-2">
        <h4 className="font-bold text-white text-sm flex items-center gap-2">
          <PhoneCall className="w-4 h-4 text-emerald-400" />
          <span>4. Kolon: İletişim, Sipariş Hattı & Canlı Durum</span>
        </h4>
        <div className="flex items-center gap-2">
          <label className="text-[10px] text-gray-400">Nokta Rengi:</label>
          <input
            type="color"
            value={iletisim.noktaRengi || '#10B981'}
            onChange={(e) => guncelleIletisim({ noktaRengi: e.target.value })}
            className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
        <div>
          <label className="block text-gray-400 mb-1 font-semibold">Kolon Başlığı</label>
          <input
            type="text"
            value={iletisim.baslik}
            onChange={(e) => guncelleIletisim({ baslik: e.target.value })}
            className="w-full bg-[#120614] border border-purple-900 rounded-xl px-3 py-2 text-white font-bold"
          />
        </div>

        <div>
          <label className="block text-gray-400 mb-1 font-semibold flex items-center gap-1">
            <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
            <span>Telefon & Sipariş Hattı</span>
          </label>
          <input
            type="text"
            value={iletisim.telefon}
            onChange={(e) => guncelleIletisim({ telefon: e.target.value })}
            className="w-full bg-[#120614] border border-purple-900 rounded-xl px-3 py-2 text-amber-400 font-extrabold"
          />
        </div>

        <div>
          <label className="block text-gray-400 mb-1 font-semibold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span>Çalışma Saatleri</span>
          </label>
          <input
            type="text"
            value={iletisim.calismaSaatleri}
            onChange={(e) => guncelleIletisim({ calismaSaatleri: e.target.value })}
            className="w-full bg-[#120614] border border-purple-900 rounded-xl px-3 py-2 text-white"
          />
        </div>

        <div className="md:col-span-3">
          <label className="block text-gray-400 mb-1 font-semibold flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-rose-400" />
            <span>Fiziksel Mağaza / Merkez Adresi</span>
          </label>
          <input
            type="text"
            value={iletisim.adres}
            onChange={(e) => guncelleIletisim({ adres: e.target.value })}
            className="w-full bg-[#120614] border border-purple-900 rounded-xl px-3 py-2 text-white"
          />
        </div>

        {/* Canlı Durum Şeridi */}
        <div className="md:col-span-3 p-3.5 rounded-xl bg-[#120614] border border-purple-900/60 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <div>
              <div className="font-bold text-white flex items-center gap-2">
                <span>Canlı Durum Şeridi</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              </div>
              <div className="text-[11px] text-gray-400">Footer altında yeşil yanıp sönen servis durum bildirimi</div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <input
              type="text"
              value={iletisim.canliDurumMetni}
              onChange={(e) => guncelleIletisim({ canliDurumMetni: e.target.value })}
              className="flex-1 md:w-80 bg-[#1E0E22] border border-purple-900 rounded-xl px-3 py-1.5 text-xs text-emerald-300 font-medium"
            />
            <button
              type="button"
              onClick={() => guncelleIletisim({ canliDurumAktif: !iletisim.canliDurumAktif })}
              className={`text-[10px] font-extrabold px-3 py-1.5 rounded-xl cursor-pointer shrink-0 ${
                iletisim.canliDurumAktif ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-gray-800 text-gray-400'
              }`}
            >
              {iletisim.canliDurumAktif ? 'AÇIK' : 'KAPALI'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
