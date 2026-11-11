import React, { useState } from 'react';
import { 
  footerAyariniGetir, 
  footerAyariniKaydet, 
  FooterAyar, 
  VARSAYILAN_FOOTER_AYARI 
} from '../MasaustuAltBilgi/footerVeritabani';
import { 
  LayoutTemplate, 
  Save, 
  RotateCcw, 
  Check, 
  Building2, 
  ShieldCheck, 
  Share2, 
  Link as LinkIcon, 
  Sparkles, 
  PhoneCall, 
  FileText 
} from 'lucide-react';
import { FooterGenelBilgiler } from './FooterYonetimBilesenleri/FooterGenelBilgiler';
import { FooterSosyalMedyaYonetimi } from './FooterYonetimBilesenleri/FooterSosyalMedyaYonetimi';
import { FooterAvantajRozetleri } from './FooterYonetimBilesenleri/FooterAvantajRozetleri';
import { FooterKolonVeLinkler } from './FooterYonetimBilesenleri/FooterKolonVeLinkler';
import { FooterOzelHizmetler } from './FooterYonetimBilesenleri/FooterOzelHizmetler';
import { FooterIletisimVeDurum } from './FooterYonetimBilesenleri/FooterIletisimVeDurum';
import { FooterSozlesmeLinkleri } from './FooterYonetimBilesenleri/FooterSozlesmeLinkleri';

type AltSekme = 'tumu' | 'genel' | 'rozetler' | 'sosyal' | 'kolonlar' | 'ozel_hizmetler' | 'iletisim' | 'sozlesmeler';

