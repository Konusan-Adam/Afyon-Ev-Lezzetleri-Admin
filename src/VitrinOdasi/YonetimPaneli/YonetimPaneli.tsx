import React, { useState, useEffect } from 'react';
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
  Clock, 
  Sparkles, 
  Bike, 
  Layers,
  Users,
  FileText,
  Database, 
  Bell, 
  LayoutTemplate,
  Star,
  Navigation,
  Megaphone,
  MapPin,
  ClipboardList,
  Percent,
  TrendingUp
} from 'lucide-react';
import { kullaniciHafizasiKullan } from '@/src/OrtakHavuz/KullaniciHafizasi';
import { PatronBildirimKutusu } from './PatronBildirimKutusu';
import { usePatronBildirimleri } from '@/src/MalzemeCekmeceleri/PatronBildirimServisi';
import { YonetimOzeti } from './YonetimOzeti';
import { YonetimMutfaklar } from './YonetimMutfaklar';
import { YonetimYemekler } from './YonetimYemekler';
import { YonetimSiparisler } from './YonetimSiparisler';
import { YonetimVaryasyonlar } from './YonetimVaryasyonlar';
import { YonetimKategoriler } from './YonetimKategoriler';
import { YonetimMusteriler } from './YonetimMusteriler';
import { YonetimKuryeler } from './YonetimKuryeler';
import { YonetimAkilliKurye } from './YonetimAkilliKurye';
import { FaturaMerkezi } from './FaturaYonetimi/FaturaMerkezi';
import { SuperAdminHukukPaneli } from '../Bilesenler/HukukVeSozlesmeler/SuperAdminHukukPaneli';
import { YonetimReklamBanner } from './YonetimReklamBanner';
import { YonetimGelAlSubeleri } from './YonetimGelAlSubeleri';
import { YonetimYedeklemeMerkezi } from './YonetimYedeklemeMerkezi';
import { YonetimFooter } from './YonetimFooter';
import { useCanliHakedisTalepleri } from '@/src/MalzemeCekmeceleri/useCanliHakedisTalepleri';
import { kategorileriGetir } from '@/src/MalzemeCekmeceleri/kategorileriGetir';
import { YonetimLezzetDanismani } from '../Bilesenler/YapayZekaDanismani/YonetimLezzetDanismani';
import { YonetimDegerlendirmeler } from './YonetimDegerlendirmeler';
import { YonetimAkilliSiparisTakip } from './YonetimAkilliSiparisTakip';
import { YonetimKomisyonlar } from './YonetimKomisyonlar';
import { YonetimRaporlar } from './YonetimRaporlar';

type YonetimSekmesi = 
  | 'ozet' 
  | 'kategoriler' 
  | 'musteriler' 
  | 'kuryeler' 
  | 'akilli_kurye'
  | 'mutfaklar' 
  | 'yemekler' 
  | 'fatura'
  | 'varyasyonlar' 
  | 'siparisler' 
  | 'reklam_banner'
  | 'gel_al_subeleri'
  | 'yedekleme'
  | 'hukuk'
  | 'footer'
  | 'lezzet_danismani'
  | 'degerlendirmeler'
  | 'akilli_siparis_takip'
  | 'komisyonlar'
  | 'raporlar';

