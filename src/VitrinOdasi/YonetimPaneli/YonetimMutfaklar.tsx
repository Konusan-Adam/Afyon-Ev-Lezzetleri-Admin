import React, { useState, useEffect } from 'react';
import { 
  Store, 
  Star, 
  MapPin, 
  Search, 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  FileText,
  FileCheck2,
  Clock,
  Eye,
  Check,
  X,
  Plus,
  Trash2,
  Edit3,
  Wallet,
  Building,
  CreditCard
} from 'lucide-react';
import { useCanliHakedisTalepleri } from '@/src/MalzemeCekmeceleri/useCanliHakedisTalepleri';
import { HakedisCekimTalebi } from '@/src/veritabani/CanliVeriYardimcisi';
import { Mutfak } from '@/src/veritabani/VeriTipleri';
import { canliFirebaseAktifMi } from '@/src/veritabani/FirebaseIstemcisi';
import { koleksiyonGetir, belgeKaydet, belgeSil } from '@/src/veritabani/FirebaseKoleksiyonServisi';

export const YonetimMutfaklar: React.FC = () => {
  const { talepler, talepDurumGuncelle } = useCanliHakedisTalepleri();
  // İç sekme: 'ev_mutfaklari' | 'ticari_mutfaklar' | 'hakedisler_odemeler'
  const [altSekme, setAltSekme] = useState<'ev_mutfaklari' | 'ticari_mutfaklar' | 'hakedisler_odemeler'>('ev_mutfaklari');

  const [mutfakListesi, setMutfakListesi] = useState<Mutfak[]>([]);
  const [arama, setArama] = useState('');
  const [filtre, setFiltre] = useState<'hepsi' | 'onayli' | 'belge_bekleyen' | 'askida'>('hepsi');
  const [seciliMutfakBelge, setSeciliMutfakBelge] = useState<Mutfak | null>(null);
  const [yeniMutfakModalAcik, setYeniMutfakModalAcik] = useState(false);

  useEffect(() => {
    async function yukle() {
      if (canliFirebaseAktifMi()) {
        try {
          const fbMutfaklar = await koleksiyonGetir<any>('mutfaklar');
          const formatli: Mutfak[] = fbMutfaklar.map((m) => {
            const varsayilanTest = ['m1', 'asci_fatma_01', 'mutfak-fatma-teyze', 'mutfak-1', 'm2', 'mutfak-muzaffer'].includes(m.id || m.kimlik);
            const onayli = m.onayli_mi !== undefined ? Boolean(m.onayli_mi) : varsayilanTest;
            return {
              id: m.id || m.kimlik,
              ad: m.ad || m.mutfak_adi || 'Afyon Ev Mutfağı',
              aciklama: m.aciklama || 'Geleneksel ev lezzetleri ustası.',
              adres: m.adres || 'Afyonkarahisar',
              min_siparis_tutari: m.min_siparis_tutari || 100,
              teslimat_ucreti: m.teslimat_ucreti ?? 25,
              puan: m.puan || 5.0,
              gorsel_url: m.gorsel_url || 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80',
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

  // Hakediş state
  const [hakedisArama, setHakedisArama] = useState('');
  const [hakedisDurumFiltresi, setHakedisDurumFiltresi] = useState<'hepsi' | 'beklemede' | 'odendi' | 'reddedildi'>('hepsi');
  const [seciliTalep, setSeciliTalep] = useState<HakedisCekimTalebi | null>(null);
  const [dekontNotu, setDekontNotu] = useState('');
  const [sayac, setSayac] = useState(0);

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
      gorsel_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
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
  };

  const hijyenDurumDegistir = async (mutfakId: string) => {
    let yeniHijyen = false;
    let yeniOnayli = false;

    setMutfakListesi(onceki => onceki.map(m => {
      if (m.id === mutfakId) {
        yeniHijyen = !m.hijyen_onayli_mi;
        yeniOnayli = yeniHijyen && Boolean(m.esnaf_muafiyet_onayli_mi);
        return { 
          ...m, 
          hijyen_onayli_mi: yeniHijyen, 
          onayli_mi: yeniOnayli, 
          onay_durumu: yeniOnayli ? 'onaylandi' : 'beklemede' 
        };
      }
      return m;
    }));

    if (seciliMutfakBelge?.id === mutfakId) {
      setSeciliMutfakBelge((onceki: any) => onceki ? { 
        ...onceki, 
        hijyen_onayli_mi: yeniHijyen, 
        onayli_mi: yeniOnayli, 
        onay_durumu: yeniOnayli ? 'onaylandi' : 'beklemede' 
      } : null);
    }

    if (canliFirebaseAktifMi()) {
      try {
        await belgeKaydet('mutfaklar', mutfakId, {
          hijyen_onayli_mi: yeniHijyen,
          onayli_mi: yeniOnayli,
          onay_durumu: yeniOnayli ? 'onaylandi' : 'beklemede'
        });
        await belgeKaydet('kullanicilar', mutfakId, {
          onayli_mi: yeniOnayli,
          onay_durumu: yeniOnayli ? 'onaylandi' : 'beklemede'
        });
      } catch (err) {
        console.warn('Mutfak hijyen onay kaydetme hatası:', err);
      }
    }
  };

  const muafiyetDurumDegistir = async (mutfakId: string) => {
    let yeniMuafiyet = false;
    let yeniOnayli = false;

    setMutfakListesi(onceki => onceki.map(m => {
      if (m.id === mutfakId) {
        yeniMuafiyet = !m.esnaf_muafiyet_onayli_mi;
        yeniOnayli = yeniMuafiyet && Boolean(m.hijyen_onayli_mi);
        return { 
          ...m, 
          esnaf_muafiyet_onayli_mi: yeniMuafiyet, 
          onayli_mi: yeniOnayli, 
          onay_durumu: yeniOnayli ? 'onaylandi' : 'beklemede' 
        };
      }
      return m;
    }));

    if (seciliMutfakBelge?.id === mutfakId) {
      setSeciliMutfakBelge((onceki: any) => onceki ? { 
        ...onceki, 
        esnaf_muafiyet_onayli_mi: yeniMuafiyet, 
        onayli_mi: yeniOnayli, 
        onay_durumu: yeniOnayli ? 'onaylandi' : 'beklemede' 
      } : null);
    }

    if (canliFirebaseAktifMi()) {
      try {
        await belgeKaydet('mutfaklar', mutfakId, {
          esnaf_muafiyet_onayli_mi: yeniMuafiyet,
          onayli_mi: yeniOnayli,
          onay_durumu: yeniOnayli ? 'onaylandi' : 'beklemede'
        });
        await belgeKaydet('kullanicilar', mutfakId, {
          onayli_mi: yeniOnayli,
          onay_durumu: yeniOnayli ? 'onaylandi' : 'beklemede'
        });
      } catch (err) {
        console.warn('Mutfak muafiyet onay kaydetme hatası:', err);
      }
    }
  };

  const mutfakOnayla = async (mutfakId: string, onayVer: boolean) => {
    setMutfakListesi(onceki => onceki.map(m => {
      if (m.id === mutfakId) {
        return {
          ...m,
          onayli_mi: onayVer,
          onay_durumu: onayVer ? 'onaylandi' : 'reddedildi',
          hijyen_onayli_mi: onayVer ? true : m.hijyen_onayli_mi,
          esnaf_muafiyet_onayli_mi: onayVer ? true : m.esnaf_muafiyet_onayli_mi
        };
      }
      return m;
    }));

    if (seciliMutfakBelge?.id === mutfakId) {
      setSeciliMutfakBelge((onceki: any) => onceki ? {
        ...onceki,
        onayli_mi: onayVer,
        onay_durumu: onayVer ? 'onaylandi' : 'reddedildi',
        hijyen_onayli_mi: onayVer ? true : onceki.hijyen_onayli_mi,
        esnaf_muafiyet_onayli_mi: onayVer ? true : onceki.esnaf_muafiyet_onayli_mi
      } : null);
    }

    if (canliFirebaseAktifMi()) {
      try {
        await belgeKaydet('mutfaklar', mutfakId, {
          onayli_mi: onayVer,
          onay_durumu: onayVer ? 'onaylandi' : 'reddedildi',
          hijyen_onayli_mi: onayVer ? true : undefined,
          esnaf_muafiyet_onayli_mi: onayVer ? true : undefined
        });
        await belgeKaydet('kullanicilar', mutfakId, {
          onayli_mi: onayVer,
          onay_durumu: onayVer ? 'onaylandi' : 'reddedildi'
        });
      } catch (err) {
        console.warn('Mutfak onay güncelleme hatası:', err);
      }
    }
  };

  // Hakediş fonksiyonları
  const filtrelenmisTalepler = talepler.filter((talep) => {
    const baslik = talep.mutfak_adi || talep.kurye_adi || '';
    const metinUyumu =
      baslik.toLowerCase().includes(hakedisArama.toLowerCase()) ||
      (talep.hesap_sahibi || '').toLowerCase().includes(hakedisArama.toLowerCase()) ||
      talep.iban.toLowerCase().includes(hakedisArama.toLowerCase());

    const durumUyumu = hakedisDurumFiltresi === 'hepsi' || talep.durum === hakedisDurumFiltresi;
    return metinUyumu && durumUyumu;
  });

  const toplamBekleyen = talepler
    .filter((t) => t.durum === 'beklemede')
    .reduce((acc, t) => acc + t.tutar, 0);

  const toplamOdenen = talepler
    .filter((t) => t.durum === 'odendi')
    .reduce((acc, t) => acc + t.tutar, 0);

  const odeOnayla = async (talepId: string) => {
    await talepDurumGuncelle(talepId, 'odendi', dekontNotu.trim() || 'EFT/Havale işlemi Afyon Merkez Muhasebe tarafından tamamlandı.');
    setSeciliTalep(null);
    setDekontNotu('');
    setSayac((s) => s + 1);
  };

  const reddet = async (talepId: string) => {
    await talepDurumGuncelle(talepId, 'reddedildi', 'IBAN bilgisi hatalı veya mutfak hesap doğrulaması yapılamadı.');
    setSeciliTalep(null);
    setDekontNotu('');
    setSayac((s) => s + 1);
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

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* 🌟 ÜST BAŞLIK & ANA SEKME GEÇİŞLERİ */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-[#180A1F] border border-[#3E1646]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white">Mutfak Yönetimi</h2>
            <p className="text-xs text-purple-300">Ev mutfakları, ticari lokantalar, yasal belgeler, askıya alma ve hakediş ödemeleri tek merkezde.</p>
          </div>
        </div>

        {/* Sekme Butonları */}
        <div className="flex items-center bg-[#120614] p-1.5 rounded-xl border border-purple-900/60 text-xs font-bold gap-1 w-full md:w-auto">
          <button
            onClick={() => setAltSekme('ev_mutfaklari')}
            className={`px-3 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              altSekme === 'ev_mutfaklari' ? 'bg-[#7B258B] text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Ev Mutfakları ({mutfakListesi.length})</span>
          </button>
          <button
            onClick={() => setAltSekme('ticari_mutfarilar' as any)}
            className={`px-3 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              altSekme === ('ticari_mutfarilar' as any) ? 'bg-[#7B258B] text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Ticari Mutfaklar</span>
          </button>
          <button
            onClick={() => setAltSekme('hakedisler_odemeler')}
            className={`px-3 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              altSekme === 'hakedisler_odemeler' ? 'bg-amber-600 text-gray-950 font-black shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Hakediş & Ödemeler ({talepler.filter(t => t.durum === 'beklemede').length})</span>
          </button>
        </div>
      </div>

      {/* ================= 1. EV MUTFAKLARI & TİCARİ MUTFAKLAR SEKMESİ ================= */}
      {altSekme !== 'hakedisler_odemeler' && (
        <div className="space-y-4">
          
          {/* Arama & Ekleme Barı */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-[#180A1F] border border-[#3E1646]">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center bg-[#240C28] p-1 rounded-xl border border-[#3E1646] text-[11px] font-bold">
                <button
                  onClick={() => setFiltre('hepsi')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    filtre === 'hepsi' ? 'bg-[#7B258B] text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Tümü
                </button>
                <button
                  onClick={() => setFiltre('onayli')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    filtre === 'onayli' ? 'bg-emerald-800 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  ✓ Tam Belgeli
                </button>
                <button
                  onClick={() => setFiltre('belge_bekleyen')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    filtre === 'belge_bekleyen' ? 'bg-amber-600 text-gray-950 font-black' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  ⚠️ Belge Bekleyen
                </button>
                <button
                  onClick={() => setFiltre('askida')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    filtre === 'askida' ? 'bg-rose-700 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  🔒 Askıda
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-56">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={arama}
                  onChange={(e) => setArama(e.target.value)}
                  placeholder="Mutfak veya mahalle ara..."
                  className="w-full bg-[#120614] border border-purple-900/60 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
                />
              </div>
              <button
                type="button"
                onClick={() => setYeniMutfakModalAcik(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-[#130713] font-bold text-xs flex items-center gap-1.5 cursor-pointer hover:brightness-110 shadow-md shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni Mutfak Ekle</span>
              </button>
            </div>
          </div>

          {/* Mutfaklar Grid Listesi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtrelenmisMutfaklar.map((mutfak) => {
              const tamBelgeli = mutfak.hijyen_onayli_mi && mutfak.esnaf_muafiyet_onayli_mi;
              const askidaMi = (mutfak as any).askida_mi;

              return (
                <div 
                  key={mutfak.id}
                  className={`p-4 rounded-2xl bg-[#180A1F] border transition-all flex flex-col justify-between gap-3 ${
                    askidaMi
                      ? 'border-rose-900/80 bg-[#24090D]'
                      : tamBelgeli 
                      ? 'border-[#3E1646] hover:border-amber-500/40' 
                      : 'border-amber-500/50 bg-[#210926]'
                  }`}
                >
                  <div className="flex gap-3.5 items-start justify-between">
                    <div className="flex items-start gap-3">
                      <img 
                        src={mutfak.gorsel_url} 
                        alt={mutfak.ad} 
                        className="w-14 h-14 rounded-xl object-cover border border-purple-800/50 shrink-0" 
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-xs sm:text-sm">{mutfak.ad}</h4>
                          <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 text-[10px] font-bold border border-amber-500/20">
                            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                            <span>{mutfak.puan}</span>
                          </div>
                        </div>
                        <p className="text-[11px] text-purple-300/80 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-amber-400" />
                          <span>{mutfak.adres}</span>
                        </p>
                        <div className="text-[10px] text-gray-400 mt-1">
                          Min: {mutfak.min_siparis_tutari} ₺ • Komisyon: %10
                        </div>
                      </div>
                    </div>

                    {/* Sağ Üst: Belge İncele, Askıya Al, Sil */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSeciliMutfakBelge(mutfak)}
                          className="px-2 py-1 rounded-lg bg-purple-950/80 hover:bg-purple-800 border border-purple-700 text-purple-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3 text-amber-400" />
                          <span>Belgeler</span>
                        </button>
                        <button
                          onClick={() => askiyaAlDegistir(mutfak.id)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                            askidaMi
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900'
                              : 'bg-amber-950 text-amber-300 border border-amber-800 hover:bg-amber-900'
                          }`}
                          title="Mutfağı Askıya Al veya Aktif Et"
                        >
                          {askidaMi ? 'Aktif Et' : 'Askıya Al'}
                        </button>
                        <button
                          onClick={() => mutfakSil(mutfak.id)}
                          className="p-1.5 rounded-lg bg-rose-950/60 border border-rose-900 text-rose-300 hover:bg-rose-900 cursor-pointer"
                          title="Mutfağı Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black border uppercase tracking-wider ${
                        askidaMi
                          ? 'bg-rose-950 text-rose-300 border-rose-700'
                          : mutfak.onayli_mi === true || mutfak.onay_durumu === 'onaylandi'
                          ? 'bg-emerald-950/70 text-emerald-300 border-emerald-700' 
                          : 'bg-amber-950/80 text-amber-300 border-amber-600'
                      }`}>
                        {askidaMi ? '🔒 Askıya Alındı' : mutfak.onayli_mi === true || mutfak.onay_durumu === 'onaylandi' ? '✓ Yasal Onaylı' : '⏳ Onay Bekliyor'}
                      </span>
                    </div>
                  </div>

                  {/* 👑 PATRON ONAY / RED EYLEM BARı */}
                  {(mutfak.onay_durumu === 'beklemede' || mutfak.onayli_mi === false) && !askidaMi && (
                    <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs">
                      <span className="text-[11px] font-bold text-amber-300">Mutfak Başvurusu:</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => mutfakOnayla(mutfak.id, true)}
                          className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Mutfağı Onayla</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => mutfakOnayla(mutfak.id, false)}
                          className="px-2.5 py-1 rounded-lg bg-rose-900/80 hover:bg-rose-800 text-rose-200 font-bold text-[11px] flex items-center gap-1 cursor-pointer active:scale-95"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reddet</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Alt Belge & Durum Barı */}
                  <div className="pt-2 border-t border-purple-950/60 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-400 text-[10px]">Hijyen:</span>
                      <button
                        onClick={() => hijyenDurumDegistir(mutfak.id)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                          mutfak.hijyen_onayli_mi
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}
                      >
                        {mutfak.hijyen_onayli_mi ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        <span>{mutfak.hijyen_onayli_mi ? 'MEB Onaylı' : 'Eksik'}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-400 text-[10px]">Vergi Muafiyet:</span>
                      <button
                        onClick={() => muafiyetDurumDegistir(mutfak.id)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                          mutfak.esnaf_muafiyet_onayli_mi
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                            : 'bg-amber-950 text-amber-300 border border-amber-700'
                        }`}
                      >
                        {mutfak.esnaf_muafiyet_onayli_mi ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        <span>{mutfak.esnaf_muafiyet_onayli_mi ? 'GVK 9/10 Onaylı' : 'Bekliyor'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ================= 2. HAKEDİŞLER & ÖDEMELER SEKMESİ ================= */}
      {altSekme === 'hakedisler_odemeler' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Finansal Özet Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#180A1F] border border-amber-500/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-200">Onay Bekleyen Çekimler</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-400 mt-2">
                {toplamBekleyen.toLocaleString('tr-TR')} ₺
              </div>
              <p className="text-[10px] text-gray-400 mt-1">EFT/Havale bekleyen aşçı & kurye hakedişleri</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#180A1F] border border-emerald-500/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-200">Tamamlanan Ödemeler</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400 mt-2">
                {toplamOdenen.toLocaleString('tr-TR')} ₺
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Hesaplara gönderilen toplam tutar</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#180A1F] border border-[#3E1646]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-300">Toplam Çekim Talebi</span>
                <Wallet className="w-4 h-4 text-purple-300" />
              </div>
              <div className="text-2xl font-black text-white mt-2">
                {talepler.length} Adet
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Sistemdeki tüm hakediş işlemleri</p>
            </div>
          </div>

          {/* Arama & Durum Filtreleri */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-[#180A1F] border border-[#3E1646]">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={hakedisArama}
                onChange={(e) => setHakedisArama(e.target.value)}
                placeholder="Mutfak, aşçı adı veya IBAN ara..."
                className="w-full bg-[#120614] border border-purple-900 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
              {(['hepsi', 'beklemede', 'odendi', 'reddedildi'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setHakedisDurumFiltresi(d)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer capitalize ${
                    hakedisDurumFiltresi === d
                      ? 'bg-amber-500 text-purple-950 shadow-md'
                      : 'bg-[#120614] text-gray-400 hover:text-white border border-purple-900/60'
                  }`}
                >
                  {d === 'hepsi' ? 'Tümü' : d === 'beklemede' ? 'Bekleyenler' : d === 'odendi' ? 'Ödenenler' : 'Reddedilenler'}
                </button>
              ))}
            </div>
          </div>

          {/* Talepler Listesi */}
          <div className="space-y-3">
            {filtrelenmisTalepler.map((talep) => (
              <div
                key={talep.id}
                className="p-4 rounded-2xl bg-[#180A1F] border border-[#3E1646] hover:border-purple-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-amber-400 text-base">
                      {talep.tutar.toLocaleString('tr-TR')} ₺
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      talep.durum === 'beklemede'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : talep.durum === 'odendi'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}>
                      {talep.durum === 'beklemede' ? 'Ödeme Bekliyor' : talep.durum === 'odendi' ? 'Ödendi ✓' : 'Reddedildi ✕'}
                    </span>
                  </div>

                  <div className="font-bold text-white text-sm">
                    {talep.mutfak_adi || talep.kurye_adi}
                  </div>

                  <div className="text-gray-300 flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-purple-400" />
                    <span>{talep.banka_adi}</span> • <span className="font-mono text-amber-300">{talep.iban}</span> ({talep.hesap_sahibi})
                  </div>

                  <div className="text-[11px] text-gray-500">
                    Talep Tarihi: {talep.talep_tarihi} {talep.dekont_notu && `• Not: ${talep.dekont_notu}`}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {talep.durum === 'beklemede' && (
                    <>
                      <button
                        onClick={() => setSeciliTalep(talep)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-[#130713] font-extrabold text-xs cursor-pointer hover:brightness-110 shadow-md"
                      >
                        Ödemeyi Onayla & Dekont Kes
                      </button>
                      <button
                        onClick={() => reddet(talep.id)}
                        className="px-3 py-2 rounded-xl bg-rose-950/60 border border-rose-900 text-rose-300 hover:bg-rose-900 cursor-pointer text-xs font-semibold"
                      >
                        Reddet
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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

      {/* 🌟 HAKEDİŞ ÖDEME ONAY MODALI */}
      {seciliTalep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-[#180A1F] border border-amber-500/50 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl text-xs">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-amber-400" />
              EFT / Havale Ödeme Onayı
            </h3>
            <div className="bg-[#120614] p-3 rounded-xl border border-purple-900 space-y-1">
              <div>Alıcı: <strong className="text-white">{seciliTalep.mutfak_adi || seciliTalep.kurye_adi}</strong></div>
              <div>Banka: <strong className="text-white">{seciliTalep.banka_adi}</strong></div>
              <div>IBAN: <strong className="font-mono text-amber-300">{seciliTalep.iban}</strong></div>
              <div>Tutar: <strong className="text-emerald-400 text-sm font-black">{seciliTalep.tutar.toLocaleString('tr-TR')} ₺</strong></div>
            </div>

            <div>
              <label className="text-gray-400 block mb-1">Muhasebe Dekont Notu</label>
              <input
                type="text"
                value={dekontNotu}
                onChange={(e) => setDekontNotu(e.target.value)}
                placeholder="Örn: EFT Ref No: TR-984321, İşlem Tamam"
                className="w-full bg-[#120614] border border-purple-900 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-purple-950">
              <button
                type="button"
                onClick={() => setSeciliTalep(null)}
                className="px-4 py-2 rounded-xl bg-purple-950 text-gray-300 font-bold cursor-pointer"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={() => odeOnayla(seciliTalep.id)}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-gray-950 font-extrabold cursor-pointer hover:brightness-110"
              >
                Ödemeyi Onayla & Dekont Gönder
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
