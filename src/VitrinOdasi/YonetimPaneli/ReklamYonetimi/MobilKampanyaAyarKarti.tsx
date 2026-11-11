import React, { useState } from 'react';
import { Smartphone, Sparkles, Image as ImageIcon } from 'lucide-react';
import { AnaAfisOgesi } from '@/src/veritabani/GercekVeriYardimcisi';
import { GorselDosyaYukleyici } from './GorselDosyaYukleyici';
import { VARSAYILAN_MOBIL_KAMPANYALAR } from '@/src/MalzemeCekmeceleri/KampanyaCekmecesi';

interface MobilKampanyaAyarKartiProps {
  liste: AnaAfisOgesi[];
  onDegis: (yeniListe: AnaAfisOgesi[]) => void;
}

export const MobilKampanyaAyarKarti: React.FC<MobilKampanyaAyarKartiProps> = ({ liste, onDegis }) => {
  const [seciliIndex, setSeciliIndex] = useState<number>(0);

  // Eğer gelen liste boşsa varsayılan 3 kampanyayı temel al
  const guvenliListe = (liste && liste.length > 0) ? liste : VARSAYILAN_MOBIL_KAMPANYALAR;

  // En az 3 adet kampanya slotu garanti et
  const tamamlanmisListe: AnaAfisOgesi[] = [
    guvenliListe[0] || VARSAYILAN_MOBIL_KAMPANYALAR[0],
    guvenliListe[1] || VARSAYILAN_MOBIL_KAMPANYALAR[1],
    guvenliListe[2] || VARSAYILAN_MOBIL_KAMPANYALAR[2]
  ];

  const aktifOge = tamamlanmisListe[seciliIndex] || tamamlanmisListe[0];

  const ogeyiGuncelle = (guncelAlanlar: Partial<AnaAfisOgesi>) => {
    const yeniListe = [...tamamlanmisListe];
    yeniListe[seciliIndex] = { ...aktifOge, ...guncelAlanlar };
    onDegis(yeniListe);
  };

  const gorselUrl = aktifOge.gorselVerisi || aktifOge.gorsel_url || aktifOge.gorselUrl || '';

  return (
    <div className="bg-[#200A25] border border-amber-500/40 rounded-2xl p-5 space-y-4 shadow-lg">
      {/* Üst Başlık ve Sekmeler */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-purple-950 gap-3">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
            <Smartphone className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-sm font-black text-white">Mobil & Tablet Kampanya Slider Yönetimi (3 Adet)</h3>
            <p className="text-xs text-purple-300">Mobil ekranın üstünde kayan kampanyaların rozet, başlık, buton ve şeffaf görsellerini yönetin</p>
          </div>
        </div>

        {/* 1. Kampanya, 2. Kampanya, 3. Kampanya Sekmeleri */}
        <div className="flex items-center gap-1 bg-[#130713] p-1 rounded-xl border border-purple-900">
          {tamamlanmisListe.map((oge, index) => (
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
              <span>{index + 1}. Kampanya</span>
              <span className={`w-2 h-2 rounded-full ${oge.aktif !== false && oge.aktif_mi !== false ? 'bg-emerald-400' : 'bg-red-400'}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Yayında mı Kontrolü */}
      <div className="flex items-center justify-between bg-[#130713] p-3 rounded-xl border border-purple-900/60">
        <span className="text-xs font-bold text-gray-200 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{seciliIndex + 1}. Kampanya Vitrinde Yayında mı?</span>
        </span>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <span className="text-xs font-bold text-gray-300">
            {aktifOge.aktif !== false && aktifOge.aktif_mi !== false ? 'Aktif (Yayında)' : 'Pasif (Gizli)'}
          </span>
          <input
            type="checkbox"
            checked={aktifOge.aktif !== false && aktifOge.aktif_mi !== false}
            onChange={(e) => ogeyiGuncelle({ aktif: e.target.checked, aktif_mi: e.target.checked })}
            className="w-4 h-4 rounded text-amber-500 cursor-pointer"
          />
        </label>
      </div>

      {/* Canlı Önizleme Kutusu (Şeffaf Arka Planlı) */}
      <div className="bg-[#1A0A1D] border border-purple-800/60 rounded-xl p-4 flex items-center justify-between gap-3">
        <div className="flex-1">
          <div className="text-[10px] text-purple-400 uppercase font-black tracking-wider mb-1">
            📱 Mobilde Nasıl Görünecek? (Önizleme)
          </div>
          {aktifOge.rozet && (
            <div className="bg-[#431B47] text-amber-300 text-[9px] font-black px-2 py-0.5 rounded w-fit mb-1 uppercase">
              {aktifOge.rozet}
            </div>
          )}
          <div className="text-white font-bold text-xs sm:text-sm line-clamp-1">{aktifOge.baslik || 'Başlık Yok'}</div>
          {aktifOge.aciklama && (
            <div className="text-purple-300/80 text-[10px] line-clamp-1 mt-0.5">{aktifOge.aciklama}</div>
          )}
          <div className="text-amber-400 font-bold text-[10px] mt-1.5 flex items-center gap-1">
            <span>{aktifOge.butonMetni || 'Hemen Keşfet!'}</span> &rarr;
          </div>
        </div>

        {/* Sağ Taraf Önizleme Görseli */}
        <div className="w-20 h-20 rounded-xl bg-purple-950/40 border border-purple-900/60 flex items-center justify-center p-1 overflow-hidden shrink-0">
          {gorselUrl ? (
            <img src={gorselUrl} alt="Önizleme" className="w-full h-full object-contain bg-transparent" />
          ) : (
            <ImageIcon className="w-8 h-8 text-purple-600/50" />
          )}
        </div>
      </div>

      {/* Alanlar: Rozet, Başlık, Açıklama, Buton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-300 block">Rozet / Üst Etiket</label>
          <input
            type="text"
            value={aktifOge.rozet || ''}
            onChange={(e) => ogeyiGuncelle({ rozet: e.target.value })}
            placeholder="Örn: İLK SİPARİŞE ÖZEL 🔥"
            className="w-full bg-[#130713] border border-purple-900/60 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-300 block">Kampanya Başlığı</label>
          <input
            type="text"
            value={aktifOge.baslik || ''}
            onChange={(e) => ogeyiGuncelle({ baslik: e.target.value })}
            placeholder="Örn: İlk Siparişine Özel %25 İndirim 🔥"
            className="w-full bg-[#130713] border border-purple-900/60 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="md:col-span-2 space-y-1.5">
          <label className="text-xs font-bold text-gray-300 block">Açıklama Metni</label>
          <textarea
            rows={2}
            value={aktifOge.aciklama || ''}
            onChange={(e) => ogeyiGuncelle({ aciklama: e.target.value })}
            placeholder="Kampanya alt açıklama yazısı..."
            className="w-full bg-[#130713] border border-purple-900/60 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-300 block">Buton Metni</label>
          <input
            type="text"
            value={aktifOge.butonMetni || 'Hemen Keşfet!'}
            onChange={(e) => ogeyiGuncelle({ butonMetni: e.target.value })}
            placeholder="Örn: Hemen Keşfet!"
            className="w-full bg-[#130713] border border-purple-900/60 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-300 block">Buton Yönlendirme Hedefi</label>
          <select
            value={aktifOge.butonHedefi || 'kesfet'}
            onChange={(e) => ogeyiGuncelle({ butonHedefi: e.target.value })}
            className="w-full bg-[#130713] border border-purple-900/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
          >
            <option value="kesfet">Sayfadaki Yemeklere / Mutfaklara Kaydır</option>
            <option value="kampanyalar">Kampanyalar Sayfası</option>
            <option value="kayit">Giriş / Kayıt Ekranı</option>
          </select>
        </div>
      </div>

      {/* Şeffaf PNG Fotoğraf Yükleyici */}
      <div className="pt-2">
        <label className="text-xs font-bold text-amber-400 block mb-1">
          📸 Şeffaf Ürün / Lezzet Fotoğrafı Yükleyin (Arka plansız PNG önerilir)
        </label>
        <GorselDosyaYukleyici
          seciliGorsel={gorselUrl}
          onGorselSecildi={(yeniUrl) => ogeyiGuncelle({ gorsel_url: yeniUrl, gorselVerisi: yeniUrl, gorselUrl: yeniUrl })}
        />
      </div>
    </div>
  );
};
