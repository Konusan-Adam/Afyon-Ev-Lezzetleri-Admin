import React, { useMemo, useState } from 'react';
import { History, Eye, Printer, FileKey2, ShieldCheck } from 'lucide-react';
import { HukukiOnayLogu, HukukiSozlesme } from '@/src/MalzemeCekmeceleri/HukukVeSozlesmeler/tipler';
import { sunucuZamaniBicimlendir } from '@/src/MalzemeCekmeceleri/HukukVeSozlesmeler/useCanliHukukiDeliller';
import { damgaDurumuEtiketi } from '@/src/MalzemeCekmeceleri/HukukVeSozlesmeler/hukukiDelilFiltreYardimcisi';
import { tsrJetonunuIndir } from '@/src/MalzemeCekmeceleri/HukukVeSozlesmeler/hukukiDelilCiktiServisi';

interface SozlesmeVersiyonGecmisiProps {
  loglar: HukukiOnayLogu[];
  sozlesmeHaritasi: Record<string, HukukiSozlesme>;
  onDetayAc: (log: HukukiOnayLogu) => void;
  onTekilYazdir: (log: HukukiOnayLogu) => void;
}

export const SozlesmeVersiyonGecmisi: React.FC<SozlesmeVersiyonGecmisiProps> = ({
  loglar,
  sozlesmeHaritasi,
  onDetayAc,
  onTekilYazdir,
}) => {
  const [seciliSozlesmeTuru, setSeciliSozlesmeTuru] = useState<string>('hepsi');

  const guncellemeLoglari = useMemo(
    () => loglar.filter((l) => l.islemTuru === 'sozlesme_guncelleme'),
    [loglar]
  );

  const sozlesmeTurleri = useMemo(() => {
    const kume = new Set<string>(Object.keys(sozlesmeHaritasi));
    guncellemeLoglari.forEach((l) => {
      if (l.sozlesmeTuru) kume.add(l.sozlesmeTuru);
    });
    return Array.from(kume);
  }, [sozlesmeHaritasi, guncellemeLoglari]);

  const goruntulenenLoglar = useMemo(() => {
    if (seciliSozlesmeTuru === 'hepsi') return guncellemeLoglari;
    return guncellemeLoglari.filter((l) => l.sozlesmeTuru === seciliSozlesmeTuru);
  }, [guncellemeLoglari, seciliSozlesmeTuru]);

  return (
    <div className="space-y-4">
      <div className="bg-[#180A1F] border border-[#3E1646] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Sözleşme Versiyon Geçmişi Zaman Çizelgesi</h3>
            <p className="text-[11px] text-gray-400">
              Kronolojik `sozlesme_guncelleme` mühürleri, versiyon numaraları ve TSA özetleri
            </p>
          </div>
        </div>

        <select
          value={seciliSozlesmeTuru}
          onChange={(e) => setSeciliSozlesmeTuru(e.target.value)}
          className="bg-[#110514] border border-[#521E5C] rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-hidden focus:border-amber-400"
        >
          <option value="hepsi">Tüm Sözleşme Türleri ({guncellemeLoglari.length})</option>
          {sozlesmeTurleri.map((tur) => (
            <option key={tur} value={tur}>
              {sozlesmeHaritasi[tur]?.kisaBaslik || sozlesmeHaritasi[tur]?.baslik || tur}
            </option>
          ))}
        </select>
      </div>

      {goruntulenenLoglar.length === 0 ? (
        <div className="rounded-2xl border border-[#3E1646] bg-[#180A1F] p-10 text-center text-xs text-gray-400">
          Seçili sözleşme türü için henüz `sozlesme_guncelleme` versiyon geçmişi kaydı bulunmuyor.
        </div>
      ) : (
        <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#3E1646]">
          {goruntulenenLoglar.map((log) => {
            const sozlesme = sozlesmeHaritasi[log.sozlesmeTuru];
            const damga = damgaDurumuEtiketi(log.damgaDurumu);
            return (
              <div
                key={log.kimlik}
                className="relative rounded-2xl border border-[#3E1646] bg-[#180A1F] p-4 shadow-lg"
              >
                <span className="absolute -left-[22px] top-5 w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-[#14061A]" />

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black font-mono">
                        v{log.sozlesmeVersiyonu || '1.0.0'}
                      </span>
                      <h4 className="text-sm font-bold text-white">
                        {sozlesme?.baslik || log.sozlesmeTuru}
                      </h4>
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${damga.sinif}`}>
                        {damga.metin}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-gray-400 font-mono">
                      <span>Tarih: <strong className="text-gray-200">{log.tarihSaat}</strong></span>
                      {log.sunucuUtc && <span>UTC: <strong className="text-gray-200">{log.sunucuUtc}</strong></span>}
                      {Boolean(log.sunucuKayitZamani) && (
                        <span>Sunucu: <strong className="text-gray-200">{sunucuZamaniBicimlendir(log.sunucuKayitZamani)}</strong></span>
                      )}
                      <span>TSA: <strong className="text-emerald-300">{log.tsaSaglayici || 'Belirtilmemiş'}</strong></span>
                    </div>

                    <div className="pt-1 text-[11px] font-mono text-purple-300 break-all flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Özet Hash: {log.ozetHash || 'Yok'}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onDetayAc(log)}
                      className="px-3 py-1.5 rounded-xl bg-purple-900/50 hover:bg-purple-800 text-amber-300 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>İncele & Kıyasla</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onTekilYazdir(log)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Yazdır</span>
                    </button>
                    {Boolean(log.tsaTokenBase64) && (
                      <button
                        type="button"
                        onClick={() => tsrJetonunuIndir(log)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-900/50 hover:bg-emerald-800 border border-emerald-600/50 text-emerald-300 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileKey2 className="w-3.5 h-3.5" />
                        <span>.tsr İndir</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
