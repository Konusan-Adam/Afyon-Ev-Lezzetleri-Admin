import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Check, Loader2, Image as ImageIcon, X } from 'lucide-react';
import { AltKategori, altKategoriEkleIslemi, altKategoriGuncelleIslemi, altKategoriSilIslemi } from '@/src/MalzemeCekmeceleri/kategorileriGetir';
import { GorselSeciciVeYukleyici } from './GorselSeciciVeYukleyici';
import { gorselUrlGuvenliYap } from '@/src/MalzemeCekmeceleri/sunucuGorselYukleyici';

interface AltKategoriDuzenleyiciProps {
  seciliUstKategoriId: string;
  seciliUstKategoriAd: string;
  altKategoriler: AltKategori[];
  onYenile: () => void;
  onBildirim: (tip: 'basarili' | 'hata', mesaj: string) => void;
}

export const AltKategoriDuzenleyici: React.FC<AltKategoriDuzenleyiciProps> = ({
  seciliUstKategoriId,
  seciliUstKategoriAd,
  altKategoriler,
  onYenile,
  onBildirim
}) => {
  const [formAcik, setFormAcik] = useState(false);
  const [yeniAd, setYeniAd] = useState('');
  const [yeniIkon, setYeniIkon] = useState('✨');
  const [yeniResim, setYeniResim] = useState('');
  const [resimSeciciAcik, setResimSeciciAcik] = useState(false);
  const [islemSuruyor, setIslemSuruyor] = useState(false);
  const [silinecekAlt, setSilinecekAlt] = useState<{ id: string; ad: string } | null>(null);

  // Düzenleme durumu
  const [duzenlenenAlt, setDuzenlenenAlt] = useState<AltKategori | null>(null);

  const aktifAltlar = altKategoriler.filter((alt) => alt.ust_kategori_id === seciliUstKategoriId);

  const altKategoriEkle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!yeniAd.trim()) return;

    setIslemSuruyor(true);
    const yeniAlt: AltKategori = {
      id: 'alt-' + Date.now(),
      ust_kategori_id: seciliUstKategoriId,
      ad: yeniAd.trim(),
      ikon: yeniIkon.trim() || undefined,
      resim_url: yeniResim.trim() || undefined,
      sira: aktifAltlar.length + 1
    };

    const sonuc = await altKategoriEkleIslemi(yeniAlt);
    setIslemSuruyor(false);

    if (sonuc.basarili) {
      onBildirim('basarili', `"${yeniAlt.ad}" alt kategorisi başarıyla eklendi.`);
      setYeniAd('');
      setYeniResim('');
      setFormAcik(false);
      setResimSeciciAcik(false);
      onYenile();
    } else {
      onBildirim('hata', `Alt kategori eklenemedi: ${sonuc.hata || 'Bilinmeyen hata'}`);
    }
  };

  const altKategoriKaydet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!duzenlenenAlt || !duzenlenenAlt.ad.trim()) return;

    setIslemSuruyor(true);
    const sonuc = await altKategoriGuncelleIslemi(duzenlenenAlt.id, {
      ad: duzenlenenAlt.ad.trim(),
      ikon: duzenlenenAlt.ikon?.trim() || undefined,
      resim_url: duzenlenenAlt.resim_url?.trim() || undefined
    });
    setIslemSuruyor(false);

    if (sonuc.basarili) {
      onBildirim('basarili', `"${duzenlenenAlt.ad}" güncellendi.`);
      setDuzenlenenAlt(null);
      onYenile();
    } else {
      onBildirim('hata', `Güncellenemedi: ${sonuc.hata || 'Bilinmeyen hata'}`);
    }
  };

  const altSilOnayla = async () => {
    if (!silinecekAlt) return;

    const { id, ad } = silinecekAlt;
    setIslemSuruyor(true);
    const sonuc = await altKategoriSilIslemi(id);
    setIslemSuruyor(false);
    setSilinecekAlt(null);

    if (sonuc.basarili) {
      onBildirim('basarili', `"${ad}" alt kategorisi başarıyla silindi.`);
      onYenile();
    } else {
      onBildirim('hata', `Silinemedi: ${sonuc.hata || 'Bilinmeyen hata'}`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Üst Başlık & Ekle Butonu */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-extrabold text-white flex items-center gap-1.5">
            <span>Alt Kategoriler & Çeşitler</span>
            <span className="text-[10px] bg-purple-900/60 text-purple-200 px-2 py-0.5 rounded-full border border-purple-700/50">
              {aktifAltlar.length} Adet
            </span>
          </h4>
          <p className="text-[10px] text-purple-300">
            "{seciliUstKategoriAd}" altındaki tüm çeşitleri ve lezzet gruplarını buradan yönetin.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setFormAcik(!formAcik);
            setDuzenlenenAlt(null);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-900/60 hover:bg-purple-800/80 border border-purple-700/50 text-purple-200 hover:text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 text-amber-400" />
          <span>Alt Kategori Ekle</span>
        </button>
      </div>

      {/* Yeni Alt Kategori Formu */}
      {formAcik && (
        <form onSubmit={altKategoriEkle} className="p-4 rounded-2xl bg-[#220B2A] border border-amber-400/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300">
              "{seciliUstKategoriAd}" İçin Yeni Alt Kategori
            </span>
            <button
              type="button"
              onClick={() => setFormAcik(false)}
              className="text-purple-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            <div className="sm:col-span-1">
              <label className="text-[10px] text-purple-300 block mb-1">Emoji / İkon</label>
              <input
                type="text"
                value={yeniIkon}
                onChange={(e) => setYeniIkon(e.target.value)}
                placeholder="Örn: 🥟"
                className="w-full bg-[#14061A] border border-purple-800/40 rounded-xl px-3 py-2 text-center text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="sm:col-span-3">
              <label className="text-[10px] text-purple-300 block mb-1">Alt Kategori Adı</label>
              <input
                type="text"
                value={yeniAd}
                onChange={(e) => setYeniAd(e.target.value)}
                placeholder="Örn: Mercimekli & Haşhaşlı Bükmeler"
                className="w-full bg-[#14061A] border border-purple-800/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                required
                autoFocus
              />
            </div>
          </div>

          {/* Opsiyonel Görsel Belirleme Aç/Kapat */}
          <div>
            <button
              type="button"
              onClick={() => setResimSeciciAcik(!resimSeciciAcik)}
              className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>{resimSeciciAcik ? 'Görsel Seçiciyi Gizle' : 'Özel Görsel / Tabak Belirle (İsteğe Bağlı)'}</span>
            </button>
          </div>

          {resimSeciciAcik && (
            <GorselSeciciVeYukleyici
              seciliUrl={yeniResim}
              onGorselSec={(url) => setYeniResim(url)}
              baslik="Alt Kategoriye Özel Tabak / Görsel"
            />
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setFormAcik(false)}
              className="px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300 text-xs font-medium cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={islemSuruyor}
              className="px-4 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-purple-950 font-bold text-xs cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              {islemSuruyor ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              <span>{islemSuruyor ? 'Ekleniyor...' : 'Alt Kategoriyi Kaydet'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Düzenleme Modalı / Formu */}
      {duzenlenenAlt && (
        <form onSubmit={altKategoriKaydet} className="p-4 rounded-2xl bg-[#250B2E] border border-amber-400 shadow-xl space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-purple-900/40 pb-2">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5" />
              Alt Kategoriyi Düzenle: {duzenlenenAlt.ad}
            </span>
            <button
              type="button"
              onClick={() => setDuzenlenenAlt(null)}
              className="text-purple-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            <div className="sm:col-span-1">
              <label className="text-[10px] text-purple-300 block mb-1">İkon</label>
              <input
                type="text"
                value={duzenlenenAlt.ikon || ''}
                onChange={(e) => setDuzenlenenAlt({ ...duzenlenenAlt, ikon: e.target.value })}
                placeholder="Örn: 🥟"
                className="w-full bg-[#14061A] border border-purple-800/40 rounded-xl px-3 py-2 text-center text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="sm:col-span-3">
              <label className="text-[10px] text-purple-300 block mb-1">Alt Kategori Adı</label>
              <input
                type="text"
                value={duzenlenenAlt.ad}
                onChange={(e) => setDuzenlenenAlt({ ...duzenlenenAlt, ad: e.target.value })}
                className="w-full bg-[#14061A] border border-purple-800/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                required
              />
            </div>
          </div>

          {/* Görsel Seçici */}
          <GorselSeciciVeYukleyici
            seciliUrl={duzenlenenAlt.resim_url || ''}
            onGorselSec={(url) => setDuzenlenenAlt({ ...duzenlenenAlt, resim_url: url })}
            baslik="Alt Kategori Görseli Değiştir veya Yükle"
          />

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setDuzenlenenAlt(null)}
              className="px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300 text-xs font-medium cursor-pointer"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={islemSuruyor}
              className="px-4 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-purple-950 font-bold text-xs cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              {islemSuruyor ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              <span>{islemSuruyor ? 'Güncelleniyor...' : 'Güncellemeleri Kaydet'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Alt Kategoriler Listesi */}
      {aktifAltlar.length === 0 ? (
        <div className="py-8 text-center text-xs text-purple-400 border border-dashed border-purple-900/40 rounded-2xl bg-[#14061A]/40">
          Bu ana kategoriye ait henüz alt kategori eklenmemiş. Yukarıdaki "Alt Kategori Ekle" butonuna basarak lezzet çeşitleri tanımlayabilirsiniz.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {aktifAltlar.map((alt) => (
            <div
              key={alt.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-[#1D0923] border border-purple-900/50 hover:border-amber-400/50 transition-all group shadow-sm"
            >
              <div className="flex items-center gap-2.5 truncate">
                {/* Görsel veya İkon */}
                <div className="w-8 h-8 rounded-xl bg-purple-950/80 border border-purple-800/60 flex items-center justify-center shrink-0 overflow-hidden">
                  {alt.resim_url ? (
                    <img src={gorselUrlGuvenliYap(alt.resim_url)} alt={alt.ad} className="w-7 h-7 object-contain drop-shadow" />
                  ) : (
                    <span className="text-base">{alt.ikon || '🍽️'}</span>
                  )}
                </div>

                <div className="truncate">
                  <div className="text-xs font-bold text-gray-200 group-hover:text-white truncate">
                    {alt.ad}
                  </div>
                  <div className="text-[9px] text-purple-400">
                    {alt.resim_url ? 'Özel Tabaklı' : alt.ikon ? `İkon: ${alt.ikon}` : 'Standart'}
                  </div>
                </div>
              </div>

              {/* İşlem Düğmeleri */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setDuzenlenenAlt(alt)}
                  className="p-1.5 rounded-lg text-purple-300 hover:text-amber-300 hover:bg-purple-900/50 transition-colors"
                  title="Alt Kategoriyi ve Görselini Düzenle"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setSilinecekAlt({ id: alt.id, ad: alt.ad })}
                  disabled={islemSuruyor}
                  className="p-1.5 rounded-lg text-purple-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                  title="Alt Kategoriyi Sil"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Alt Kategori Silme Onay Modalı */}
      {silinecekAlt && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#1C0822] border-2 border-rose-500/60 rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-950/80 border border-rose-500/50 flex items-center justify-center text-rose-400 shrink-0">
                <Trash2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-white font-bold text-xs">
                  Alt Kategoriyi Sil
                </h4>
                <p className="text-[11px] text-purple-200 mt-0.5">
                  <span className="font-bold text-amber-300">"{silinecekAlt.ad}"</span> alt çeşidini silmek istediğinize emin misiniz?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setSilinecekAlt(null)}
                disabled={islemSuruyor}
                className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={altSilOnayla}
                disabled={islemSuruyor}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                {islemSuruyor ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>{islemSuruyor ? 'Siliniyor...' : 'Evet, Sil'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
