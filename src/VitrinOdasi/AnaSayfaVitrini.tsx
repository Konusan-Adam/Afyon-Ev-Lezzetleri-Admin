import React from 'react';
import { UstBar } from './UstBar/UstBar';
import { MasaustuAltBilgi } from './MasaustuAltBilgi/MasaustuAltBilgi';
import { FiltrePaneli } from './AramaFiltre/FiltrePaneli';
import { CokluSepetVitrini } from './Bilesenler/Sepet/CokluSepetVitrini';
import { OrtakSepetPenceresi } from './Bilesenler/Sepet/OrtakSepetPenceresi';
import { YuzenSepetBari } from './Bilesenler/Sepet/YuzenSepetBari';
import { sepetHafizasiKullan } from '@/src/OrtakHavuz/SepetHafizasi';
import { AdresSecimPenceresi } from './Bilesenler/AdresVeKonum/AdresSecimPenceresi';
import { HaritaAdresSecici } from './Bilesenler/AdresVeKonum/HaritaAdresSecici';
import { GelAlSubesiSecimPenceresi } from './Bilesenler/AdresVeKonum/GelAlSubesiSecimPenceresi';
import { KullaniciGirisPenceresi } from './KullaniciGiris/KullaniciGirisPenceresi';
import { MobilAnaVitrin } from './MobilAnasayfa/MobilAnaVitrin';
import { MobilAltMenu } from './MobilAnasayfa/MobilAltMenu';
import { YonetimPaneli } from './YonetimPaneli/YonetimPaneli';
import { MusteriPaneli } from './MusteriPaneli/MusteriPaneli';
import { MutfakPaneli } from './MutfakPaneli/MutfakPaneli';
import { KuryePaneli } from './KuryePaneli/KuryePaneli';
import { CerezOnayBari } from './Bilesenler/HukukVeSozlesmeler/CerezOnayBari';
import { SozlesmePenceresi } from './Bilesenler/HukukVeSozlesmeler/SozlesmePenceresi';
import { type SozlesmeTuru } from '@/src/MalzemeCekmeceleri';
import { aramaVeFiltreKullan } from '@/src/OrtakHavuz/AramaVeFiltreHafizasi';
import { kullaniciHafizasiKullan } from '@/src/OrtakHavuz/KullaniciHafizasi';
import { TepeReklamBari } from './ReklamVeDuyuru/TepeReklamBari';
import { OnSiparisSecici } from './Bilesenler/OnSiparisVePorsiyon/OnSiparisSecici';
import { porsiyonDusur } from '@/src/MalzemeCekmeceleri/OnSiparisVePorsiyon/PorsiyonServisi';
import { Yemek, Mutfak } from '@/src/veritabani/VeriTipleri';
import { UrunOzellestirmePenceresi } from './Bilesenler/UrunSecenekleri/UrunOzellestirmePenceresi';
import { koleksiyonGetir } from '@/src/veritabani/FirebaseKoleksiyonServisi';
import { PwaKurulumKarti } from './PwaKurulumKarti';
import { LezzetDanismaniVitrini } from './Bilesenler/YapayZekaDanismani/LezzetDanismaniVitrini';

import { PatronGuvenlikKapisi, patronGirisOnayliMi } from './Bilesenler/GuvenlikZirhi/PatronGuvenlikKapisi';
import { MutfaklarModali } from './Bilesenler/MutfaklarModali';

