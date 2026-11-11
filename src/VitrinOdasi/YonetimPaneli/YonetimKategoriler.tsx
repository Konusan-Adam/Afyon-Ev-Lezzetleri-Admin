import React, { useState } from 'react';
import { Layers, Plus, Trash2, ChevronRight, Tag, Image as ImageIcon, Check, Loader2, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { 
  kategorileriGetir, 
  Kategori, 
  kategoriEkleIslemi, 
  kategoriGuncelleIslemi, 
  kategoriSilIslemi 
} from '@/src/MalzemeCekmeceleri/kategorileriGetir';
import { GorselSeciciVeYukleyici, HAZIR_AFYON_TABAKLARI } from './KategoriBilesenleri/GorselSeciciVeYukleyici';
import { AltKategoriDuzenleyici } from './KategoriBilesenleri/AltKategoriDuzenleyici';
import { gorselUrlGuvenliYap } from '@/src/MalzemeCekmeceleri/sunucuGorselYukleyici';

export const YonetimKategoriler: React.FC = () => {
  const { kategoriler: anaKategoriler, altKategoriler, yenile } = kategorileriGetir();
  const [seciliUstKategori, setSeciliUstKategori] = useState<string>('kat-hamur');

  // Bildirim Durumu
  const [bildirim, setBildirim] = useState<{ tip: 'basarili' | 'hata'; mesaj: string } | null>(null);
  const [islemSuruyor, setIslemSuruyor] = useState<boolean>(false);
  const [silinecekKategori, setSilinecekKategori] = useState<{ id: string; ad: string } | null>(null);

  // Yeni Ana Kategori Formu
  const [yeniKatAd, setYeniKatAd] = useState('');
  const [yeniKatIkon, setYeniKatIkon] = useState('🥐');
  const [yeniKatResim, setYeniKatResim] = useState(HAZIR_AFYON_TABAKLARI[0].url);
  const [yeniKatFormAcik, setYeniKatFormAcik] = useState(false);

  // Seçili Kategori Görsel Düzenleme
  const [gorselDuzenlemeAcik, setGorselDuzenlemeAcik] = useState(false);
  const [geciciDuzenlenenResim, setGeciciDuzenlenenResim] = useState<string>('');

  const seciliKategoriNesnesi = anaKategoriler.find((k) => k.id === seciliUstKategori) || anaKategoriler[0];

  const bildirimGoster = (tip: 'basarili' | 'hata', mesaj: string) => {
    setBildirim({ tip, mesaj });
    setTimeout(() => {
      setBildirim(null);
    }, 3500);
  };

  const anaKategoriEkle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!yeniKatAd.trim()) return;

    setIslemSuruyor(true);
    const yeniId = 'kat-' + Date.now();
    const yeniKategori: Kategori = {
      id: yeniId,
      ad: yeniKatAd.trim(),
      ikon: yeniKatIkon.trim() || '🍽️',
      resim_url: yeniKatResim || HAZIR_AFYON_TABAKLARI[6].url,
      sira: anaKategoriler.length + 1
    };

    const sonuc = await kategoriEkleIslemi(yeniKategori);
    setIslemSuruyor(false);

    if (sonuc.basarili) {
      bildirimGoster('basarili', `"${yeniKategori.ad}" kategorisi başarıyla eklendi ve kaydedildi.`);
      setSeciliUstKategori(yeniId);
      setYeniKatAd('');
      setYeniKatFormAcik(false);
      yenile();
    } else {
      bildirimGoster('hata', `Kategori eklenemedi: ${sonuc.hata || 'Bilinmeyen hata'}`);
    }
  };

  const anaKategoriSilOnayla = async () => {
    if (!silinecekKategori) return;

    if (anaKategoriler.length <= 1) {
      bildirimGoster('hata', 'Sistemde en az 1 ana kategori bulunmalıdır.');
      setSilinecekKategori(null);
      return;
    }

    const { id, ad } = silinecekKategori;
    setIslemSuruyor(true);
    const sonuc = await kategoriSilIslemi(id);
    setIslemSuruyor(false);
    setSilinecekKategori(null);

    if (sonuc.basarili) {
      bildirimGoster('basarili', `"${ad}" kategorisi ve bağlı alt dalları başarıyla silindi.`);
      if (seciliUstKategori === id) {
        const kalan = anaKategoriler.filter((k) => k.id !== id);
        setSeciliUstKategori(kalan[0]?.id || '');
      }
      yenile();
    } else {
      bildirimGoster('hata', `Kategori silinemedi: ${sonuc.hata || 'Bilinmeyen hata'}`);
    }
  };

  const kategoriResmiGuncelle = async (yeniUrl: string) => {
    if (!seciliKategoriNesnesi) return;

    setIslemSuruyor(true);
    const sonuc = await kategoriGuncelleIslemi(seciliKategoriNesnesi.id, { resim_url: yeniUrl });
    setIslemSuruyor(false);

    if (sonuc.basarili) {
      bildirimGoster('basarili', `"${seciliKategoriNesnesi.ad}" tabağı güncellendi.`);
      setGorselDuzenlemeAcik(false);
      yenile();
    } else {
      bildirimGoster('hata', `Görsel güncellenemedi: ${sonuc.hata || 'Bilinmeyen hata'}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Canlı Bildirim Çubuğu */}
      {bildirim && (
        <div
          className={`p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all animate-in fade-in slide-in-from-top duration-200 border ${
            bildirim.tip === 'basarili'
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/80 border-rose-500/50 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {bildirim.tip === 'basarili' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span className="text-xs sm:text-sm font-bold">{bildirim.mesaj}</span>
          </div>
        </div>
      )}

      {/* Üst Bilgi Barı */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#180A1F] border border-[#3E1646]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-900/40 border border-purple-700/50 flex items-center justify-center text-amber-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-white font-bold text-sm flex items-center gap-2">
              Kategori, Alt Dal ve Mobil Görsel Yönetimi
              <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full font-extrabold border border-amber-400/30">
                Süper Admin Tezgâhı
              </span>
            </h2>
            <p className="text-xs text-purple-300">
              Vitrindeki ana kategorileri, alt çeşitlerini ve mobil/tabletteki iştah açıcı yuvarlak tabak görsellerini buradan özelleştirebilir, hazır tabaklar seçebilir veya cihazınızdan görsel yükleyebilirsiniz.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setYeniKatFormAcik(!yeniKatFormAcik)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#6D237A] to-[#882C99] hover:brightness-110 text-white text-xs font-bold transition-all shadow-md cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Ana Kategori</span>
        </button>
      </div>

      {/* Yeni Ana Kategori Ekleme Çekmecesi */}
      {yeniKatFormAcik && (
        <form onSubmit={anaKategoriEkle} className="p-4 sm:p-5 rounded-2xl bg-[#200A28] border border-amber-500/40 space-y-4 shadow-xl animate-in fade-in">
          <div className="flex items-center justify-between border-b border-purple-900/40 pb-2">
            <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              Yeni Ana Kategori ve Görsel Tanımla
            </h4>
            <button
              type="button"
              onClick={() => setYeniKatFormAcik(false)}
              className="text-purple-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-1">
              <label className="text-[10px] text-purple-300 block mb-1">İkon (Emoji)</label>
              <input
                type="text"
                value={yeniKatIkon}
                onChange={(e) => setYeniKatIkon(e.target.value)}
                placeholder="Örn: 🥐"
                className="w-full bg-[#14061A] border border-purple-800/40 rounded-xl px-3 py-2 text-center text-lg text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="sm:col-span-3">
              <label className="text-[10px] text-purple-300 block mb-1">Kategori Adı</label>
              <input
                type="text"
                value={yeniKatAd}
                onChange={(e) => setYeniKatAd(e.target.value)}
                placeholder="Örn: Haşhaşlı Hamur İşleri & Börekler"
                className="w-full bg-[#14061A] border border-purple-800/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                required
              />
            </div>
          </div>

          {/* 3 Modlu Görsel Seçici ve Yükleyici */}
          <GorselSeciciVeYukleyici
            seciliUrl={yeniKatResim}
            onGorselSec={(url) => setYeniKatResim(url)}
            baslik="Kategori Vitrin Tabağı (Hazır Seç, Cihazdan Yükle veya Link Gir)"
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setYeniKatFormAcik(false)}
              className="px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300 text-xs font-medium cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={islemSuruyor}
              className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-purple-950 font-bold text-xs cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              {islemSuruyor ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              <span>{islemSuruyor ? 'Kaydediliyor...' : 'Kategoriyi Kaydet'}</span>
            </button>
          </div>
        </form>
      )}

      {/* 2 Sütunlu Hiyerarşi Tezgâhı */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SOL: Ana Kategoriler Listesi */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-purple-200 px-1">
            <span>1. Ana Kategoriler ({anaKategoriler.length})</span>
            <span className="text-[10px] text-purple-400">Yönetmek için tıkla</span>
          </div>

          <div className="space-y-2">
            {anaKategoriler.map((kat) => {
              const seciliMi = kat.id === seciliUstKategori;
              const altSayisi = altKategoriler.filter((a) => a.ust_kategori_id === kat.id).length;

              return (
                <div
                  key={kat.id}
                  onClick={() => {
                    setSeciliUstKategori(kat.id);
                    setGorselDuzenlemeAcik(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                    seciliMi
                      ? 'bg-gradient-to-r from-[#3D1445] to-[#551C60] border-amber-400/60 shadow-lg text-white'
                      : 'bg-[#180A1F] border-[#3E1646] hover:border-purple-600/50 text-gray-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Mobil Tabak Görseli Küçük Önizleme */}
                    <div className="relative w-11 h-11 rounded-full bg-purple-950/80 border border-amber-400/50 flex items-center justify-center p-1 shrink-0 overflow-hidden shadow">
                      {kat.resim_url ? (
                        <img src={gorselUrlGuvenliYap(kat.resim_url)} alt={kat.ad} className="w-full h-full object-contain drop-shadow" />
                      ) : (
                        <span className="text-xl">{kat.ikon}</span>
                      )}
                    </div>

                    <div>
                      <div className="font-bold text-xs flex items-center gap-1.5">
                        <span>{kat.ikon}</span>
                        <span>{kat.ad}</span>
                      </div>
                      <div className="text-[10px] text-purple-300 flex items-center gap-1.5 mt-0.5">
                        <Tag className="w-3 h-3 text-amber-400" />
                        <span>{altSayisi} Alt Kategori</span>
                        {kat.resim_url?.startsWith('data:image') && (
                          <span className="text-[9px] bg-amber-400/20 text-amber-300 px-1.5 rounded">Özel Görsel</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {kat.id !== 'hepsi' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSilinecekKategori({ id: kat.id, ad: kat.ad });
                        }}
                        disabled={islemSuruyor}
                        className="p-1.5 rounded-lg text-purple-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Kategoriyi Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <ChevronRight className={`w-4 h-4 transition-transform ${seciliMi ? 'text-amber-400 translate-x-1' : 'text-purple-600'}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SAĞ: Seçili Ana Kategoriye Ait Detay, Görsel Özelleştirme ve Alt Kategoriler */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-[#180A1F] border border-[#3E1646] space-y-5">
            {/* Seçili Kategori Üst Bilgisi & Mobil Resim Ayarı */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-purple-900/30">
              <div className="flex items-center gap-3.5">
                <div className="relative w-14 h-14 rounded-full bg-purple-950 border-2 border-amber-400 shadow-[0_0_14px_rgba(251,191,36,0.25)] flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                  <img
                    src={gorselUrlGuvenliYap(seciliKategoriNesnesi?.resim_url || HAZIR_AFYON_TABAKLARI[6].url)}
                    alt={seciliKategoriNesnesi?.ad}
                    className="w-full h-full object-contain drop-shadow"
                  />
                  <span className="absolute -bottom-1 -right-1 text-xs bg-purple-900 rounded-full px-1 border border-purple-700">
                    {seciliKategoriNesnesi?.ikon}
                  </span>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-amber-400 font-extrabold">
                    Seçili Kategori & Vitrin Tabağı
                  </div>
                  <h3 className="text-sm font-extrabold text-white">
                    {seciliKategoriNesnesi?.ad}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setGeciciDuzenlenenResim(seciliKategoriNesnesi?.resim_url || HAZIR_AFYON_TABAKLARI[0].url);
                      setGorselDuzenlemeAcik(!gorselDuzenlemeAcik);
                    }}
                    className="text-[11px] text-amber-300 hover:text-amber-200 underline font-semibold flex items-center gap-1 mt-0.5 cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Görseli Değiştir / Bilgisayardan Yükle</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Görsel Değiştirme Modülü (Hazır Tabak, Dosya Yükleme veya Link) */}
            {gorselDuzenlemeAcik && (
              <div className="p-4 rounded-2xl bg-[#220B2A] border border-amber-400/50 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300">
                    "{seciliKategoriNesnesi?.ad}" İçin Yeni Görsel Seçin veya Yükleyin:
                  </span>
                  <button
                    type="button"
                    onClick={() => setGorselDuzenlemeAcik(false)}
                    className="text-purple-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <GorselSeciciVeYukleyici
                  seciliUrl={geciciDuzenlenenResim || seciliKategoriNesnesi?.resim_url || ''}
                  onGorselSec={(yeniUrl) => setGeciciDuzenlenenResim(yeniUrl)}
                  baslik="Seçili Kategori Vitrin Tabağı"
                />

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setGorselDuzenlemeAcik(false)}
                    className="px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300 text-xs font-medium cursor-pointer"
                  >
                    İptal
                  </button>
                  <button
                    type="button"
                    onClick={() => kategoriResmiGuncelle(geciciDuzenlenenResim)}
                    disabled={islemSuruyor}
                    className="px-4 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-purple-950 font-bold text-xs cursor-pointer shadow-sm flex items-center gap-1.5"
                  >
                    {islemSuruyor ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    <span>{islemSuruyor ? 'Kaydediliyor...' : 'Yeni Görseli Kaydet'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Alt Kategoriler ve Çeşitler Modüler Yöneticisi */}
            <AltKategoriDuzenleyici
              seciliUstKategoriId={seciliUstKategori || seciliKategoriNesnesi?.id || 'kat-hamur'}
              seciliUstKategoriAd={seciliKategoriNesnesi?.ad || ''}
              altKategoriler={altKategoriler}
              onYenile={yenile}
              onBildirim={bildirimGoster}
            />
          </div>
        </div>
      </div>

      {/* Ana Kategori Silme Onay Modalı */}
      {silinecekKategori && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#1C0822] border-2 border-rose-500/60 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-500/50 flex items-center justify-center text-rose-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-white font-bold text-sm">
                  Kategoriyi Silmek İstediğinize Emin Misiniz?
                </h3>
                <p className="text-xs text-purple-200">
                  <span className="font-extrabold text-amber-300">"{silinecekKategori.ad}"</span> ana kategorisi ve bu kategoriye bağlı tüm alt dallar silinecektir.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-900/40 text-[11px] text-rose-300">
              Bu işlem geri alınamaz. Vitrinde bu kategori ve ona bağlı alt başlıklar anında kaldırılacaktır.
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSilinecekKategori(null)}
                disabled={islemSuruyor}
                className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold cursor-pointer transition-colors"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={anaKategoriSilOnayla}
                disabled={islemSuruyor}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg transition-colors"
              >
                {islemSuruyor ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>{islemSuruyor ? 'Siliniyor...' : 'Evet, Kategoriyi Sil'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
