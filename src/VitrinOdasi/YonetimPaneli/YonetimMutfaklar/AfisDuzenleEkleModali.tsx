import React, { useState, useEffect } from 'react';
import { X, Save, Store, Image as ImageIcon } from 'lucide-react';
import { Mutfak } from '@/src/veritabani/VeriTipleri';
import type { MutfakAfisiKaydi } from '@/src/MalzemeCekmeceleri/useCanliMutfakAfisleri';
import type { MutfakAfisFormVerisi } from '@/src/MalzemeCekmeceleri/MutfakAfisServisi';
import { RESMI_MUTFAK_LOGOSU } from '@/src/MalzemeCekmeceleri/Mutfak/resmiMutfakLogosu';
import { gorselUrlGuvenliYap } from '@/src/MalzemeCekmeceleri/sunucuGorselYukleyici';
import { GorselDosyaYukleyici } from '../ReklamYonetimi/GorselDosyaYukleyici';

interface AfisDuzenleEkleModaliProps {
  acikMi: boolean;
  duzenlenecekAfis: MutfakAfisiKaydi | null;
  onayliMutfaklar: Mutfak[];
  varsayilanSira: number;
  onKapat: () => void;
  onKaydet: (veri: MutfakAfisFormVerisi) => Promise<void>;
}

