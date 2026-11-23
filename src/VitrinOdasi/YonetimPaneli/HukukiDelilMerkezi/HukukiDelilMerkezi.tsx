import React, { useMemo, useState } from 'react';
import { ShieldCheck, Lock, FileSpreadsheet, History } from 'lucide-react';
import { HukukiOnayLogu } from '@/src/MalzemeCekmeceleri/HukukVeSozlesmeler/tipler';
import { useCanliHukukiDeliller } from '@/src/MalzemeCekmeceleri/HukukVeSozlesmeler/useCanliHukukiDeliller';
import {
  HukukiDelilFiltreDurumu,
  hukukiDelilleriFiltrele,
  hukukiDelilOzetHesapla,
} from '@/src/MalzemeCekmeceleri/HukukVeSozlesmeler/hukukiDelilFiltreYardimcisi';
import {
  delilCsvIndir,
  delilJsonIndir,
} from '@/src/MalzemeCekmeceleri/HukukVeSozlesmeler/hukukiDelilCiktiServisi';
import { HukukiDelilOzetKartlari } from './HukukiDelilOzetKartlari';
import { HukukiDelilFiltreBari } from './HukukiDelilFiltreBari';
import { HukukiDelilTablosu } from './HukukiDelilTablosu';
import { SozlesmeVersiyonGecmisi } from './SozlesmeVersiyonGecmisi';
import { DelilDetayVeKiyaslamaModali } from './DelilDetayVeKiyaslamaModali';
import { ResmiDelilTutanagiYazdir } from './ResmiDelilTutanagiYazdir';

type AltGorunum = 'kayitlar' | 'versiyonlar';

export const HukukiDelilMerkezi: React.FC = () => {
  const { loglar, sozlesmeHaritasi, yukleniyor } = useCanliHukukiDeliller();
  const [altGorunum, setAltGorunum] = useState<AltGorunum>('kayitlar');
  const [filtre, setFiltre] = useState<HukukiDelilFiltreDurumu>({
    arama: '',
    islemTuru: 'hepsi',
    damgaDurumu: 'hepsi',
    baslangicTarihi: '',
    bitisTarihi: '',
  });
  const [seciliLog, setSeciliLog] = useState<HukukiOnayLogu | null>(null);
  const [yazdirilacakLoglar, setYazdirilacakLoglar] = useState<HukukiOnayLogu[]>([]);

  const filtrelenenLoglar = useMemo(() => hukukiDelilleriFiltrele(loglar, filtre), [loglar, filtre]);
  const ozet = useMemo(() => hukukiDelilOzetHesapla(loglar), [loglar]);

  return (
    <div className="space-y-5">
      {/* Başlık ve Salt-Okunur Bilgilendirme */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#180A1F] border border-[#3E1646] rounded-2xl p-5 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-purple-700 flex items-center justify-center text-white shadow-lg shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-black text-white">Hukuki Delil & Zaman Damgası Çıktı Merkezi</h2>
              <span className="px-2.5 py-0.5 rounded-lg bg-rose-950/70 border border-rose-700/50 text-rose-200 text-[10px] font-bold inline-flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>Salt-Okunur (Değiştirilemez / Silinemez)</span>
              </span>
            </div>
            <p className="text-xs text-purple-200/80 mt-1">
              Canlı <code className="text-amber-300">hukuki_onay_loglari</code> ve <code className="text-amber-300">sozlesmeler</code> koleksiyonlarından beslenen resmi tutanak, CSV/JSON ve RFC 3161 (.tsr) çıktı merkezi.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#110514] p-1.5 rounded-xl border border-[#3E1646] shrink-0">
          <button
            type="button"
            onClick={() => setAltGorunum('kayitlar')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-all ${
              altGorunum === 'kayitlar'
                ? 'bg-amber-400 text-purple-950 shadow'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Onay & Delil Kayıtları</span>
          </button>
          <button
            type="button"
            onClick={() => setAltGorunum('versiyonlar')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-all ${
              altGorunum === 'versiyonlar'
                ? 'bg-amber-400 text-purple-950 shadow'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Sözleşme Versiyon Geçmişi</span>
          </button>
        </div>
      </div>

      {/* Üst Özet Kartları */}
      <HukukiDelilOzetKartlari ozet={ozet} />

      {altGorunum === 'kayitlar' ? (
        <>
          <HukukiDelilFiltreBari
            filtre={filtre}
            filtrelenenSayi={filtrelenenLoglar.length}
            onFiltreDegistir={setFiltre}
            onPdfYazdir={() => setYazdirilacakLoglar(filtrelenenLoglar)}
            onCsvIndir={() => delilCsvIndir(filtrelenenLoglar)}
            onJsonIndir={() => delilJsonIndir(filtrelenenLoglar)}
          />
          <HukukiDelilTablosu
            loglar={filtrelenenLoglar}
            yukleniyor={yukleniyor}
            onDetayAc={(log) => setSeciliLog(log)}
            onTekilYazdir={(log) => setYazdirilacakLoglar([log])}
          />
        </>
      ) : (
        <SozlesmeVersiyonGecmisi
          loglar={loglar}
          sozlesmeHaritasi={sozlesmeHaritasi}
          onDetayAc={(log) => setSeciliLog(log)}
          onTekilYazdir={(log) => setYazdirilacakLoglar([log])}
        />
      )}

      <DelilDetayVeKiyaslamaModali
        log={seciliLog}
        sozlesmeHaritasi={sozlesmeHaritasi}
        onKapat={() => setSeciliLog(null)}
        onYazdir={(log) => setYazdirilacakLoglar([log])}
      />

      <ResmiDelilTutanagiYazdir
        loglar={yazdirilacakLoglar}
        sozlesmeHaritasi={sozlesmeHaritasi}
        acikMi={yazdirilacakLoglar.length > 0}
        onKapat={() => setYazdirilacakLoglar([])}
      />
    </div>
  );
};
