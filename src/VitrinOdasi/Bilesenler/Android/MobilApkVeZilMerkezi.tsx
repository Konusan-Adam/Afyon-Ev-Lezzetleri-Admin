import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  RefreshCw,
  Music,
  ShieldCheck,
  Volume2,
  BatteryCharging,
} from 'lucide-react';
import { useApkGuncelleme } from '@/src/MalzemeCekmeceleri/Android/useApkGuncelleme';
import {
  aktifZilSesiniCal,
  androidOrtamindaMi,
  pilKisitlamasiniKaldir,
  zilAyarlariniGetir,
} from '@/src/MalzemeCekmeceleri/Android/AndroidKopruServisi';
import { HAZIR_ZIL_SECENEKLERI } from '@/src/MalzemeCekmeceleri/Android/ZilSesiOynatici';
import { ZilSesiSecVeEkleModali } from './ZilSesiSecVeEkleModali';

export const MobilApkVeZilMerkezi: React.FC = () => {
  const { meta, kuruluSurum, kontrolEdiliyor, indirVeKur, simdiKontrolEt } = useApkGuncelleme();
  const [zilModaliAcik, setZilModaliAcik] = useState(false);
  const androidIcinde = androidOrtamindaMi();
  const mevcutZil = zilAyarlariniGetir();

  const seciliZilEtiketi =
    mevcutZil.seciliKimlik === 'ozel'
      ? mevcutZil.ozelSesAdi || 'Özel Yüklenen Ses'
      : HAZIR_ZIL_SECENEKLERI.find((z) => z.kimlik === mevcutZil.seciliKimlik)?.ad || 'Acil Sipariş Sireni';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Android APK İndirme & Güncelleme Kartı */}
        <div className="p-5 rounded-2xl bg-[#180A1F] border border-[#3E1646] space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">Afyon Patron Native Android APK</h3>
                <p className="text-[11px] text-purple-300">
                  Capacitor olmadan saf Android arka plan servisi ile imzalı APK
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={simdiKontrolEt}
              disabled={kontrolEdiliyor}
              className="min-h-[36px] px-2.5 py-1.5 rounded-xl bg-[#120614] border border-purple-900/60 text-purple-200 hover:text-white text-xs font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${kontrolEdiliyor ? 'animate-spin' : ''}`} />
              <span>Yenile</span>
            </button>
          </div>

          {meta ? (
            <div className="p-3.5 rounded-xl bg-[#120614] border border-purple-900/50 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Paket Kimliği:</span>
                <span className="font-mono text-amber-300 text-[11px]">{meta.paketKimligi}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Sürüm / Boyut:</span>
                <span className="font-bold text-white tabular-nums">
                  v{meta.surumAdi} • {meta.boyutMb} MB
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">İmza Durumu:</span>
                <span className="text-emerald-300 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>JAR v1 + APK v2/v3</span>
                </span>
              </div>
              {kuruluSurum && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Cihazdaki Sürüm:</span>
                  <span className="text-sky-300 font-bold">v{kuruluSurum.surumAdi}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-[#120614] border border-purple-900/50 text-xs text-gray-400">
              APK paketi henüz oluşturulmadı. Derlemek için <code className="text-amber-300">npm run build && npm run build:apk</code> çalıştırın.
            </div>
          )}

          <button
            type="button"
            onClick={indirVeKur}
            disabled={!meta}
            className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-gray-950 font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{androidIcinde ? 'Uygulamayı Güncelle / Kur' : `${meta?.apkDosyaAdi || 'afyon-admin.apk'} İndir`}</span>
          </button>
        </div>

        {/* Zil Sesi & Arka Plan Alarm Yönetimi */}
        <div className="p-5 rounded-2xl bg-[#180A1F] border border-[#3E1646] space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-800/30 border border-purple-600/40 flex items-center justify-center text-amber-300 shrink-0">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">Arka Plan Zil & Siren Ayarları</h3>
              <p className="text-[11px] text-purple-300">
                Ekran kapalıyken çalacak zil sesini seçin veya cihazınızdan özel ses yükleyin
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#120614] border border-purple-900/50 space-y-2 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-gray-400">Aktif Melodi:</span>
              <span className="font-bold text-amber-300 truncate">{seciliZilEtiketi}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Ses Seviyesi:</span>
              <span className="font-mono font-bold text-white tabular-nums">
                %{Math.round(mevcutZil.sesSeviyesi * 100)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setZilModaliAcik(true)}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-[#7B258B] hover:bg-[#8C2B9E] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Music className="w-4 h-4" />
              <span>Zil Sesi Seç & Ekle</span>
            </button>

            <button
              type="button"
              onClick={() => aktifZilSesiniCal('Alarm Testi', 'Afyon Patron arka plan alarm testi', androidIcinde)}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-[#120614] hover:bg-[#240C28] border border-purple-800/60 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              <span>Zili Test Et</span>
            </button>
          </div>

          {androidIcinde && (
            <button
              type="button"
              onClick={pilKisitlamasiniKaldir}
              className="w-full min-h-[40px] px-4 py-2 rounded-xl bg-sky-950/40 border border-sky-700/50 text-sky-200 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <BatteryCharging className="w-4 h-4 text-sky-400" />
              <span>Pil Kısıtlamasından Muafiyet İste</span>
            </button>
          )}
        </div>
      </div>

      <ZilSesiSecVeEkleModali
        acikMi={zilModaliAcik}
        onKapat={() => setZilModaliAcik(false)}
      />
    </div>
  );
};
