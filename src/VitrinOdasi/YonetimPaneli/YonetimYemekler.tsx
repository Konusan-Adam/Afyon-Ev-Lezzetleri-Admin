import React, { useState, useEffect } from 'react';
import { UtensilsCrossed, Plus, Search, Tag, Trash2, Edit3, Check, X, Store, Sparkles, Clock, CheckCircle2, XCircle, Layers } from 'lucide-react';
import { Yemek, Mutfak } from '@/src/veritabani/VeriTipleri';
import { canliFirebaseAktifMi } from '@/src/veritabani/FirebaseIstemcisi';
import { koleksiyonGetir, belgeKaydet, belgeSil } from '@/src/veritabani/FirebaseKoleksiyonServisi';
import { kategorileriGetir } from '@/src/MalzemeCekmeceleri/kategorileriGetir';
import { gorselUrlGuvenliYap } from '@/src/MalzemeCekmeceleri/sunucuGorselYukleyici';
import { PatronYemekEklePenceresi } from './YemekBilesenleri/PatronYemekEklePenceresi';
import { PatronYemekDuzenlePenceresi } from './YemekBilesenleri/PatronYemekDuzenlePenceresi';

export const YonetimYemekler: React.FC = () => {
  const [yemekler, setYemekler] = useState<(Yemek & { tukendi_mi?: boolean })[]>([]);
  const [mutfaklar, setMutfaklar] = useState<Mutfak[]>([]);
  const [arama, setArama] = useState('');
  const [secilenKategori, setSecilenKategori] = useState<string>('hepsi');
  const [onayFiltresi, setOnayFiltresi] = useState<'hepsi' | 'bekleyenler' | 'onaylilar' | 'reddedilenler'>('hepsi');
  const [yeniModalAcik, setYeniModalAcik] = useState(false);
  const [duzenlenenYemek, setDuzenlenenYemek] = useState<(Yemek & { tukendi_mi?: boolean }) | null>(null);

  const { kategoriler } = kategorileriGetir();

  useEffect(() => {
    async function yukle() {
      if (canliFirebaseAktifMi()) {
        try {
          const [fbYemekler, fbMutfaklar] = await Promise.all([
            koleksiyonGetir<Yemek>('yemekler'),
            koleksiyonGetir<Mutfak>('mutfaklar'),
          ]);
          if (fbYemekler && fbYemekler.length > 0) {
            setYemekler(fbYemekler);
          }
          if (fbMutfaklar && fbMutfaklar.length > 0) {
            setMutfaklar(fbMutfaklar);
          }
        } catch (err) {
          console.warn('Firebase veri çekme hatası:', err);
        }
      }
    }
    yukle();
  }, []);

  const yemekSil = async (id: string) => {
    if (confirm('Bu yemeği menüden kalıcı olarak silmek istediğinize emin misiniz?')) {
      setYemekler((onceki) => onceki.filter((y) => y.id !== id));
      if (canliFirebaseAktifMi()) {
        try {
          await belgeSil('yemekler', id);
        } catch {}
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('afyon_yemekler_guncellendi'));
      }
    }
  };

  const stokDurumDegistir = async (id: string) => {
    let yeniDurum = false;
    setYemekler((onceki) =>
      onceki.map((y) => {
        if (y.id === id) {
          yeniDurum = !y.tukendi_mi;
          return { ...y, tukendi_mi: yeniDurum };
        }
        return y;
      })
    );
    if (canliFirebaseAktifMi()) {
      try {
        await belgeKaydet('yemekler', id, { tukendi_mi: yeniDurum });
      } catch {}
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('afyon_yemekler_guncellendi'));
    }
  };

  const yemekOnayDurumDegistir = async (id: string, onay: boolean) => {
    const durum = onay ? 'onaylandi' : 'reddedildi';
    setYemekler((onceki) =>
      onceki.map((y) => {
        if (y.id === id) {
          return { ...y, onayli_mi: onay, onay_durumu: durum } as any;
        }
        return y;
      })
    );

    if (canliFirebaseAktifMi()) {
      try {
        await belgeKaydet('yemekler', id, {
          onayli_mi: onay,
          onay_durumu: durum,
        });
      } catch (err) {
        console.warn('Yemek onay durumu kaydetme hatası:', err);
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('afyon_yemekler_guncellendi'));
    }
  };

  const onayBekleyenSayisi = yemekler.filter(
    (y: any) => y.onay_durumu === 'beklemede' || y.onayli_mi === false
  ).length;

  const filtrelenmis = yemekler.filter((y) => {
    const uyumArama =
      y.baslik.toLowerCase().includes(arama.toLowerCase()) ||
      y.kategori.toLowerCase().includes(arama.toLowerCase()) ||
      (y.alt_kategori && y.alt_kategori.toLowerCase().includes(arama.toLowerCase()));
    const uyumKategori = secilenKategori === 'hepsi' || y.kategori === secilenKategori;

    let uyumOnay = true;
    const bekliyor = (y as any).onay_durumu === 'beklemede' || (y as any).onayli_mi === false;
    const reddedildi = (y as any).onay_durumu === 'reddedildi';
    const onayli = Boolean((y as any).onay_durumu === 'onaylandi' || (y.onayli_mi && !bekliyor && !reddedildi));

    if (onayFiltresi === 'bekleyenler') uyumOnay = bekliyor;
    else if (onayFiltresi === 'onaylilar') uyumOnay = onayli;
    else if (onayFiltresi === 'reddedilenler') uyumOnay = reddedildi;

    return uyumArama && uyumKategori && uyumOnay;
  });

  return (
    <div className="space-y-6">
      {/* 🌟 ÜST BAŞLIK VE YENİ EKLE BUTONU */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[#1A0A21] border border-[#521E5C] shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <UtensilsCrossed className="w-6 h-6 text-amber-400" />
            <span>Afyon Menü & Yemek Yönetimi</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Mutfakların menülerini inceleyin, onaylayın, yeni lezzetler veya varyasyonlar tanımlayın.
          </p>
        </div>
        <button
          onClick={() => setYeniModalAcik(true)}
          className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-purple-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Yeni Yemek / Menü Ekle</span>
        </button>
      </div>

      {/* 🔍 ARAMA VE FİLTRELEME ÇUBUĞU */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Yemek, lezzet veya alt kategori adı ile ara..."
            value={arama}
            onChange={(e) => setArama(e.target.value)}
            className="w-full bg-[#180A1F] border border-[#3E1646] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>
      </div>

      {/* 🚦 ONAY DURUMU SEKMELERİ */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setOnayFiltresi('hepsi')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            onayFiltresi === 'hepsi'
              ? 'bg-amber-500 text-purple-950 shadow-md'
              : 'bg-[#180A1F] text-gray-400 hover:text-white border border-[#3E1646]'
          }`}
        >
          Tüm Yemekler ({yemekler.length})
        </button>
        <button
          onClick={() => setOnayFiltresi('bekleyenler')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            onayFiltresi === 'bekleyenler'
              ? 'bg-amber-500 text-purple-950 shadow-md'
              : 'bg-[#180A1F] text-amber-300 hover:bg-amber-950/40 border border-amber-500/40'
          }`}
        >
          <span>⏳ Onay Bekleyenler</span>
          {onayBekleyenSayisi > 0 && (
            <span className="px-1.5 py-0.2 bg-amber-400 text-purple-950 rounded-full text-[10px] font-black animate-pulse">
              {onayBekleyenSayisi}
            </span>
          )}
        </button>
        <button
          onClick={() => setOnayFiltresi('onaylilar')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            onayFiltresi === 'onaylilar'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-[#180A1F] text-gray-400 hover:text-emerald-300 border border-[#3E1646]'
          }`}
        >
          ✅ Onaylananlar (
          {
            yemekler.filter(
              (y: any) =>
                y.onay_durumu === 'onaylandi' ||
                (y.onayli_mi && y.onay_durumu !== 'beklemede' && y.onay_durumu !== 'reddedildi')
            ).length
          }
          )
        </button>
        <button
          onClick={() => setOnayFiltresi('reddedilenler')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            onayFiltresi === 'reddedilenler'
              ? 'bg-rose-800 text-white shadow-md'
              : 'bg-[#180A1F] text-gray-400 hover:text-rose-300 border border-[#3E1646]'
          }`}
        >
          ❌ Reddedilenler ({yemekler.filter((y: any) => y.onay_durumu === 'reddedildi').length})
        </button>
      </div>

      {/* 🏷️ KATEGORİ FİLTRELERİ */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        <button
          onClick={() => setSecilenKategori('hepsi')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            secilenKategori === 'hepsi'
              ? 'bg-[#7B258B] text-white shadow-md'
              : 'bg-[#180A1F] text-gray-400 hover:text-white border border-[#3E1646]'
          }`}
        >
          Tüm Kategoriler ({yemekler.length})
        </button>
        {kategoriler
          .filter((k) => k.id !== 'hepsi')
          .map((kat) => (
            <button
              key={kat.id}
              onClick={() => setSecilenKategori(kat.ad)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                secilenKategori === kat.ad
                  ? 'bg-[#7B258B] text-white shadow-md'
                  : 'bg-[#180A1F] text-gray-400 hover:text-white border border-[#3E1646]'
              }`}
            >
              {kat.ad}
            </button>
          ))}
      </div>

      {/* 📋 YEMEK LİSTESİ GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtrelenmis.map((yemek) => {
          const tukendi = yemek.tukendi_mi;
          const bekliyor = (yemek as any).onay_durumu === 'beklemede' || (yemek as any).onayli_mi === false;
          const reddedildi = (yemek as any).onay_durumu === 'reddedildi';
          const mutfak = mutfaklar.find((m) => m.id === yemek.mutfak_id);
          const mutfakAdi = mutfak?.ad || (mutfak as any)?.mutfak_adi || yemek.mutfak_id || 'Afyon Mutfağı';

          return (
            <div
              key={yemek.id}
              className={`p-4 rounded-2xl bg-[#180A1F] border transition-all flex flex-col justify-between gap-3 ${
                bekliyor
                  ? 'border-amber-500/50 bg-[#1E0E22]'
                  : reddedildi
                  ? 'border-rose-900/60 bg-[#22090D]'
                  : tukendi
                  ? 'border-rose-900/60 bg-[#22090D]'
                  : 'border-[#3E1646] hover:border-amber-500/40'
              }`}
            >
              <div className="flex gap-3.5">
                <img
                  src={gorselUrlGuvenliYap(yemek.gorsel_url)}
                  alt={yemek.baslik}
                  className="w-20 h-20 rounded-xl object-cover border border-purple-800/50 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <h4 className="font-bold text-white text-sm truncate">{yemek.baslik}</h4>
                    <span className="text-xs text-amber-400 font-black bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 shrink-0">
                      {yemek.fiyat} ₺
                      {yemek.birim && (
                        <span className="text-[10px] text-gray-400 font-normal"> / {yemek.birim}</span>
                      )}
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-400 line-clamp-2 mt-1">{yemek.aciklama}</p>

                  {/* Mutfak ve Kategori Etiketleri */}
                  <div className="flex items-center flex-wrap gap-1.5 mt-2">
                    <span className="text-[10px] text-amber-300 bg-amber-950/70 px-2 py-0.5 rounded-full border border-amber-600/40 flex items-center gap-1 font-semibold truncate max-w-[140px]">
                      <Store className="w-2.5 h-2.5 shrink-0" />
                      <span className="truncate">{mutfakAdi}</span>
                    </span>

                    <span className="text-[10px] text-purple-300 bg-purple-950 px-2 py-0.5 rounded-full border border-purple-800/50 flex items-center gap-1">
                      <Tag className="w-2.5 h-2.5" />
                      {yemek.kategori}
                    </span>

                    {yemek.alt_kategori && (
                      <span className="text-[10px] text-purple-200 bg-purple-900/40 px-1.5 py-0.5 rounded border border-purple-700/30">
                        {yemek.alt_kategori}
                      </span>
                    )}

                    {yemek.secenek_gruplari && yemek.secenek_gruplari.length > 0 && (
                      <span className="text-[10px] text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>{yemek.secenek_gruplari.length} Varyasyon</span>
                      </span>
                    )}

                    {bekliyor ? (
                      <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/40">
                        ⏳ Onay Bekliyor
                      </span>
                    ) : reddedildi ? (
                      <span className="text-[10px] font-bold text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/40">
                        ❌ Reddedildi
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/40">
                        ✅ Onaylı
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 👑 PATRON ONAY / RED EYLEM ALANI */}
              {bekliyor && (
                <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs">
                  <span className="text-[11px] font-bold text-amber-300">Yemek Onayı:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => yemekOnayDurumDegistir(yemek.id, true)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Onayla</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => yemekOnayDurumDegistir(yemek.id, false)}
                      className="px-2.5 py-1 rounded-lg bg-rose-900/80 hover:bg-rose-800 text-rose-200 font-bold text-[11px] flex items-center gap-1 cursor-pointer active:scale-95"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reddet</span>
                    </button>
                  </div>
                </div>
              )}

              {reddedildi && (
                <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-rose-950/60 border border-rose-900/50 text-xs">
                  <span className="text-[11px] text-rose-300">Yemek reddedildi</span>
                  <button
                    type="button"
                    onClick={() => yemekOnayDurumDegistir(yemek.id, true)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-emerald-200 font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3 h-3" />
                    <span>Yeniden Onayla</span>
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-purple-950/80 text-xs">
                <button
                  onClick={() => stokDurumDegistir(yemek.id)}
                  className={`px-3 py-1 rounded-lg font-bold text-[10px] cursor-pointer transition-colors ${
                    tukendi
                      ? 'bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900'
                  }`}
                >
                  {tukendi ? '🔴 Tükendi (Satışa Aç)' : '🟢 Yayında (Tükendi Yap)'}
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setDuzenlenenYemek(yemek)}
                    className="p-2 rounded-lg bg-purple-950/80 hover:bg-purple-800 border border-purple-700 text-purple-200 cursor-pointer"
                    title="Düzenle"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                  </button>
                  <button
                    onClick={() => yemekSil(yemek.id)}
                    className="p-2 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-900 text-rose-300 cursor-pointer"
                    title="Sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 🌟 YENİ YEMEK EKLEME MODALI (TAM TEŞEKKÜLLÜ & MUTFAK SEVİYESİNDE) */}
      {yeniModalAcik && (
        <PatronYemekEklePenceresi
          mutfaklar={mutfaklar}
          onKapat={() => setYeniModalAcik(false)}
          onEklendi={(yeniYemek) => {
            setYemekler((onceki) => [yeniYemek, ...onceki]);
          }}
        />
      )}

      {/* ✏️ DÜZENLEME MODALI (TAM TEŞEKKÜLLÜ) */}
      {duzenlenenYemek && (
        <PatronYemekDuzenlePenceresi
          yemek={duzenlenenYemek}
          mutfaklar={mutfaklar}
          onKapat={() => setDuzenlenenYemek(null)}
          onGuncellendi={(guncel) => {
            setYemekler((onceki) => onceki.map((y) => (y.id === guncel.id ? guncel : y)));
          }}
        />
      )}
    </div>
  );
};
