import React, { useState } from 'react';
import {
  PackageCheck,
  Check,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  UtensilsCrossed,
  Tag,
} from 'lucide-react';
import {
  useCanliCokluMenuler,
  type CokluMenuKaydi,
} from '@/src/MalzemeCekmeceleri/useCanliCokluMenuler';
import { RESMI_MUTFAK_LOGOSU } from '@/src/MalzemeCekmeceleri/Mutfak/resmiMutfakLogosu';
import { gorselUrlGuvenliYap } from '@/src/MalzemeCekmeceleri/sunucuGorselYukleyici';

type DurumFiltresi = 'hepsi' | 'beklemede' | 'onaylandi' | 'reddedildi';

function icerikEtiketiGetir(kalem: unknown): string {
  if (typeof kalem === 'string') return kalem;
  if (kalem && typeof kalem === 'object') {
    const k = kalem as Record<string, unknown>;
    const ad = String(k.ad || k.baslik || k.yemek_adi || k.isim || k.name || 'Ürün');
    const adet = k.adet ?? k.miktar ?? k.porsiyon;
    return adet ? `${adet}x ${ad}` : ad;
  }
  return 'Menü Öğesi';
}

export const YonetimCokluMenuler: React.FC = () => {
  const { menuler, bekleyenSayisi, yukleniyor, menuOnayGuncelle } = useCanliCokluMenuler();
  const [filtre, setFiltre] = useState<DurumFiltresi>('hepsi');
  const [redModalMenu, setRedModalMenu] = useState<CokluMenuKaydi | null>(null);
  const [redGerekcesiMetni, setRedGerekcesiMetni] = useState(
    'Menü içeriği veya fiyatlandırması standartlarımıza uygun değil.'
  );

  const onaylananSayisi = menuler.filter(
    (m) => m.onay_durumu === 'onaylandi' || (m.onayli_mi === true && m.onay_durumu !== 'reddedildi')
  ).length;
  const reddedilenSayisi = menuler.filter((m) => m.onay_durumu === 'reddedildi').length;

  const durumSiniflandir = (m: CokluMenuKaydi): 'beklemede' | 'onaylandi' | 'reddedildi' => {
    if (m.onay_durumu === 'reddedildi') return 'reddedildi';
    if (m.onay_durumu === 'onaylandi' || m.onayli_mi === true) return 'onaylandi';
    return 'beklemede';
  };

  const siraliMenuler = [...menuler].sort((a, b) => {
    const sira = (m: CokluMenuKaydi) => {
      const d = durumSiniflandir(m);
      return d === 'beklemede' ? 0 : d === 'onaylandi' ? 1 : 2;
    };
    return sira(a) - sira(b);
  });

  const filtrelenmisMenuler = siraliMenuler.filter((menu) => {
    const durum = durumSiniflandir(menu);
    if (filtre === 'beklemede') return durum === 'beklemede';
    if (filtre === 'onaylandi') return durum === 'onaylandi';
    if (filtre === 'reddedildi') return durum === 'reddedildi';
    return true;
  });

  const redOnayla = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!redModalMenu) return;
    const temizSebep = redGerekcesiMetni.trim() || 'Standartlara uygun bulunmadı.';
    await menuOnayGuncelle(redModalMenu.id, false, temizSebep);
    setRedModalMenu(null);
    setRedGerekcesiMetni('Menü içeriği veya fiyatlandırması standartlarımıza uygun değil.');
  };

  return (
    <div className="space-y-6 text-white animate-fadeIn">
      <div className="p-4 sm:p-5 rounded-2xl bg-[#180A1F] border border-[#3E1646] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <PackageCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base">Çoklu Menü Onayları</h3>
            <p className="text-xs text-purple-300">
              Mutfakların oluşturduğu çoklu menü ve paket tekliflerini canlı inceleyin, onaylayın veya gerekçeyle reddedin.
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
            Tümü ({menuler.length})
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
          <span>Çoklu menüler canlı yükleniyor...</span>
        </div>
      ) : filtrelenmisMenuler.length === 0 ? (
        <div className="p-12 text-center text-gray-400 text-xs bg-[#180A1F] rounded-2xl border border-purple-900/40">
          <UtensilsCrossed className="w-10 h-10 mx-auto mb-2 text-amber-400 opacity-50" />
          <p className="font-bold text-white text-sm">
            {menuler.length === 0
              ? 'Henüz sisteme gönderilmiş çoklu menü bulunmuyor.'
              : 'Bu filtrede gösterilecek çoklu menü yok.'}
          </p>
          <p className="text-gray-400 mt-1">
            Mutfaklar çoklu menü oluşturduğunda onay için anında burada listelenir.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtrelenmisMenuler.map((menu) => {
            const durum = durumSiniflandir(menu);
            const onayliMi = durum === 'onaylandi';
            const reddedildiMi = durum === 'reddedildi';
            const menuBaslik = menu.baslik || menu.ad || menu.menu_adi || 'Çoklu Menü';
            const asilFiyat = Number(menu.fiyat ?? menu.toplam_fiyat ?? 0);
            const indirimliFiyat = menu.indirimli_fiyat !== undefined ? Number(menu.indirimli_fiyat) : undefined;
            const icerikListesi = menu.urunler || menu.yemekler || menu.kalemler || menu.ogeler || [];

            return (
              <div
                key={menu.id}
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
                        <span>{menu.mutfak_adi || menu.mutfak_id || 'Ev Mutfağı'}</span>
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

                    {menu.aktif_mi !== undefined && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold shrink-0 ${
                          menu.aktif_mi ? 'bg-emerald-950 text-emerald-300' : 'bg-gray-800 text-gray-400'
                        }`}
                      >
                        {menu.aktif_mi ? 'Aktif' : 'Pasif'}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-3 items-start">
                    <img
                      src={menu.gorsel_url ? gorselUrlGuvenliYap(menu.gorsel_url) : RESMI_MUTFAK_LOGOSU}
                      alt={menuBaslik}
                      className="w-20 h-20 rounded-xl object-cover border border-purple-800/60 shrink-0 bg-black"
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-black text-white truncate">{menuBaslik}</h4>
                        <div className="text-right shrink-0">
                          {indirimliFiyat !== undefined && indirimliFiyat > 0 && indirimliFiyat < asilFiyat ? (
                            <div className="flex flex-col items-end">
                              <span className="text-[10px] line-through text-gray-400">{asilFiyat} ₺</span>
                              <span className="text-xs font-black text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
                                {indirimliFiyat} ₺
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs font-black text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
                              {asilFiyat} ₺
                            </span>
                          )}
                        </div>
                      </div>

                      {menu.kategori && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-purple-300 bg-purple-950 px-2 py-0.5 rounded-full border border-purple-800/60">
                          <Tag className="w-2.5 h-2.5" />
                          <span>{menu.kategori}</span>
                        </span>
                      )}

                      <p className="text-xs text-gray-300 line-clamp-2">
                        {menu.aciklama || 'Açıklama belirtilmedi.'}
                      </p>
                    </div>
                  </div>

                  {Array.isArray(icerikListesi) && icerikListesi.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-[#120614] border border-purple-900/50 space-y-1.5">
                      <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider block">
                        Menü İçeriği ({icerikListesi.length} Kalem)
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {icerikListesi.map((kalem, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded-lg bg-purple-950/90 text-purple-100 border border-purple-800/60"
                          >
                            {icerikEtiketiGetir(kalem)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {reddedildiMi && menu.red_gerekcesi && (
                    <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-[11px]">
                      <strong>Red Gerekçesi:</strong> {menu.red_gerekcesi}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-purple-950 flex items-center justify-between gap-2 text-xs">
                  <span className="text-[11px] text-gray-400">Çoklu Menü Onayı:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => menuOnayGuncelle(menu.id, true, '')}
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
                        setRedModalMenu(menu);
                        setRedGerekcesiMetni(
                          menu.red_gerekcesi || 'Menü içeriği veya fiyatlandırması standartlarımıza uygun değil.'
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

      {redModalMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <form
            onSubmit={redOnayla}
            className="bg-[#180A1F] border border-rose-500/50 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl text-xs"
          >
            <div className="flex items-center justify-between border-b border-purple-950 pb-3">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-400" />
                <div>
                  <h4 className="text-sm font-extrabold text-white">Çoklu Menüyü Reddet</h4>
                  <p className="text-[11px] text-purple-300 truncate max-w-[260px]">
                    {redModalMenu.mutfak_adi || 'Ev Mutfağı'} —{' '}
                    {redModalMenu.baslik || redModalMenu.ad || redModalMenu.menu_adi || 'Çoklu Menü'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRedModalMenu(null)}
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
                placeholder="Örn: Paket içeriği veya fiyat bilgisi eksik."
                className="w-full bg-[#120614] border border-purple-800/70 rounded-xl p-3 text-white outline-none focus:border-rose-400 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-purple-950">
              <button
                type="button"
                onClick={() => setRedModalMenu(null)}
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
