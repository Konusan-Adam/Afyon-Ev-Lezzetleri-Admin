import React, { createContext, useContext, useState, useEffect } from 'react';
import { Kullanici, KullaniciRolu } from '@/src/veritabani/VeriTipleri';
import {
  veritabaninaKullaniciKaydet,
  veritabanindanKullaniciGirisYaptir,
} from '@/src/MalzemeCekmeceleri/kullaniciIslemleri';
import { mevcutUrlPaneliniBul, urlVeBasligiGuncelle } from '@/src/GirisKapisi/RotaYardimcisi';
import { yonetimYetkisiVarMi } from '@/src/MalzemeCekmeceleri/Kimlik/kullaniciAnahtarYardimcisi';
import { superAdminHesabiniSenkronizeEt } from '@/src/MalzemeCekmeceleri/Kimlik/superAdminSenkronizasyonu';

export type PanelTipi = 'vitrin' | 'patron' | 'musteri' | 'mutfak' | 'kurye';

interface KullaniciHafizaTipi {
  aktifKullanici: Kullanici | null;
  pencereAcik: boolean;
  baslangicSekmesi: 'giris' | 'kayit';
  baslangicRolu: KullaniciRolu;
  yukleniyor: boolean;
  goruntulenenPanel: PanelTipi;
  panelDegistir: (panel: PanelTipi) => void;
  yonetimModuAcik: boolean;
  yonetimModunuAyarla: (acik: boolean) => void;
  pencereAc: (baslangicSekmesi?: 'giris' | 'kayit' | any, baslangicRolu?: KullaniciRolu) => void;
  pencereKapat: () => void;
  girisYap: (telefon: string, sifre: string) => Promise<boolean>;
  oturumKullanicisiniAyarla: (kullanici: Kullanici) => void;
  kayitOl: (bilgiler: {
    ad_soyad: string;
    telefon: string;
    eposta?: string;
    rol: KullaniciRolu;
    isletme_adi?: string;
    arac_tipi?: string;
    ilce?: string;
    sifre?: string;
    hijyen_onayli_mi?: boolean;
    esnaf_muafiyet_onayli_mi?: boolean;
    belgeler?: any;
  }) => Promise<boolean>;
  cikisYap: () => void;
  testRoluneGec: (rol: KullaniciRolu) => void;
}

const KullaniciContext = createContext<KullaniciHafizaTipi | undefined>(undefined);

