import React, { useState, useEffect } from 'react';
import { Image, Megaphone, CheckCircle2, AlertCircle, Clock, Save, Plus } from 'lucide-react';
import { canliFirebaseAktifMi } from '@/src/veritabani/FirebaseIstemcisi';
import { belgeGetir, belgeKaydet } from '@/src/veritabani/FirebaseKoleksiyonServisi';
import { patronBildirimiEkle } from '@/src/MalzemeCekmeceleri/PatronBildirimServisi';

interface MutfakAfisSekmesiProps {
  mutfakId: string;
  mutfakAdi: string;
}

export const MutfakAfisSekmesi: React.FC<MutfakAfisSekmesiProps> = ({ mutfakId, mutfakAdi }) => {
  const [baslik, setBaslik] = useState('');
  const [aciklama, setAciklama] = useState('');
  const [rozet, setRozet] = useState('GELENEKSEL ÖZEL LEZZET');
  const [gorselUrl, setGorselUrl] = useState('https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=1200&auto=format&fit=crop&q=80');
  const [aktifMi, setAktifMi] = useState(true);
  const [onayDurumu, setOnayDurumu] = useState<'beklemede' | 'onaylandi' | 'reddedildi'>('beklemede');
  const [redGerekcesi, setRedGerekcesi] = useState('');
  const [kaydedildi, setKaydedildi] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(true);

  const afisId = `afis_${mutfakId}`;

  useEffect(() => {
    let aktif = true;
    async function afisGetir() {
      if (canliFirebaseAktifMi()) {
        try {
          const mevcut = await belgeGetir<any>('mutfak_afisleri', afisId);
          if (mevcut && aktif) {
            setBaslik(mevcut.baslik || '');
            setAciklama(mevcut.aciklama || '');
            setRozet(mevcut.rozet || 'GELENEKSEL ÖZEL LEZZET');
            setGorselUrl(mevcut.gorsel_url || gorselUrl);
            setAktifMi(mevcut.aktif_mi ?? true);
            setOnayDurumu(mevcut.onay_durumu || 'beklemede');
            setRedGerekcesi(mevcut.red_gerekcesi || '');
          }
        } catch (err) {
          console.warn('Mutfak afişi çekme hatası:', err);
        }
      }
      if (aktif) setYukleniyor(false);
    }
    afisGetir();
    return () => { aktif = false; };
  }, [afisId]);

  const afisiKaydet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!baslik.trim()) return;

    const veri = {
      id: afisId,
      mutfak_id: mutfakId,
      mutfak_adi: mutfakAdi,
      baslik: baslik.trim(),
      aciklama: aciklama.trim(),
      rozet: rozet.trim() || 'ÖZEL LEZZET',
      gorsel_url: gorselUrl.trim(),
      aktif_mi: aktifMi,
      onay_durumu: 'beklemede',
      onayli_mi: false,
      red_gerekcesi: '',
      guncelleme_tarihi: new Date().toISOString()
    };

    setOnayDurumu('beklemede');
    setRedGerekcesi('');
    setKaydedildi(true);
    setTimeout(() => setKaydedildi(false), 4000);

    if (canliFirebaseAktifMi()) {
      try {
        await belgeKaydet('mutfak_afisleri', afisId, veri);
        patronBildirimiEkle(
          'mutfak_afis_talebi',
          'Mutfak Afiş Onayı Bekliyor 🖼️',
          `${mutfakAdi} vitrin için "${baslik}" başlıklı afişini onaya gönderdi.`,
          afisId,
          { hedefSekme: 'mutfak_afisleri' }
        );
      } catch (err) {
        console.warn('Afiş kaydetme hatası:', err);
      }
    }
  };

  return (
    <div className="space-y-6 text-white animate-fadeIn">
      <div className="p-4 rounded-2xl bg-[#180A1F] border border-[#3E1646] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base">Mutfak Afişim & Vitrin Duyurusu</h3>
            <p className="text-xs text-purple-300">Vitrin ana sayfasında müşterilerinize özel afişinizi sergileyin. Patron onayından sonra yayına girer.</p>
          </div>
        </div>

        <div className="shrink-0">
          {onayDurumu === 'onaylandi' && (
            <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 text-xs font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Patron Onaylı / Yayında
            </span>
          )}
          {onayDurumu === 'beklemede' && (
            <span className="px-3 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-700 text-xs font-bold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Patron Onayı Bekliyor
            </span>
          )}
          {onayDurumu === 'reddedildi' && (
            <span className="px-3 py-1 rounded-full bg-rose-950 text-rose-300 border border-rose-700 text-xs font-bold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Reddedildi
            </span>
          )}
        </div>
      </div>

      {kaydedildi && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-600 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Afişiniz Patron Masası onay kuyruğuna iletildi.</span>
        </div>
      )}

      {onayDurumu === 'reddedildi' && redGerekcesi && (
        <div className="p-3 bg-rose-950/80 border border-rose-600 text-rose-200 text-xs rounded-xl space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-rose-400" /> Patron Red Gerekçesi:
          </div>
          <p>{redGerekcesi}</p>
        </div>
      )}

      <form onSubmit={afisiKaydet} className="p-5 rounded-2xl bg-[#180A1F] border border-[#3E1646] space-y-4 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="text-gray-300 font-semibold block mb-1">Afiş Başlığı</label>
              <input
                type="text"
                required
                value={baslik}
                onChange={(e) => setBaslik(e.target.value)}
                placeholder="Örn: Anne Eliyle T Açılan Hakiki Haşhaşlı Bükme"
                className="w-full bg-[#120614] border border-purple-900 rounded-xl px-3 py-2.5 text-white outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-gray-300 font-semibold block mb-1">Özel Etiket / Rozet Metni</label>
              <input
                type="text"
                value={rozet}
                onChange={(e) => setRozet(e.target.value)}
                placeholder="Örn: %100 DOĞAL EV YAPIMI"
                className="w-full bg-[#120614] border border-purple-900 rounded-xl px-3 py-2.5 text-white outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-gray-300 font-semibold block mb-1">Afiş Görseli URL</label>
              <input
                type="url"
                required
                value={gorselUrl}
                onChange={(e) => setGorselUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-[#120614] border border-purple-900 rounded-xl px-3 py-2.5 text-white font-mono outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="aktifMiCheck"
                checked={aktifMi}
                onChange={(e) => setAktifMi(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
              <label htmlFor="aktifMiCheck" className="text-gray-300 font-semibold cursor-pointer">
                Afiş Vitrinde Aktif Olsun
              </label>
            </div>
          </div>

          <div className="space-y-3 flex flex-col justify-between">
            <div>
              <label className="text-gray-300 font-semibold block mb-1">Açıklama / Alt Başlık</label>
              <textarea
                rows={4}
                value={aciklama}
                onChange={(e) => setAciklama(e.target.value)}
                placeholder="Müşterilerinize özel kampanya veya lezzet hikayenizi yazın..."
                className="w-full bg-[#120614] border border-purple-900 rounded-xl p-3 text-white outline-none focus:border-amber-400 resize-none"
              />
            </div>

            {/* Önizleme Kartı */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-gray-400 block font-bold">Canlı Vitrin Önizlemesi:</span>
              <div className="relative rounded-xl overflow-hidden border border-purple-900/60 h-32 bg-black">
                <img src={gorselUrl || 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5'} alt="Önizleme" className="w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3 flex flex-col justify-end">
                  <span className="text-[9px] font-bold text-amber-400 tracking-wider uppercase">{rozet || 'ÖZEL LEZZET'}</span>
                  <div className="text-xs font-black text-white truncate">{baslik || 'Afiş Başlığı'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-purple-950">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-gray-950 font-extrabold text-xs flex items-center gap-2 shadow-lg cursor-pointer transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Afişi Onaya Gönder</span>
          </button>
        </div>
      </form>
    </div>
  );
};
