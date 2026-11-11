import React, { useState, useEffect } from 'react';
import { Megaphone, Save, CheckCircle2 } from 'lucide-react';
import { useCanliReklamAyarlari } from '@/src/MalzemeCekmeceleri/useCanliReklamAyarlari';
import { ReklamAyarlari } from '@/src/veritabani/GercekVeriYardimcisi';
import { AnaAfisAyarKarti } from './ReklamYonetimi/AnaAfisAyarKarti';
import { TepeSeritAyarKarti } from './ReklamYonetimi/TepeSeritAyarKarti';
import { KareReklamAyarKarti } from './ReklamYonetimi/KareReklamAyarKarti';
import { KuponAyarKarti } from './ReklamYonetimi/KuponAyarKarti';
import { MobilKampanyaAyarKarti } from './ReklamYonetimi/MobilKampanyaAyarKarti';
import { useKampanyalar } from '@/src/MalzemeCekmeceleri/KampanyaCekmecesi';

export const YonetimReklamBanner: React.FC = () => {
  const { ayarlar: canliAyarlar, reklamAyarlariniGuncelle } = useCanliReklamAyarlari();
  const { kampanyalar, kampanyalariKaydet } = useKampanyalar();
  const [ayarlar, setAyarlar] = useState<ReklamAyarlari>(canliAyarlar);
  const [mobilKampanyalar, setMobilKampanyalar] = useState(kampanyalar);
  const [kaydedildi, setKaydedildi] = useState<boolean>(false);
  const [kaydediliyor, setKaydediliyor] = useState<boolean>(false);

  useEffect(() => {
    if (canliAyarlar) setAyarlar(canliAyarlar);
    if (kampanyalar) setMobilKampanyalar(kampanyalar);
  }, [canliAyarlar, kampanyalar]);

  const kaydet = async (e: React.FormEvent) => {
    e.preventDefault();
    setKaydediliyor(true);

    const basarili1 = await reklamAyarlariniGuncelle(ayarlar);
    const basarili2 = await kampanyalariKaydet(mobilKampanyalar);

    setKaydediliyor(false);
    if (basarili1 && basarili2) {
      setKaydedildi(true);
      setTimeout(() => setKaydedildi(false), 3500);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-purple-900/40">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-amber-400" />
            <span>Vitrin Afiş, Tepe Şerit ve Kare Reklam Yönetimi (%100 Canlı)</span>
          </h2>
          <p className="text-xs text-purple-300">
            Tepe duyuru şeridi, ana afiş alanı ve masaüstü kare reklam kutusunu doğrudan canlı Firebase veritabanı üzerinden yönetebilirsiniz.
          </p>
        </div>

        {kaydedildi && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs font-bold animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Tüm Reklam ve Afişler Canlıya Kaydedildi!</span>
          </div>
        )}
      </div>

      <form onSubmit={kaydet} className="space-y-6">
        {/* 1. Tepe İnce Duyuru Şeridi (3 Slayt) */}
        <TepeSeritAyarKarti 
          liste={ayarlar.tepeBantListesi || []} 
          onDegis={(yeni: any) => setAyarlar((eski: any) => ({ ...eski, tepeBantListesi: yeni }))} 
        />

        {/* 2. Ana Vitrin Afişi (3 Slayt) */}
        <AnaAfisAyarKarti 
          liste={ayarlar.anaAfisListesi || []} 
          onDegis={(yeni: any) => setAyarlar((eski: any) => ({ ...eski, anaAfisListesi: yeni }))} 
        />

        {/* 3. Masaüstü Kare Reklam Kutusu (3 Slayt) */}
        <KareReklamAyarKarti 
          liste={ayarlar.kareReklamListesi || []} 
          onDegis={(yeni: any) => setAyarlar((eski: any) => ({ ...eski, kareReklamListesi: yeni }))} 
        />

        {/* 4. Mobil Kampanya Ayarları */}
        <MobilKampanyaAyarKarti
          liste={mobilKampanyalar}
          onDegis={(yeni) => setMobilKampanyalar(yeni)}
        />

        {/* 5. Sepet İndirim Kuponu Ayarı */}
        <KuponAyarKarti />

        {/* Alt Kaydet Butonu */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={kaydediliyor}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-500/25 hover:from-amber-400 hover:to-orange-500 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{kaydediliyor ? 'Canlıya Kaydediliyor...' : 'Tüm Değişiklikleri Canlıya Kaydet'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
