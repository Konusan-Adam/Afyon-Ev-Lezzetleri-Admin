import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, AlertTriangle, HelpCircle, Printer, FileKey2, Shield } from 'lucide-react';
import { HukukiOnayLogu, HukukiSozlesme } from '@/src/MalzemeCekmeceleri/HukukVeSozlesmeler/tipler';
import { sunucuZamaniBicimlendir } from '@/src/MalzemeCekmeceleri/HukukVeSozlesmeler/useCanliHukukiDeliller';
import {
  damgaDurumuEtiketi,
  islemTuruEtiketi,
} from '@/src/MalzemeCekmeceleri/HukukVeSozlesmeler/hukukiDelilFiltreYardimcisi';
import {
  MetinUyumSonucu,
  sozlesmeMetinUyumuDogrula,
  tsrJetonunuIndir,
} from '@/src/MalzemeCekmeceleri/HukukVeSozlesmeler/hukukiDelilCiktiServisi';

interface DelilDetayVeKiyaslamaModaliProps {
  log: HukukiOnayLogu | null;
  sozlesmeHaritasi: Record<string, HukukiSozlesme>;
  onKapat: () => void;
  onYazdir: (log: HukukiOnayLogu) => void;
}

export const DelilDetayVeKiyaslamaModali: React.FC<DelilDetayVeKiyaslamaModaliProps> = ({
  log,
  sozlesmeHaritasi,
  onKapat,
  onYazdir,
}) => {
  const [uyumSonucu, setUyumSonucu] = useState<MetinUyumSonucu | null>(null);
  const [kontrolEdiliyor, setKontrolEdiliyor] = useState(false);

  const ilgiliSozlesme = log ? sozlesmeHaritasi[log.sozlesmeTuru] : undefined;

  useEffect(() => {
    let iptal = false;
    if (!log) {
      setUyumSonucu(null);
      return;
    }
    setKontrolEdiliyor(true);
    sozlesmeMetinUyumuDogrula(log, ilgiliSozlesme)
      .then((sonuc) => {
        if (!iptal) setUyumSonucu(sonuc);
      })
      .finally(() => {
        if (!iptal) setKontrolEdiliyor(false);
      });
    return () => {
      iptal = true;
    };
  }, [log, ilgiliSozlesme]);

  if (!log) return null;

  const damga = damgaDurumuEtiketi(log.damgaDurumu);
  const ekDetayMetni =
    typeof log.ekDetay === 'string'
      ? log.ekDetay
      : log.ekDetay
      ? JSON.stringify(log.ekDetay, null, 2)
      : '';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#4A1A54] bg-[#14061A] shadow-2xl flex flex-col">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[#1A0822] border-b border-[#3E1646]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-300">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Hukuki Delil & Zaman Damgası İnceleme</h3>
              <p className="text-[11px] font-mono text-gray-400">Kayıt Kimliği: {log.kimlik}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onKapat}
            className="p-2 rounded-xl bg-purple-950/60 hover:bg-purple-900 text-gray-300 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs">
          {/* Metin Uyuşma ve Doğrulama Sonucu */}
          <div className="rounded-2xl border border-[#3E1646] bg-[#1C0A24] p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300">
                Sözleşme Metin & Hash Kıyaslama Sonucu (SHA-256)
              </span>
              {kontrolEdiliyor ? (
                <span className="px-3 py-1 rounded-lg bg-purple-900/60 text-purple-200 font-bold">
                  SHA-256 Hesaplanıyor...
                </span>
              ) : uyumSonucu?.durum === 'eslesti' ? (
                <span className="px-3 py-1 rounded-lg bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 font-black inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Güncel Metinle Birebir Eşleşiyor (Doğrulandı)</span>
                </span>
              ) : uyumSonucu?.durum === 'farkli' ? (
                <span className="px-3 py-1 rounded-lg bg-amber-950/90 border border-amber-500/60 text-amber-300 font-black inline-flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Onay Anındaki Eski Sürüm (v{log.sozlesmeVersiyonu || '1.0.0'}) — Güncel Metinden Farklı</span>
                </span>
              ) : (
                <span className="px-3 py-1 rounded-lg bg-gray-900 border border-gray-700 text-gray-300 font-bold inline-flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4" />
                  <span>Karşılaştırma İçin Sözleşme Metni / Hash Eksik</span>
                </span>
              )}
            </div>

            {uyumSonucu?.durum === 'farkli' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-[#120516] border border-amber-500/30 rounded-xl p-3 font-mono text-[11px]">
                <div className="space-y-1">
                  <div className="text-amber-300 font-bold">Onay Anındaki Kayıtlı Mühür</div>
                  <div className="text-gray-300">Sürüm: v{log.sozlesmeVersiyonu || '-'}</div>
                  <div className="text-gray-300">Tarih: {log.tarihSaat}</div>
                  <div className="text-gray-400 break-all">Hash: {log.sozlesmeMetinHash || '-'}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-emerald-300 font-bold">Güncel Sözleşme Belgesi</div>
                  <div className="text-gray-300">Sürüm: v{ilgiliSozlesme?.versiyon || '-'}</div>
                  <div className="text-gray-300">Güncelleme: {ilgiliSozlesme?.guncellenmeTarihi || '-'}</div>
                  <div className="text-gray-400 break-all">Güncel SHA-256: {uyumSonucu.guncelHash || '-'}</div>
                </div>
              </div>
            )}

            {ilgiliSozlesme?.icerik && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-amber-200">
                  {ilgiliSozlesme.baslik} (Mevcut v{ilgiliSozlesme.versiyon})
                </div>
                <pre className="max-h-44 overflow-y-auto whitespace-pre-wrap rounded-xl bg-[#100414] border border-[#34113B] p-3 text-[11px] text-gray-300 font-sans leading-relaxed">
                  {ilgiliSozlesme.icerik}
                </pre>
              </div>
            )}
          </div>

          {/* Taraf, İşlem ve Zaman Damgası Detayları */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-[#3E1646] bg-[#180A1F] p-4 space-y-2">
              <div className="text-[11px] font-bold uppercase text-amber-300">Taraf & İşlem Bilgileri</div>
              <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                <span className="text-gray-400">İşlem Türü:</span>
                <span className="col-span-2 font-bold text-white">{islemTuruEtiketi(log.islemTuru)}</span>
                <span className="text-gray-400">İlgili Kayıt ID:</span>
                <span className="col-span-2 font-mono text-gray-200 break-all">{log.ilgiliKayitId || '-'}</span>
                <span className="text-gray-400">Ad Soyad:</span>
                <span className="col-span-2 font-bold text-white">{log.kullaniciAdSoyad || 'Misafir'}</span>
                <span className="text-gray-400">Telefon:</span>
                <span className="col-span-2 font-mono text-gray-200">{log.kullaniciTelefon || '-'}</span>
                <span className="text-gray-400">Kullanıcı Kimlik:</span>
                <span className="col-span-2 font-mono text-gray-200 break-all">{log.kullaniciKimlik || '-'}</span>
                <span className="text-gray-400">Onay Durumu:</span>
                <span className="col-span-2 font-bold text-emerald-300">{log.onaylandiMi ? 'ONAYLANDI' : 'REDDEDİLDİ'}</span>
              </div>
            </div>

            <div className="rounded-2xl border border-[#3E1646] bg-[#180A1F] p-4 space-y-2">
              <div className="text-[11px] font-bold uppercase text-amber-300">Zaman, IP ve Cihaz Kanıtı</div>
              <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                <span className="text-gray-400">Yerel Tarih (TR):</span>
                <span className="col-span-2 font-mono text-white">{log.tarihSaat}</span>
                <span className="text-gray-400">Sunucu UTC:</span>
                <span className="col-span-2 font-mono text-gray-200">{log.sunucuUtc || '-'}</span>
                <span className="text-gray-400">Firestore Zamanı:</span>
                <span className="col-span-2 font-mono text-gray-200">{sunucuZamaniBicimlendir(log.sunucuKayitZamani)}</span>
                <span className="text-gray-400">IP Adresi:</span>
                <span className="col-span-2 font-mono text-amber-200">{log.ipAdresi}</span>
                <span className="text-gray-400">Cihaz Bilgisi:</span>
                <span className="col-span-2 font-mono text-gray-300 break-all">{log.cihazBilgisi}</span>
              </div>
            </div>
          </div>

          {/* Kriptografik Mühür Bilgileri */}
          <div className="rounded-2xl border border-[#3E1646] bg-[#180A1F] p-4 space-y-2 font-mono text-[11px]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-sans font-bold uppercase text-amber-300">
                Kriptografik Mühür & RFC 3161 Zaman Damgası
              </span>
              <span className={`px-2 py-0.5 rounded border text-[10px] font-sans font-bold ${damga.sinif}`}>
                {damga.metin}{log.tsaSaglayici ? ` • ${log.tsaSaglayici}` : ''}
              </span>
            </div>
            <div className="break-all text-gray-300"><strong className="text-gray-400">Özet Hash (SHA-256):</strong> {log.ozetHash || '-'}</div>
            <div className="break-all text-gray-300"><strong className="text-gray-400">Sözleşme Metin Hash:</strong> {log.sozlesmeMetinHash || '-'}</div>
            <div className="break-all text-gray-300"><strong className="text-gray-400">Sunucu İmzası:</strong> {log.sunucuImzasi || '-'}</div>
            {ekDetayMetni && (
              <div className="pt-2">
                <div className="text-gray-400 font-bold mb-1">Ek Detay (ekDetay):</div>
                <pre className="rounded-xl bg-[#100414] border border-[#34113B] p-2.5 text-[10px] text-purple-200 overflow-x-auto">
                  {ekDetayMetni}
                </pre>
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-2 px-6 py-4 bg-[#1A0822] border-t border-[#3E1646]">
          <span className="text-[11px] text-gray-400">
            Salt-okunur delil kaydı — düzenleme ve silme kapalıdır.
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {Boolean(log.tsaTokenBase64) && (
              <button
                type="button"
                onClick={() => tsrJetonunuIndir(log)}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <FileKey2 className="w-4 h-4" />
                <span>.tsr İndir</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onYazdir(log)}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Resmi PDF / Yazdır</span>
            </button>
            <button
              type="button"
              onClick={onKapat}
              className="px-4 py-2 rounded-xl bg-purple-950 hover:bg-purple-900 text-gray-200 font-bold text-xs cursor-pointer"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