export const AfisDuzenleEkleModali: React.FC<AfisDuzenleEkleModaliProps> = ({
  acikMi,
  duzenlenecekAfis,
  onayliMutfaklar,
  varsayilanSira,
  onKapat,
  onKaydet,
}) => {
  const [mutfakId, setMutfakId] = useState('');
  const [mutfakAdi, setMutfakAdi] = useState('');
  const [baslik, setBaslik] = useState('');
  const [aciklama, setAciklama] = useState('');
  const [rozet, setRozet] = useState('ÖNE ÇIKAN EV MUTFAĞI');
  const [gorselUrl, setGorselUrl] = useState(RESMI_MUTFAK_LOGOSU);
  const [sira, setSira] = useState<number>(1);
  const [butonMetni, setButonMetni] = useState('Mutfağı İncele');
  const [butonHedefi, setButonHedefi] = useState('mutfak_detay');
  const [gorselTipi, setGorselTipi] = useState<'arka_plan' | 'sag_taraf'>('arka_plan');
  const [yayinla, setYayinla] = useState(true);
  const [kaydediliyor, setKaydediliyor] = useState(false);

  useEffect(() => {
    if (!acikMi) return;
    if (duzenlenecekAfis) {
      setMutfakId(duzenlenecekAfis.mutfak_id || '');
      setMutfakAdi(duzenlenecekAfis.mutfak_adi || '');
      setBaslik(duzenlenecekAfis.baslik || '');
      setAciklama(duzenlenecekAfis.aciklama || '');
      setRozet(duzenlenecekAfis.rozet || 'ÖZEL LEZZET');
      setGorselUrl(duzenlenecekAfis.gorsel_url || RESMI_MUTFAK_LOGOSU);
      setSira(Number(duzenlenecekAfis.sira ?? varsayilanSira));
      setButonMetni(duzenlenecekAfis.butonMetni || 'Mutfağı İncele');
      setButonHedefi(duzenlenecekAfis.butonHedefi || 'mutfak_detay');
      setGorselTipi(duzenlenecekAfis.gorselTipi || 'arka_plan');
      setYayinla(duzenlenecekAfis.onayli_mi === true && duzenlenecekAfis.aktif_mi === true);
    } else {
      const ilkMutfak = onayliMutfaklar[0];
      const ilkAd = ilkMutfak?.ad || (ilkMutfak as any)?.mutfak_adi || '';
      setMutfakId(ilkMutfak?.id || '');
      setMutfakAdi(ilkAd);
      setBaslik(ilkAd ? `${ilkAd} — Günün Özel Ev Lezzetleri` : '');
      setAciklama(
        (ilkMutfak as any)?.tanitim_yazisi ||
          ilkMutfak?.aciklama ||
          'Afyonkarahisar ev mutfaklarımızdan taze, katkısız ve ev yapımı lezzetler.'
      );
      setRozet('ÖNE ÇIKAN EV MUTFAĞI');
      setGorselUrl(RESMI_MUTFAK_LOGOSU);
      setSira(varsayilanSira);
      setButonMetni('Mutfağı İncele');
      setButonHedefi('mutfak_detay');
      setGorselTipi('arka_plan');
      setYayinla(true);
    }
  }, [acikMi, duzenlenecekAfis, onayliMutfaklar, varsayilanSira]);

  if (!acikMi) return null;

  const mutfakSecildi = (secilenId: string) => {
    setMutfakId(secilenId);
    const secilen = onayliMutfaklar.find((m) => m.id === secilenId);
    const ad = secilen?.ad || (secilen as any)?.mutfak_adi || '';
    setMutfakAdi(ad);
    if (!duzenlenecekAfis && ad) {
      setBaslik(`${ad} — Günün Özel Ev Lezzetleri`);
      const tanitim = (secilen as any)?.tanitim_yazisi || secilen?.aciklama;
      if (tanitim) {
        setAciklama(tanitim);
      }
    }
  };

  const gonder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!baslik.trim() || !mutfakId) return;
    setKaydediliyor(true);
    try {
      await onKaydet({
        id: duzenlenecekAfis?.id,
        mutfak_id: mutfakId,
        mutfak_adi: mutfakAdi || 'Ev Mutfağı',
        baslik: baslik.trim(),
        aciklama: aciklama.trim(),
        rozet: rozet.trim() || 'ÖZEL LEZZET',
        gorsel_url: gorselUrl.trim() || RESMI_MUTFAK_LOGOSU,
        sira: Math.max(1, Number(sira) || 1),
        onayli_mi: yayinla,
        aktif_mi: yayinla,
        butonMetni: butonMetni.trim() || 'Mutfağı İncele',
        butonHedefi,
        gorselTipi,
      });
      onKapat();
    } finally {
      setKaydediliyor(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <form
        onSubmit={gonder}
        className="bg-[#180A1F] border border-amber-500/40 rounded-3xl w-full max-w-2xl p-6 space-y-4 shadow-2xl text-xs my-8"
      >
        <div className="flex items-center justify-between border-b border-purple-950 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-white">
                {duzenlenecekAfis ? 'Mutfak Afişini Düzenle' : 'Tepe Vitrine Onaylı Mutfak Slaytı Ekle'}
              </h4>
              <p className="text-[11px] text-purple-300">
                AnaAfisBannerVitrini ve MobilKampanyaSlider alanlarında gösterilecek mutfak slaytını yapılandırın.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onKapat}
            className="w-8 h-8 rounded-full bg-purple-950 text-gray-400 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="text-gray-300 font-semibold block mb-1">Onaylı Mutfak Seçimi</label>
            <select
              required
              value={mutfakId}
              onChange={(e) => mutfakSecildi(e.target.value)}
              className="w-full bg-[#120614] border border-purple-800/80 rounded-xl px-3 py-2.5 text-white outline-none focus:border-amber-400"
            >
              <option value="">Mutfak seçiniz...</option>
              {onayliMutfaklar.map((m) => {
                const mAd = m.ad || (m as any).mutfak_adi || m.id;
                return (
                  <option key={m.id} value={m.id}>
                    {mAd} {m.ilce ? `(${m.ilce})` : ''}
                  </option>
                );
              })}
              {duzenlenecekAfis?.mutfak_id &&
                !onayliMutfaklar.some((m) => m.id === duzenlenecekAfis.mutfak_id) && (
                  <option value={duzenlenecekAfis.mutfak_id}>
                    {duzenlenecekAfis.mutfak_adi || duzenlenecekAfis.mutfak_id}
                  </option>
                )}
            </select>
          </div>

          <div>
            <label className="text-gray-300 font-semibold block mb-1">Vitrin Sırası</label>
            <input
              type="number"
              min={1}
              max={999}
              required
              value={sira}
              onChange={(e) => setSira(Number(e.target.value) || 1)}
              className="w-full bg-[#120614] border border-purple-800/80 rounded-xl px-3 py-2.5 text-white font-mono tabular-nums outline-none focus:border-amber-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-gray-300 font-semibold block mb-1">Afiş Başlığı</label>
            <input
              type="text"
              required
              value={baslik}
              onChange={(e) => setBaslik(e.target.value)}
              placeholder="Örn: Fatma Hanım Mutfağı — Haşhaşlı Bükme Şöleni"
              className="w-full bg-[#120614] border border-purple-800/80 rounded-xl px-3 py-2.5 text-white outline-none focus:border-amber-400"
            />
          </div>
          <div>
            <label className="text-gray-300 font-semibold block mb-1">Rozet Metni</label>
            <input
              type="text"
              value={rozet}
              onChange={(e) => setRozet(e.target.value)}
              placeholder="Örn: ÖNE ÇIKAN MUTFAK"
              className="w-full bg-[#120614] border border-purple-800/80 rounded-xl px-3 py-2.5 text-white outline-none focus:border-amber-400"
            />
          </div>
        </div>

        <div>
          <label className="text-gray-300 font-semibold block mb-1">Açıklama</label>
          <textarea
            rows={2}
            value={aciklama}
            onChange={(e) => setAciklama(e.target.value)}
            placeholder="Vitrin bannerında görünecek kısa lezzet açıklaması..."
            className="w-full bg-[#120614] border border-purple-800/80 rounded-xl p-3 text-white outline-none focus:border-amber-400 resize-none"
          />
        </div>

        <div className="space-y-2.5 p-3.5 rounded-2xl bg-[#120614] border border-purple-900/60">
          <GorselDosyaYukleyici
            seciliGorsel={gorselUrl}
            onGorselSecildi={(url) => setGorselUrl(url || RESMI_MUTFAK_LOGOSU)}
            klasorTipi="afisler"
          />
          <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-end">
            <div className="flex-1">
              <label className="text-gray-400 font-semibold block mb-1 text-[11px]">
                Görsel URL (Yüklenebilir veya Harici Bağlantı)
              </label>
              <input
                type="text"
                value={gorselUrl}
                onChange={(e) => setGorselUrl(e.target.value)}
                className="w-full bg-[#180A1F] border border-purple-800/70 rounded-xl px-3 py-2 text-white font-mono text-[11px] outline-none focus:border-amber-400"
              />
            </div>
            <button
              type="button"
              onClick={() => setGorselUrl(RESMI_MUTFAK_LOGOSU)}
              className="px-3 py-2 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-700 text-amber-300 font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Resmi Logo Kullan</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-gray-300 font-semibold block mb-1">Buton Metni</label>
            <input
              type="text"
              value={butonMetni}
              onChange={(e) => setButonMetni(e.target.value)}
              className="w-full bg-[#120614] border border-purple-800/80 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
            />
          </div>
          <div>
            <label className="text-gray-300 font-semibold block mb-1">Tıklama Hedefi</label>
            <select
              value={butonHedefi}
              onChange={(e) => setButonHedefi(e.target.value)}
              className="w-full bg-[#120614] border border-purple-800/80 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
            >
              <option value="mutfak_detay">Seçili Mutfağın Vitrinini Aç</option>
              <option value="mutfaklar">Ev Mutfakları Listesine Kaydır</option>
              <option value="kampanyalar">Kampanyalara Kaydır</option>
              <option value="kayit">Giriş / Kayıt Penceresini Aç</option>
            </select>
          </div>
          <div>
            <label className="text-gray-300 font-semibold block mb-1">Masaüstü Yerleşim</label>
            <select
              value={gorselTipi}
              onChange={(e) => setGorselTipi(e.target.value as 'arka_plan' | 'sag_taraf')}
              className="w-full bg-[#120614] border border-purple-800/80 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
            >
              <option value="arka_plan">Tam Arka Plan</option>
              <option value="sag_taraf">Sağ Taraf Ürün</option>
            </select>
          </div>
        </div>

        <label className="flex items-center justify-between p-3 rounded-xl bg-[#120614] border border-purple-900/60 cursor-pointer">
          <div>
            <span className="font-bold text-white block">Onayla ve Tepe Vitrinde Yayınla</span>
            <span className="text-[11px] text-purple-300">
              İşaretliyse `onayli_mi: true` ve `aktif_mi: true` olarak kaydedilip hemen vitrinde gösterilir.
            </span>
          </div>
          <input
            type="checkbox"
            checked={yayinla}
            onChange={(e) => setYayinla(e.target.checked)}
            className="w-4 h-4 accent-amber-500 cursor-pointer"
          />
        </label>

        {gorselUrl && (
          <div className="relative rounded-xl overflow-hidden h-28 border border-purple-900/60 bg-black">
            <img
              src={gorselUrlGuvenliYap(gorselUrl)}
              alt="Önizleme"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = RESMI_MUTFAK_LOGOSU;
              }}
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-950/90 via-purple-950/60 to-transparent p-3 flex flex-col justify-center">
              <span className="text-[9px] font-bold text-amber-400 uppercase">{rozet || 'ÖZEL LEZZET'}</span>
              <span className="text-sm font-black text-white truncate">{baslik || 'Afiş Başlığı'}</span>
              <span className="text-[11px] text-purple-200 truncate">{mutfakAdi}</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-purple-950">
          <button
            type="button"
            onClick={onKapat}
            className="px-4 py-2 rounded-xl bg-purple-950 text-gray-300 font-bold cursor-pointer"
          >
            Vazgeç
          </button>
          <button
            type="submit"
            disabled={kaydediliyor || !mutfakId || !baslik.trim()}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-purple-950 font-black flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{kaydediliyor ? 'Kaydediliyor...' : duzenlenecekAfis ? 'Değişiklikleri Kaydet' : 'Vitrine Ekle'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
