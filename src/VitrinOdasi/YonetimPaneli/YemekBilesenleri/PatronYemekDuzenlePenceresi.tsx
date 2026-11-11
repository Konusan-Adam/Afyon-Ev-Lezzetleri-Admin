import React, { useState } from 'react';
import { X, Edit3, Check, Store, Loader2 } from 'lucide-react';
import { kategorileriGetir } from '@/src/MalzemeCekmeceleri/kategorileriGetir';
import { canliFirebaseAktifMi } from '@/src/veritabani/FirebaseIstemcisi';
import { belgeKaydet } from '@/src/veritabani/FirebaseKoleksiyonServisi';
import { type Yemek, type Mutfak } from '@/src/veritabani/VeriTipleri';
import { type SecenekGrubu, porsiyonBelirle } from '@/src/MalzemeCekmeceleri';
import { YemekSecenekDuzenleyici } from '@/src/VitrinOdasi/Bilesenler';
import { YemekGorselSecici } from '@/src/VitrinOdasi/MutfakPaneli/YemekGorselSecici';

interface PatronYemekDuzenlePenceresiOzellikleri {
  yemek: Yemek & { tukendi_mi?: boolean };
  mutfaklar: Mutfak[];
  onKapat: () => void;
  onGuncellendi: (guncelYemek: Yemek) => void;
}

