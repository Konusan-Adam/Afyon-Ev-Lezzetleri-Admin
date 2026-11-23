import React from 'react';
import { Search, Download, Printer, RotateCcw } from 'lucide-react';
import { HukukiDelilFiltreDurumu } from '@/src/MalzemeCekmeceleri/HukukVeSozlesmeler/hukukiDelilFiltreYardimcisi';

interface HukukiDelilFiltreBariProps {
  filtre: HukukiDelilFiltreDurumu;
  filtrelenenSayi: number;
  onFiltreDegistir: (yeni: HukukiDelilFiltreDurumu) => void;
  onPdfYazdir: () => void;
  onCsvIndir: () => void;
  onJsonIndir: () => void;
}

export const HukukiDelilFiltreBari: React.FC<HukukiDelilFiltreBariProps> = ({
  filtre,
  filtrelenenSayi,
  onFiltreDegistir,
  onPdfYazdir,
  onCsvIndir,
  onJsonIndir,
}) => {
  const sifirla = () =>
    onFiltreDegistir({ arama: '', islemTuru: 'hepsi', damgaDurumu: 'hepsi', baslangicTarihi: '', bitisTarihi: '' });

  return (
    <div className="bg-[#180A1F] border border-[#3E1646] rounded-2xl p-4 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2.5">
        <div className="relative lg:col-span-2">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={filtre.arama}
            onChange={(e) => onFiltreDegistir({ ...filtre, arama: e.target.value })}
            placeholder="Ad Soyad, Telefon, Sipariş/Kayıt ID, IP veya SHA-256..."
            className="w-full bg-[#110514] border border-[#521E5C] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-hidden focus:border-amber-400"
          />
        </div>

        <select
          value={filtre.islemTuru}
          onChange={(e) => onFiltreDegistir({ ...filtre, islemTuru: e.target.value })}
          className="bg-[#110514] border border-[#521E5C] rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-hidden focus:border-amber-400"
        >
          <option value="hepsi">Tüm İşlem Türleri</option>
          <option value="kayit">Üyelik Kaydı (kayit)</option>
          <option value="siparis">Sipariş Onayı (siparis)</option>
          <option value="cerez_onayi">Çerez Onayı (cerez_onayi)</option>
          <option value="teslimat">Teslimat (teslimat)</option>
          <option value="iptal">İptal (iptal)</option>
          <option value="hakedis">Hakediş (hakedis)</option>
          <option value="sozlesme_guncelleme">Sözleşme Güncelleme</option>
          <option value="ozel_onay">Özel Onay (ozel_onay)</option>
        </select>

        <select
          value={filtre.damgaDurumu}
          onChange={(e) => onFiltreDegistir({ ...filtre, damgaDurumu: e.target.value })}
          className="bg-[#110514] border border-[#521E5C] rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-hidden focus:border-amber-400"
        >
          <option value="hepsi">Tüm Damga Durumları</option>
          <option value="rfc3161_onayli">RFC 3161 Onaylı</option>
          <option value="sunucu_muhurlu">Sunucu Mühürlü</option>
          <option value="yerel_ozet">Yerel Özet</option>
        </select>

        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={filtre.baslangicTarihi}
            onChange={(e) => onFiltreDegistir({ ...filtre, baslangicTarihi: e.target.value })}
            title="Başlangıç Tarihi"
            className="w-full bg-[#110514] border border-[#521E5C] rounded-xl px-2 py-2 text-[11px] text-gray-200 focus:outline-hidden focus:border-amber-400"
          />
          <input
            type="date"
            value={filtre.bitisTarihi}
            onChange={(e) => onFiltreDegistir({ ...filtre, bitisTarihi: e.target.value })}
            title="Bitiş Tarihi"
            className="w-full bg-[#110514] border border-[#521E5C] rounded-xl px-2 py-2 text-[11px] text-gray-200 focus:outline-hidden focus:border-amber-400"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-purple-950/80">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-purple-300 font-semibold">
            Listelenen: <strong className="text-amber-300">{filtrelenenSayi}</strong> kayıt
          </span>
          <button
            type="button"
            onClick={sifirla}
            className="px-2.5 py-1 rounded-lg bg-purple-950/60 hover:bg-purple-900/60 text-gray-300 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Filtreleri Temizle</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={filtrelenenSayi === 0}
            onClick={onPdfYazdir}
            className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Resmi PDF / Yazdır</span>
          </button>
          <button
            type="button"
            disabled={filtrelenenSayi === 0}
            onClick={onCsvIndir}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Excel (.csv) İndir</span>
          </button>
          <button
            type="button"
            disabled={filtrelenenSayi === 0}
            onClick={onJsonIndir}
            className="px-3.5 py-1.5 rounded-xl bg-purple-900/60 hover:bg-purple-800 border border-purple-700/60 text-gray-100 font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tam Arşiv (.json)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
