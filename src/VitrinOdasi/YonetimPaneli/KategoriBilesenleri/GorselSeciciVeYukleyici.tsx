import React, { useState, useRef } from 'react';
import { UploadCloud, Link as LinkIcon, Sparkles, Check, Image as ImageIcon, RotateCcw, AlertTriangle } from 'lucide-react';
import { sunucuyaGorselYukle, GorselKlasorTipi, gorselUrlGuvenliYap } from '@/src/MalzemeCekmeceleri/sunucuGorselYukleyici';

export const HAZIR_AFYON_TABAKLARI = [
  { ad: 'Bükme & Hamur İşi', url: 'https://pngimg.com/uploads/pie/pie_PNG51.png' },
  { ad: 'Keşkek & Sıcak Yemek', url: 'https://pngimg.com/uploads/soup/soup_PNG86.png' },
  { ad: 'Sucuk & Kebap', url: 'https://pngimg.com/uploads/kebab/kebab_PNG48.png' },
  { ad: 'Ekmek Kadayıfı & Tatlı', url: 'https://pngimg.com/uploads/pancake/pancake_PNG98.png' },
  { ad: 'Köy Çorbası & Arabaşı', url: 'https://pngimg.com/uploads/soup/soup_PNG109.png' },
  { ad: 'Ayran & Vişne Şerbeti', url: 'https://pngimg.com/uploads/cocktail/cocktail_PNG72.png' },
  { ad: 'Geleneksel Sofra Tabağı', url: 'https://pngimg.com/uploads/plate/plate_PNG5337.png' }
];

interface GorselSeciciVeYukleyiciProps {
  seciliUrl: string;
  onGorselSec: (yeniUrl: string) => void;
  baslik?: string;
  klasorTipi?: GorselKlasorTipi;
  onYukleniyor?: (durum: boolean) => void;
}

