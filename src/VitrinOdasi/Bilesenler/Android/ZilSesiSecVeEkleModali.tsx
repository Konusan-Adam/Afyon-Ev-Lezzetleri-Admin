import React, { useState, useRef } from 'react';
import {
  Volume2,
  Music,
  Upload,
  Play,
  Square,
  Check,
  X,
  BatteryCharging,
  Trash2,
} from 'lucide-react';
import {
  HAZIR_ZIL_SECENEKLERI,
  HazirZilKimligi,
  webZiliniCal,
} from '@/src/MalzemeCekmeceleri/Android/ZilSesiOynatici';
import {
  aktifZilSesiniSustur,
  androidOrtamindaMi,
  pilKisitlamasiniKaldir,
  zilAyarlariniGetir,
  zilAyarlariniKaydetVeSenkronizeEt,
} from '@/src/MalzemeCekmeceleri/Android/AndroidKopruServisi';

interface ZilSesiSecVeEkleModaliProps {
  acikMi: boolean;
  onKapat: () => void;
}

const AZAMI_SES_BOYUTU_BYTE = 2.5 * 1024 * 1024;

export const ZilSesiSecVeEkleModali: React.FC<ZilSesiSecVeEkleModaliProps> = ({
  acikMi,
  onKapat,
}) => {
  const baslangicAyar = zilAyarlariniGetir();
  const [seciliKimlik, setSeciliKimlik] = useState<HazirZilKimligi>(baslangicAyar.seciliKimlik);
  const [sesSeviyesi, setSesSeviyesi] = useState<number>(baslangicAyar.sesSeviyesi);
  const [ozelSesAdi, setOzelSesAdi] = useState<string>(baslangicAyar.ozelSesAdi || '');
  const [ozelSesVeriUrl, setOzelSesVeriUrl] = useState<string>(baslangicAyar.ozelSesVeriUrl || '');
  const [yuklemeHatasi, setYuklemeHatasi] = useState<string | null>(null);
  const [kaydedildiMesaji, setKaydedildiMesaji] = useState(false);

  const dosyaSeciciRef = useRef<HTMLInputElement | null>(null);
  const androidIcinde = androidOrtamindaMi();

  if (!acikMi) return null;

  const dosyaSecildi = (e: React.ChangeEvent<HTMLInputElement>) => {
    setYuklemeHatasi(null);
    const dosya = e.target.files?.[0];
    if (!dosya) return;

    if (dosya.size > AZAMI_SES_BOYUTU_BYTE) {
      setYuklemeHatasi('Ses dosyası en fazla 2.5 MB olabilir.');
      return;
    }

    const izinliUzanti = /\.(mp3|wav|ogg|m4a)$/i.test(dosya.name);
    if (!izinliUzanti && !dosya.type.startsWith('audio/')) {
      setYuklemeHatasi('Lütfen .mp3, .wav veya .ogg formatında bir ses dosyası seçin.');
      return;
    }

    const okuyucu = new FileReader();
    okuyucu.onload = () => {
      const sonuc = typeof okuyucu.result === 'string' ? okuyucu.result : '';
      if (!sonuc) {
        setYuklemeHatasi('Ses dosyası okunamadı.');
        return;
      }
      setOzelSesAdi(dosya.name);
      setOzelSesVeriUrl(sonuc);
      setSeciliKimlik('ozel');
      webZiliniCal('ozel', sesSeviyesi, sonuc);
    };
    okuyucu.onerror = () => setYuklemeHatasi('Ses dosyası yüklenirken hata oluştu.');
    okuyucu.readAsDataURL(dosya);
  };

  const ozelSesiKaldir = () => {
    setOzelSesAdi('');
    setOzelSesVeriUrl('');
    if (seciliKimlik === 'ozel') {
      setSeciliKimlik('acil_siren');
    }
    if (dosyaSeciciRef.current) {
      dosyaSeciciRef.current.value = '';
    }
  };

  const kaydet = () => {
    const basarili = zilAyarlariniKaydetVeSenkronizeEt({
      seciliKimlik,
      sesSeviyesi,
      ozelSesAdi: ozelSesAdi || undefined,
      ozelSesVeriUrl: ozelSesVeriUrl || undefined,
    });
    if (!basarili) {
      setYuklemeHatasi('Seçilen ses cihaz belleğine sığmadı, lütfen daha küçük bir dosya deneyin.');
      return;
    }
    setKaydedildiMesaji(true);
    setTimeout(() => {
      setKaydedildiMesaji(false);
      onKapat();
    }, 650);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3.5 sm:p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl bg-[#180A1F] border border-amber-500/40 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Başlık */}
        <div className="px-5 py-4 bg-[#120614] border-b border-[#3E1646] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Music className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-extrabold text-white truncate">
                Zil Sesi Seç & Ekle
              </h3>
              <p className="text-[11px] text-purple-300 truncate">
                Ekran kapalıyken çalacak Android alarm sesini belirleyin
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              aktifZilSesiniSustur();
              onKapat();
            }}
            className="min-w-[36px] min-h-[36px] rounded-xl bg-purple-950/70 text-gray-300 hover:text-white flex items-center justify-center cursor-pointer shrink-0"
            aria-label="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* İçerik */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          {/* Ses Seviyesi */}
          <div className="p-3.5 rounded-2xl bg-[#120614] border border-purple-900/50 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-amber-400" />
                Alarm Ses Seviyesi
              </span>
              <span className="font-mono font-bold text-amber-300 tabular-nums">
                %{Math.round(sesSeviyesi * 100)}
              </span>
            </div>
            <input
              type="range"
              min={0.2}
              max={1.0}
              step={0.05}
              value={sesSeviyesi}
              onChange={(e) => setSesSeviyesi(parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Hazır Melodiler */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-purple-300 uppercase tracking-wider">
              Hazır Alarm ve Zil Sesleri
            </div>
            <div className="space-y-2">
              {HAZIR_ZIL_SECENEKLERI.map((secenek) => {
                const secili = seciliKimlik === secenek.kimlik;
                return (
                  <div
                    key={secenek.kimlik}
                    onClick={() => setSeciliKimlik(secenek.kimlik)}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-2.5 cursor-pointer ${
                      secili
                        ? 'bg-[#2A0E33] border-amber-400/70'
                        : 'bg-[#120614] border-purple-900/50 hover:border-purple-700'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        {secili && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                        <span className="truncate">{secenek.ad}</span>
                      </div>
                      <p className="text-[11px] text-gray-400 truncate mt-0.5">
                        {secenek.aciklama}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSeciliKimlik(secenek.kimlik);
                        webZiliniCal(secenek.kimlik, sesSeviyesi);
                      }}
                      className="min-h-[36px] px-3 py-1.5 rounded-xl bg-purple-950 hover:bg-purple-800 border border-purple-700/60 text-amber-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <Play className="w-3 h-3" />
                      <span>Test Et</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Özel Ses Dosyası Yükle */}
          <div className="p-3.5 rounded-2xl bg-[#120614] border border-purple-900/60 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-bold text-white">Cihazdan Özel Zil Sesi Ekle</div>
              <span className="text-[10px] text-gray-400">MP3 / WAV / OGG (Maks. 2.5 MB)</span>
            </div>

            <input
              ref={dosyaSeciciRef}
              type="file"
              accept=".mp3,.wav,.ogg,audio/*"
              onChange={dosyaSecildi}
              className="hidden"
            />

            {ozelSesVeriUrl ? (
              <div
                onClick={() => setSeciliKimlik('ozel')}
                className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 cursor-pointer ${
                  seciliKimlik === 'ozel'
                    ? 'bg-emerald-950/40 border-emerald-500/60'
                    : 'bg-[#180A1F] border-purple-900/50'
                }`}
              >
                <div className="min-w-0 flex-1 flex items-center gap-2">
                  {seciliKimlik === 'ozel' && (
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  )}
                  <span className="text-xs font-semibold text-emerald-200 truncate">
                    {ozelSesAdi || 'Özel Yüklenen Ses'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSeciliKimlik('ozel');
                      webZiliniCal('ozel', sesSeviyesi, ozelSesVeriUrl);
                    }}
                    className="min-h-[32px] px-2.5 py-1 rounded-lg bg-emerald-900/60 text-emerald-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap"
                  >
                    <Play className="w-3 h-3" />
                    <span>Dinle</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      ozelSesiKaldir();
                    }}
                    className="min-h-[32px] min-w-[32px] p-1.5 rounded-lg bg-rose-950/70 text-rose-300 hover:bg-rose-900 flex items-center justify-center cursor-pointer"
                    title="Özel sesi sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => dosyaSeciciRef.current?.click()}
              className="w-full min-h-[42px] px-4 py-2 rounded-xl bg-[#240C28] hover:bg-[#311137] border border-dashed border-amber-500/50 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>{ozelSesVeriUrl ? 'Farklı Ses Dosyası Seç' : 'Telefon / Bilgisayardan Ses Seç'}</span>
            </button>

            {yuklemeHatasi && (
              <p className="text-[11px] text-rose-400 font-semibold">{yuklemeHatasi}</p>
            )}
          </div>

          {/* Android Pil Kısıtlaması Kaldırma */}
          {androidIcinde && (
            <button
              type="button"
              onClick={pilKisitlamasiniKaldir}
              className="w-full min-h-[42px] px-4 py-2 rounded-xl bg-sky-950/50 hover:bg-sky-900/60 border border-sky-700/50 text-sky-200 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <BatteryCharging className="w-4 h-4 text-sky-400" />
              <span>Android Pil Kısıtlamasından Muaf Tut</span>
            </button>
          )}
        </div>

        {/* Alt Aksiyonlar */}
        <div className="px-4 sm:px-5 py-3.5 bg-[#120614] border-t border-[#3E1646] flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={aktifZilSesiniSustur}
            className="min-h-[40px] px-3 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/70 border border-rose-800/60 text-rose-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Square className="w-3.5 h-3.5" />
            <span>Sustur</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onKapat}
              className="min-h-[40px] px-3.5 py-2 rounded-xl bg-purple-950/60 text-gray-300 text-xs font-bold cursor-pointer whitespace-nowrap"
            >
              İptal
            </button>
            <button
              type="button"
              onClick={kaydet}
              className="min-h-[40px] px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-gray-950 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-md"
            >
              <Check className="w-4 h-4" />
              <span>{kaydedildiMesaji ? 'Kaydedildi' : 'Kaydet ve Aktifleştir'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