export const PatronYemekDuzenlePenceresi: React.FC<PatronYemekDuzenlePenceresiOzellikleri> = ({
  yemek,
  mutfaklar,
  onKapat,
  onGuncellendi,
}) => {
  const { kategoriler, altKategoriler } = kategorileriGetir();
  const [baslik, setBaslik] = useState(yemek.baslik || '');
  const [mutfakId, setMutfakId] = useState(yemek.mutfak_id || mutfaklar[0]?.id || 'mutfak-1');
  const [aciklama, setAciklama] = useState(yemek.aciklama || '');
  const [fiyat, setFiyat] = useState<number | ''>(yemek.fiyat || '');
  const [birim, setBirim] = useState(yemek.birim || 'Porsiyon');
  const [stokTipi, setStokTipi] = useState<'sinirsiz' | 'sinirli'>(
    yemek.sinirsiz_stok === false || (yemek.gunluk_stok !== undefined && yemek.gunluk_stok > 0)
      ? 'sinirli'
      : 'sinirsiz'
  );
  const [gunlukStok, setGunlukStok] = useState<number | ''>(yemek.gunluk_stok || 10);
  const [kategori, setKategori] = useState(yemek.kategori || kategoriler[1]?.ad || 'Hamur İşleri & Bükme');
  const [altKategori, setAltKategori] = useState<string>(yemek.alt_kategori || '');
  const [hazirlanmaSuresi, setHazirlanmaSuresi] = useState(yemek.hazirlanma_suresi || '20-30 dk');
  const [onayDurumu, setOnayDurumu] = useState<'onaylandi' | 'beklemede' | 'reddedildi'>(
    (yemek as any).onay_durumu || (yemek.onayli_mi ? 'onaylandi' : 'beklemede')
  );

  // Seçilen kategoriye ait alt kategoriler
  const seciliKategoriNesnesi = kategoriler.find((k) => k.ad === kategori);
  const bagliAltlar = seciliKategoriNesnesi
    ? altKategoriler.filter((a) => a.ust_kategori_id === seciliKategoriNesnesi.id)
    : [];

  const [gorselUrl, setGorselUrl] = useState(yemek.gorsel_url || '');
  const [gorselYukleniyor, setGorselYukleniyor] = useState(false);
  const [secenekGruplari, setSecenekGruplari] = useState<SecenekGrubu[]>(yemek.secenek_gruplari || []);
  const [hata, setHata] = useState('');

  const guncelle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (gorselYukleniyor) {
      setHata('Fotoğrafınız cPanel sunucusuna aktarılıyor, lütfen bekleyin...');
      return;
    }
    if (!baslik.trim()) {
      setHata('Lütfen yemek adını yazınız.');
      return;
    }
    if (!fiyat || Number(fiyat) <= 0) {
      setHata('Lütfen geçerli bir birim fiyatı giriniz.');
      return;
    }
    if (!gorselUrl.trim()) {
      setHata('Lütfen yemeğe ait gerçek bir fotoğraf yükleyiniz. Görsel boş bırakılamaz.');
      return;
    }

    const guncelYemekVerisi: any = {
      ...yemek,
      mutfak_id: mutfakId,
      baslik: baslik.trim(),
      aciklama: aciklama.trim() || 'Patron onaylı taze Afyon lezzeti.',
      fiyat: Number(fiyat),
      birim: birim || 'Porsiyon',
      gunluk_stok: stokTipi === 'sinirli' ? Number(gunlukStok) || 10 : undefined,
      kalan_stok: stokTipi === 'sinirli' ? Number(gunlukStok) || 10 : undefined,
      sinirsiz_stok: stokTipi === 'sinirsiz',
      kategori,
      alt_kategori: altKategori ? altKategori.trim() : '',
      hazirlanma_suresi: hazirlanmaSuresi,
      gorsel_url: gorselUrl.trim(),
      onay_durumu: onayDurumu,
      onayli_mi: onayDurumu === 'onaylandi',
      secenek_gruplari: secenekGruplari || [],
    };

    if (stokTipi === 'sinirli') {
      const miktar = Number(gunlukStok) || 10;
      porsiyonBelirle(yemek.id, miktar, miktar, birim, false);
    } else {
      porsiyonBelirle(yemek.id, 999, 999, birim, true);
    }

    if (canliFirebaseAktifMi()) {
      await belgeKaydet('yemekler', yemek.id, guncelYemekVerisi);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('afyon_yemekler_guncellendi'));
    }

    onGuncellendi(guncelYemekVerisi as Yemek);
    onKapat();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#1D0A20] border border-amber-500/60 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Üst Bar */}
        <div className="p-4 border-b border-[#3E1646] flex items-center justify-between bg-[#240C28]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Edit3 className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Yemek & Menü Bilgilerini Düzenle</h3>
              <p className="text-[10px] text-amber-400/80">ID: {yemek.id}</p>
            </div>
          </div>
          <button onClick={onKapat} className="text-gray-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Alanı */}
        <form onSubmit={guncelle} className="p-4 overflow-y-auto space-y-3.5 flex-1 text-xs">
          {hata && (
            <div className="bg-rose-950/80 border border-rose-500 text-rose-200 p-2.5 rounded-xl text-xs">
              {hata}
            </div>
          )}

          {/* Mutfak Seçimi & Onay Durumu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#18081A] border border-purple-900/50 p-3 rounded-2xl">
            <div>
              <label className="block text-amber-300 font-semibold mb-1 flex items-center gap-1">
                <Store className="w-3.5 h-3.5" />
                <span>Yemeğin Bağlı Olduğu Mutfak</span>
              </label>
              <select
                value={mutfakId}
                onChange={(e) => setMutfakId(e.target.value)}
                className="w-full bg-[#130713] border border-purple-900/70 rounded-xl px-2.5 py-2 text-white focus:border-amber-400 outline-none font-bold"
              >
                {mutfaklar.map((m) => (
                  <option key={m.id} value={m.id} className="bg-[#1D0A20] text-white">
                    {m.ad || (m as any).mutfak_adi || m.id}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-1">Yayın & Onay Durumu</label>
              <select
                value={onayDurumu}
                onChange={(e) => setOnayDurumu(e.target.value as any)}
                className="w-full bg-[#130713] border border-purple-900/70 rounded-xl px-2.5 py-2 text-white focus:border-amber-400 outline-none font-semibold"
              >
                <option value="onaylandi" className="bg-[#1D0A20] text-emerald-300">
                  ✅ Onaylı & Canlıda
                </option>
                <option value="beklemede" className="bg-[#1D0A20] text-amber-300">
                  ⏳ Onay Bekliyor
                </option>
                <option value="reddedildi" className="bg-[#1D0A20] text-rose-400">
                  ❌ Reddedildi
                </option>
              </select>
            </div>
          </div>

          {/* Yemek Adı */}
          <div>
            <label className="block text-gray-300 font-semibold mb-1">Yemek / Lezzet Adı</label>
            <input
              type="text"
              value={baslik}
              onChange={(e) => {
                setBaslik(e.target.value);
                setHata('');
              }}
              placeholder="Örn: Hakiki Haşhaşlı Katmer (2 Adet)"
              className="w-full bg-[#130713] border border-purple-900/60 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:border-amber-400 outline-none"
            />
          </div>

          {/* Kategori, Fiyat ve Satış Birimi */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Ana Kategori</label>
              <select
                value={kategori}
                onChange={(e) => {
                  setKategori(e.target.value);
                  setAltKategori('');
                }}
                className="w-full bg-[#130713] border border-purple-900/60 rounded-xl px-2.5 py-2 text-white focus:border-amber-400 outline-none"
              >
                {kategoriler
                  .filter((k) => k.id !== 'hepsi')
                  .map((k) => (
                    <option key={k.id} value={k.ad} className="bg-[#1D0A20] text-white">
                      {k.ad}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-1">Birim Fiyatı (₺)</label>
              <input
                type="number"
                min="10"
                value={fiyat}
                onChange={(e) => {
                  setFiyat(e.target.value ? Number(e.target.value) : '');
                  setHata('');
                }}
                placeholder="Örn: 140"
                className="w-full bg-[#130713] border border-purple-900/60 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:border-amber-400 outline-none font-bold"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-1">Satış Birimi</label>
              <select
                value={birim}
                onChange={(e) => setBirim(e.target.value)}
                className="w-full bg-[#130713] border border-purple-900/60 rounded-xl px-2.5 py-2 text-white focus:border-amber-400 outline-none font-medium"
              >
                <option value="Porsiyon">Porsiyon</option>
                <option value="Adet">Adet</option>
                <option value="Kg">Kg (Kilogram)</option>
                <option value="Gram">Gram</option>
                <option value="Litre">Litre</option>
                <option value="Dilim">Dilim</option>
                <option value="Tepsi">Tepsi</option>
                <option value="Kavanoz">Kavanoz</option>
                <option value="Tabak">Tabak</option>
                <option value="Paket">Paket</option>
              </select>
            </div>
          </div>

          {/* Günlük Hazırlık & Stok Durumu */}
          <div className="bg-[#18081A] border border-purple-900/50 rounded-2xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-300 font-semibold text-xs">Günlük Üretim & Stok Durumu</span>
              <div className="flex items-center gap-1 bg-[#120514] p-1 rounded-xl border border-purple-900/40">
                <button
                  type="button"
                  onClick={() => setStokTipi('sinirsiz')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    stokTipi === 'sinirsiz'
                      ? 'bg-purple-700 text-white shadow'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Taze Pişer (Sınırsız)
                </button>
                <button
                  type="button"
                  onClick={() => setStokTipi('sinirli')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    stokTipi === 'sinirli'
                      ? 'bg-amber-500 text-black shadow'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Sınırlı Günlük Stok
                </button>
              </div>
            </div>

            {stokTipi === 'sinirli' ? (
              <div className="flex items-center gap-2 pt-1 border-t border-purple-900/30">
                <label className="text-gray-400 text-xs whitespace-nowrap">Günlük Üretim:</label>
                <input
                  type="number"
                  min="1"
                  max="999"
                  value={gunlukStok}
                  onChange={(e) => setGunlukStok(e.target.value ? Number(e.target.value) : '')}
                  placeholder="Örn: 10"
                  className="w-20 bg-[#130713] border border-amber-500/60 rounded-lg px-2.5 py-1 text-white font-bold text-center outline-none focus:border-amber-400 text-xs"
                />
                <span className="text-amber-300 font-bold text-xs">{birim}</span>
                <span className="text-gray-500 text-[10px] ml-auto">
                  (3 {birim.toLowerCase()} kaldığında kartta acil rozeti görünür)
                </span>
              </div>
            ) : (
              <p className="text-[11px] text-purple-300/60">
                Sipariş geldikçe taze pişirilir. Kart üzerinde sahte stok uyarısı gösterilmez.
              </p>
            )}
          </div>

          {/* Alt Kategori Seçimi (Dinamik) */}
          {bagliAltlar.length > 0 && (
            <div>
              <label className="block text-gray-300 font-semibold mb-1 text-xs">
                Alt Kategori / Çeşit (İsteğe Bağlı)
              </label>
              <select
                value={altKategori}
                onChange={(e) => setAltKategori(e.target.value)}
                className="w-full bg-[#130713] border border-purple-900/60 rounded-xl px-2.5 py-2 text-white text-xs focus:border-amber-400 outline-none"
              >
                <option value="">-- Genel / Belirtilmemiş --</option>
                {bagliAltlar.map((alt) => (
                  <option key={alt.id} value={alt.ad} className="bg-[#1D0A20] text-white">
                    {alt.ad}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Hazırlık Süresi */}
          <div>
            <label className="block text-gray-300 font-semibold mb-1">Tahmini Pişirme / Hazırlık Süresi</label>
            <input
              type="text"
              value={hazirlanmaSuresi}
              onChange={(e) => setHazirlanmaSuresi(e.target.value)}
              placeholder="Örn: 20-30 dk"
              className="w-full bg-[#130713] border border-purple-900/60 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:border-amber-400 outline-none"
            />
          </div>

          {/* Cihazdan / Galeriden Fotoğraf Seçici */}
          <YemekGorselSecici
            secilenGorsel={gorselUrl}
            onGorselSec={setGorselUrl}
            onYukleniyor={setGorselYukleniyor}
          />

          {/* Varyasyon ve Porsiyon Düzenleyici (Yemeksepeti Modeli) */}
          <YemekSecenekDuzenleyici
            kategori={kategori}
            secenekGruplari={secenekGruplari}
            onChange={setSecenekGruplari}
          />

          {/* Açıklama */}
          <div>
            <label className="block text-gray-300 font-semibold mb-1">Lezzet Tarifi & Malzeme Notu</label>
            <textarea
              rows={2}
              value={aciklama}
              onChange={(e) => setAciklama(e.target.value)}
              placeholder="Örn: Hakiki Afyon manda kaymağı ve yerli tohum haşhaş ile taze taze açılmıştır."
              className="w-full bg-[#130713] border border-purple-900/60 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:border-amber-400 outline-none resize-none"
            />
          </div>

          {/* Kaydet Butonu */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-purple-900/40">
            <button
              type="button"
              onClick={onKapat}
              disabled={gorselYukleniyor}
              className="px-4 py-2 rounded-xl bg-purple-950/80 border border-purple-800 text-gray-300 hover:text-white cursor-pointer disabled:opacity-50"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={gorselYukleniyor}
              className={`px-5 py-2 rounded-xl font-extrabold flex items-center gap-1.5 shadow-lg transition-all ${
                gorselYukleniyor
                  ? 'bg-amber-600/60 text-black/70 cursor-wait animate-pulse shadow-none'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 text-gray-950 cursor-pointer hover:brightness-110 shadow-amber-500/20'
              }`}
            >
              {gorselYukleniyor ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Fotoğraf Sunucuya Yükleniyor...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Değişiklikleri Kaydet & Güncelle</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
