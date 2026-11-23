import React, { useState } from 'react';
import {
  ShieldCheck,
  BarChart3,
  Store,
  UtensilsCrossed,
  ShoppingBag,
  LogOut,
  Eye,
  Menu,
  X,
  Sparkles,
  Bike,
  Users,
  FileText,
  Database,
  Bell,
  MapPin,
  Percent,
  Megaphone,
  FileCheck2
} from 'lucide-react';
import { kullaniciHafizasiKullan } from '@/src/OrtakHavuz/KullaniciHafizasi';
import { PatronBildirimKutusu, type BildirimYonlendirmeHedefi } from './PatronBildirimKutusu';
import { type SubeYonlendirmeBilgisi } from '../PatronMasasi/SubeYonetimi/SubeYonetimSekmesi';
import { usePatronBildirimleri } from '@/src/MalzemeCekmeceleri/PatronBildirimServisi';
import { useCanliHakedisTalepleri } from '@/src/MalzemeCekmeceleri/useCanliHakedisTalepleri';
import { useCanliMutfakAfisleri } from '@/src/MalzemeCekmeceleri/useCanliMutfakAfisleri';
import { useCanliCokluMenuler } from '@/src/MalzemeCekmeceleri/useCanliCokluMenuler';
import { YonetimMutfaklar, type MutfakYonlendirmeBilgisi } from './YonetimMutfaklar';
import { YonetimMutfakAfisleri } from './YonetimMutfaklar/YonetimMutfakAfisleri';
import { YonetimSiparisBirlesik } from './YonetimSiparisBirlesik';
import { YonetimKuryeBirlesik } from './YonetimKuryeBirlesik';
import { YonetimMenuBirlesik, type MenuYonlendirmeBilgisi } from './YonetimMenuBirlesik';
import { FaturaMerkezi } from './FaturaYonetimi/FaturaMerkezi';
import { YonetimKomisyonlar } from './YonetimKomisyonlar';
import { YonetimOzetBirlesik } from './YonetimOzetBirlesik';
import { YonetimGelAlSubeleri } from './YonetimGelAlSubeleri';
import { YonetimMusteriBirlesik } from './YonetimMusteriBirlesik';
import { YonetimSistemBirlesik } from './YonetimSistemBirlesik';
import { YonetimLezzetDanismani } from '../Bilesenler/YapayZekaDanismani/YonetimLezzetDanismani';
import { HukukiDelilMerkezi } from './HukukiDelilMerkezi/HukukiDelilMerkezi';

type YonetimSekmesi =
  | 'mutfaklar'
  | 'mutfak_afisleri'
  | 'siparisler'
  | 'kuryeler'
  | 'yemekler'
  | 'fatura'
  | 'komisyonlar'
  | 'ozet'
  | 'gel_al_subeleri'
  | 'musteriler'
  | 'hukuki_delil'
  | 'sistem_ayarlari'
  | 'lezzet_danismani';