export const AnaSayfaVitrini: React.FC = () => {
  const [aktifSozlesmeTuru, setAktifSozlesmeTuru] = React.useState<SozlesmeTuru | null>(null);
  const [seciliMutfak, setSeciliMutfak] = React.useState<Mutfak | null>(null);
  const [seciliYemekModal, setSeciliYemekModal] = React.useState<Yemek | null>(null);
  const [patronOnayli, setPatronOnayli] = React.useState<boolean>(patronGirisOnayliMi);
  const [mutfaklarModaliAcik, setMutfaklarModaliAcik] = React.useState<boolean>(false);

  const {
    aramaMetni,
    aramaMetniniDegistir,
    filtrePaneliAcik,
    filtrePaneliniAc,
    filtrePaneliniKapat,
    aktifFiltreler,
    filtreleriUygula,
    sifirla,
  } = aramaVeFiltreKullan();

  const { sepetPaneliAc, sepeteEkle } = sepetHafizasiKullan();
  const { goruntulenenPanel, panelDegistir } = kullaniciHafizasiKullan();

  // Mutfak kimliğine göre mutfak nesnesini bulup vitrinini açar
  const mutfakAcById = async (mutfakId: string) => {
    sifirla();
    setSeciliYemekModal(null);
    try {
      const mutfaklar = await koleksiyonGetir<Mutfak>('mutfaklar');
      const bulunan = (mutfaklar || []).find((m) => m.id === mutfakId);
      if (bulunan) {
        setSeciliMutfak(bulunan);
      }
    } catch (error) {
      console.error('Mutfak yüklenirken hata oluştu:', error);
    }
  };

  // Mutfak seçildiğinde doğrudan dükkan vitrinine geçiş
  const mutfakSecildiIslemi = (mutfak: Mutfak | null) => {
    sifirla();
    setSeciliYemekModal(null);
    setMutfaklarModaliAcik(false);
    setSeciliMutfak(mutfak);
  };

  // Yemek seçildiğinde ürün detay & porsiyon modalını açma
  const yemekSecildiIslemi = (yemek: Yemek) => {
    sifirla();
    setSeciliYemekModal(yemek);
  };

  // Marka logosuna veya Keşfet butonuna tıklandığında tam anasayfaya dönüş
  const anasayfayaDonusYap = () => {
    sifirla(); // Arama metnini ve filtreleri sıfırlar
    setSeciliMutfak(null); // Açık dükkan / mutfak vitrini varsa kapatır, ana vitrine döndürür
    setSeciliYemekModal(null);
    setMutfaklarModaliAcik(false);
    if (goruntulenenPanel !== 'vitrin') {
      panelDegistir('vitrin'); // Herhangi bir paneldeyse vitrine alır
    }
    // Sayfayı yumuşakça en tepeye kaydırır
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 4 Farklı Panel Yönlendirmesi
  if (goruntulenenPanel === 'patron') {
    if (!patronOnayli && !patronGirisOnayliMi()) {
      return <PatronGuvenlikKapisi onYetkilendirildi={() => setPatronOnayli(true)} />;
    }
    return <YonetimPaneli />;
  }

  if (goruntulenenPanel === 'musteri') {
    return <MusteriPaneli />;
  }

  if (goruntulenenPanel === 'mutfak') {
    return <MutfakPaneli />;
  }

  if (goruntulenenPanel === 'kurye') {
    return <KuryePaneli />;
  }

  return (
    <main className="w-full min-h-screen">
      {/* 🚀 En Üst İnce Reklam & Duyuru Şeridi (Yönetim Panelinden Yönetilir) */}
      <TepeReklamBari />

      {/* 📦 Eksiksiz Tam Paketler (Admin, Mutfak, Kurye) */}
      <div className="bg-stone-900 text-white px-4 py-3 border-b border-stone-800 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-center sm:text-left">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <div>
              <span className="font-bold text-xs sm:text-sm text-stone-100">
                Eksiksiz Tam Proje Paketleri Güncellendi (Tüm Dosyalar & Varlıklar Dahil):
              </span>{' '}
              <span className="text-xs text-stone-300">
                Hiçbir eksik bileşen olmadan doğrudan yeni projeye yüklenecek tam bağımsız projeler.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-center shrink-0">
            <a
              href="/paketler/Afyon-Yonetim-Admin-Paneli.zip"
              download="Afyon-Yonetim-Admin-Paneli.zip"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs rounded-lg transition-colors shadow-xs"
            >
              ⬇️ Admin Paneli Tam Paket (11 MB)
            </a>
            <a
              href="/paketler/Afyon-Mutfak-Paneli.zip"
              download="Afyon-Mutfak-Paneli.zip"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-stone-950 font-bold text-xs rounded-lg transition-colors shadow-xs"
            >
              ⬇️ Mutfak Paneli Tam Paket (11 MB)
            </a>
            <a
              href="/paketler/Afyon-Kurye-Paneli.zip"
              download="Afyon-Kurye-Paneli.zip"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs rounded-lg transition-colors shadow-xs"
            >
              ⬇️ Kurye Paneli Tam Paket (11 MB)
            </a>
          </div>
        </div>
      </div>

      {/* Masaüstü Tek Sıra Lüks Üst Bar */}
      <div className="hidden lg:block">
        <UstBar
          aramaMetni={aramaMetni}
          aramaMetniniDegistir={aramaMetniniDegistir}
          anasayfayaGitTiklandi={anasayfayaDonusYap}
          filtreleTiklandi={filtrePaneliniAc}
          sepetiAcTiklandi={sepetPaneliAc}
          mutfakSecildi={mutfakSecildiIslemi}
          yemekSecildi={yemekSecildiIslemi}
        />
      </div>

      {/* Mobil ve Tablet İçin Ana Vitrin */}
      <MobilAnaVitrin 
        anasayfayaGitTiklandi={anasayfayaDonusYap} 
        seciliMutfak={seciliMutfak}
        mutfakSecildi={mutfakSecildiIslemi}
        yemekSecildi={yemekSecildiIslemi}
      />

      {/* Sadece Masaüstü İçin Sade Alt Bilgi (Footer) */}
      <MasaustuAltBilgi />

      {/* Mobil ve Tablet Alt Gezinti Menüsü (Keşfet, Mutfaklar, Sepetim, Giriş/Hesabım) */}
      <MobilAltMenu 
        anasayfayaDon={anasayfayaDonusYap}
        mutfaklarTiklandi={() => setMutfaklarModaliAcik(true)}
        aktifSekme={mutfaklarModaliAcik ? 'mutfaklar' : 'kesfet'}
      />

      {/* Yüzen Sepet Çubuğu (Yemeksepeti / Getir Stili) */}
      <YuzenSepetBari />

      {/* Ortak Modallar & Pencereler (Hem Mobil, Hem Tablet, Hem Masaüstünde Aktiftir) */}
      <MutfaklarModali
        acikMi={mutfaklarModaliAcik}
        onKapat={() => setMutfaklarModaliAcik(false)}
        onMutfakSec={(mutfak) => mutfakSecildiIslemi(mutfak)}
      />
      <FiltrePaneli
        acik={filtrePaneliAcik}
        mevcutFiltreler={aktifFiltreler}
        kapat={filtrePaneliniKapat}
        uygula={filtreleriUygula}
      />
      <CokluSepetVitrini />
      <AdresSecimPenceresi />
      <HaritaAdresSecici />
      <GelAlSubesiSecimPenceresi />
      <OrtakSepetPenceresi />
      <KullaniciGirisPenceresi />

      {/* 🍲 Canlı Arama veya Yemek Kartından Tıklanan Ürün Detay & Porsiyon Modalı */}
      {seciliYemekModal && (
        <UrunOzellestirmePenceresi
          yemek={seciliYemekModal}
          onKapat={() => setSeciliYemekModal(null)}
          mutfakVitriniAc={mutfakAcById}
          onSepeteEkle={async (konfig) => {
            await sepeteEkle(
              seciliYemekModal.mutfak_id || '',
              seciliYemekModal.id,
              konfig.adet,
              konfig.birim_fiyat
            );
            porsiyonDusur(seciliYemekModal.id, konfig.adet);
            setSeciliYemekModal(null);
          }}
        />
      )}

      {/* Yasal Çerez Onay Barı ve Sözleşme Penceresi */}
      <CerezOnayBari onSozlesmeAc={(tur) => setAktifSozlesmeTuru(tur)} />
      <SozlesmePenceresi
        tur={aktifSozlesmeTuru}
        acikMi={Boolean(aktifSozlesmeTuru)}
        onKapat={() => setAktifSozlesmeTuru(null)}
        onayButonuGoster={false}
      />

      {/* PWA Kurulum İstemi Kartı */}
      <PwaKurulumKarti />

      {/* 🤖 Afyon Lezzet Danışmanı (Hareketli Logo ve Yapay Zeka Asistanı) */}
      <LezzetDanismaniVitrini />
    </main>
  );
};
