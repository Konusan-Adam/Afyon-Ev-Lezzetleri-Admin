import React, { useState } from 'react';
import {
  Store,
  Building,
  Megaphone,
  Wallet,
  SlidersHorizontal,
  Plus,
  Search,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';

export type MutfakAltSekme =
  | 'ev_mutfaklari'
  | 'ticari_mutfaklar'
  | 'mutfak_afisleri'
  | 'hakedisler_odemeler';

export type MutfakFiltreDurumu = 'hepsi' | 'onayli' | 'belge_bekleyen' | 'askida';

interface MobilMutfakAracCubuguProps {
  altSekme: MutfakAltSekme;
  onAltSekmeSec: (sekme: MutfakAltSekme) => void;
  filtre: MutfakFiltreDurumu;
  onFiltreSec: (filtre: MutfakFiltreDurumu) => void;
  arama: string;
  onAramaDegistir: (metin: string) => void;
  mutfakSayisi: number;
  bekleyenAfisSayisi: number;
  bekleyenHakedisSayisi: number;
  gorunurMu: boolean;
  sayfaAsagidaMi: boolean;
  onYeniMutfakAc: () => void;
}

const SEKME_ETIKETLERI: Record<MutfakAltSekme, string> = {
  ev_mutfaklari: 'Ev Mutfakları',
  ticari_mutfaklar: 'Ticari Mutfaklar',
  mutfak_afisleri: 'Afişler & Vitrin',
  hakedisler_odemeler: 'Hakediş & Ödemeler',
};

export const MobilMutfakAracCubugu: React.FC<MobilMutfakAracCubuguProps> = ({
  altSekme,
  onAltSekmeSec,
  filtre,
  onFiltreSec,
  arama,
  onAramaDegistir,
  mutfakSayisi,
  bekleyenAfisSayisi,
  bekleyenHakedisSayisi,
  gorunurMu,
  sayfaAsagidaMi,
  onYeniMutfakAc,
}) => {
  const [cekmeceAcik, setCekmeceAcik] = useState(false);

  const mutfakListesiAktif =
    altSekme !== 'hakedisler_odemeler' && altSekme !== 'mutfak_afisleri';
  const aktifFiltreVar = filtre !== 'hepsi' || arama.trim().length > 0;
  const yuzenBarGoster = sayfaAsagidaMi && (gorunurMu || cekmeceAcik);

  const icerikKarti = (
    <div className="rounded-2xl bg-[#180A1F]/95 backdrop-blur-md border border-[#3E1646] shadow-lg overflow-hidden">
      {/* İnce Tek Satır Üst Şerit */}
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <button
          type="button"
          onClick={() => setCekmeceAcik((onceki) => !onceki)}
          className="flex items-center gap-2 min-w-0 min-h-[38px] text-left cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <Store className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-extrabold text-white truncate">Mutfak Yönetimi</div>
            <div className="text-[10px] text-purple-300 truncate flex items-center gap-1">
              <span>{SEKME_ETIKETLERI[altSekme]}</span>
              {mutfakListesiAktif && <span>({mutfakSayisi})</span>}
            </div>
          </div>
        </button>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setCekmeceAcik((onceki) => !onceki)}
            className={`relative min-h-[38px] px-2.5 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap ${
              cekmeceAcik || aktifFiltreVar
                ? 'bg-[#7B258B] border-purple-500/60 text-white'
                : 'bg-[#120614] border-purple-900/70 text-purple-200 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
            <span>Filtre</span>
            {aktifFiltreVar && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" aria-hidden="true" />
            )}
            {cekmeceAcik ? (
              <ChevronUp className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 shrink-0" />
            )}
          </button>

          {mutfakListesiAktif && (
            <button
              type="button"
              onClick={onYeniMutfakAc}
              className="min-h-[38px] px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-[#130713] font-extrabold text-[11px] flex items-center gap-1 cursor-pointer shadow-sm whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span>Ekle</span>
            </button>
          )}
        </div>
      </div>

      {/* Açılır/Kapanır Sekme, Filtre & Arama Çekmecesi */}
      {cekmeceAcik && (
        <div className="px-3 pb-3 pt-2 border-t border-[#3E1646]/80 space-y-2.5 bg-[#120614]/80">
          {/* Alt Sekmeler */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => {
                onAltSekmeSec('ev_mutfaklari');
                setCekmeceAcik(false);
              }}
              className={`min-h-[34px] px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                altSekme === 'ev_mutfaklari'
                  ? 'bg-[#7B258B] text-white'
                  : 'bg-[#180A1F] text-gray-300 border border-purple-900/50'
              }`}
            >
              <Store className="w-3.5 h-3.5 shrink-0" />
              <span>Ev Mutfakları ({mutfakSayisi})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onAltSekmeSec('ticari_mutfaklar');
                setCekmeceAcik(false);
              }}
              className={`min-h-[34px] px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                altSekme === 'ticari_mutfaklar'
                  ? 'bg-[#7B258B] text-white'
                  : 'bg-[#180A1F] text-gray-300 border border-purple-900/50'
              }`}
            >
              <Building className="w-3.5 h-3.5 shrink-0" />
              <span>Ticari Mutfaklar</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onAltSekmeSec('mutfak_afisleri');
                setCekmeceAcik(false);
              }}
              className={`min-h-[34px] px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                altSekme === 'mutfak_afisleri'
                  ? 'bg-[#7B258B] text-white'
                  : 'bg-[#180A1F] text-gray-300 border border-purple-900/50'
              }`}
            >
              <Megaphone className="w-3.5 h-3.5 shrink-0" />
              <span>Afişler ({bekleyenAfisSayisi})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onAltSekmeSec('hakedisler_odemeler');
                setCekmeceAcik(false);
              }}
              className={`min-h-[34px] px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                altSekme === 'hakedisler_odemeler'
                  ? 'bg-amber-600 text-gray-950 font-black'
                  : 'bg-[#180A1F] text-gray-300 border border-purple-900/50'
              }`}
            >
              <Wallet className="w-3.5 h-3.5 shrink-0" />
              <span>Hakediş ({bekleyenHakedisSayisi})</span>
            </button>
          </div>

          {mutfakListesiAktif && (
            <>
              {/* Durum Filtreleri */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => onFiltreSec('hepsi')}
                  className={`min-h-[34px] px-3 py-1 rounded-lg text-[11px] font-bold cursor-pointer whitespace-nowrap shrink-0 ${
                    filtre === 'hepsi'
                      ? 'bg-[#7B258B] text-white'
                      : 'bg-[#180A1F] text-gray-400 border border-purple-900/50'
                  }`}
                >
                  Tümü
                </button>
                <button
                  type="button"
                  onClick={() => onFiltreSec('onayli')}
                  className={`min-h-[34px] px-3 py-1 rounded-lg text-[11px] font-bold cursor-pointer whitespace-nowrap shrink-0 ${
                    filtre === 'onayli'
                      ? 'bg-emerald-800 text-white'
                      : 'bg-[#180A1F] text-gray-400 border border-purple-900/50'
                  }`}
                >
                  ✓ Tam Belgeli
                </button>
                <button
                  type="button"
                  onClick={() => onFiltreSec('belge_bekleyen')}
                  className={`min-h-[34px] px-3 py-1 rounded-lg text-[11px] font-bold cursor-pointer whitespace-nowrap shrink-0 ${
                    filtre === 'belge_bekleyen'
                      ? 'bg-amber-600 text-gray-950 font-black'
                      : 'bg-[#180A1F] text-gray-400 border border-purple-900/50'
                  }`}
                >
                  ⚠️ Belge Bekleyen
                </button>
                <button
                  type="button"
                  onClick={() => onFiltreSec('askida')}
                  className={`min-h-[34px] px-3 py-1 rounded-lg text-[11px] font-bold cursor-pointer whitespace-nowrap shrink-0 ${
                    filtre === 'askida'
                      ? 'bg-rose-700 text-white'
                      : 'bg-[#180A1F] text-gray-400 border border-purple-900/50'
                  }`}
                >
                  🔒 Askıda
                </button>
              </div>

              {/* Arama */}
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={arama}
                  onChange={(e) => onAramaDegistir(e.target.value)}
                  placeholder="Mutfak veya mahalle ara..."
                  className="w-full min-h-[38px] bg-[#180A1F] border border-purple-900/70 rounded-xl pl-9 pr-8 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
                />
                {arama && (
                  <button
                    type="button"
                    onClick={() => onAramaDegistir('')}
                    aria-label="Aramayı temizle"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Normal akışta tepe şerit: kısa sayfalarda kartların üstüne asla binmez */}
      <div className="lg:hidden relative z-20">{icerikKarti}</div>

      {/* Uzun sayfalarda aşağı indikten sonra sadece yukarı kaydırırken beliren yüzen şerit */}
      <div
        aria-hidden={!yuzenBarGoster}
        className={`lg:hidden fixed top-[61px] inset-x-0 z-30 px-3.5 sm:px-4 pt-1.5 transition-all duration-200 ease-out will-change-transform ${
          yuzenBarGoster
            ? 'translate-y-0 opacity-100'
            : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        {icerikKarti}
      </div>
    </>
  );
};
