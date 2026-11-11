import React, { useState } from 'react';
import { Megaphone, Sparkles } from 'lucide-react';
import { AnaAfisOgesi } from '@/src/veritabani/CanliVeriYardimcisi';
import { GorselDosyaYukleyici } from './GorselDosyaYukleyici';
import { AfisCanliOnizleme } from './AfisCanliOnizleme';

interface AnaAfisAyarKartiProps {
  liste: AnaAfisOgesi[];
  onDegis: (yeniListe: AnaAfisOgesi[]) => void;
}

export const AnaAfisAyarKarti: React.FC<AnaAfisAyarKartiProps> = ({ liste, onDegis }) => {
  const [seciliIndex, setSeciliIndex] = useState<number>(0);

  const guvenliListe: AnaAfisOgesi[] = liste.length > 0 ? liste : [
    {
      id: '1',
      aktif: true,
      aktif_mi: true,
      rozet: 'İLK SİPARİŞE ÖZEL',
      baslik: 'Başlık',
      aciklama: 'Açıklama',
      gorsel_url: '',
      gorselVerisi: '',
      butonMetni: 'İncele',
      butonHedefi: 'kayit'
    }
  ];

  const aktifOge = guvenliListe[seciliIndex] || guvenliListe[0];

  const ogeyiGuncelle = (guncelAlanlar: Partial<AnaAfisOgesi>) => {
    const yeniListe = [...guvenliListe];
    yeniListe[seciliIndex] = { ...aktifOge, ...guncelAlanlar };
    onDegis(yeniListe);
  };

  return (
    <div className="bg-[#200A25] border border-amber-500/40 rounded-2xl p-5 space-y-4 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-purple-950 gap-3">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
            <Megaphone className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-sm font-black text-white">
              Vitrin Büyük Afiş Banner Slider (3 Adet)
            </h3>
            <p className="text-xs text-purple-300">
              Ana sayfada dönen 3 adet büyük afiş/reklam kaydırıcısını buradan yönetebilirsiniz
            </p>
          </div>
        </div>

        {/* Sekme Seçici (1. Afiş, 2. Afiş, 3. Afiş) */}
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
              <span>{index + 1}. Afiş</span>
              <span className={`w-2 h-2 rounded-full ${oge.aktif ? 'bg-emerald-400' : 'bg-red-400'}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Seçili Afişin Aktiflik Durumu */}
      <div className="flex items-center justify-between bg-[#130713] p-3 rounded-xl border border-purple-900/60">
        <span className="text-xs font-bold text-gray-200 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{seciliIndex + 1}. Afiş Yayında mı?</span>
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

      {/* Görsel Yükleyici */}
      <GorselDosyaYukleyici
        seciliGorsel={aktifOge.gorselVerisi || aktifOge.gorselUrl || aktifOge.gorsel_url || ''}
        onGorselSecildi={(veri) => ogeyiGuncelle({ gorselVerisi: veri, gorselUrl: veri, gorsel_url: veri })}
      />

      {/* Metin Alanları */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-300 block">Rozet / Etiket Metni</label>
          <input
            type="text"
            value={aktifOge.rozet}
            onChange={(e) => ogeyiGuncelle({ rozet: e.target.value })}
            placeholder="Örn: İLK SİPARİŞE ÖZEL %25 İNDİRİM 🔥"
            className="w-full bg-[#130713] border border-purple-900/60 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-300 block">Afiş Başlığı</label>
          <input
            type="text"
            value={aktifOge.baslik}
            onChange={(e) => ogeyiGuncelle({ baslik: e.target.value })}
            placeholder="Örn: Afyon Ev Lezzetleri Sofrana Geliyor!"
            className="w-full bg-[#130713] border border-purple-900/60 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="md:col-span-2 space-y-1.5">
          <label className="text-xs font-bold text-gray-300 block">Açıklama Metni</label>
          <textarea
            rows={2}
            value={aktifOge.aciklama}
            onChange={(e) => ogeyiGuncelle({ aciklama: e.target.value })}
            placeholder="Afiş altındaki açıklama..."
            className="w-full bg-[#130713] border border-purple-900/60 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-300 block">Görsel Yerleşimi</label>
          <select
            value={aktifOge.gorselTipi || 'arka_plan'}
            onChange={(e) => ogeyiGuncelle({ gorselTipi: e.target.value as 'arka_plan' | 'sag_taraf' })}
            className="w-full bg-[#130713] border border-purple-900/60 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
          >
            <option value="arka_plan">Arka Plan (Tam Ekran)</option>
            <option value="sag_taraf">Sağ Taraf (Ürün Odaklı)</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-300 block">Buton Metni</label>
          <input
            type="text"
            value={aktifOge.butonMetni}
            onChange={(e) => ogeyiGuncelle({ butonMetni: e.target.value })}
            placeholder="Örn: Hemen Üye Ol & Fırsatı Yakala"
            className="w-full bg-[#130713] border border-purple-900/60 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-300 block">Buton Aksiyonu</label>
          <select
            value={aktifOge.butonHedefi}
            onChange={(e) => ogeyiGuncelle({ butonHedefi: e.target.value as any })}
            className="w-full bg-[#130713] border border-purple-900/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
          >
            <option value="kayit">Giriş & Üye Ol Penceresini Aç</option>
            <option value="mutfaklar">Ev Mutfakları Listesine Kaydır</option>
            <option value="kampanyalar">Kampanyalara Yönlendir</option>
          </select>
        </div>
      </div>

      {/* Canlı Önizleme */}
      <AfisCanliOnizleme ayar={aktifOge as any} />
    </div>
  );
};
