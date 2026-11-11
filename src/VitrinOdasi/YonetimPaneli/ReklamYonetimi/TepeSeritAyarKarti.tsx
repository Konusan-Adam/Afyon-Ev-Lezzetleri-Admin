import React, { useState } from 'react';
import { ChefHat, Sparkles } from 'lucide-react';
import { TepeBantOgesi } from '@/src/veritabani/CanliVeriYardimcisi';

interface TepeSeritAyarKartiProps {
  liste: TepeBantOgesi[];
  onDegis: (yeniListe: TepeBantOgesi[]) => void;
}

export const TepeSeritAyarKarti: React.FC<TepeSeritAyarKartiProps> = ({ liste, onDegis }) => {
  const [seciliIndex, setSeciliIndex] = useState<number>(0);

  const guvenliListe: TepeBantOgesi[] = liste.length > 0 ? liste : [
    {
      id: '1',
      aktif: true,
      metin: 'Duyuru metni',
      butonMetni: 'İncele',
      butonHedefi: 'kayit'
    }
  ];

  const aktifOge = guvenliListe[seciliIndex] || guvenliListe[0];

  const ogeyiGuncelle = (guncelAlanlar: Partial<TepeBantOgesi>) => {
    const yeniListe = [...guvenliListe];
    yeniListe[seciliIndex] = { ...aktifOge, ...guncelAlanlar };
    onDegis(yeniListe);
  };

  return (
    <div className="bg-[#200A25] border border-purple-900/60 rounded-2xl p-5 space-y-4 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-purple-950 gap-3">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
            <ChefHat className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-black text-white">En Üst İnce Duyuru Barı Slider (3 Adet)</h3>
            <p className="text-xs text-purple-300">Sayfanın en tepesinde dönen 3 adet ince duyuru şeridini yönetebilirsiniz</p>
          </div>
        </div>

        {/* Sekme Seçici (1. Duyuru, 2. Duyuru, 3. Duyuru) */}
        <div className="flex items-center gap-1 bg-[#130713] p-1 rounded-xl border border-purple-900">
          {guvenliListe.map((oge, index) => (
            <button
              key={oge.id || index}
              type="button"
              onClick={() => setSeciliIndex(index)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                seciliIndex === index
                  ? 'bg-amber-500 text-purple-950 shadow-sm'
                  : 'text-purple-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{index + 1}. Duyuru</span>
              <span className={`w-2 h-2 rounded-full ${oge.aktif ? 'bg-emerald-400' : 'bg-red-400'}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Aktiflik Durumu */}
      <div className="flex items-center justify-between bg-[#130713] p-3 rounded-xl border border-purple-900/60">
        <span className="text-xs font-bold text-gray-200 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{seciliIndex + 1}. Duyuru Yayında mı?</span>
        </span>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <span className="text-xs font-bold text-gray-300">
            {aktifOge.aktif ? 'Aktif (Yayında)' : 'Pasif (Gizli)'}
          </span>
          <input
            type="checkbox"
            checked={aktifOge.aktif}
            onChange={(e) => ogeyiGuncelle({ aktif: e.target.checked })}
            className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 cursor-pointer"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-xs font-bold text-gray-300 block">Duyuru / Reklam Metni</label>
          <input
            type="text"
            value={aktifOge.metin}
            onChange={(e) => ogeyiGuncelle({ metin: e.target.value })}
            placeholder="Örn: Evinde yemek yapıp satmak ister misin? Aşçı Başvurusu Başladı!"
            className="w-full bg-[#130713] border border-purple-900/60 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-300 block">Buton Yazısı</label>
          <input
            type="text"
            value={aktifOge.butonMetni}
            onChange={(e) => ogeyiGuncelle({ butonMetni: e.target.value })}
            placeholder="Örn: Aşçı Başvurusu Yap"
            className="w-full bg-[#130713] border border-purple-900/60 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-300 block">Buton Hedefi / Aksiyonu</label>
          <select
            value={aktifOge.butonHedefi}
            onChange={(e) => ogeyiGuncelle({ butonHedefi: e.target.value as any })}
            className="w-full bg-[#130713] border border-purple-900/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
          >
            <option value="mutfak_basvurusu">Ev Mutfağı & Aşçı Paneli / Başvuru</option>
            <option value="kampanyalar">Kampanyalar Sayfası</option>
            <option value="kayit">Giriş & Kayıt Ekranı</option>
          </select>
        </div>
      </div>
    </div>
  );
};