export const YonetimFooter: React.FC = () => {
  const [ayar, setAyar] = useState<FooterAyar>(footerAyariniGetir());
  const [basariliMesaji, setBasariliMesaji] = useState<string | null>(null);
  const [aktifSekme, setAktifSekme] = useState<AltSekme>('tumu');

  const kaydet = () => {
    footerAyariniKaydet(ayar);
    setBasariliMesaji('Footer ayarları eksiksiz kaydedildi ve canlı vitrine yansıtıldı!');
    setTimeout(() => setBasariliMesaji(null), 3500);
  };

  const varsayilanaDon = () => {
    if (confirm('Tüm footer ayarlarını fabrika varsayılanlarına döndürmek istediğinize emin misiniz?')) {
      setAyar(VARSAYILAN_FOOTER_AYARI);
      footerAyariniKaydet(VARSAYILAN_FOOTER_AYARI);
      setBasariliMesaji('Fabrika ayarlarına dönüldü.');
      setTimeout(() => setBasariliMesaji(null), 3000);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      
      {/* 🌟 ÜST KONTROL BARı */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-[#180A1F] border border-[#3E1646] shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <LayoutTemplate className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <span>Footer (Alt Bilgi) Tam Kontrol Masası</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                %100 Dinamik
              </span>
            </h3>
            <p className="text-xs text-purple-300">
              Web sitesi altındaki her bir yazıyı, logoyu, 4'lü rozetleri, sosyal medyayı, kolonları ve iletişim hattını yönetin.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={varsayilanaDon}
            className="px-3.5 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Fabrika Ayarları</span>
          </button>

          <button
            type="button"
            onClick={kaydet}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-gray-950 font-extrabold text-xs flex items-center gap-1.5 cursor-pointer hover:brightness-110 shadow-lg shadow-amber-500/20 transition-transform active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Değişiklikleri Kaydet</span>
          </button>
        </div>
      </div>

      {/* Başarı Mesajı */}
      {basariliMesaji && (
        <div className="p-4 rounded-xl bg-emerald-950/90 border border-emerald-500/80 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-xl animate-bounce">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{basariliMesaji}</span>
        </div>
      )}

      {/* Kategori Filtre Butonları */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setAktifSekme('tumu')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
            aktifSekme === 'tumu'
              ? 'bg-amber-500 text-gray-950 shadow-md'
              : 'bg-[#180A1F] border border-purple-900/60 text-purple-300 hover:text-white'
          }`}
        >
          Tüm Ayarlar (Tek Sayfa)
        </button>

        <button
          type="button"
          onClick={() => setAktifSekme('genel')}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 cursor-pointer transition-all ${
            aktifSekme === 'genel'
              ? 'bg-purple-900 text-white border border-purple-600'
              : 'bg-[#180A1F] border border-purple-900/60 text-purple-300 hover:text-white'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Genel & Logo</span>
        </button>

        <button
          type="button"
          onClick={() => setAktifSekme('rozetler')}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 cursor-pointer transition-all ${
            aktifSekme === 'rozetler'
              ? 'bg-purple-900 text-white border border-purple-600'
              : 'bg-[#180A1F] border border-purple-900/60 text-purple-300 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>4'lü Avantaj Rozetleri</span>
        </button>

        <button
          type="button"
          onClick={() => setAktifSekme('sosyal')}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 cursor-pointer transition-all ${
            aktifSekme === 'sosyal'
              ? 'bg-purple-900 text-white border border-purple-600'
              : 'bg-[#180A1F] border border-purple-900/60 text-purple-300 hover:text-white'
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Sosyal Medya</span>
        </button>

        <button
          type="button"
          onClick={() => setAktifSekme('kolonlar')}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 cursor-pointer transition-all ${
            aktifSekme === 'kolonlar'
              ? 'bg-purple-900 text-white border border-purple-600'
              : 'bg-[#180A1F] border border-purple-900/60 text-purple-300 hover:text-white'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>Dinamik Kolonlar</span>
        </button>

        <button
          type="button"
          onClick={() => setAktifSekme('ozel_hizmetler')}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 cursor-pointer transition-all ${
            aktifSekme === 'ozel_hizmetler'
              ? 'bg-purple-900 text-white border border-purple-600'
              : 'bg-[#180A1F] border border-purple-900/60 text-purple-300 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Özel Hizmetler</span>
        </button>

        <button
          type="button"
          onClick={() => setAktifSekme('iletisim')}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 cursor-pointer transition-all ${
            aktifSekme === 'iletisim'
              ? 'bg-purple-900 text-white border border-purple-600'
              : 'bg-[#180A1F] border border-purple-900/60 text-purple-300 hover:text-white'
          }`}
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>İletişim & Durum</span>
        </button>

        <button
          type="button"
          onClick={() => setAktifSekme('sozlesmeler')}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 cursor-pointer transition-all ${
            aktifSekme === 'sozlesmeler'
              ? 'bg-purple-900 text-white border border-purple-600'
              : 'bg-[#180A1F] border border-purple-900/60 text-purple-300 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Sözleşmeler</span>
        </button>
      </div>

      {/* MODÜLER BÖLÜMLER */}
      <div className="space-y-6">
        {(aktifSekme === 'tumu' || aktifSekme === 'genel') && (
          <FooterGenelBilgiler ayar={ayar} guncelle={setAyar} />
        )}

        {(aktifSekme === 'tumu' || aktifSekme === 'rozetler') && (
          <FooterAvantajRozetleri ayar={ayar} guncelle={setAyar} />
        )}

        {(aktifSekme === 'tumu' || aktifSekme === 'sosyal') && (
          <FooterSosyalMedyaYonetimi ayar={ayar} guncelle={setAyar} />
        )}

        {(aktifSekme === 'tumu' || aktifSekme === 'kolonlar') && (
          <FooterKolonVeLinkler ayar={ayar} guncelle={setAyar} />
        )}

        {(aktifSekme === 'tumu' || aktifSekme === 'ozel_hizmetler') && (
          <FooterOzelHizmetler ayar={ayar} guncelle={setAyar} />
        )}

        {(aktifSekme === 'tumu' || aktifSekme === 'iletisim') && (
          <FooterIletisimVeDurum ayar={ayar} guncelle={setAyar} />
        )}

        {(aktifSekme === 'tumu' || aktifSekme === 'sozlesmeler') && (
          <FooterSozlesmeLinkleri ayar={ayar} guncelle={setAyar} />
        )}
      </div>

      {/* Alt Hızlı Kaydet Butonu */}
      <div className="p-4 rounded-2xl bg-[#180A1F] border border-[#3E1646] flex items-center justify-between">
        <span className="text-xs text-purple-300">
          Değişikliklerin canlı web sitesinde hemen görünmesi için kaydetmeyi unutmayın.
        </span>
        <button
          type="button"
          onClick={kaydet}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-gray-950 font-extrabold text-xs flex items-center gap-1.5 cursor-pointer hover:brightness-110 shadow-lg shadow-amber-500/20"
        >
          <Save className="w-4 h-4" />
          <span>Tüm Değişiklikleri Kaydet</span>
        </button>
      </div>

    </div>
  );
};
