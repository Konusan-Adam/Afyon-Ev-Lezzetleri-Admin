import React, { useState, useEffect } from 'react';
import {
  Store,
  Search,
  ShieldCheck,
  Award,
  FileCheck2,
  X,
  Plus,
  Wallet,
  Building,
  Megaphone
} from 'lucide-react';
import { useCanliHakedisTalepleri } from '@/src/MalzemeCekmeceleri/useCanliHakedisTalepleri';
import { useCanliMutfakAfisleri } from '@/src/MalzemeCekmeceleri/useCanliMutfakAfisleri';
import { RESMI_MUTFAK_LOGOSU } from '@/src/MalzemeCekmeceleri/Mutfak/resmiMutfakLogosu';
import { HakedisYonetimMerkezi } from './HakedisYonetimi/HakedisYonetimMerkezi';
import { YonetimMutfakAfisleri } from './YonetimMutfaklar/YonetimMutfakAfisleri';
import { MutfakYonetimKarti } from './YonetimMutfaklar/MutfakYonetimKarti';
import {
  MobilMutfakAracCubugu,
  type MutfakAltSekme,
  type MutfakFiltreDurumu,
} from './YonetimMutfaklar/MobilMutfakAracCubugu';
import { Mutfak } from '@/src/veritabani/VeriTipleri';
import { canliFirebaseAktifMi } from '@/src/veritabani/FirebaseIstemcisi';
import { koleksiyonGetir, belgeKaydet, belgeSil } from '@/src/veritabani/FirebaseKoleksiyonServisi';
import { hukukiDelilDamgalaVeKaydet } from '@/src/MalzemeCekmeceleri/HukukVeSozlesmeler/hukukiDelilServisi';

export interface MutfakYonlendirmeBilgisi {
  altSekme: 'ev_mutfaklari' | 'ticari_mutfaklar' | 'mutfak_afisleri' | 'hakedisler_odemeler';
  anahtar: number;
}

interface YonetimMutfaklarProps {
  mutfakYonlendirme?: MutfakYonlendirmeBilgisi | null;
  mobilBarlarGorunur?: boolean;
  sayfaAsagidaMi?: boolean;
}