export const GorselSeciciVeYukleyici: React.FC<GorselSeciciVeYukleyiciProps> = ({
  seciliUrl,
  onGorselSec,
  baslik = 'Kategori Görseli Seçin veya Yükleyin',
  klasorTipi = 'kategoriler',
  onYukleniyor,
}) => {
  const [aktifSekme, setAktifSekme] = useState<'hazir' | 'yukle' | 'url'>('hazir');
  const [manuelUrl, setManuelUrl] = useState('');
  const [yuklemeHatasi, setYuklemeHatasi] = useState<string | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [suruklemeAktif, setSuruklemeAktif] = useState(false);
  const dosyaGirdiRef = useRef<HTMLInputElement>(null);

  // Görseli WebP formatına sıkıştırıp sunucuya veya yedeğe yükler
  const dosyayiIsleVeAyarla = async (dosya: File) => {
    setYuklemeHatasi(null);
    setYukleniyor(true);
    onYukleniyor?.(true);

    try {
      const sonuc = await sunucuyaGorselYukle(dosya, klasorTipi);
      if (sonuc.basarili && sonuc.url) {
        onGorselSec(sonuc.url);
      } else {
        setYuklemeHatasi(sonuc.hata || 'Görsel yüklenemedi.');
      }
    } catch (hata: any) {
      setYuklemeHatasi(hata?.message || 'Görsel aktarılamadı.');
    } finally {
      setYukleniyor(false);
      onYukleniyor?.(false);
    }
  };

  const dosyaDegisti = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dosya = e.target.files?.[0];
    if (dosya) {
      dosyayiIsleVeAyarla(dosya);
    }
  };

  const surukleBirak = (e: React.DragEvent) => {
    e.preventDefault();
    setSuruklemeAktif(false);
    const dosya = e.dataTransfer.files?.[0];
    if (dosya) {
      dosyayiIsleVeAyarla(dosya);
    }
  };

  const urlKaydet = (e?: React.FormEvent | React.MouseEvent | React.KeyboardEvent) => {
    if (e && 'preventDefault' in e) e.preventDefault();
    if (!manuelUrl.trim()) return;
    onGorselSec(manuelUrl.trim());
    setManuelUrl('');
  };

  return (
    <div className="space-y-3 p-3.5 rounded-2xl bg-[#1A0720] border border-purple-900/50">
      {/* Üst Başlık & Sekmeler */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-900/40 pb-2.5">
        <label className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
          <span>{baslik}</span>
        </label>

        {/* 3 Seçim Sekmesi */}
        <div className="flex items-center gap-1 p-0.5 rounded-xl bg-[#120516] border border-purple-900/60 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setAktifSekme('hazir')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
              aktifSekme === 'hazir'
                ? 'bg-amber-400 text-purple-950 shadow-sm'
                : 'text-purple-300 hover:text-white'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Hazır Tabaklar</span>
          </button>

          <button
            type="button"
            onClick={() => setAktifSekme('yukle')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
              aktifSekme === 'yukle'
                ? 'bg-amber-400 text-purple-950 shadow-sm'
                : 'text-purple-300 hover:text-white'
            }`}
          >
            <UploadCloud className="w-3 h-3" />
            <span>Dosya Yükle</span>
          </button>

          <button
            type="button"
            onClick={() => setAktifSekme('url')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
              aktifSekme === 'url'
                ? 'bg-amber-400 text-purple-950 shadow-sm'
                : 'text-purple-300 hover:text-white'
            }`}
          >
            <LinkIcon className="w-3 h-3" />
            <span>Görsel Linki</span>
          </button>
        </div>
      </div>

      {/* SEKME 1: Hazır Afyon Tabakları */}
      {aktifSekme === 'hazir' && (
        <div className="space-y-2">
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {HAZIR_AFYON_TABAKLARI.map((tabak, idx) => {
              const seciliMi = seciliUrl === tabak.url;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onGorselSec(tabak.url)}
                  className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer relative group ${
                    seciliMi
                      ? 'bg-purple-900/70 border-amber-400 ring-2 ring-amber-400/50 shadow-md'
                      : 'bg-[#120516] border-purple-900/40 hover:border-purple-700/80 hover:scale-105'
                  }`}
                >
                  <img src={tabak.url} alt={tabak.ad} className="w-9 h-9 object-contain drop-shadow" />
                  <span className="text-[8px] text-center text-gray-300 line-clamp-1 group-hover:text-amber-200">
                    {tabak.ad}
                  </span>
                  {seciliMi && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 text-purple-950 rounded-full flex items-center justify-center font-bold text-[9px] shadow">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* SEKME 2: Bilgisayar / Telefondan Görsel Yükle */}
      {aktifSekme === 'yukle' && (
        <div className="space-y-2">
          <input
            type="file"
            ref={dosyaGirdiRef}
            onChange={dosyaDegisti}
            accept="image/*,.jpg,.jpeg,.png,.webp,.heic,.heif"
            className="hidden"
          />

          <div
            onDragOver={(e) => { e.preventDefault(); setSuruklemeAktif(true); }}
            onDragLeave={() => setSuruklemeAktif(false)}
            onDrop={surukleBirak}
            onClick={() => dosyaGirdiRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-4 sm:p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
              suruklemeAktif
                ? 'border-amber-400 bg-amber-400/10 scale-[1.01]'
                : 'border-purple-800/60 hover:border-amber-400/60 bg-[#120516]'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-purple-950 border border-purple-700/60 flex items-center justify-center text-amber-400">
              <UploadCloud className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">
                Görseli buraya sürükleyin veya <span className="text-amber-400 underline">cihazınızdan seçin</span>
              </p>
              <p className="text-[10px] text-purple-300 mt-0.5">
                PNG (şeffaf tabaklar için ideal), JPG veya WEBP • Otomatik optimize edilir
              </p>
            </div>
            {yukleniyor && (
              <span className="text-xs text-amber-400 font-bold animate-pulse">Görsel optimize ediliyor...</span>
            )}
          </div>

          {yuklemeHatasi && (
            <div className="text-[11px] text-rose-300 bg-rose-950/60 border border-rose-800/50 rounded-xl p-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{yuklemeHatasi}</span>
            </div>
          )}
        </div>
      )}

      {/* SEKME 3: Doğrudan URL Gir */}
      {aktifSekme === 'url' && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="url"
              value={manuelUrl}
              onChange={(e) => setManuelUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  urlKaydet(e);
                }
              }}
              placeholder="https://orneksite.com/gorsel.png"
              className="flex-1 bg-[#120516] border border-purple-900/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
            />
            <button
              type="button"
              onClick={urlKaydet}
              className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-bold text-xs cursor-pointer shadow-sm flex items-center gap-1 shrink-0"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Uygula</span>
            </button>
          </div>
          <p className="text-[10px] text-purple-400">
            İnternetteki şeffaf arka planlı bir yemek tabağı linkini yapıştırabilirsiniz.
          </p>
        </div>
      )}

      {/* Seçili Görsel ve Canlı Mobil Tabak Önizlemesi */}
      <div className="pt-2 border-t border-purple-900/40 flex items-center justify-between gap-3 bg-[#130516]/60 p-2.5 rounded-xl">
        <div className="flex items-center gap-3">
          {/* Mobil Yuvarlak Tabak Canlı Simülasyonu */}
          <div className="relative w-12 h-12 rounded-full bg-[#1e0725] border-2 border-amber-400/80 shadow-[0_0_12px_rgba(251,191,36,0.3)] flex items-center justify-center p-1 overflow-hidden shrink-0">
            {seciliUrl ? (
              <img
                src={gorselUrlGuvenliYap(seciliUrl)}
                alt="Tabak Önizleme"
                className="w-full h-full object-contain drop-shadow"
              />
            ) : (
              <ImageIcon className="w-5 h-5 text-purple-500" />
            )}
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-wider text-amber-400 font-extrabold">
              Canlı Mobil Vitrin Önizlemesi
            </div>
            <div className="text-[11px] font-bold text-white">
              {seciliUrl.startsWith('/api/uploads') || seciliUrl.includes('yedek.pazarafyon.com.tr')
                ? 'Sunucuya Yüklenen Görsel (cPanel / uploads)'
                : seciliUrl.startsWith('data:image')
                ? 'Özel Yüklenen Görsel (Cihazdan)'
                : HAZIR_AFYON_TABAKLARI.find((t) => t.url === seciliUrl)?.ad || 'Özel Bağlantı / URL'}
            </div>
          </div>
        </div>

        {/* Varsayılana Sıfırla */}
        {seciliUrl !== HAZIR_AFYON_TABAKLARI[6].url && (
          <button
            type="button"
            onClick={() => onGorselSec(HAZIR_AFYON_TABAKLARI[6].url)}
            className="flex items-center gap-1 text-[10px] text-purple-400 hover:text-amber-300 font-medium transition-colors cursor-pointer"
            title="Standart tabağa sıfırla"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Sıfırla</span>
          </button>
        )}
      </div>
    </div>
  );
};
