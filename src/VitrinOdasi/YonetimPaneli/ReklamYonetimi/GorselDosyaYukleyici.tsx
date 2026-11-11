import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, Trash2, RefreshCw, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { sunucuyaGorselYukle, gorselUrlGuvenliYap, GorselKlasorTipi } from '@/src/MalzemeCekmeceleri/sunucuGorselYukleyici';

interface GorselDosyaYukleyiciProps {
  seciliGorsel: string;
  onGorselSecildi: (gorselVerisi: string) => void;
  klasorTipi?: GorselKlasorTipi;
}

export const GorselDosyaYukleyici: React.FC<GorselDosyaYukleyiciProps> = ({
  seciliGorsel,
  onGorselSecildi,
  klasorTipi = 'afisler'
}) => {
  const dosyaGirdiReferansi = useRef<HTMLInputElement>(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hataMesaji, setHataMesaji] = useState<string | null>(null);

  const dosyaSecimiOldu = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const dosya = e.target.files?.[0];
    if (!dosya) return;

    if (!dosya.type.startsWith('image/')) {
      setHataMesaji('Lütfen geçerli bir görsel dosyası seçin (PNG, JPG, WebP).');
      return;
    }

    setHataMesaji(null);
    setYukleniyor(true);

    try {
      const sonuc = await sunucuyaGorselYukle(dosya, klasorTipi);
      if (sonuc.basarili && sonuc.url) {
        onGorselSecildi(sonuc.url);
      } else {
        setHataMesaji(sonuc.hata || 'Görsel yüklenemedi.');
      }
    } catch (err: any) {
      setHataMesaji(err.message || 'Görsel yüklenirken bir sorun oluştu.');
    } finally {
      setYukleniyor(false);
      if (dosyaGirdiReferansi.current) {
        dosyaGirdiReferansi.current.value = '';
      }
    }
  };

  const gorselVar = Boolean(seciliGorsel && seciliGorsel.trim().length > 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
          <Upload className="w-4 h-4 text-amber-400" />
          <span>Fotoğraf Yükle (Otomatik WebP & Sunucu Kaydı)</span>
        </label>
        {yukleniyor ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>WebP Sıkıştırılıyor & Yükleniyor...</span>
          </span>
        ) : gorselVar ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>WebP Yüklendi</span>
          </span>
        ) : null}
      </div>

      {hataMesaji && (
        <div className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{hataMesaji}</span>
        </div>
      )}

      {/* Gizli Dosya Giriş Alanı */}
      <input
        ref={dosyaGirdiReferansi}
        type="file"
        accept="image/*"
        onChange={dosyaSecimiOldu}
        disabled={yukleniyor}
        className="hidden"
      />

      {gorselVar ? (
        /* 🖼️ GÖRSEL YÜKLÜYKEN: Canlı Önizleme Kutusu */
        <div className="border border-purple-800/80 rounded-xl p-3 bg-[#140616] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 w-full sm:w-auto">
            {/* Önizleme Küçük Resmi */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-[#0D040E] border border-purple-700/60 flex items-center justify-center p-1.5 overflow-hidden shrink-0 shadow-inner">
              <img
                src={gorselUrlGuvenliYap(seciliGorsel)}
                alt="Yüklenen Görsel Önizleme"
                className="w-full h-full object-contain bg-transparent select-none"
              />
            </div>
            {/* Açıklama */}
            <div>
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>Yüklenen Görsel Önizlemesi</span>
              </p>
              <p className="text-[11px] text-purple-300/70 mt-0.5">
                Görsel başarıyla seçildi ve bu alana tanımlandı.
              </p>
            </div>
          </div>

          {/* Değiştir / Kaldır Butonları */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => dosyaGirdiReferansi.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-xs font-bold text-amber-300 border border-purple-700/60 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Görseli Değiştir</span>
            </button>
            <button
              type="button"
              onClick={() => onGorselSecildi('')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-xs font-bold text-red-400 border border-red-800/50 transition-all cursor-pointer"
              title="Görseli Kaldır"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Kaldır</span>
            </button>
          </div>
        </div>
      ) : (
        /* 📂 GÖRSEL YOKKEN: Boş Yükleme Alanı */
        <div
          onClick={() => dosyaGirdiReferansi.current?.click()}
          className="border-2 border-dashed border-purple-800/80 hover:border-amber-400 rounded-xl p-5 bg-[#140616] hover:bg-[#1a081d] transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group text-center"
        >
          <div className="p-3 rounded-full bg-purple-900/50 group-hover:bg-amber-400/20 text-amber-400 transition-colors">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-white group-hover:text-amber-300">
              Bilgisayarınızdan veya Telefonunuzdan Fotoğraf Seçin
            </p>
            <p className="text-[11px] text-purple-300/70">
              JPG, PNG, WebP formatında görsel yükleyin (Şeffaf PNG önerilir)
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
