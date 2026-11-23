import React from 'react';
import { Printer, X } from 'lucide-react';
import { HukukiOnayLogu, HukukiSozlesme } from '@/src/MalzemeCekmeceleri/HukukVeSozlesmeler/tipler';
import { sunucuZamaniBicimlendir } from '@/src/MalzemeCekmeceleri/HukukVeSozlesmeler/useCanliHukukiDeliller';
import { islemTuruEtiketi } from '@/src/MalzemeCekmeceleri/HukukVeSozlesmeler/hukukiDelilFiltreYardimcisi';

interface ResmiDelilTutanagiYazdirProps {
  loglar: HukukiOnayLogu[];
  sozlesmeHaritasi: Record<string, HukukiSozlesme>;
  acikMi: boolean;
  onKapat: () => void;
}

export const ResmiDelilTutanagiYazdir: React.FC<ResmiDelilTutanagiYazdirProps> = ({
  loglar,
  sozlesmeHaritasi,
  acikMi,
  onKapat,
}) => {
  if (!acikMi || loglar.length === 0) return null;

  const olusturmaZamani = new Date().toLocaleString('tr-TR');

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm overflow-y-auto p-4 sm:p-8 flex justify-center items-start">
      <div className="yazdirilabilir-delil-tutanagi w-full max-w-4xl bg-white text-gray-900 rounded-2xl shadow-2xl border border-gray-300 overflow-hidden">
        {/* Yazdırmada Gizlenen Araç Çubuğu */}
        <div className="yazdirma-gizle flex items-center justify-between px-6 py-3.5 bg-purple-950 text-white border-b border-purple-900">
          <div>
            <div className="text-sm font-black">Resmi Hukuki Delil Tutanağı Önizlemesi</div>
            <div className="text-[11px] text-purple-200">{loglar.length} kayıt yazdırılmaya / PDF kaydına hazır</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Yazdır / PDF Kaydet</span>
            </button>
            <button
              type="button"
              onClick={onKapat}
              className="p-2 rounded-xl bg-purple-900 hover:bg-purple-800 text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Resmi Tutanak Gövdesi */}
        <div className="p-6 sm:p-8 space-y-6 text-xs leading-relaxed">
          <header className="border-b-2 border-gray-900 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h2 className="text-lg font-black tracking-tight text-gray-900">
                AFYON EV LEZZETLERİ — RESMİ HUKUKİ DELİL VE ZAMAN DAMGASI TUTANAĞI
              </h2>
              <p className="text-[11px] text-gray-600">
                Değiştirilemez (Salt-Okunur) Elektronik Onay, IP, Sunucu Zamanı ve RFC 3161 Kriptografik Doğrulama Raporu
              </p>
            </div>
            <div className="text-right text-[11px] font-mono text-gray-700">
              <div>Çıktı Tarihi: {olusturmaZamani}</div>
              <div>Toplam Kayıt: {loglar.length}</div>
            </div>
          </header>

          {loglar.map((log, indeks) => {
            const sozlesme = sozlesmeHaritasi[log.sozlesmeTuru];
            const surumFarkliMi = Boolean(sozlesme?.versiyon && log.sozlesmeVersiyonu && sozlesme.versiyon !== log.sozlesmeVersiyonu);
            const ekDetayMetni =
              typeof log.ekDetay === 'string'
                ? log.ekDetay
                : log.ekDetay
                ? JSON.stringify(log.ekDetay, null, 2)
                : '';

            return (
              <section
                key={log.kimlik}
                className="border border-gray-300 rounded-xl p-4 space-y-3 break-inside-avoid"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-2">
                  <div className="font-bold text-sm text-gray-900">
                    #{indeks + 1} • {islemTuruEtiketi(log.islemTuru)} ({log.ilgiliKayitId || log.kimlik})
                  </div>
                  <span className="px-2 py-0.5 rounded bg-gray-100 border border-gray-300 font-mono text-[10px] font-bold">
                    {log.onaylandiMi ? 'ONAYLANDI' : 'REDDEDİLDİ'} • {log.damgaDurumu || 'yerel_ozet'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div><strong>Delil Kimliği:</strong> <span className="font-mono">{log.kimlik}</span></div>
                  <div><strong>Taraf Ad Soyad:</strong> {log.kullaniciAdSoyad || 'Misafir'}</div>
                  <div><strong>Telefon / Kullanıcı ID:</strong> <span className="font-mono">{log.kullaniciTelefon || '-'} / {log.kullaniciKimlik || '-'}</span></div>
                  <div><strong>Gerçek IP Adresi:</strong> <span className="font-mono">{log.ipAdresi}</span></div>
                  <div><strong>TR Yerel Saat:</strong> <span className="font-mono">{log.tarihSaat}</span></div>
                  <div><strong>Sunucu UTC:</strong> <span className="font-mono">{log.sunucuUtc || '-'}</span></div>
                  <div className="sm:col-span-2">
                    <strong>Firestore Sunucu Kayıt Zamanı:</strong>{' '}
                    <span className="font-mono">{sunucuZamaniBicimlendir(log.sunucuKayitZamani)}</span>
                  </div>
                  <div className="sm:col-span-2 break-all">
                    <strong>Cihaz / Tarayıcı:</strong> <span className="font-mono">{log.cihazBilgisi}</span>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 font-mono text-[10px] space-y-1 break-all">
                  <div><strong>TSA Sağlayıcı:</strong> {log.tsaSaglayici || '-'}</div>
                  <div><strong>Sözleşme Metin Hash (SHA-256):</strong> {log.sozlesmeMetinHash || '-'}</div>
                  <div><strong>Delil Özet Hash (SHA-256):</strong> {log.ozetHash || '-'}</div>
                  <div><strong>Sunucu İmzası:</strong> {log.sunucuImzasi || '-'}</div>
                </div>

                <div className="border-t border-gray-200 pt-2 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <strong>
                      İlgili Sözleşme: {sozlesme?.baslik || log.sozlesmeTuru} (Onaylanan Sürüm: v{log.sozlesmeVersiyonu || '1.0.0'})
                    </strong>
                    {surumFarkliMi && (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                        Not: Güncel sözleşme sürümü v{sozlesme?.versiyon} olarak güncellenmiştir.
                      </span>
                    )}
                  </div>
                  {sozlesme?.icerik ? (
                    <pre className="whitespace-pre-wrap font-sans text-[10px] text-gray-800 bg-gray-50 border border-gray-200 rounded-lg p-3 leading-relaxed">
                      {sozlesme.icerik}
                    </pre>
                  ) : (
                    <p className="text-[10px] text-gray-500 italic">Bu kayıt için eşleşen sözleşme tam metni veritabanında bulunamadı.</p>
                  )}
                </div>

                {ekDetayMetni && (
                  <div className="text-[10px] font-mono bg-gray-50 border border-gray-200 rounded-lg p-2 break-all">
                    <strong>Ek Detay:</strong> {ekDetayMetni}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
};