export const YonetimPaneli: React.FC = () => {
  const { aktifKullanici, cikisYap, panelDegistir } = kullaniciHafizasiKullan();
  const [aktifSekme, setAktifSekme] = useState<YonetimSekmesi>('mutfaklar');
  const [mobilMenuAcik, setMobilMenuAcik] = useState<boolean>(false);
  const { kategoriler } = kategorileriGetir();
  const { talepler } = useCanliHakedisTalepleri();

  const bekleyenHakedisSayisi = talepler.filter(t => t.durum === 'beklemede').length;
  const [bildirimKutusuAcik, setBildirimKutusuAcik] = useState(false);
  const { okunmamisSayisi: okunmamisBildirimSayisi } = usePatronBildirimleri();

  const menuElemanlari = [
    {
      id: 'mutfaklar' as YonetimSekmesi,
      baslik: 'Mutfak Yönetimi',
      ikon: Store,
      rozet: bekleyenHakedisSayisi > 0 ? `${bekleyenHakedisSayisi} Ödeme Bekleyen` : undefined
    },
    {
      id: 'kuryeler' as YonetimSekmesi,
      baslik: 'Kurye Yönetimi',
      ikon: Bike
    },
    {
      id: 'akilli_kurye' as YonetimSekmesi,
      baslik: 'Akıllı Kurye & Rota',
      ikon: Navigation,
      rozet: 'Algoritma'
    },
    {
      id: 'musteriler' as YonetimSekmesi,
      baslik: 'Müşteri Yönetimi',
      ikon: Users
    },
    {
      id: 'yemekler' as YonetimSekmesi,
      baslik: 'Menü Yönetimi',
      ikon: UtensilsCrossed
    },
    {
      id: 'fatura' as YonetimSekmesi,
      baslik: 'Fatura Yönetimi',
      ikon: FileText,
      rozet: 'E-Arşiv & Gider'
    },
    {
      id: 'ozet' as YonetimSekmesi,
      baslik: 'Genel Özet & Kasa',
      ikon: BarChart3,
      rozet: 'Canlı'
    },
    {
      id: 'kategoriler' as YonetimSekmesi,
      baslik: 'Kategori & Alt Gruplar',
      ikon: Layers,
      sayi: kategoriler.length
    },
    {
      id: 'varyasyonlar' as YonetimSekmesi,
      baslik: 'Varyasyon Şablonları',
      ikon: Layers,
      rozet: 'Merkez'
    },
    {
      id: 'siparisler' as YonetimSekmesi,
      baslik: 'Canlı Sipariş & Dağıtım',
      ikon: ShoppingBag,
      rozet: '3 Yeni'
    },
    {
      id: 'reklam_banner' as YonetimSekmesi,
      baslik: 'Reklam & Banner',
      ikon: Megaphone,
      rozet: 'Vitrinde'
    },
    {
      id: 'gel_al_subeleri' as YonetimSekmesi,
      baslik: 'Şube & Gel-Al Yönetimi',
      ikon: MapPin,
      rozet: 'Ekosistem'
    },
    {
      id: 'yedekleme' as YonetimSekmesi,
      baslik: 'Veritabanı & Arşiv',
      ikon: Database,
      rozet: 'DirectAdmin'
    },
    {
      id: 'degerlendirmeler' as YonetimSekmesi,
      baslik: 'Müşteri Yorumları',
      ikon: Star
    },
    {
      id: 'hukuk' as YonetimSekmesi,
      baslik: 'Hukuk, KVKK & Loglar',
      ikon: ShieldCheck,
      rozet: 'Denetim'
    },
    {
      id: 'footer' as YonetimSekmesi,
      baslik: 'Footer (Alt Bilgi) Yönetimi',
      ikon: LayoutTemplate,
      rozet: 'Tasarım'
    },
    {
      id: 'lezzet_danismani' as YonetimSekmesi,
      baslik: 'Yapay Zeka Danışmanı',
      ikon: Sparkles,
      rozet: 'Canlı Asistan'
    },
    {
      id: 'akilli_siparis_takip' as YonetimSekmesi,
      baslik: 'Akıllı Sipariş & Ciro Takibi',
      ikon: ClipboardList,
      rozet: 'Nokta Atışı'
    },
    {
      id: 'komisyonlar' as YonetimSekmesi,
      baslik: 'Komisyon Yönetimi',
      ikon: Percent
    },
    {
      id: 'raporlar' as YonetimSekmesi,
      baslik: 'Mali Raporlar',
      ikon: TrendingUp
    },
  ];

  const baslikGetir = () => {
    switch (aktifSekme) {
      case 'ozet': return 'Genel Durum & Kasa Raporu';
      case 'kategoriler': return 'Kategori ve Alt Kategori Hiyerarşisi';
      case 'musteriler': return 'Kayıtlı Müşteri ve Cüzdan Yönetimi';
      case 'kuryeler': return 'Kurye Operasyonları ve Sefer Hakedişleri';
      case 'akilli_kurye': return 'Akıllı Kurye, KM Fiyatlandırma ve Rota Optimizasyon Merkezi';
      case 'mutfaklar': return 'Mutfak Yönetimi (Ev & Ticari Mutfaklar, Hakediş & Ödemeler)';
      case 'yemekler': return 'Menü, Tarifler ve Fiyat Yönetimi';
      case 'fatura': return 'Fatura & Gider Pusulası Yönetim Merkezi';
      case 'varyasyonlar': return 'Merkezi Varyasyon & Seçenek Şablonları';
      case 'siparisler': return 'Canlı Siparişler ve Kurye Sevk Masası';
      case 'reklam_banner': return 'Reklam, Banner ve Tepe Duyuru Yönetimi';
      case 'gel_al_subeleri': return 'Şube & Gel-Al Yönetim Modülü (Tezgâh Stokları, Siparişler & Canlı Yayın)';
      case 'yedekleme': return 'Firebase & DirectAdmin Veritabanı Arşiv Merkezi';
      case 'hukuk': return 'Yasal Sözleşmeler, KVKK ve Onay Logları';
      case 'footer': return 'Footer (Alt Bilgi) Tasarım ve İçerik Yönetimi';
      case 'lezzet_danismani': return 'Yapay Zeka Lezzet Danışmanı Yönetimi';
      case 'komisyonlar': return 'Komisyon ve Hizmet Bedeli Yönetimi';
      case 'raporlar': return 'Mali Raporlar ve Hakediş Analizi';
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
            onSekmeSec={(sekme) => {
              setAktifSekme(sekme as any);
              setMobilMenuAcik(false);
            }}
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
              onSekmeSec={(sekme) => setAktifSekme(sekme as any)}
            />

            <span className="px-3 py-1.5 rounded-xl bg-[#23092A] text-amber-300 border border-purple-800/40 text-xs font-bold">
              👑 Süper Patron Yetkisi
            </span>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          {aktifSekme === 'ozet' && <YonetimOzeti />}
          {aktifSekme === 'kategoriler' && <YonetimKategoriler />}
          {aktifSekme === 'musteriler' && <YonetimMusteriler />}
          {aktifSekme === 'kuryeler' && <YonetimKuryeler />}
          {aktifSekme === 'akilli_kurye' && <YonetimAkilliKurye />}
          {aktifSekme === 'mutfaklar' && <YonetimMutfaklar />}
          {aktifSekme === 'yemekler' && <YonetimYemekler />}
          {aktifSekme === 'fatura' && <FaturaMerkezi />}
          {aktifSekme === 'varyasyonlar' && <YonetimVaryasyonlar />}
          {aktifSekme === 'siparisler' && <YonetimSiparisler />}
          {aktifSekme === 'reklam_banner' && <YonetimReklamBanner />}
          {aktifSekme === 'gel_al_subeleri' && <YonetimGelAlSubeleri />}
          {aktifSekme === 'yedekleme' && <YonetimYedeklemeMerkezi />}
          {aktifSekme === 'hukuk' && <SuperAdminHukukPaneli />}
          {aktifSekme === 'footer' && <YonetimFooter />}
          {aktifSekme === 'degerlendirmeler' && <YonetimDegerlendirmeler />}
          {aktifSekme === 'lezzet_danismani' && <YonetimLezzetDanismani />}
          {aktifSekme === 'akilli_siparis_takip' && <YonetimAkilliSiparisTakip />}
          {aktifSekme === 'komisyonlar' && <YonetimKomisyonlar />}
          {aktifSekme === 'raporlar' && <YonetimRaporlar />}
        </main>
      </div>

    </div>
  );
};
