import React from 'react';

interface FormProps {
  ad: string;
  setAd: (v: string) => void;
  adres: string;
  setAdres: (v: string) => void;
  telefon: string;
  setTelefon: (v: string) => void;
  acilisSaati: string;
  setAcilisSaati: (v: string) => void;
  kapanisSaati: string;
  setKapanisSaati: (v: string) => void;
  hijyenPuani: number;
  setHijyenPuani: (v: number) => void;
  enlem: number;
  setEnlem: (v: number) => void;
  boylam: number;
  setBoylam: (v: number) => void;
  aciklama: string;
  setAciklama: (v: string) => void;
  youtubeLink: string;
  setYoutubeLink: (v: string) => void;
  canliYayinAktif: boolean;
  setCanliYayinAktif: (v: boolean) => void;
}

export const SubeFormGirdileri: React.FC<FormProps> = ({
  ad, setAd, adres, setAdres, telefon, setTelefon,
  acilisSaati, setAcilisSaati, kapanisSaati, setKapanisSaati,
  hijyenPuani, setHijyenPuani, enlem, setEnlem, boylam, setBoylam,
  aciklama, setAciklama, youtubeLink, setYoutubeLink, canliYayinAktif, setCanliYayinAktif
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
    <div className="space-y-1">
      <label className="text-gray-300 font-bold">Şube Adı *</label>
      <input type="text" required value={ad} onChange={e => setAd(e.target.value)}
        placeholder="Örn: Zafer Meydanı Gel-Al" className="w-full bg-[#120415] border border-purple-900/80 rounded-xl px-3 py-2 text-white" />
    </div>
    <div className="space-y-1">
      <label className="text-gray-300 font-bold">Telefon (SIFIR E-Posta) *</label>
      <input type="text" required value={telefon} onChange={e => setTelefon(e.target.value)}
        placeholder="0272 213 00 01" className="w-full bg-[#120415] border border-purple-900/80 rounded-xl px-3 py-2 text-white" />
    </div>
    <div className="sm:col-span-2 space-y-1">
      <label className="text-gray-300 font-bold">Açık Adres *</label>
      <input type="text" required value={adres} onChange={e => setAdres(e.target.value)}
        placeholder="Zafer Meydanı No:3 Afyon Merkez" className="w-full bg-[#120415] border border-purple-900/80 rounded-xl px-3 py-2 text-white" />
    </div>
    <div className="grid grid-cols-2 gap-2">
      <div>
        <label className="text-gray-300 font-bold block mb-1">Açılış Saati</label>
        <input type="time" value={acilisSaati} onChange={e => setAcilisSaati(e.target.value)}
          className="w-full bg-[#120415] border border-purple-900/80 rounded-xl px-2.5 py-2 text-white font-mono" />
      </div>
      <div>
        <label className="text-gray-300 font-bold block mb-1">Kapanış Saati</label>
        <input type="time" value={kapanisSaati} onChange={e => setKapanisSaati(e.target.value)}
          className="w-full bg-[#120415] border border-purple-900/80 rounded-xl px-2.5 py-2 text-white font-mono" />
      </div>
    </div>
    <div className="space-y-1">
      <label className="text-gray-300 font-bold">Hijyen Puanı (1-100)</label>
      <input type="number" min={1} max={100} value={hijyenPuani} onChange={e => setHijyenPuani(Number(e.target.value))}
        className="w-full bg-[#120415] border border-purple-900/80 rounded-xl px-3 py-2 text-white" />
    </div>
    <div className="space-y-1">
      <label className="text-gray-300 font-bold">Enlem / Boylam (GPS)</label>
      <div className="grid grid-cols-2 gap-1.5">
        <input type="number" step="0.0001" value={enlem} onChange={e => setEnlem(Number(e.target.value))}
          placeholder="Enlem" className="w-full bg-[#120415] border border-purple-900/80 rounded-xl px-2 py-2 text-white" />
        <input type="number" step="0.0001" value={boylam} onChange={e => setBoylam(Number(e.target.value))}
          placeholder="Boylam" className="w-full bg-[#120415] border border-purple-900/80 rounded-xl px-2 py-2 text-white" />
      </div>
    </div>
    <div className="space-y-1">
      <label className="text-gray-300 font-bold">Şube Tanıtım Metni</label>
      <input type="text" value={aciklama} onChange={e => setAciklama(e.target.value)}
        placeholder="Örn: Sıcak ve taze teslimat" className="w-full bg-[#120415] border border-purple-900/80 rounded-xl px-3 py-2 text-white" />
    </div>
    <div className="sm:col-span-2 space-y-1 p-2.5 rounded-xl bg-purple-950/40 border border-purple-800/40">
      <div className="flex items-center justify-between mb-1">
        <label className="text-rose-300 font-bold">YouTube Canlı Yayın Linki</label>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input type="checkbox" checked={canliYayinAktif} onChange={e => setCanliYayinAktif(e.target.checked)} className="rounded" />
          <span className="text-[11px] text-gray-200 font-bold">Yayını Aç</span>
        </label>
      </div>
      <input type="text" value={youtubeLink} onChange={e => setYoutubeLink(e.target.value)}
        placeholder="https://www.youtube.com/watch?v=..." className="w-full bg-[#120415] border border-purple-900/80 rounded-xl px-3 py-2 text-white" />
    </div>
  </div>
);