export const YonetimMutfaklar: React.FC<YonetimMutfaklarProps> = ({
  mutfakYonlendirme,
  mobilBarlarGorunur = true,
  sayfaAsagidaMi = false,
}) => {
  const { talepler } = useCanliHakedisTalepleri();
  const { bekleyenSayisi: bekleyenAfisSayisi } = useCanliMutfakAfisleri();
  // İç sekme: 'ev_mutfaklari' | 'ticari_mutfaklar' | 'mutfak_afisleri' | 'hakedisler_odemeler'
  const [altSekme, setAltSekme] = useState<MutfakAltSekme>('ev_mutfaklari');

  useEffect(() => {
    if (mutfakYonlendirme?.altSekme) {
      setAltSekme(mutfakYonlendirme.altSekme);
    }
  }, [mutfakYonlendirme?.anahtar, mutfakYonlendirme?.altSekme]);

  const [mutfakListesi, setMutfakListesi] = useState<Mutfak[]>([]);
  const [arama, setArama] = useState('');
  const [filtre, setFiltre] = useState<MutfakFiltreDurumu>('hepsi');
  const [seciliMutfakBelge, setSeciliMutfakBelge] = useState<Mutfak | null>(null);
  const [yeniMutfakModalAcik, setYeniMutfakModalAcik] = useState(false);

  useEffect(() => {
    async function yukle() {
      if (canliFirebaseAktifMi()) {
        try {
          const fbMutfaklar = await koleksiyonGetir<any>('mutfaklar');
          const formatli: Mutfak[] = fbMutfaklar.map((m) => {
            const mutfakId = m.id || m.kimlik;
            const varsayilanTest = ['m1', 'asci_fatma_01', 'mutfak-fatma-teyze', 'mutfak-1', 'm2', 'mutfak-muzaffer'].includes(mutfakId);
            const onayli = m.onayli_mi !== undefined ? Boolean(m.onayli_mi) : varsayilanTest;

            // Eski stok görselli mutfak kayıtlarını resmi logoya çek
            if (mutfakId && m.gorsel_url !== RESMI_MUTFAK_LOGOSU) {
              belgeKaydet('mutfaklar', mutfakId, { gorsel_url: RESMI_MUTFAK_LOGOSU }).catch(() => {});
            }

            return {
              id: mutfakId,
              ad: m.ad || m.mutfak_adi || 'Afyon Ev Mutfağı',
              aciklama: m.aciklama || 'Geleneksel ev lezzetleri ustası.',
              adres: m.adres || 'Afyonkarahisar',
              min_siparis_tutari: m.min_siparis_tutari || 100,
              teslimat_ucreti: m.teslimat_ucreti ?? 25,
              puan: m.puan || 5.0,
              gorsel_url: RESMI_MUTFAK_LOGOSU,
              onayli_mi: onayli,
              onay_durumu: m.onay_durumu || (onayli ? 'onaylandi' : 'beklemede'),
              hijyen_onayli_mi: Boolean(m.hijyen_onayli_mi) || (varsayilanTest && m.hijyen_onayli_mi === undefined),
              esnaf_muafiyet_onayli_mi: Boolean(m.esnaf_muafiyet_onayli_mi) || (varsayilanTest && m.esnaf_muafiyet_onayli_mi === undefined),
              belgeler: m.belgeler
            };
          });

          if (formatli.length > 0) {
            setMutfakListesi(formatli);
            return;
          }
        } catch (err) {
          console.warn('Firebase mutfaklar çekme uyarısı:', err);
        }
      }
      setMutfakListesi([]);
    }
    yukle();
  }, []);

  // Yeni Mutfak Form State
  const [yeniAd, setYeniAd] = useState('');
  const [yeniAciklama, setYeniAciklama] = useState('');
  const [yeniAdres, setYeniAdres] = useState('Afyon Merkez');
  const [yeniMinTutar, setYeniMinTutar] = useState('150');
  const [yeniTip, setYeniTip] = useState<'ev' | 'ticari'>('ev');

  const mutfakEkle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!yeniAd) return;

    const yeni: Mutfak & { tip?: string; askida_mi?: boolean } = {
      id: `m-${Date.now()}`,
      ad: `${yeniAd} (${yeniTip === 'ticari' ? 'Ticari Lokanta' : 'Ev Mutfağı'})`,
      aciklama: yeniAciklama || 'Geleneksel Afyon lezzetleri',
      adres: yeniAdres,
      min_siparis_tutari: parseFloat(yeniMinTutar) || 150,
      teslimat_ucreti: 0,
      puan: 5.0,
      gorsel_url: RESMI_MUTFAK_LOGOSU,
      hijyen_onayli_mi: false,
      esnaf_muafiyet_onayli_mi: yeniTip === 'ev',
      askida_mi: false,
      belgeler: {
        hijyenBarkodNo: 'MEB-2026-NEW',
        hijyenKurum: 'Afyon Halk Eğitim',
        hijyenVerilisTarihi: '2026-09-01',
        vergiMuafiyetNo: yeniTip === 'ev' ? 'GVK-NEW-03' : 'VERGI-LTD-03',
        vergiDairesi: 'Afyon Vergi Dairesi',
        muafiyetVerilisTarihi: '2026-09-01'
      }
    };

    if (canliFirebaseAktifMi()) {
      try {
        await belgeKaydet('mutfaklar', yeni.id, yeni);
        await belgeKaydet('kullanicilar', yeni.id, {
          kimlik: yeni.id,
          ad_soyad: yeni.ad,
          telefon: '5550000000',
          rol: 'ev_mutfagi',
          isletme_adi: yeni.ad,
          onayli_mi: false
        });
      } catch (err) {
        console.warn('Mutfak veritabanına kaydetme hatası:', err);
      }
    }

    setMutfakListesi([yeni as Mutfak, ...mutfakListesi]);
    setYeniAd('');
    setYeniAciklama('');
    setYeniMutfakModalAcik(false);
  };

  const mutfakSil = async (id: string) => {
    setMutfakListesi(onceki => onceki.filter(m => m.id !== id));
    if (seciliMutfakBelge?.id === id) {
      setSeciliMutfakBelge(null);
    }
    if (canliFirebaseAktifMi()) {
      try {
        await belgeSil('mutfaklar', id);
        await belgeSil('kullanicilar', id);
      } catch (err) {
        console.warn('Mutfak veritabanından silme hatası:', err);
      }
    }
  };

  const askiyaAlDegistir = async (id: string) => {
    const hedef = mutfakListesi.find(m => m.id === id);
    let yeniAskida = false;
    setMutfakListesi(onceki => onceki.map(m => {
      const askida = (m as any).askida_mi;
      if (m.id === id) {
        yeniAskida = !askida;
        return { ...m, askida_mi: yeniAskida } as any;
      }
      return m;
    }));

    if (canliFirebaseAktifMi()) {
      try {
        await belgeKaydet('mutfaklar', id, { askida_mi: yeniAskida });
        await belgeKaydet('kullanicilar', id, { askida_mi: yeniAskida });
      } catch (err) {
        console.warn('Mutfak askıya alma hatası:', err);
      }
    }

    void hukukiDelilDamgalaVeKaydet({
      islemTuru: 'ozel_onay',
      sozlesmeTuru: 'yetkili_hesap_onayi',
      sozlesmeVersiyonu: '1.0.0',
      ilgiliKayitId: id,
      onaylandiMi: !yeniAskida,
      ekDetay: {
        hedefTipi: 'mutfak_asci',
        mutfakAdi: hedef?.ad || '',
        aksiyon: yeniAskida ? 'askiya_alindi' : 'aktif_edildi',
      },
    });
  };

  const hijyenDurumDegistir = async (mutfakId: string) => {
    let yeniHijyen = false;
    let yeniOnayli = false;
    let yeniBelgeDurum = 'beklemede';

    setMutfakListesi(onceki => onceki.map(m => {
      if (m.id === mutfakId) {
        yeniHijyen = !m.hijyen_onayli_mi;
        yeniOnayli = yeniHijyen && Boolean(m.esnaf_muafiyet_onayli_mi);
        yeniBelgeDurum = yeniHijyen ? 'onaylandi' : 'reddedildi';
        return { 
          ...m, 
          hijyen_onayli_mi: yeniHijyen, 
          onayli_mi: yeniOnayli, 
          onay_durumu: yeniOnayli ? 'onaylandi' : 'beklemede',
          belgeler: m.belgeler ? { ...m.belgeler, hijyenOnayDurumu: yeniBelgeDurum as any } : undefined
        };
      }
      return m;
    }));

    if (seciliMutfakBelge?.id === mutfakId) {
      setSeciliMutfakBelge((onceki: any) => onceki ? { 
        ...onceki, 
        hijyen_onayli_mi: yeniHijyen, 
        onayli_mi: yeniOnayli, 
        onay_durumu: yeniOnayli ? 'onaylandi' : 'beklemede',
        belgeler: onceki.belgeler ? { ...onceki.belgeler, hijyenOnayDurumu: yeniBelgeDurum } : undefined
      } : null);
    }

    if (canliFirebaseAktifMi()) {
      try {
        const hedefMutfak = mutfakListesi.find(m => m.id === mutfakId);
        const guncelBelgeler = hedefMutfak?.belgeler ? { ...hedefMutfak.belgeler, hijyenOnayDurumu: yeniBelgeDurum } : { hijyenOnayDurumu: yeniBelgeDurum };
        await belgeKaydet('mutfaklar', mutfakId, {
          hijyen_onayli_mi: yeniHijyen,
          onayli_mi: yeniOnayli,
          onay_durumu: yeniOnayli ? 'onaylandi' : 'beklemede',
          belgeler: guncelBelgeler
        });
        await belgeKaydet('kullanicilar', mutfakId, {
          onayli_mi: yeniOnayli,
          onay_durumu: yeniOnayli ? 'onaylandi' : 'beklemede'
        });
      } catch (err) {
        console.warn('Mutfak hijyen onay kaydetme hatası:', err);
      }
    }

    const hedef = mutfakListesi.find(m => m.id === mutfakId);
    void hukukiDelilDamgalaVeKaydet({
      islemTuru: 'ozel_onay',
      sozlesmeTuru: 'yetkili_hesap_onayi',
      sozlesmeVersiyonu: '1.0.0',
      ilgiliKayitId: mutfakId,
      onaylandiMi: yeniHijyen,
      ekDetay: {
        hedefTipi: 'mutfak_hijyen_belgesi',
        mutfakAdi: hedef?.ad || '',
        aksiyon: yeniHijyen ? 'hijyen_onaylandi' : 'hijyen_onayi_kaldirildi',
      },
    });
  };

  const muafiyetDurumDegistir = async (mutfakId: string) => {
    let yeniMuafiyet = false;
    let yeniOnayli = false;
    let yeniBelgeDurum = 'beklemede';

    setMutfakListesi(onceki => onceki.map(m => {
      if (m.id === mutfakId) {
        yeniMuafiyet = !m.esnaf_muafiyet_onayli_mi;
        yeniOnayli = yeniMuafiyet && Boolean(m.hijyen_onayli_mi);
        yeniBelgeDurum = yeniMuafiyet ? 'onaylandi' : 'reddedildi';
        return { 
          ...m, 
          esnaf_muafiyet_onayli_mi: yeniMuafiyet, 
          onayli_mi: yeniOnayli, 
          onay_durumu: yeniOnayli ? 'onaylandi' : 'beklemede',
          belgeler: m.belgeler ? { ...m.belgeler, muafiyetOnayDurumu: yeniBelgeDurum as any } : undefined
        };
      }
      return m;
    }));

    if (seciliMutfakBelge?.id === mutfakId) {
      setSeciliMutfakBelge((onceki: any) => onceki ? { 
        ...onceki, 
        esnaf_muafiyet_onayli_mi: yeniMuafiyet, 
        onayli_mi: yeniOnayli, 
        onay_durumu: yeniOnayli ? 'onaylandi' : 'beklemede',
        belgeler: onceki.belgeler ? { ...onceki.belgeler, muafiyetOnayDurumu: yeniBelgeDurum } : undefined
      } : null);
    }

    if (canliFirebaseAktifMi()) {
      try {
        const hedefMutfak = mutfakListesi.find(m => m.id === mutfakId);
        const guncelBelgeler = hedefMutfak?.belgeler ? { ...hedefMutfak.belgeler, muafiyetOnayDurumu: yeniBelgeDurum } : { muafiyetOnayDurumu: yeniBelgeDurum };
        await belgeKaydet('mutfaklar', mutfakId, {
          esnaf_muafiyet_onayli_mi: yeniMuafiyet,
          onayli_mi: yeniOnayli,
          onay_durumu: yeniOnayli ? 'onaylandi' : 'beklemede',
          belgeler: guncelBelgeler
        });
        await belgeKaydet('kullanicilar', mutfakId, {
          onayli_mi: yeniOnayli,
          onay_durumu: yeniOnayli ? 'onaylandi' : 'beklemede'
        });
      } catch (err) {
        console.warn('Mutfak muafiyet onay kaydetme hatası:', err);
      }
    }

    const hedef = mutfakListesi.find(m => m.id === mutfakId);
    void hukukiDelilDamgalaVeKaydet({
      islemTuru: 'ozel_onay',
      sozlesmeTuru: 'yetkili_hesap_onayi',
      sozlesmeVersiyonu: '1.0.0',
      ilgiliKayitId: mutfakId,
      onaylandiMi: yeniMuafiyet,
      ekDetay: {
        hedefTipi: 'mutfak_vergi_muafiyet',
        mutfakAdi: hedef?.ad || '',
        aksiyon: yeniMuafiyet ? 'muafiyet_onaylandi' : 'muafiyet_onayi_kaldirildi',
      },
    });
  };

  const mutfakOnayla = async (mutfakId: string, onayVer: boolean) => {
    const durumStr = onayVer ? 'onaylandi' : 'reddedildi';
    setMutfakListesi(onceki => onceki.map(m => {
      if (m.id === mutfakId) {
        return {
          ...m,
          onayli_mi: onayVer,
          onay_durumu: durumStr,
          hijyen_onayli_mi: onayVer ? true : m.hijyen_onayli_mi,
          esnaf_muafiyet_onayli_mi: onayVer ? true : m.esnaf_muafiyet_onayli_mi,
          belgeler: m.belgeler ? {
            ...m.belgeler,
            hijyenOnayDurumu: onayVer ? 'onaylandi' : m.belgeler.hijyenOnayDurumu,
            muafiyetOnayDurumu: onayVer ? 'onaylandi' : m.belgeler.muafiyetOnayDurumu
          } : undefined
        };
      }
      return m;
    }));

    if (seciliMutfakBelge?.id === mutfakId) {
      setSeciliMutfakBelge((onceki: any) => onceki ? {
        ...onceki,
        onayli_mi: onayVer,
        onay_durumu: durumStr,
        hijyen_onayli_mi: onayVer ? true : onceki.hijyen_onayli_mi,
        esnaf_muafiyet_onayli_mi: onayVer ? true : onceki.esnaf_muafiyet_onayli_mi,
        belgeler: onceki.belgeler ? {
          ...onceki.belgeler,
          hijyenOnayDurumu: onayVer ? 'onaylandi' : onceki.belgeler.hijyenOnayDurumu,
          muafiyetOnayDurumu: onayVer ? 'onaylandi' : onceki.belgeler.muafiyetOnayDurumu
        } : undefined
      } : null);
    }

    if (canliFirebaseAktifMi()) {
      try {
        const hedefMutfak = mutfakListesi.find(m => m.id === mutfakId);
        const guncelBelgeler = hedefMutfak?.belgeler ? {
          ...hedefMutfak.belgeler,
          hijyenOnayDurumu: onayVer ? 'onaylandi' : hedefMutfak.belgeler.hijyenOnayDurumu,
          muafiyetOnayDurumu: onayVer ? 'onaylandi' : hedefMutfak.belgeler.muafiyetOnayDurumu
        } : undefined;

        await belgeKaydet('mutfaklar', mutfakId, {
          onayli_mi: onayVer,
          onay_durumu: durumStr,
          hijyen_onayli_mi: onayVer ? true : undefined,
          esnaf_muafiyet_onayli_mi: onayVer ? true : undefined,
          belgeler: guncelBelgeler
        });
        await belgeKaydet('kullanicilar', mutfakId, {
          onayli_mi: onayVer,
          onay_durumu: durumStr
        });
      } catch (err) {
        console.warn('Mutfak onay güncelleme hatası:', err);
      }
    }

    const hedef = mutfakListesi.find(m => m.id === mutfakId);
    void hukukiDelilDamgalaVeKaydet({
      islemTuru: 'ozel_onay',
      sozlesmeTuru: 'yetkili_hesap_onayi',
      sozlesmeVersiyonu: '1.0.0',
      ilgiliKayitId: mutfakId,
      onaylandiMi: onayVer,
      ekDetay: {
        hedefTipi: 'mutfak_asci',
        mutfakAdi: hedef?.ad || '',
        aksiyon: onayVer ? 'hesap_onaylandi' : 'hesap_reddedildi',
      },
    });
  };

  const filtrelenmisMutfaklar = mutfakListesi.filter(m => {
    const aramaUyumu = m.ad.toLowerCase().includes(arama.toLowerCase()) || 
      m.adres?.toLowerCase().includes(arama.toLowerCase());

    if (!aramaUyumu) return false;

    const askida = (m as any).askida_mi;
    if (filtre === 'askida') return askida;
    if (filtre === 'onayli') return m.hijyen_onayli_mi && m.esnaf_muafiyet_onayli_mi && !askida;
    if (filtre === 'belge_bekleyen') return (!m.hijyen_onayli_mi || !m.esnaf_muafiyet_onayli_mi) && !askida;
    return true;
  });

  const bekleyenHakedisSayisi = talepler.filter(t => t.durum === 'beklemede').length;

  return (
    <div className="space-y-4 lg:space-y-6 animate-fadeIn">

      {/* 📱 MOBİL AÇILIR/KAPANIR & KAYDIRMAYA DUYARLI ARAÇ ÇUBUĞU */}
      <MobilMutfakAracCubugu
        altSekme={altSekme}
        onAltSekmeSec={setAltSekme}
        filtre={filtre}
        onFiltreSec={setFiltre}
        arama={arama}
        onAramaDegistir={setArama}
        mutfakSayisi={mutfakListesi.length}
        bekleyenAfisSayisi={bekleyenAfisSayisi}
        bekleyenHakedisSayisi={bekleyenHakedisSayisi}
        gorunurMu={mobilBarlarGorunur}
        sayfaAsagidaMi={sayfaAsagidaMi}
        onYeniMutfakAc={() => setYeniMutfakModalAcik(true)}
      />

      {/* 🌟 ÜST BAŞLIK & ANA SEKME GEÇİŞLERİ (Masaüstü) */}
      <div className="hidden lg:flex flex-col xl:flex-row xl:items-center justify-between gap-4 p-5 rounded-2xl bg-[#180A1F] border border-[#3E1646]">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <Store className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-extrabold text-white">Mutfak Yönetimi</h2>
            <p className="text-xs text-purple-300 leading-relaxed">
              Ev mutfakları, ticari lokantalar, yasal belgeler, askıya alma ve hakediş ödemeleri tek merkezde.
            </p>
          </div>
        </div>

        {/* Sekme Butonları */}
        <div className="flex items-center bg-[#120614] p-1.5 rounded-xl border border-purple-900/60 text-xs font-bold gap-1.5 w-full xl:w-auto overflow-x-auto no-scrollbar md:flex-wrap">
          <button
            type="button"
            onClick={() => setAltSekme('ev_mutfaklari')}
            className={`min-h-[38px] px-3 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              altSekme === 'ev_mutfaklari' ? 'bg-[#7B258B] text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Store className="w-3.5 h-3.5 shrink-0" />
            <span>Ev Mutfakları ({mutfakListesi.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setAltSekme('ticari_mutfaklar')}
            className={`min-h-[38px] px-3 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              altSekme === 'ticari_mutfaklar' ? 'bg-[#7B258B] text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Building className="w-3.5 h-3.5 shrink-0" />
            <span>Ticari Mutfaklar</span>
          </button>
          <button
            type="button"
            onClick={() => setAltSekme('mutfak_afisleri')}
            className={`min-h-[38px] px-3 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              altSekme === 'mutfak_afisleri' ? 'bg-[#7B258B] text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5 shrink-0" />
            <span>Mutfak Afişleri & Vitrin ({bekleyenAfisSayisi})</span>
          </button>
          <button
            type="button"
            onClick={() => setAltSekme('hakedisler_odemeler')}
            className={`min-h-[38px] px-3 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              altSekme === 'hakedisler_odemeler' ? 'bg-amber-600 text-gray-950 font-black shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Wallet className="w-3.5 h-3.5 shrink-0" />
            <span>Hakediş & Ödemeler ({bekleyenHakedisSayisi})</span>
          </button>
        </div>
      </div>

      {/* ================= 1. EV MUTFAKLARI & TİCARİ MUTFAKLAR SEKMESİ ================= */}
      {altSekme === 'mutfak_afisleri' && <YonetimMutfakAfisleri />}

      {altSekme !== 'hakedisler_odemeler' && altSekme !== 'mutfak_afisleri' && (
        <div className="space-y-4">
          
          {/* Arama & Ekleme Barı (Masaüstü) */}
          <div className="hidden lg:flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-4 rounded-2xl bg-[#180A1F] border border-[#3E1646]">
            <div className="w-full lg:w-auto overflow-x-auto no-scrollbar">
              <div className="inline-flex items-center bg-[#240C28] p-1 rounded-xl border border-[#3E1646] text-[11px] font-bold gap-1 whitespace-nowrap">
                <button
                  type="button"
                  onClick={() => setFiltre('hepsi')}
                  className={`min-h-[34px] px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    filtre === 'hepsi' ? 'bg-[#7B258B] text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Tümü
                </button>
                <button
                  type="button"
                  onClick={() => setFiltre('onayli')}
                  className={`min-h-[34px] px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    filtre === 'onayli' ? 'bg-emerald-800 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  ✓ Tam Belgeli
                </button>
                <button
                  type="button"
                  onClick={() => setFiltre('belge_bekleyen')}
                  className={`min-h-[34px] px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    filtre === 'belge_bekleyen' ? 'bg-amber-600 text-gray-950 font-black' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  ⚠️ Belge Bekleyen
                </button>
                <button
                  type="button"
                  onClick={() => setFiltre('askida')}
                  className={`min-h-[34px] px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    filtre === 'askida' ? 'bg-rose-700 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  🔒 Askıda
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
              <div className="relative w-full sm:w-60">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={arama}
                  onChange={(e) => setArama(e.target.value)}
                  placeholder="Mutfak veya mahalle ara..."
                  className="w-full min-h-[40px] bg-[#120614] border border-purple-900/60 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
                />
              </div>
              <button
                type="button"
                onClick={() => setYeniMutfakModalAcik(true)}
                className="min-h-[40px] px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-[#130713] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:brightness-110 shadow-md whitespace-nowrap shrink-0"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span>Yeni Mutfak Ekle</span>
              </button>
            </div>
          </div>

          {/* Mutfaklar Grid Listesi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtrelenmisMutfaklar.map((mutfak) => (
              <MutfakYonetimKarti
                key={mutfak.id}
                mutfak={mutfak}
                onBelgeAc={setSeciliMutfakBelge}
                onAskiyaAlDegistir={askiyaAlDegistir}
                onMutfakSil={mutfakSil}
                onMutfakOnayla={mutfakOnayla}
                onHijyenDegistir={hijyenDurumDegistir}
                onMuafiyetDegistir={muafiyetDurumDegistir}
              />
            ))}
          </div>

        </div>
      )}

      {/* ================= 2. HAKEDİŞLER & ÖDEMELER SEKMESİ ================= */}
      {/* ================= 2. HAKEDİŞ & TOPLU BANKA ÖDEMELERİ ================= */}
      {altSekme === 'hakedisler_odemeler' && <HakedisYonetimMerkezi />}

      {/* 🌟 YENİ MUTFAK EKLEME MODALI */}
      {yeniMutfakModalAcik && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-[#180A1F] border border-amber-500/50 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Store className="w-5 h-5 text-amber-400" />
              Mutfak Yönetimi: Yeni Mutfak Ekle
            </h3>
            <form onSubmit={mutfakEkle} className="space-y-3 text-xs">
              <div>
                <label className="text-gray-400 block mb-1">Mutfak Türü</label>
                <select
                  value={yeniTip}
                  onChange={(e) => setYeniTip(e.target.value as any)}
                  className="w-full bg-[#130713] border border-purple-800/60 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="ev">Ev Mutfağı (GVK 9/10 Esnaf Muafiyetli)</option>
                  <option value="ticari">Ticari Lokanta / Restoran</option>
                </select>
              </div>
              <div>
                <label className="text-gray-400 block mb-1">Mutfak / İşletme Adı</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Hatice Teyze Mantı Evi"
                  value={yeniAd}
                  onChange={(e) => setYeniAd(e.target.value)}
                  className="w-full bg-[#130713] border border-purple-800/60 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-gray-400 block mb-1">Açıklama / Uzmanlık</label>
                <input
                  type="text"
                  placeholder="Örn: Ev yapımı tereyağlı bükme ve çorbalar"
                  value={yeniAciklama}
                  onChange={(e) => setYeniAciklama(e.target.value)}
                  className="w-full bg-[#130713] border border-purple-800/60 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-gray-400 block mb-1">Mahalle / Adres</label>
                <input
                  type="text"
                  value={yeniAdres}
                  onChange={(e) => setYeniAdres(e.target.value)}
                  className="w-full bg-[#130713] border border-purple-800/60 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-gray-400 block mb-1">Min. Sipariş Tutarı (TL)</label>
                <input
                  type="number"
                  value={yeniMinTutar}
                  onChange={(e) => setYeniMinTutar(e.target.value)}
                  className="w-full bg-[#130713] border border-purple-800/60 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-purple-950">
                <button
                  type="button"
                  onClick={() => setYeniMutfakModalAcik(false)}
                  className="px-4 py-2 rounded-xl bg-purple-950 text-gray-300 font-bold cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-gray-950 font-extrabold cursor-pointer"
                >
                  Mutfağı Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🔍 BELGE İNCELEME MODALI */}
      {seciliMutfakBelge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-[#180A1F] border border-amber-500/50 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-purple-950 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-sm">{seciliMutfakBelge.ad}</h3>
                  <p className="text-[11px] text-gray-400">Resmi Belge & İzin Doğrulama Masası</p>
                </div>
              </div>
              <button
                onClick={() => setSeciliMutfakBelge(null)}
                className="w-8 h-8 rounded-full bg-purple-950 text-gray-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-[#240C28] p-3.5 rounded-2xl border border-purple-900/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    <FileCheck2 className="w-4 h-4 text-amber-400" />
                    <span>MEB Hijyen Eğitimi Sertifikası</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    seciliMutfakBelge.hijyen_onayli_mi ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                  }`}>
                    {seciliMutfakBelge.hijyen_onayli_mi ? 'Onaylı' : 'Bekliyor'}
                  </span>
                </div>
                <button
                  onClick={() => hijyenDurumDegistir(seciliMutfakBelge.id)}
                  className="w-full py-1.5 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-purple-200 text-xs font-bold cursor-pointer mt-2"
                >
                  {seciliMutfakBelge.hijyen_onayli_mi ? 'Hijyen Onayını Kaldır' : 'Hijyen Belgesini Onayla'}
                </button>
              </div>

              <div className="bg-[#240C28] p-3.5 rounded-2xl border border-purple-900/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Esnaf Vergi Muafiyeti</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    seciliMutfakBelge.esnaf_muafiyet_onayli_mi ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
                  }`}>
                    {seciliMutfakBelge.esnaf_muafiyet_onayli_mi ? 'Onaylı' : 'Bekliyor'}
                  </span>
                </div>
                <button
                  onClick={() => muafiyetDurumDegistir(seciliMutfakBelge.id)}
                  className="w-full py-1.5 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-purple-200 text-xs font-bold cursor-pointer mt-2"
                >
                  {seciliMutfakBelge.esnaf_muafiyet_onayli_mi ? 'Muafiyet Onayını Kaldır' : 'Muafiyet Onayla'}
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSeciliMutfakBelge(null)}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-gray-950 font-extrabold text-xs cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
