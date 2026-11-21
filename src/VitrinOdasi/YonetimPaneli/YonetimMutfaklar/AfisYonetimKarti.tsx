import React from 'react';
import {
  Check,
  X,
  Edit3,
  Trash2,
  ArrowUp,
  ArrowDown,
  Store,
  EyeOff,
} from 'lucide-react';
import {
  afisDurumunuGetir,
  type MutfakAfisiKaydi,
} from '@/src/MalzemeCekmeceleri/useCanliMutfakAfisleri';
import { RESMI_MUTFAK_LOGOSU } from '@/src/MalzemeCekmeceleri/Mutfak/resmiMutfakLogosu';
import { gorselUrlGuvenliYap } from '@/src/MalzemeCekmeceleri/sunucuGorselYukleyici';

interface AfisYonetimKartiProps {
  afis: MutfakAfisiKaydi;
  index: number;
  toplam: number;
  onaylaVeYayinla: (afis: MutfakAfisiKaydi) => void;
  reddetModalAc: (afis: MutfakAfisiKaydi) => void;
  duzenleModalAc: (afis: MutfakAfisiKaydi) => void;
  silModalAc: (afis: MutfakAfisiKaydi) => void;
  siraDegistir: (afis: MutfakAfisiKaydi, yon: -1 | 1) => void;
}

export const AfisYonetimKarti: React.FC<AfisYonetimKartiProps> = ({
  afis,
  index,
  toplam,
  onaylaVeYayinla,
  reddetModalAc,
  duzenleModalAc,
  silModalAc,
  siraDegistir,
}) => {
  const durum = afisDurumunuGetir(afis);
  const yayindaMi = durum === 'yayinda';
  const reddedildiMi = durum === 'reddedildi';
  const onayliPasifMi = durum === 'onayli_pasif';
  const redMetni = afis.red_nedeni || afis.red_gerekcesi || '';
  const gorselSrc = afis.gorsel_url
    ? gorselUrlGuvenliYap(afis.gorsel_url)
    : RESMI_MUTFAK_LOGOSU;

  const durumEtiketi = yayindaMi
    ? 'Yayında (Vitrin)'
    : onayliPasifMi
    ? 'Onaylı / Pasif'
    : reddedildiMi
    ? 'Reddedildi / Kaldırıldı'
    : 'Onay Bekliyor';

  const durumSinifi = yayindaMi
    ? 'bg-emerald-950/90 text-emerald-300 border-emerald-700/70'
    : onayliPasifMi
    ? 'bg-slate-900 text-slate-300 border-slate-700'
    : reddedildiMi
    ? 'bg-rose-950/90 text-rose-300 border-rose-700/70'
    : 'bg-amber-950/90 text-amber-300 border-amber-700/70';

  return (
    <div
      className={`p-4 rounded-2xl bg-[#180A1F] border transition-colors flex flex-col justify-between gap-3.5 ${
        yayindaMi
          ? 'border-emerald-500/40'
          : reddedildiMi
          ? 'border-rose-500/40 bg-[#200912]'
          : 'border-amber-500/45'
      }`}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-purple-200 min-w-0">
            <Store className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-bold truncate">{afis.mutfak_adi || 'Ev Mutfağı'}</span>
            <span aria-hidden="true" className="text-purple-500">·</span>
            <span className="font-mono tabular-nums text-[11px] text-amber-300 font-bold shrink-0">
              Sıra #{afis.sira ?? index + 1}
            </span>
          </div>

          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${durumSinifi}`}>
            {durumEtiketi}
          </span>
        </div>

        <div className="relative rounded-xl overflow-hidden h-44 border border-purple-900/60 bg-black">
          <img
            src={gorselSrc}
            alt={afis.baslik}
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.src = RESMI_MUTFAK_LOGOSU;
            }}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent p-3.5 flex flex-col justify-end">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
              {afis.rozet || 'ÖZEL LEZZET'}
            </span>
            <h4 className="text-sm font-black text-white leading-snug line-clamp-2">
              {afis.baslik}
            </h4>
          </div>
        </div>

        <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
          {afis.aciklama || 'Açıklama girilmedi.'}
        </p>

        {reddedildiMi && redMetni && (
          <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800/70 text-rose-200 text-[11px]">
            <span className="font-bold">Red / Kaldırma Nedeni: </span>
            <span>{redMetni}</span>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-purple-950/90 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => siraDegistir(afis, -1)}
            className="p-1.5 rounded-lg bg-[#120614] border border-purple-900 text-purple-200 hover:text-amber-300 hover:border-amber-500/50 disabled:opacity-35 cursor-pointer disabled:cursor-not-allowed"
            title="Sırayı Yukarı Taşı"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={index === toplam - 1}
            onClick={() => siraDegistir(afis, 1)}
            className="p-1.5 rounded-lg bg-[#120614] border border-purple-900 text-purple-200 hover:text-amber-300 hover:border-amber-500/50 disabled:opacity-35 cursor-pointer disabled:cursor-not-allowed"
            title="Sırayı Aşağı Taşı"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center flex-wrap gap-1.5">
          {!yayindaMi && (
            <button
              type="button"
              onClick={() => onaylaVeYayinla(afis)}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Onayla / Yayına Al</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => reddetModalAc(afis)}
            className="px-2.5 py-1.5 rounded-xl bg-rose-950/90 hover:bg-rose-900 border border-rose-800 text-rose-200 font-bold text-[11px] flex items-center gap-1 cursor-pointer whitespace-nowrap"
          >
            {yayindaMi ? <EyeOff className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
            <span>{yayindaMi ? 'Yayından Kaldır' : 'Reddet'}</span>
          </button>

          <button
            type="button"
            onClick={() => duzenleModalAc(afis)}
            className="px-2.5 py-1.5 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-700 text-amber-300 font-bold text-[11px] flex items-center gap-1 cursor-pointer whitespace-nowrap"
            title="Afişi Düzenle"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Düzenle</span>
          </button>

          <button
            type="button"
            onClick={() => silModalAc(afis)}
            className="p-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-900 text-rose-300 cursor-pointer"
            title="Afişi Kalıcı Sil"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
