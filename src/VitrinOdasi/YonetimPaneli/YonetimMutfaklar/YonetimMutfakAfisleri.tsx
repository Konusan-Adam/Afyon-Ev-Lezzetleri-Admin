import React, { useState } from 'react';
import { Megaphone, Check, X, Image, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { canliFirebaseAktifMi } from '@/src/veritabani/FirebaseIstemcisi';
import { belgeKaydet } from '@/src/veritabani/FirebaseKoleksiyonServisi';
import { useCanliMutfakAfisleri, type MutfakAfisiKaydi } from '@/src/MalzemeCekmeceleri/useCanliMutfakAfisleri';
import { RESMI_MUTFAK_LOGOSU } from '@/src/MalzemeCekmeceleri/Mutfak/resmiMutfakLogosu';

type DurumFiltresi = 'hepsi' | 'beklemede' | 'onaylandi' | 'reddedildi';

export const YonetimMutfakAfisleri: React.FC = () => {
  const { afisler, setAfisler, bekleyenSayisi, yukleniyor } = useCanliMutfakAfisleri();
  const [filtre, setFiltre] = useState<DurumFiltresi>('hepsi');
  const [redModalAfis, setRedModalAfis] = useState<MutfakAfisiKaydi | null>(null);
  const [redGerekcesiMetni, setRedGerekcesiMetni] = useState('Görsel veya metin standartlarımıza uygun değil.');

  const afisDurumGuncelle = async (afisId: string, onayli: boolean, redGerekcesi = '') => {
    const yeniDurum: 'onaylandi' | 'reddedildi' = onayli ? 'onaylandi' : 'reddedildi';
    setAfisler((onceki) =>
      onceki.map((a) =>
        a.id === afisId
          ? { ...a, onay_durumu: yeniDurum, onayli_mi: onayli, red_gerekcesi: redGerekcesi }
          : a
      )
    );

    if (canliFirebaseAktifMi()) {
      try {
        await belgeKaydet('mutfak_afisleri', afisId, {
          onay_durumu: yeniDurum,
          onayli_mi: onayli,
          red_gerekcesi: redGerekcesi,
        });
      } catch (err) {
        console.warn('Afiş durum güncelleme hatası:', err);
      }
    }
  };

  const onaylananSayisi = afisler.filter((a) => a.onay_durumu === 'onaylandi').length;
  const reddedilenSayisi = afisler.filter((a) => a.onay_durumu === 'reddedildi').length;

  const siraliAfisler = [...afisler].sort((a, b) => {
    const sira = (d?: string) => (!d || d === 'beklemede' ? 0 : d === 'onaylandi' ? 1 : 2);
    return sira(a.onay_durumu) - sira(b.onay_durumu);
  });

  const filtrelenmisAfisler = siraliAfisler.filter((afis) => {
    if (filtre === 'beklemede') return !afis.onay_durumu || afis.onay_durumu === 'beklemede';
    if (filtre === 'onaylandi') return afis.onay_durumu === 'onaylandi';
    if (filtre === 'reddedildi') return afis.onay_durumu === 'reddedildi';
    return true;
  });

  const redOnayla = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!redModalAfis) return;
    const temizSebep = redGerekcesiMetni.trim() || 'Standartlara uygun bulunmadı.';
    await afisDurumGuncelle(redModalAfis.id, false, temizSebep);
    setRedModalAfis(null);
    setRedGerekcesiMetni('Görsel veya metin standartlarımıza uygun değil.');
  };

  return (
    <div className="space-y-6 text-white animate-fadeIn">
      <div className="p-4 sm:p-5 rounded-2xl bg-[#180A1F] border border-[#3E1646] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base">Mutfak Afiş Onayları</h3>
            <p className="text-xs text-purple-300">
              Ev mutfaklarının vitrin için gönderdiği afiş ve duyuruları canlı izleyin, onaylayın veya gerekçeyle reddedin.
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-1.5 bg-[#120614] p-1.5 rounded-xl border border-purple-900/60 text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setFiltre('hepsi')}
            className={`px-2.5 py-1.5 rounded-lg cursor-pointer transition-all ${
              filtre === 'hepsi' ? 'bg-[#7B258B] text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Tümü ({afisler.length})
          </button>
          <button
            type="button"
            onClick={() => setFiltre('beklemede')}
            className={`px-2.5 py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1 ${
              filtre === 'beklemede' ? 'bg-amber-500 text-gray-950 font-black' : 'text-amber-300 hover:bg-amber-500/10'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>Bekleyen ({bekleyenSayisi})</span>
          </button>
          <button
            type="button"
            onClick={() => setFiltre('onaylandi')}
            className={`px-2.5 py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1 ${
              filtre === 'onaylandi' ? 'bg-emerald-700 text-white' : 'text-emerald-300 hover:bg-emerald-900/30'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Onaylı ({onaylananSayisi})</span>
          </button>
          <button
            type="button"
            onClick={() => setFiltre('reddedildi')}
            className={`px-2.5 py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1 ${
              filtre === 'reddedildi' ? 'bg-rose-700 text-white' : 'text-rose-300 hover:bg-rose-900/30'
            }`}
          >
            <XCircle className="w-3 h-3" />
            <span>Reddedilen ({reddedilenSayisi})</span>
          </button>
        </div>
      </div>

      {yukleniyor ? (
        <div className="p-12 text-center text-amber-300 text-xs bg-[#180A1F] rounded-2xl border border-purple-900/40 flex flex-col items-center gap-2">
          <Loader2 className="w-7 h-7 animate-spin" />
          <span>Mutfak afişleri canlı yükleniyor...</span>
        </div>
      ) : filtrelenmisAfisler.length === 0 ? (
        <div className="p-12 text-center text-gray-400 text-xs bg-[#180A1F] rounded-2xl border border-purple-900/40">
          <Image className="w-10 h-10 mx-auto mb-2 text-amber-400 opacity-50" />
          <p className="font-bold text-white text-sm">
            {afisler.length === 0
              ? 'Henüz sisteme gönderilmiş mutfak afişi bulunmuyor.'
              : 'Bu filtrede gösterilecek mutfak afişi yok.'}
          </p>
          <p className="text-gray-400 mt-1">
            Ev mutfakları "Mutfak Afişim" sekmesinden afiş yüklediklerinde anında burada listelenir.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtrelenmisAfisler.map((afis) => {
            const onayliMi = afis.onay_durumu === 'onaylandi';
            const reddedildiMi = afis.onay_durumu === 'reddedildi';

            return (
              <div
                key={afis.id}
                className={`p-4 rounded-2xl bg-[#180A1F] border transition-all flex flex-col justify-between gap-3 ${
                  onayliMi
                    ? 'border-emerald-500/40'
                    : reddedildiMi
                    ? 'border-rose-500/40 bg-[#21080D]'
                    : 'border-amber-500/50 bg-[#210926]'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-purple-950 text-purple-200 border border-purple-800 text-[10px] font-bold">
                        <img
                          src={RESMI_MUTFAK_LOGOSU}
                          alt="Afyon Ev Lezzetleri"
                          className="w-4 h-4 rounded-full object-cover"
                        />
                        <span>{afis.mutfak_adi || 'Ev Mutfağı'}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          onayliMi
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                            : reddedildiMi
                            ? 'bg-rose-950 text-rose-300 border-rose-700'
                            : 'bg-amber-950 text-amber-300 border-amber-700'
                        }`}
                      >
                        {onayliMi ? '✓ Onaylı / Yayında' : reddedildiMi ? '✕ Reddedildi' : '⏳ Onay Bekliyor'}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold shrink-0 ${
                        afis.aktif_mi ? 'bg-emerald-950 text-emerald-300' : 'bg-gray-800 text-gray-400'
                      }`}
                    >
                      {afis.aktif_mi ? 'Aktif' : 'Pasif'}
                    </span>
                  </div>

                  <div className="relative rounded-xl overflow-hidden h-40 border border-purple-900/60 bg-black">
                    <img
                      src={afis.gorsel_url || RESMI_MUTFAK_LOGOSU}
                      alt={afis.baslik}
                      className="w-full h-full object-cover opacity-85"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-3 flex flex-col justify-end">
                      <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">
                        {afis.rozet || 'ÖZEL LEZZET'}
                      </span>
                      <h4 className="text-sm font-black text-white">{afis.baslik}</h4>
                    </div>
                  </div>

                  <p className="text-xs text-gray-300 line-clamp-2">{afis.aciklama || 'Açıklama girilmedi.'}</p>

                  {reddedildiMi && afis.red_gerekcesi && (
                    <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-[11px]">
                      <strong>Red Gerekçesi:</strong> {afis.red_gerekcesi}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-purple-950 flex items-center justify-between gap-2 text-xs">
                  <span className="text-[11px] text-gray-400">Afiş Yönetimi:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => afisDurumGuncelle(afis.id, true, '')}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer transition-all ${
                        onayliMi
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-950/80 border border-emerald-700 text-emerald-300 hover:bg-emerald-900'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{onayliMi ? 'Onaylı' : 'Onayla'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRedModalAfis(afis);
                        setRedGerekcesiMetni(
                          afis.red_gerekcesi || 'Görsel veya metin standartlarımıza uygun değil.'
                        );
                      }}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer transition-all ${
                        reddedildiMi
                          ? 'bg-rose-700 text-white'
                          : 'bg-rose-950/80 border border-rose-800 text-rose-300 hover:bg-rose-900'
                      }`}
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reddet</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reddetme Gerekçesi Modalı */}
      {redModalAfis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <form
            onSubmit={redOnayla}
            className="bg-[#180A1F] border border-rose-500/50 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl text-xs"
          >
            <div className="flex items-center justify-between border-b border-purple-950 pb-3">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-400" />
                <div>
                  <h4 className="text-sm font-extrabold text-white">Mutfak Afişini Reddet</h4>
                  <p className="text-[11px] text-purple-300 truncate max-w-[260px]">
                    {redModalAfis.mutfak_adi} — {redModalAfis.baslik}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRedModalAfis(null)}
                className="w-8 h-8 rounded-full bg-purple-950 text-gray-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-gray-300 font-semibold block mb-1.5">Kısa Red Gerekçesi</label>
              <textarea
                rows={3}
                required
                value={redGerekcesiMetni}
                onChange={(e) => setRedGerekcesiMetni(e.target.value)}
                placeholder="Örn: Afiş görseli bulanık veya metin kurallara uygun değil."
                className="w-full bg-[#120614] border border-purple-800/70 rounded-xl p-3 text-white outline-none focus:border-rose-400 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-purple-950">
              <button
                type="button"
                onClick={() => setRedModalAfis(null)}
                className="px-4 py-2 rounded-xl bg-purple-950 text-gray-300 font-bold cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold cursor-pointer"
              >
                Reddi Kaydet
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
