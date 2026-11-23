import React from 'react';
import { Eye, Printer, FileKey2 } from 'lucide-react';
import { HukukiOnayLogu } from '@/src/MalzemeCekmeceleri/HukukVeSozlesmeler/tipler';
import {
  damgaDurumuEtiketi,
  islemTuruEtiketi,
} from '@/src/MalzemeCekmeceleri/HukukVeSozlesmeler/hukukiDelilFiltreYardimcisi';
import { tsrJetonunuIndir } from '@/src/MalzemeCekmeceleri/HukukVeSozlesmeler/hukukiDelilCiktiServisi';

interface HukukiDelilTablosuProps {
  loglar: HukukiOnayLogu[];
  yukleniyor: boolean;
  onDetayAc: (log: HukukiOnayLogu) => void;
  onTekilYazdir: (log: HukukiOnayLogu) => void;
}

export const HukukiDelilTablosu: React.FC<HukukiDelilTablosuProps> = ({
  loglar,
  yukleniyor,
  onDetayAc,
  onTekilYazdir,
}) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[#3E1646] bg-[#180A1F] shadow-xl">
      <table className="w-full text-left text-xs text-gray-300">
        <thead className="bg-[#110514] text-amber-300 uppercase font-mono text-[10px] border-b border-[#3E1646]">
          <tr>
            <th className="p-3">Tarih & Sunucu UTC</th>
            <th className="p-3">İşlem & İlgili Kayıt</th>
            <th className="p-3">Taraf Bilgisi</th>
            <th className="p-3">Sözleşme</th>
            <th className="p-3">IP & Damga</th>
            <th className="p-3">SHA-256 Özet</th>
            <th className="p-3 text-right">Doğrulama & Çıktı</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-purple-950/70">
          {yukleniyor ? (
            <tr>
              <td colSpan={7} className="p-8 text-center text-purple-300">Canlı delil kayıtları yükleniyor...</td>
            </tr>
          ) : loglar.length === 0 ? (
            <tr>
              <td colSpan={7} className="p-8 text-center text-gray-400">Filtreye uygun hukuki delil kaydı bulunamadı.</td>
            </tr>
          ) : (
            loglar.map((log) => {
              const damga = damgaDurumuEtiketi(log.damgaDurumu);
              return (
                <tr key={log.kimlik} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-3 font-mono text-[11px] whitespace-nowrap">
                    <div className="text-white">{log.tarihSaat}</div>
                    {log.sunucuUtc && <div className="text-[10px] text-gray-400">UTC: {log.sunucuUtc}</div>}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-md bg-purple-950 text-purple-200 border border-purple-800/60 text-[10px] font-bold">
                      {islemTuruEtiketi(log.islemTuru)}
                    </span>
                    <div className="text-[10px] font-mono text-gray-400 mt-1 truncate max-w-[140px]">
                      {log.ilgiliKayitId || log.kimlik}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-white">{log.kullaniciAdSoyad || 'Misafir'}</div>
                    <div className="text-[11px] font-mono text-gray-400">{log.kullaniciTelefon || '-'}</div>
                  </td>
                  <td className="p-3 font-mono text-[11px] text-amber-200">
                    <div>{log.sozlesmeTuru}</div>
                    <div className="text-[10px] text-gray-400">v{log.sozlesmeVersiyonu || '1.0.0'}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-mono text-[11px] text-gray-300">{log.ipAdresi}</div>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded border text-[10px] font-bold ${damga.sinif}`}>
                      {damga.metin}{log.tsaSaglayici ? ` • ${log.tsaSaglayici}` : ''}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-[10px] text-purple-300">
                    {log.ozetHash ? `${log.ozetHash.slice(0, 14)}…` : 'Özet Yok'}
                  </td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onDetayAc(log)}
                        className="px-2.5 py-1.5 rounded-lg bg-purple-900/50 hover:bg-purple-800 text-amber-300 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>İncele</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onTekilYazdir(log)}
                        title="Tekil Resmi PDF / Yazdır"
                        className="p-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      {Boolean(log.tsaTokenBase64) && (
                        <button
                          type="button"
                          onClick={() => tsrJetonunuIndir(log)}
                          title="RFC 3161 .tsr Jetonunu İndir"
                          className="px-2 py-1.5 rounded-lg bg-emerald-900/50 hover:bg-emerald-800 border border-emerald-600/50 text-emerald-300 text-[10px] font-black inline-flex items-center gap-1 cursor-pointer"
                        >
                          <FileKey2 className="w-3.5 h-3.5" />
                          <span>.tsr İndir</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