export const KullaniciSaglayici: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [aktifKullanici, setAktifKullanici] = useState<Kullanici | null>(() => {
    try {
      const kayitliOturum = localStorage.getItem('afyon_oturum_kullanici');
      return kayitliOturum ? JSON.parse(kayitliOturum) : null;
    } catch {
      return null;
    }
  });

  const [pencereAcik, setPencereAcik] = useState<boolean>(false);
  const [baslangicSekmesi, setBaslangicSekmesi] = useState<'giris' | 'kayit'>('giris');
  const [baslangicRolu, setBaslangicRolu] = useState<KullaniciRolu>('musteri');
  const [yukleniyor, setYukleniyor] = useState<boolean>(false);
  const [goruntulenenPanel, setGoruntulenenPanel] = useState<PanelTipi>(() => mevcutUrlPaneliniBul());

  useEffect(() => {
    superAdminHesabiniSenkronizeEt();
  }, []);

  // URL rotası veya geri/ileri tuşu değiştiğinde senkronize et
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const rotaGuncelle = () => {
      setGoruntulenenPanel(mevcutUrlPaneliniBul());
    };
    window.addEventListener('popstate', rotaGuncelle);
    window.addEventListener('hashchange', rotaGuncelle);
    return () => {
      window.removeEventListener('popstate', rotaGuncelle);
      window.removeEventListener('hashchange', rotaGuncelle);
    };
  }, []);

  // Oturum değiştikçe localStorage güncelle
  useEffect(() => {
    if (aktifKullanici) {
      localStorage.setItem('afyon_oturum_kullanici', JSON.stringify(aktifKullanici));
    } else {
      localStorage.removeItem('afyon_oturum_kullanici');
    }
  }, [aktifKullanici]);

  const panelDegistir = (panel: PanelTipi) => {
    setGoruntulenenPanel(panel);
    urlVeBasligiGuncelle(panel);
  };

  const yonetimModunuAyarla = (acik: boolean) => {
    const hedef: PanelTipi = acik ? 'patron' : 'vitrin';
    setGoruntulenenPanel(hedef);
    urlVeBasligiGuncelle(hedef);
  };

  const testRoluneGec = (rol: KullaniciRolu) => {
    if (rol === 'musteri') {
      setGoruntulenenPanel('musteri');
    } else if (rol === 'ev_mutfagi' || rol === 'ticari_restoran') {
      setGoruntulenenPanel('mutfak');
    } else if (rol === 'kurye') {
      setGoruntulenenPanel('kurye');
    } else if (yonetimYetkisiVarMi(rol)) {
      setGoruntulenenPanel('patron');
    }
  };

  const roleGorePaneleYonlendir = (kullanici: Kullanici) => {
    if (yonetimYetkisiVarMi(kullanici.rol)) {
      setGoruntulenenPanel('patron');
    } else if (kullanici.rol === 'ev_mutfagi' || kullanici.rol === 'ticari_restoran') {
      setGoruntulenenPanel('mutfak');
    } else if (kullanici.rol === 'kurye') {
      setGoruntulenenPanel('kurye');
    } else {
      setGoruntulenenPanel('vitrin');
    }
  };

  const oturumKullanicisiniAyarla = (kullanici: Kullanici) => {
    setAktifKullanici(kullanici);
    setPencereAcik(false);
    roleGorePaneleYonlendir(kullanici);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('afyon_oturum_degisti', { detail: { aktifKullanici: kullanici } }));
    }
  };

  const girisYap = async (telefon: string, sifre: string): Promise<boolean> => {
    setYukleniyor(true);
    const kullanici = await veritabanindanKullaniciGirisYaptir(telefon, sifre);
    setYukleniyor(false);

    if (kullanici) {
      oturumKullanicisiniAyarla(kullanici);
      return true;
    }
    return false;
  };

  const kayitOl = async (bilgiler: {
    ad_soyad: string;
    telefon: string;
    eposta?: string;
    rol: KullaniciRolu;
    isletme_adi?: string;
    arac_tipi?: string;
    ilce?: string;
    sifre?: string;
  }): Promise<boolean> => {
    setYukleniyor(true);
    const kaydolunankullanici = await veritabaninaKullaniciKaydet(bilgiler);
    setYukleniyor(false);

    if (kaydolunankullanici) {
      oturumKullanicisiniAyarla(kaydolunankullanici);
      return true;
    }
    return false;
  };

  const cikisYap = () => {
    setAktifKullanici(null);
    localStorage.removeItem('afyon_oturum_kullanici');
    localStorage.removeItem('afyon_misafir_secili_adres');
    localStorage.removeItem('afyon_secili_mahalle');
    localStorage.removeItem('afyon_son_misafir_telefon');
    localStorage.removeItem('afyon_son_misafir_ad');
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('afyon_patron_guvenlik_muhru');
    }
    setGoruntulenenPanel('vitrin');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('afyon_oturum_degisti', { detail: { aktifKullanici: null } }));
    }
  };

  return (
    <KullaniciContext.Provider
      value={{
        aktifKullanici,
        pencereAcik,
        baslangicSekmesi,
        baslangicRolu,
        yukleniyor,
        goruntulenenPanel,
        panelDegistir,
        yonetimModuAcik: goruntulenenPanel === 'patron',
        yonetimModunuAyarla,
        pencereAc: (sekme?: any, rol?: KullaniciRolu) => {
          const gecerliSekme = sekme === 'kayit' ? 'kayit' : 'giris';
          const gecerliRol = rol && ['musteri', 'ev_mutfagi', 'ticari_restoran', 'kurye'].includes(rol) ? rol : 'musteri';
          setBaslangicSekmesi(gecerliSekme);
          setBaslangicRolu(gecerliRol);
          setPencereAcik(true);
        },
        pencereKapat: () => setPencereAcik(false),
        girisYap,
        oturumKullanicisiniAyarla,
        kayitOl,
        cikisYap,
        testRoluneGec,
      }}
    >
      {children}
    </KullaniciContext.Provider>
  );
};

export const kullaniciHafizasiKullan = () => {
  const context = useContext(KullaniciContext);
  if (!context) {
    throw new Error('kullaniciHafizasiKullan, KullaniciSaglayici içinde kullanılmalıdır');
  }
  return context;
};
