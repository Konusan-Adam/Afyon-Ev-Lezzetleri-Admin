import React from 'react';
import { FooterAyar } from '../../MasaustuAltBilgi/footerVeritabani';
import { Building2, Image as ImageIcon } from 'lucide-react';

interface Props {
  ayar: FooterAyar;
  guncelle: (yeniAyar: FooterAyar) => void;
}

export const FooterGenelBilgiler: React.FC<Props> = ({ ayar, guncelle }) => {
  return (
    <div className="p-5 rounded-2xl bg-[#180A1F] border border-[#3E1646] space-y-4">
      <h4 className="font-bold text-white text-sm flex items-center gap-2 border-b border-purple-950 pb-2">
        <Building2 className="w-4 h-4 text-amber-400" />
        <span>Genel Şirket Bilgileri & Marka Logosu</span>
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
        <div>
          <label className="block text-gray-400 mb-1 font-semibold">Şirket Unvanı (Logo Yanı)</label>
          <input
            type="text"
            value={ayar.sirketUnvani}
            onChange={(e) => guncelle({ ...ayar, sirketUnvani: e.target.value })}
            className="w-full bg-[#120614] border border-purple-900 rounded-xl px-3 py-2 text-white font-bold"
          />
        </div>

        <div>
          <label className="block text-gray-400 mb-1 font-semibold">Alt Slogan / Unvan</label>
          <input
            type="text"
            value={ayar.altBaslik}
            onChange={(e) => guncelle({ ...ayar, altBaslik: e.target.value })}
            className="w-full bg-[#120614] border border-purple-900 rounded-xl px-3 py-2 text-white"
          />
        </div>

        <div>
          <label className="block text-gray-400 mb-1 font-semibold">Logo Görseli URL'si</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={ayar.logoUrl || '/marka_logosu.jpg'}
              onChange={(e) => guncelle({ ...ayar, logoUrl: e.target.value })}
              className="flex-1 bg-[#120614] border border-purple-900 rounded-xl px-3 py-2 text-white"
            />
            <div className="w-9 h-9 rounded-xl bg-white p-0.5 shrink-0 overflow-hidden border border-purple-700 flex items-center justify-center">
              <img src={ayar.logoUrl || '/marka_logosu.jpg'} alt="Önizleme" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <div className="md:col-span-3">
          <label className="block text-gray-400 mb-1 font-semibold">Footer Tanıtım & Hikaye Açıklaması</label>
          <textarea
            rows={2}
            value={ayar.aciklama}
            onChange={(e) => guncelle({ ...ayar, aciklama: e.target.value })}
            className="w-full bg-[#120614] border border-purple-900 rounded-xl px-3 py-2 text-white leading-relaxed"
          />
        </div>

        <div className="md:col-span-3">
          <label className="block text-gray-400 mb-1 font-semibold">En Alt Telif Metni (Copyright)</label>
          <input
            type="text"
            value={ayar.telifMetni}
            onChange={(e) => guncelle({ ...ayar, telifMetni: e.target.value })}
            className="w-full bg-[#120614] border border-purple-900 rounded-xl px-3 py-2 text-white"
          />
        </div>
      </div>
    </div>
  );
};
