import React, { useState, useEffect } from 'react';
import { Navigation, Calculator, Zap, DollarSign, MapPin, Check, Sliders, ShieldAlert, Sparkles, Award } from 'lucide-react';
import { useKuryeAyarlari } from '@/src/MalzemeCekmeceleri/useKuryeAyarlari';

export const YonetimAkilliKurye: React.FC = () => {
  const { ayarlar, ayarKaydet } = useKuryeAyarlari();

  // Akıllı Kurye Ayar State'leri (Firebase'den gelecek)
  const [tabanUcret, setTabanUcret] = useState(ayarlar.taban_ucret);
  const [kmBasiUcret, setKmBasiUcret] = useState(ayarlar.km_basi_ucret);
  const [elektrikliBonusu, setElektrikliBonusu] = useState(ayarlar.elektrikli_bonusu);
  const [yagmurluCarpani, setYagmurluCarpani] = useState(ayarlar.yagmurlu_hava_carpani);
  const [geceVardiyasiPrimi, setGeceVardiyasiPrimi] = useState(ayarlar.gece_vardiyasi_primi);
  const [ucretsizTeslimatAktif, setUcretsizTeslimatAktif] = useState(Boolean(ayarlar.ucretsiz_teslimat_aktif));
  const [ucretsizTeslimatEsigi, setUcretsizTeslimatEsigi] = useState(Number(ayarlar.ucretsiz_teslimat_esigi) || 500);

  useEffect(() => {
    setTabanUcret(ayarlar.taban_ucret);
    setKmBasiUcret(ayarlar.km_basi_ucret);
    setElektrikliBonusu(ayarlar.elektrikli_bonusu);
    setYagmurluCarpani(ayarlar.yagmurlu_hava_carpani);
    setGeceVardiyasiPrimi(ayarlar.gece_vardiyasi_primi);
    setUcretsizTeslimatAktif(Boolean(ayarlar.ucretsiz_teslimat_aktif));
    setUcretsizTeslimatEsigi(Number(ayarlar.ucretsiz_teslimat_esigi) || 500);
  }, [ayarlar]);

  // Simülasyon State'leri
  const [simMesafeKm, setSimMesafeKm] = useState(4.5);
  const [simAracTipi, setSimAracTipi] = useState<'Motosiklet' | 'Elektrikli Bisiklet' | 'Yaya'>('Elektrikli Bisiklet');
  const [simYagmurluMu, setSimYagmurluMu] = useState(true);
  const [simKaydetBasarili, setSimKaydetBasarili] = useState(false);

  // Hesaplama Mantığı
  let hesaplananPrim = tabanUcret + (simMesafeKm * kmBasiUcret);
  if (simAracTipi === 'Elektrikli Bisiklet') {
    hesaplananPrim += elektrikliBonusu;
  }
  if (simYagmurluMu) {
    hesaplananPrim *= yagmurluCarpani;
  }

  const ayarKaydetHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    await ayarKaydet({
        id: 'genel_ayarlar',
        taban_ucret: Number(tabanUcret),
        km_basi_ucret: Number(kmBasiUcret),
        elektrikli_bonusu: Number(elektrikliBonusu),
        yagmurlu_hava_carpani: Number(yagmurluCarpani),
        gece_vardiyasi_primi: Number(geceVardiyasiPrimi),
        ucretsiz_teslimat_aktif: ucretsizTeslimatAktif,
        ucretsiz_teslimat_esigi: Number(ucretsizTeslimatEsigi),
    });
    setSimKaydetBasarili(true);
    setTimeout(() => setSimKaydetBasarili(false), 3000);
  };


  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* 🌟 ÜST BİLGİ */}
      <div className="p-5 rounded-2xl bg-[#180A1F] border border-[#3E1646] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Navigation className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base">Akıllı Kurye & Rota Hesaplama Yönetimi</h3>
            <p className="text-xs text-purple-300">KM başı maliyetler, çevre dostu elektrikli araç bonusları, yoğun hava çarpanları ve canlı prim simülatörü.</p>
          </div>
        </div>

        {simKaydetBasarili && (
          <div className="px-4 py-2 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-bold flex items-center gap-2 animate-bounce">
            <Check className="w-4 h-4" />
            <span>Akıllı Rota Kuralları Başarıyla Güncellendi!</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* SOL: Algoritma Parametreleri (Tam Kontrol) */}
        <div className="p-6 rounded-2xl bg-[#180A1F] border border-[#3E1646] space-y-4">
          <h4 className="font-bold text-white text-sm flex items-center gap-2 border-b border-purple-950 pb-3">
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>Algoritma & Ücretlendirme Katsayıları</span>
          </h4>

          <form onSubmit={ayarKaydetHandler} className="space-y-4 text-xs">
            <div>
              <label className="text-gray-300 block mb-1 font-semibold">Taban Teslimat Ücreti (TL)</label>
              <input
                type="number"
                value={tabanUcret}
                onChange={(e) => setTabanUcret(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#130713] border border-purple-800 rounded-xl px-3 py-2.5 text-white font-bold focus:outline-none focus:border-amber-400"
              />
              <span className="text-[10px] text-gray-500 mt-0.5 block">Sipariş başı kuryeye ödenen minimum sabit taban prim.</span>
            </div>

            <div>
              <label className="text-gray-300 block mb-1 font-semibold">Kilometre Başına Ek Ücret (TL / KM)</label>
              <input
                type="number"
                value={kmBasiUcret}
                onChange={(e) => setKmBasiUcret(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#130713] border border-purple-800 rounded-xl px-3 py-2.5 text-white font-bold focus:outline-none focus:border-amber-400"
              />
              <span className="text-[10px] text-gray-500 mt-0.5 block">Mutfak ile teslimat adresi arasındaki kuş uçuşu / harita mesafesi çarpanı.</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-300 block mb-1 font-semibold">🌱 Elektrikli Araç Bonusu (TL)</label>
                <input
                  type="number"
                  value={elektrikliBonusu}
                  onChange={(e) => setElektrikliBonusu(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#130713] border border-purple-800 rounded-xl px-3 py-2.5 text-white font-bold focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-gray-300 block mb-1 font-semibold">🌧️ Yağmurlu Hava Çarpanı</label>
                <input
                  type="number"
                  step="0.05"
                  value={yagmurluCarpani}
                  onChange={(e) => setYagmurluCarpani(parseFloat(e.target.value) || 1.0)}
                  className="w-full bg-[#130713] border border-purple-800 rounded-xl px-3 py-2.5 text-white font-bold focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="text-gray-300 block mb-1 font-semibold">🌙 Gece Vardiyası Ek Primi (TL)</label>
              <input
                type="number"
                value={geceVardiyasiPrimi}
                onChange={(e) => setGeceVardiyasiPrimi(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#130713] border border-purple-800 rounded-xl px-3 py-2.5 text-white font-bold focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* 👑 PATRON ÖZEL KONTROLÜ: ÜCRETSİZ TESLİMAT KAMPANYASI */}
            <div className="bg-[#130713] p-3.5 rounded-xl border border-amber-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-white font-bold block text-xs">👑 Ücretsiz Kurye Kampanyası</span>
                  <span className="text-[10px] text-gray-400">Belirlediğin tutarın üzerindeki sepetlerde kurye ücretini sıfırlar.</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ucretsizTeslimatAktif}
                    onChange={(e) => setUcretsizTeslimatAktif(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                </label>
              </div>

              {ucretsizTeslimatAktif && (
                <div className="pt-2 border-t border-purple-900/40">
                  <label className="text-gray-300 block mb-1 font-semibold">Minimum Sepet Tutarı (TL)</label>
                  <input
                    type="number"
                    value={ucretsizTeslimatEsigi}
                    onChange={(e) => setUcretsizTeslimatEsigi(parseFloat(e.target.value) || 0)}
                    placeholder="Örn: 500"
                    className="w-full bg-[#1A0A1D] border border-emerald-500/50 rounded-xl px-3 py-2 text-emerald-300 font-extrabold focus:outline-none focus:border-emerald-400"
                  />
                  <span className="text-[10px] text-emerald-400/80 mt-0.5 block">
                    Yalnızca {ucretsizTeslimatEsigi} ₺ ve üzeri sepetlerde kurye ücreti 0 ₺ olur.
                  </span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-gray-950 font-extrabold cursor-pointer hover:brightness-110 shadow-md mt-2"
            >
              Katsayıları ve Kuralları Kaydet
            </button>
          </form>
        </div>

        {/* SAĞ: Canlı Rota & Prim Simülatörü */}
        <div className="p-6 rounded-2xl bg-[#180A1F] border border-[#3E1646] space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="font-bold text-white text-sm flex items-center gap-2 border-b border-purple-950 pb-3">
              <Calculator className="w-4 h-4 text-emerald-400" />
              <span>Canlı Rota & Prim Hesaplama Simülatörü</span>
            </h4>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-gray-400 block mb-1">Rota Mesafesi: <strong className="text-white">{simMesafeKm} KM</strong></label>
                <input
                  type="range"
                  min="0.5"
                  max="15"
                  step="0.5"
                  value={simMesafeKm}
                  onChange={(e) => setSimMesafeKm(parseFloat(e.target.value) || 1)}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Kurye Araç Tipi</label>
                <select
                  value={simAracTipi}
                  onChange={(e) => setSimAracTipi(e.target.value as any)}
                  className="w-full bg-[#130713] border border-purple-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400 font-semibold"
                >
                  <option value="Motosiklet">Motosiklet (Standart)</option>
                  <option value="Elektrikli Bisiklet">Elektrikli Bisiklet (Çevre Dostu Bonus)</option>
                  <option value="Yaya">Yaya / Mahalle İçi</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#130713] border border-purple-900">
                <span className="text-gray-300 font-medium">Hava Durumu: Yağmurlu / Zorlu Koşul</span>
                <input
                  type="checkbox"
                  checked={simYagmurluMu}
                  onChange={(e) => setSimYagmurluMu(e.target.checked)}
                  className="w-4 h-4 accent-amber-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Hesaplama Sonucu Kartı */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#250D2D] to-[#120614] border border-amber-500/40 space-y-2">
            <span className="text-[10px] text-amber-300 font-extrabold uppercase tracking-wider block">
              SİMÜLASYON HESAPLAMA SONUCU
            </span>
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs text-gray-400">Kurye Sefer Primi:</span>
                <div className="text-2xl font-black text-emerald-400 mt-0.5">
                  {hesaplananPrim.toFixed(2)} ₺
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-purple-300 bg-purple-950 px-2 py-1 rounded-lg border border-purple-800">
                  ⚡ Tahmini Teslimat: {Math.round(12 + simMesafeKm * 3)} Dk
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