export const YonetimPaneli: React.FC = () => {
  const { cikisYap, panelDegistir } = kullaniciHafizasiKullan();
  const [aktifSekme, setAktifSekme] = useState<YonetimSekmesi>('mutfaklar');
  const [mobilMenuAcik, setMobilMenuAcik] = useState<boolean>(false);
  const { talepler } = useCanliHakedisTalepleri();
  const { bekleyenSayisi: bekleyenAfisSayisi } = useCanliMutfakAfisleri();
  const { bekleyenSayisi: bekleyenCokluMenuSayisi } = useCanliCokluMenuler();

  const bekleyenHakedisSayisi = talepler.filter(t => t.durum === 'beklemede').length;
  const [bildirimKutusuAcik, setBildirimKutusuAcik] = useState(false);
  const [subeYonlendirme, setSubeYonlendirme] = useState<SubeYonlendirmeBilgisi | null>(null);
  const [mutfakYonlendirme, setMutfakYonlendirme] = useState<MutfakYonlendirmeBilgisi | null>(null);
  const [menuYonlendirme, setMenuYonlendirme] = useState<MenuYonlendirmeBilgisi | null>(null);
  const { okunmamisSayisi: okunmamisBildirimSayisi } = usePatronBildirimleri();

  const bildirimSekmesineGit = (sekme: string, hedef?: BildirimYonlendirmeHedefi) => {
    setAktifSekme(sekme as YonetimSekmesi);
    setMobilMenuAcik(false);
    if (sekme === 'gel_al_subeleri' && hedef?.altSekme) {
      setSubeYonlendirme({
        altSekme: hedef.altSekme as SubeYonlendirmeBilgisi['altSekme'],
        subeId: hedef.subeId,
        metinIpucu: hedef.metinIpucu,
        anahtar: Date.now(),
      });
    }
    if (sekme === 'mutfaklar' && hedef?.altSekme) {
      setMutfakYonlendirme({
        altSekme: hedef.altSekme as MutfakYonlendirmeBilgisi['altSekme'],
        anahtar: Date.now(),
      });
    }
    if (sekme === 'yemekler' && hedef?.altSekme) {
      setMenuYonlendirme({
        altSekme: hedef.altSekme as MenuYonlendirmeBilgisi['altSekme'],
        anahtar: Date.now(),
      });
    }
  };

  const menuElemanlari: { id: YonetimSekmesi; baslik: string; ikon: any; rozet?: string; sayi?: number }[] = [
    {
      id: 'mutfaklar',
      baslik: 'Mutfak & Hakediş',
      ikon: Store,
      rozet: bekleyenHakedisSayisi > 0 ? `${bekleyenHakedisSayisi} Bekleyen` : undefined
    },
    {
      id: 'mutfak_afisleri',
      baslik: 'Mutfak Afişleri & Vitrin',
      ikon: Megaphone,
      rozet: bekleyenAfisSayisi > 0 ? `${bekleyenAfisSayisi} Bekleyen` : undefined
    },
    { id: 'siparisler', baslik: 'Sipariş & Ciro Takibi', ikon: ShoppingBag },
    { id: 'kuryeler', baslik: 'Kurye & Rota', ikon: Bike },
    {
      id: 'yemekler',
      baslik: 'Menü, Kategori & Varyasyon',
      ikon: UtensilsCrossed,
      rozet: bekleyenCokluMenuSayisi > 0 ? `${bekleyenCokluMenuSayisi} Çoklu Menü` : undefined
    },
    { id: 'fatura', baslik: 'Fatura Yönetimi', ikon: FileText, rozet: 'E-Arşiv' },
    { id: 'komisyonlar', baslik: 'Komisyon Yönetimi', ikon: Percent },
    { id: 'ozet', baslik: 'Genel Özet & Raporlar', ikon: BarChart3 },
    { id: 'gel_al_subeleri', baslik: 'Şube & Gel-Al', ikon: MapPin },
    { id: 'musteriler', baslik: 'Müşteri & Yorumlar', ikon: Users },
    { id: 'hukuki_delil', baslik: 'Hukuki Delil & Damga', ikon: FileCheck2, rozet: 'Salt-Okunur' },
    { id: 'sistem_ayarlari', baslik: 'Sistem, Ödeme & Site', ikon: Database },
    { id: 'lezzet_danismani', baslik: 'Lezzet Danışmanı', ikon: Sparkles }
  ];

  const baslikGetir = () => {
    switch (aktifSekme) {
      case 'mutfaklar': return 'Mutfak Yönetimi, Hakediş & Toplu Ödeme Merkezi';
      case 'mutfak_afisleri': return 'Mutfak Afişleri ve Tepe Vitrin Yönetimi';
      case 'siparisler': return 'Canlı Sipariş Sevk ve Ciro Takip Masası';
      case 'kuryeler': return 'Kurye Operasyonları, Rota ve KM Fiyatlandırma';
      case 'yemekler': return 'Menü, Kategori ve Varyasyon Yönetimi';
      case 'fatura': return 'Fatura & Gider Pusulası Yönetim Merkezi';
      case 'komisyonlar': return 'Komisyon ve Hizmet Bedeli Yönetimi';
      case 'ozet': return 'Genel Durum, Kasa ve Mali Raporlar';
      case 'gel_al_subeleri': return 'Şube & Gel-Al Yönetim Modülü';
      case 'musteriler': return 'Müşteriler, Cüzdan ve Yorum Yönetimi';
      case 'hukuki_delil': return 'Hukuki Delil & Zaman Damgası Çıktı Merkezi';
      case 'sistem_ayarlari': return 'Ödeme Seçenekleri, Sanal POS, Arşiv, Reklam, Hukuk ve Footer';
      case 'lezzet_danismani': return 'Lezzet Danışmanı Yönetimi';
      default: return 'Patron Masası';
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#0C020E] text-gray-200 flex flex-col lg:flex-row select-none">
      
      {/* Mobil Üst Bar */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-[#180A1F] border-b border-[#3E1646] sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FFB703] to-[#8C1D9C] flex items-center justify-center text-white shadow-md">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-white font-bold text-xs">PATRON MASASI</div>
            <div className="text-[10px] text-amber-300 font-medium">Süper Admin</div>
          </div>
        </div>

        <div className="flex items-center gap-2 relative">
          {/* Mobil & Tablet Bildirim Çanı */}
          <button
            type="button"
            onClick={() => setBildirimKutusuAcik(!bildirimKutusuAcik)}
            className="relative p-2 rounded-xl bg-purple-900/40 hover:bg-purple-900/70 text-amber-300 border border-purple-800 cursor-pointer flex items-center justify-center active:scale-95"
            title="Patron Canlı Bildirimleri"
          >
            <Bell className="w-4 h-4" />
            {okunmamisBildirimSayisi > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-purple-950 text-[9px] font-black flex items-center justify-center shadow animate-pulse">
                {okunmamisBildirimSayisi}
              </span>
            )}
          </button>

          <PatronBildirimKutusu
            acikMi={bildirimKutusuAcik}
            onKapat={() => setBildirimKutusuAcik(false)}
            onSekmeSec={bildirimSekmesineGit}
          />

          <button
            type="button"
            onClick={() => {
              cikisYap();
              panelDegistir('vitrin');
            }}
            className="px-2.5 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/50 text-rose-300 text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-[11px]">Çıkış</span>
          </button>
          <button
            type="button"
            onClick={() => setMobilMenuAcik(!mobilMenuAcik)}
            className="p-2 rounded-xl bg-purple-900/40 text-amber-300 border border-purple-800 cursor-pointer"
          >
            {mobilMenuAcik ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Kenar Çubuğu (Sidebar) */}
      <aside className={`w-full lg:w-72 bg-[#14061A] border-r border-[#34113B] flex flex-col justify-between p-4 lg:p-6 shrink-0 ${
        mobilMenuAcik ? 'block' : 'hidden lg:flex'
      }`}>
        <div className="space-y-6">
          {/* Logo / Başlık */}
          <div className="hidden lg:flex items-center gap-3 p-3 rounded-2xl bg-[#1C0922] border border-[#3E1646]">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FFB703] to-[#8C1D9C] flex items-center justify-center text-white shadow-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-white font-black text-sm">PATRON MASASI</h2>
              <p className="text-[10px] text-amber-400 font-bold">Afyon Ev Lezzetleri — Süper Admin</p>
            </div>
          </div>

          {/* Menü Navigasyonu */}
          <nav className="space-y-1.5">
            {menuElemanlari.map((eleman) => {
              const Icon = eleman.ikon;
              const aktif = aktifSekme === eleman.id;
              return (
                <button
                  key={eleman.id}
                  type="button"
                  onClick={() => {
                    setAktifSekme(eleman.id);
                    setMobilMenuAcik(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    aktif
                      ? 'bg-gradient-to-r from-[#7B258B] to-[#551461] text-white shadow-lg border border-purple-500/40'
                      : 'text-gray-400 hover:text-white hover:bg-[#1C0922]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${aktif ? 'text-amber-300' : 'text-gray-400'}`} />
                    <span>{eleman.baslik}</span>
                  </div>

                  {eleman.rozet && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {eleman.rozet}
                    </span>
                  )}

                  {eleman.sayi !== undefined && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-950/80 text-gray-300 border border-purple-800/40">
                      {eleman.sayi}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sol Alt */}
        <div className="pt-3 border-t border-purple-950/80 space-y-1.5">
          <button
            type="button"
            onClick={() => panelDegistir('vitrin')}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#270E2F] hover:bg-[#3E1649] text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer shadow-md"
          >
            <Eye className="w-4 h-4" />
            <span>Müşteri Vitrinine Git</span>
          </button>

          <button
            type="button"
            onClick={cikisYap}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-900/40 text-xs font-bold transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Güvenli Çıkış</span>
          </button>
        </div>
      </aside>

      {/* 👉 SAĞ İÇERİK ALANI */}
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        <header className="hidden lg:flex items-center justify-between px-8 py-5 bg-[#14061A]/80 backdrop-blur-md border-b border-[#34113B] sticky top-0 z-30">
          <div>
            <h1 className="text-white font-extrabold text-lg">{baslikGetir()}</h1>
            <p className="text-xs text-purple-300/80">Afyon Ev Lezzetleri — Patron Operasyon Merkezi</p>
          </div>
          <div className="flex items-center gap-3 relative">
            <button
              type="button"
              onClick={() => setBildirimKutusuAcik(!bildirimKutusuAcik)}
              className="relative p-2.5 rounded-xl bg-[#23092A] hover:bg-[#320D3C] text-amber-300 border border-purple-800/60 transition-all cursor-pointer flex items-center justify-center shadow-md"
              title="Patron Canlı Bildirimleri"
            >
              <Bell className="w-4 h-4" />
              {okunmamisBildirimSayisi > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-purple-950 text-[10px] font-black flex items-center justify-center shadow animate-pulse">
                  {okunmamisBildirimSayisi}
                </span>
              )}
            </button>

            <PatronBildirimKutusu
              acikMi={bildirimKutusuAcik}
              onKapat={() => setBildirimKutusuAcik(false)}
              onSekmeSec={bildirimSekmesineGit}
            />

            <span className="px-3 py-1.5 rounded-xl bg-[#23092A] text-amber-300 border border-purple-800/40 text-xs font-bold">
              👑 Süper Patron Yetkisi
            </span>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          {aktifSekme === 'mutfaklar' && <YonetimMutfaklar mutfakYonlendirme={mutfakYonlendirme} />}
          {aktifSekme === 'mutfak_afisleri' && <YonetimMutfakAfisleri />}
          {aktifSekme === 'siparisler' && <YonetimSiparisBirlesik />}
          {aktifSekme === 'kuryeler' && <YonetimKuryeBirlesik />}
          {aktifSekme === 'yemekler' && <YonetimMenuBirlesik menuYonlendirme={menuYonlendirme} />}
          {aktifSekme === 'fatura' && <FaturaMerkezi />}
          {aktifSekme === 'komisyonlar' && <YonetimKomisyonlar />}
          {aktifSekme === 'ozet' && <YonetimOzetBirlesik />}
          {aktifSekme === 'gel_al_subeleri' && <YonetimGelAlSubeleri subeYonlendirme={subeYonlendirme} />}
          {aktifSekme === 'musteriler' && <YonetimMusteriBirlesik />}
          {aktifSekme === 'hukuki_delil' && <HukukiDelilMerkezi />}
          {aktifSekme === 'sistem_ayarlari' && <YonetimSistemBirlesik />}
          {aktifSekme === 'lezzet_danismani' && <YonetimLezzetDanismani />}
        </main>
      </div>

    </div>
  );
};
