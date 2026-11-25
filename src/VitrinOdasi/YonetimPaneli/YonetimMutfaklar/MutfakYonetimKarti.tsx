import React from 'react';
import { Star, MapPin, Eye, Trash2, Check, X, Clock } from 'lucide-react';
import { Mutfak } from '@/src/veritabani/VeriTipleri';
import { RESMI_MUTFAK_LOGOSU } from '@/src/MalzemeCekmeceleri/Mutfak/resmiMutfakLogosu';

interface MutfakYonetimKartiProps {
  mutfak: Mutfak & { askida_mi?: boolean };
  onBelgeAc: (mutfak: Mutfak) => void;
  onAskiyaAlDegistir: (mutfakId: string) => void;
  onMutfakSil: (mutfakId: string) => void;
  onMutfakOnayla: (mutfakId: string, onayVer: boolean) => void;
  onHijyenDegistir: (mutfakId: string) => void;
  onMuafiyetDegistir: (mutfakId: string) => void;
}

export const MutfakYonetimKarti: React.FC<MutfakYonetimKartiProps> = ({
  mutfak,
  onBelgeAc,
  onAskiyaAlDegistir,
  onMutfakSil,
  onMutfakOnayla,
  onHijyenDegistir,
  onMuafiyetDegistir,
}) => {
  const tamBelgeli = mutfak.hijyen_onayli_mi && mutfak.esnaf_muafiyet_onayli_mi;
  const askidaMi = Boolean(mutfak.askida_mi);
  const yasalOnayli = mutfak.onayli_mi === true || mutfak.onay_durumu === 'onaylandi';

  return (
    <div
      className={`p-4 rounded-2xl bg-[#180A1F] border transition-all flex flex-col justify-between gap-3 overflow-hidden ${
        askidaMi
          ? 'border-rose-900/80 bg-[#24090D]'
          : tamBelgeli
          ? 'border-[#3E1646] hover:border-amber-500/40'
          : 'border-amber-500/50 bg-[#210926]'
      }`}
    >
      {/* Üst Bilgi + Eylemler (Mobilde alt alta, geniş ekranda yan yana) */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <img
            src={RESMI_MUTFAK_LOGOSU}
            alt={mutfak.ad}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover border border-amber-500/40 shrink-0 bg-[#1D0A20]"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center flex-wrap gap-1.5">
              <h4 className="font-bold text-white text-sm leading-snug break-words">
                {mutfak.ad}
              </h4>
              <div className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 text-[10px] font-bold border border-amber-500/20 shrink-0 tabular-nums">
                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                <span>{mutfak.puan}</span>
              </div>
            </div>
            <p className="text-[11px] text-purple-300/80 flex items-center gap-1 mt-0.5 min-w-0">
              <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="truncate">{mutfak.adres}</span>
            </p>
            <div className="text-[11px] text-gray-400 mt-1 tabular-nums">
              Min: {mutfak.min_siparis_tutari} ₺ • Komisyon: %10
            </div>
          </div>
        </div>

        {/* Eylem Butonları + Yasal Durum Rozeti */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-purple-950/50 shrink-0">
          <span
            className={`px-2 py-0.5 rounded-md text-[10px] font-black border uppercase tracking-wide whitespace-nowrap sm:order-2 ${
              askidaMi
                ? 'bg-rose-950 text-rose-300 border-rose-700'
                : yasalOnayli
                ? 'bg-emerald-950/70 text-emerald-300 border-emerald-700'
                : 'bg-amber-950/80 text-amber-300 border-amber-600'
            }`}
          >
            {askidaMi ? 'Askıya Alındı' : yasalOnayli ? '✓ Yasal Onaylı' : 'Onay Bekliyor'}
          </span>

          <div className="flex items-center gap-1.5 sm:order-1">
            <button
              type="button"
              onClick={() => onBelgeAc(mutfak)}
              className="min-h-[34px] px-2.5 py-1 rounded-lg bg-purple-950/80 hover:bg-purple-800 border border-purple-700 text-purple-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Belgeler</span>
            </button>
            <button
              type="button"
              onClick={() => onAskiyaAlDegistir(mutfak.id)}
              className={`min-h-[34px] px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors whitespace-nowrap ${
                askidaMi
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900'
                  : 'bg-amber-950 text-amber-300 border border-amber-800 hover:bg-amber-900'
              }`}
              title="Mutfağı Askıya Al veya Aktif Et"
            >
              {askidaMi ? 'Aktif Et' : 'Askıya Al'}
            </button>
            <button
              type="button"
              onClick={() => onMutfakSil(mutfak.id)}
              className="min-h-[34px] min-w-[34px] p-1.5 rounded-lg bg-rose-950/60 border border-rose-900 text-rose-300 hover:bg-rose-900 cursor-pointer flex items-center justify-center shrink-0"
              title="Mutfağı Sil"
              aria-label="Mutfağı Sil"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Patron Onay / Red Eylem Barı */}
      {(mutfak.onay_durumu === 'beklemede' || mutfak.onayli_mi === false) && !askidaMi && (
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs">
          <span className="text-[11px] font-bold text-amber-300">Mutfak Başvurusu:</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onMutfakOnayla(mutfak.id, true)}
              className="min-h-[34px] px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer shadow-xs active:scale-95 whitespace-nowrap"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mutfağı Onayla</span>
            </button>
            <button
              type="button"
              onClick={() => onMutfakOnayla(mutfak.id, false)}
              className="min-h-[34px] px-2.5 py-1 rounded-lg bg-rose-900/80 hover:bg-rose-800 text-rose-200 font-bold text-[11px] flex items-center gap-1 cursor-pointer active:scale-95 whitespace-nowrap"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reddet</span>
            </button>
          </div>
        </div>
      )}

      {/* Alt Belge & Durum Barı */}
      <div className="pt-2.5 border-t border-purple-950/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
        <div className="flex items-center justify-between gap-2 bg-[#120614]/60 px-2.5 py-1.5 rounded-xl border border-purple-950/50">
          <span className="text-gray-400 text-[11px] whitespace-nowrap">Hijyen:</span>
          <button
            type="button"
            onClick={() => onHijyenDegistir(mutfak.id)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
              mutfak.hijyen_onayli_mi
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                : 'bg-rose-950 text-rose-300 border border-rose-800'
            }`}
          >
            {mutfak.hijyen_onayli_mi ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
            <span>{mutfak.hijyen_onayli_mi ? 'MEB Onaylı' : 'Eksik'}</span>
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 bg-[#120614]/60 px-2.5 py-1.5 rounded-xl border border-purple-950/50">
          <span className="text-gray-400 text-[11px] whitespace-nowrap">Vergi Muafiyet:</span>
          <button
            type="button"
            onClick={() => onMuafiyetDegistir(mutfak.id)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
              mutfak.esnaf_muafiyet_onayli_mi
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                : 'bg-amber-950 text-amber-300 border border-amber-700'
            }`}
          >
            {mutfak.esnaf_muafiyet_onayli_mi ? (
              <Check className="w-3 h-3" />
            ) : (
              <Clock className="w-3 h-3" />
            )}
            <span>{mutfak.esnaf_muafiyet_onayli_mi ? 'GVK 9/10 Onaylı' : 'Bekliyor'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
