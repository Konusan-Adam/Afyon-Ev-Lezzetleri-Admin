import React, { useState } from 'react';
import { X, Check, Store } from 'lucide-react';
import { GelAlSubesi } from '@/src/veritabani/VeriTipleri';
import { SubeFormGirdileri } from './SubeFormGirdileri';

interface ModalProps {
  acikMi: boolean;
  duzenlenen: GelAlSubesi | null;
  onKapat: () => void;
  onKaydet: (veri: Partial<GelAlSubesi>) => Promise<void>;
}

export const SubeDuzenleModali: React.FC<ModalProps> = ({ duzenlenen, onKapat, onKaydet }) => {
  const [ad, setAd] = useState(duzenlenen?.ad || '');
  const [adres, setAdres] = useState(duzenlenen?.adres || '');
  const [telefon, setTelefon] = useState(duzenlenen?.telefon || '');
  const [acilisSaati, setAcilisSaati] = useState(duzenlenen?.acilis_saati || '08:30');
  const [kapanisSaati, setKapanisSaati] = useState(duzenlenen?.kapanis_saati || '22:00');
  const [hijyenPuani, setHijyenPuani] = useState(duzenlenen?.hijyen_puani || 98);
  const [enlem, setEnlem] = useState(duzenlenen?.enlem || 38.7569);
  const [boylam, setBoylam] = useState(duzenlenen?.boylam || 30.5387);
  const [aciklama, setAciklama] = useState(duzenlenen?.aciklama || '');
  const [youtubeLink, setYoutubeLink] = useState(duzenlenen?.youtube_canli_yayin_linki || '');
  const [canliYayinAktif, setCanliYayinAktif] = useState(duzenlenen?.canli_yayin_aktif_mi ?? false);
  const [kaydediliyor, setKaydediliyor] = useState(false);

  const gonder = async (e: React.FormEvent) => {
    e.preventDefault();
    setKaydediliyor(true);
    await onKaydet({
      ad, adres, telefon, acilis_saati: acilisSaati, kapanis_saati: kapanisSaati,
      calisma_saatleri: `${acilisSaati} - ${kapanisSaati}`, hijyen_puani: hijyenPuani,
      enlem, boylam, aciklama, youtube_canli_yayin_linki: youtubeLink, canli_yayin_aktif_mi: canliYayinAktif
    });
    setKaydediliyor(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-[#1C0722] border border-amber-500/50 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-purple-900/60">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <Store className="w-4 h-4 text-amber-400" />
            <span>{duzenlenen ? `"${duzenlenen.ad}" Şubesini Düzenle` : 'Yeni Gel-Al Şubesi Tanımla'}</span>
          </h3>
          <button type="button" onClick={onKapat} className="text-purple-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={gonder} className="space-y-4">
          <SubeFormGirdileri
            ad={ad} setAd={setAd} adres={adres} setAdres={setAdres} telefon={telefon} setTelefon={setTelefon}
            acilisSaati={acilisSaati} setAcilisSaati={setAcilisSaati} kapanisSaati={kapanisSaati} setKapanisSaati={setKapanisSaati}
            hijyenPuani={hijyenPuani} setHijyenPuani={setHijyenPuani} enlem={enlem} setEnlem={setEnlem} boylam={boylam} setBoylam={setBoylam}
            aciklama={aciklama} setAciklama={setAciklama} youtubeLink={youtubeLink} setYoutubeLink={setYoutubeLink}
            canliYayinAktif={canliYayinAktif} setCanliYayinAktif={setCanliYayinAktif}
          />
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-purple-900/50">
            <button type="button" onClick={onKapat} className="px-4 py-2 rounded-xl bg-purple-900/40 text-xs font-bold text-gray-300">İptal</button>
            <button type="submit" disabled={kaydediliyor} className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-400 text-purple-950 font-black text-xs hover:brightness-110 disabled:opacity-50">
              <Check className="w-4 h-4" /><span>{kaydediliyor ? 'Kaydediliyor...' : 'Kaydet'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
