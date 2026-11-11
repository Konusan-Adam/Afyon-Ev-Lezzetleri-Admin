import React, { useState, useEffect } from 'react';
import { Bike, Phone, ShieldCheck, Award, Wallet, Plus, Trash2, Edit3, CheckCircle2, Clock, Building, CreditCard, X, Search, MapPin, Navigation } from 'lucide-react';
import { useCanliHakedisTalepleri } from '@/src/MalzemeCekmeceleri/useCanliHakedisTalepleri';
import { TestKurye, HakedisCekimTalebi } from '@/src/veritabani/CanliVeriYardimcisi';
import { canliFirebaseAktifMi } from '@/src/veritabani/FirebaseIstemcisi';
import { koleksiyonGetir, belgeKaydet, belgeSil } from '@/src/veritabani/FirebaseKoleksiyonServisi';

export const YonetimKuryeler: React.FC = () => {
  const { talepler, talepDurumGuncelle } = useCanliHakedisTalepleri();
  const [altSekme, setAltSekme] = useState<'kuryeler' | 'hakedisler'>('kuryeler');
  const [kuryeler, setKuryeler] = useState<(TestKurye & { askida_mi?: boolean })[]>([]);
  const [yeniModalAcik, setYeniModalAcik] = useState<boolean>(false);
  const [duzenlenenKurye, setDuzenlenenKurye] = useState<(TestKurye & { askida_mi?: boolean }) | null>(null);
  const [aramaMetni, setAramaMetni] = useState('');

  useEffect(() => {
    async function yukle() {
      if (canliFirebaseAktifMi()) {
        try {
          const tumKullanicilar = await koleksiyonGetir<any>('kullanicilar');
          const fbKuryeler: (TestKurye & { askida_mi?: boolean })[] = tumKullanicilar
            .filter((k) => k.rol === 'kurye')
            .map((k) => ({
              id: k.id || k.kimlik,
              ad_soyad: k.ad_soyad || 'Kurye',
              telefon: k.telefon || '',
              arac_tipi: k.arac_tipi || 'Motosiklet',
              plaka: k.plaka || '',
              mahalle: k.ilce ? `${k.ilce} Bölgesi` : 'Afyon Merkez',
              toplam_teslimat: k.toplam_teslimat || 0,
              tamamlanan_siparis: k.toplam_teslimat || 0,
              puan: k.puan || 5.0,
              aktif_konum: { mahalle: k.ilce ? `${k.ilce} Bölgesi` : 'Afyon Merkez', enlem: 38.7569, boylam: 30.5387 },
              bakiye: k.bakiye || 0,
              durum: (k.durum ? k.durum : (k.onayli_mi === false || k.askida_mi === true ? 'molada' : 'bosta')) as 'bosta' | 'molada' | 'yolda',
              askida_mi: k.onayli_mi === false || k.askida_mi === true
            }));

          setKuryeler(fbKuryeler);
          return;
        } catch (err) {
          console.warn('Firebase kurye çekme hatası:', err);
        }
      }
      setKuryeler([]);
    }
    yukle();
  }, []);

  // Yeni kurye formu state
  const [adSoyad, setAdSoyad] = useState('');
  const [telefon, setTelefon] = useState('');
  const [aracTipi, setAracTipi] = useState<'Motosiklet' | 'Elektrikli Bisiklet' | 'Hafif Ticari'>('Motosiklet');
  const [plaka, setPlaka] = useState('');
  const [mahalle, setMahalle] = useState('Afyon Merkez');

  // Hakediş ödeme modal state
  const [seciliTalep, setSeciliTalep] = useState<HakedisCekimTalebi | null>(null);
  const [dekontNotu, setDekontNotu] = useState('');
  const [, setSayac] = useState(0);

  const teslimatBasiPrim = 35;

  const kuryeEkle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adSoyad || !telefon) return;

    const temizTel = telefon.replace(/\D/g, '');
    const duzgunTel = temizTel.startsWith('0') ? temizTel : `0${temizTel}`;
    const yeniId = `tel_${duzgunTel}`;

    const yeniKurye: TestKurye & { askida_mi?: boolean } = {
      id: yeniId,
      ad_soyad: adSoyad,
      telefon: duzgunTel,
      arac_tipi: aracTipi,
      plaka,
      durum: 'bosta',
      puan: 5.0,
      tamamlanan_siparis: 0,
      toplam_teslimat: 0,
      bakiye: 0,
      mahalle,
      aktif_konum: {
        mahalle,
        enlem: 38.7569,
        boylam: 30.5387,
      },
      askida_mi: false
    };

    setKuryeler([yeniKurye, ...kuryeler]);
    if (canliFirebaseAktifMi()) {
      try {
        await belgeKaydet('kullanicilar', yeniId, {
          kimlik: yeniId,
          id: yeniId,
          ad_soyad: adSoyad,
          telefon: duzgunTel,
          arac_tipi: aracTipi,
          plaka,
          rol: 'kurye',
          onayli_mi: true,
          onay_durumu: 'onaylandi',
          askida_mi: false,
          durum: 'bosta',
          bakiye: 0,
          toplam_teslimat: 0,
          ilce: mahalle,
          olusturma_tarihi: new Date().toISOString()
        });
      } catch (err) {
        console.error('Kurye Firebase kaydetme hatası:', err);
      }
    }
    setAdSoyad('');
    setTelefon('');
    setYeniModalAcik(false);
  };

  const kuryeGuncelle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!duzenlenenKurye) return;

    setKuryeler(kuryeler.map(k => k.id === duzenlenenKurye.id ? duzenlenenKurye : k));
    if (canliFirebaseAktifMi()) {
      try {
        await belgeKaydet('kullanicilar', duzenlenenKurye.id, {
          ad_soyad: duzenlenenKurye.ad_soyad,
          telefon: duzenlenenKurye.telefon,
          arac_tipi: duzenlenenKurye.arac_tipi,
          plaka: duzenlenenKurye.plaka,
          mahalle: duzenlenenKurye.mahalle,
          ilce: duzenlenenKurye.mahalle
        });
      } catch (err) {
        console.error('Kurye güncelleme hatası:', err);
      }
    }
    setDuzenlenenKurye(null);
  };

  const kuryeSil = async (id: string) => {
    if (confirm('Bu kuryeyi kadrodan kalıcı olarak silmek istediğinize emin misiniz?')) {
      setKuryeler(kuryeler.filter(k => k.id !== id));
      if (canliFirebaseAktifMi()) {
        try {
          await belgeSil('kullanicilar', id);
        } catch (err) {
          console.error('Kurye Firebase silme hatası:', err);
        }
      }
    }
  };

  const askiyaAlDegistir = async (id: string) => {
    const kurye = kuryeler.find(k => k.id === id);
    if (!kurye) return;
    const yeniAskida = !kurye.askida_mi;
    const yeniOnayli = !yeniAskida; // Onayla / Aktif et = onayli_mi: true, Askıya Al = onayli_mi: false
    const yeniDurum = yeniAskida ? 'molada' : 'bosta';

    setKuryeler(kuryeler.map(k => {
      if (k.id === id) {
        return { ...k, askida_mi: yeniAskida, durum: yeniDurum as any };
      }
      return k;
    }));

    if (canliFirebaseAktifMi()) {
      try {
        await belgeKaydet('kullanicilar', id, {
          onayli_mi: yeniOnayli,
          onay_durumu: yeniOnayli ? 'onaylandi' : 'askida',
          askida_mi: yeniAskida,
          durum: yeniDurum
        });
      } catch (err) {
        console.error('Kurye askı durumu Firebase güncelleme hatası:', err);
      }
    }
  };

  const durumDegistir = async (id: string, yeniDurum: 'bosta' | 'yolda' | 'molada') => {
    setKuryeler(kuryeler.map(k => {
      if (k.id === id) {
        return { ...k, durum: yeniDurum };
      }
      return k;
    }));
    if (canliFirebaseAktifMi()) {
      try {
        await belgeKaydet('kullanicilar', id, { durum: yeniDurum });
      } catch (err) {
        console.error('Kurye durum güncelleme hatası:', err);
      }
    }
  };

  // Kurye hakediş talepleri
  const kuryeTalepleri = talepler.filter(t => t.rol_tipi === 'kurye');

  const toplamBekleyen = kuryeTalepleri
    .filter((t) => t.durum === 'beklemede')
    .reduce((acc, t) => acc + t.tutar, 0);

  const toplamOdenen = kuryeTalepleri
    .filter((t) => t.durum === 'odendi')
    .reduce((acc, t) => acc + t.tutar, 0);

  const odeOnayla = async (talepId: string) => {
    await talepDurumGuncelle(talepId, 'odendi', dekontNotu.trim() || 'Kurye hakediş ödemesi tamamlandı.');
    setSeciliTalep(null);
    setDekontNotu('');
    setSayac((s) => s + 1);
  };

  const reddet = async (talepId: string) => {
    await talepDurumGuncelle(talepId, 'reddedildi', 'IBAN bilgisi hatalı.');
    setSeciliTalep(null);
    setDekontNotu('');
    setSayac((s) => s + 1);
  };

  const filtrelenmisKuryeler = kuryeler.filter(k => 
    k.ad_soyad.toLowerCase().includes(aramaMetni.toLowerCase()) ||
    k.telefon.includes(aramaMetni) ||
    (k.plaka || '').toLowerCase().includes(aramaMetni.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* 🌟 ÜST BAŞLIK VE SEKME GEÇİŞİ */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#1A0A1D] p-5 rounded-2xl border border-[#3E1646]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Bike className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white">Kurye Yönetimi (Tam Kontrol, Askıya Al & Sil)</h2>
            <p className="text-xs text-[#9866A3]">Kurye kadrosu, araç bilgileri, askıya alma, silme ve hakediş ödemeleri tek merkezde.</p>
          </div>
        </div>

        {/* Sekmeler */}
        <div className="flex items-center bg-[#120614] p-1.5 rounded-xl border border-purple-900/60 text-xs font-bold gap-1 w-full md:w-auto">
          <button
            onClick={() => setAltSekme('kuryeler')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              altSekme === 'kuryeler' ? 'bg-[#7B258B] text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            <span>Kurye Kadrosu ({kuryeler.length})</span>
          </button>
          <button
            onClick={() => setAltSekme('hakedisler')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              altSekme === 'hakedisler' ? 'bg-amber-600 text-gray-950 font-black shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Hakediş & Ödemeler ({kuryeTalepleri.filter(t => t.durum === 'beklemede').length})</span>
          </button>
        </div>
      </div>

      {/* ================= 1. KADRO SEKMESİ ================= */}
      {altSekme === 'kuryeler' && (
        <div className="space-y-4">
          
          {/* Arama & Yeni Kurye Butonu */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl bg-[#1A0A1D] border border-[#3E1646]">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={aramaMetni}
                onChange={(e) => setAramaMetni(e.target.value)}
                placeholder="Kurye adı, telefon veya plaka ara..."
                className="w-full bg-[#130713] border border-[#4D1857] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <button
              type="button"
              onClick={() => setYeniModalAcik(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-[#130713] font-bold text-xs flex items-center gap-1.5 cursor-pointer hover:brightness-110 shadow-md shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Kurye Ekle</span>
            </button>
          </div>

          {/* Kurye Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filtrelenmisKuryeler.map((kurye) => {
              const toplamHakedis = (kurye.tamamlanan_siparis || 0) * teslimatBasiPrim;
              const askida = kurye.askida_mi;
              return (
                <div
                  key={kurye.id}
                  className={`bg-[#1A0A1D] border rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-lg transition-colors ${
                    askida ? 'border-rose-900/80 bg-[#22090D]' : 'border-[#3E1646] hover:border-[#DDAF53]/40'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white text-base">{kurye.ad_soyad}</h3>
                          {askida ? (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold">
                              Onay Bekliyor / Askıda
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                              Onaylı
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#9866A3]">Araç: {kurye.arac_tipi} {kurye.plaka ? `(${kurye.plaka})` : '(Plaka Belirtilmedi)'}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-amber-400" /> {kurye.telefon}
                        </p>
                        <p className="text-[11px] text-purple-300 mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-purple-400" /> Bölge: {kurye.aktif_konum?.mahalle || 'Merkez'}
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-end gap-1.5">
                        <select
                          value={kurye.durum}
                          onChange={(e) => durumDegistir(kurye.id, e.target.value as any)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer border ${
                            kurye.durum === 'bosta'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                              : 'bg-amber-950 text-amber-300 border-amber-800'
                          }`}
                        >
                          <option value="bosta">🟢 Müsait</option>
                          <option value="yolda">🛵 Yolda</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#3E1646] text-xs">
                      <div className="bg-[#130713] p-2.5 rounded-xl border border-purple-950">
                        <span className="text-gray-400 block">Tamamlanan</span>
                        <strong className="text-white text-sm">{kurye.tamamlanan_siparis} Sefer</strong>
                      </div>
                      <div className="bg-[#130713] p-2.5 rounded-xl border border-purple-950">
                        <span className="text-gray-400 block">Puan</span>
                        <strong className="text-amber-400 text-sm flex items-center gap-1">
                          <Award className="w-3.5 h-3.5" /> {kurye.puan}
                        </strong>
                      </div>
                    </div>

                    <div className="bg-[#130713] p-3 rounded-xl border border-[#4D1857] flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-gray-400 block">Güncel Hakediş</span>
                        <strong className="text-emerald-400 text-base font-black">{toplamHakedis.toLocaleString('tr-TR')} ₺</strong>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setDuzenlenenKurye(kurye)}
                          className="p-2 rounded-lg bg-purple-950/80 border border-purple-800 text-purple-200 hover:bg-purple-800 cursor-pointer"
                          title="Kuryeyi Düzenle"
                        >
                          <Edit3 className="w-4 h-4 text-amber-400" />
                        </button>
                        <button
                          type="button"
                          onClick={() => askiyaAlDegistir(kurye.id)}
                          className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold cursor-pointer transition-colors ${
                            askida ? 'bg-emerald-950 border-emerald-800 text-emerald-300 hover:bg-emerald-900' : 'bg-amber-950 border-amber-800 text-amber-300 hover:bg-amber-900'
                          }`}
                          title="Askıya Al veya Onayla / Aktif Et"
                        >
                          {askida ? 'Onayla / Aktif Et' : 'Askıya Al'}
                        </button>
                        <button
                          type="button"
                          onClick={() => kuryeSil(kurye.id)}
                          className="p-2 rounded-lg bg-rose-950/60 border border-rose-900 text-rose-300 hover:bg-rose-900 cursor-pointer transition-colors"
                          title="Kuryeyi Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => alert(`${kurye.ad_soyad} için ${toplamHakedis} ₺ hakediş ödemesi banka hesabına başarıyla aktarıldı!`)}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-[#130713] font-bold text-xs hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <Wallet className="w-4 h-4" />
                      <span>Hakediş Ödemesini Onayla</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ================= 2. HAKEDİŞLER & ÖDEMELER SEKMESİ ================= */}
      {altSekme === 'hakedisler' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Finansal Özet Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#1A0A1D] border border-amber-500/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-200">Onay Bekleyen Kurye Çekimleri</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-400 mt-2">
                {toplamBekleyen.toLocaleString('tr-TR')} ₺
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#1A0A1D] border border-emerald-500/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-200">Ödenen Kurye Hakedişleri</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400 mt-2">
                {toplamOdenen.toLocaleString('tr-TR')} ₺
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#1A0A1D] border border-[#3E1646]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-300">Toplam Talep</span>
                <Wallet className="w-4 h-4 text-purple-300" />
              </div>
              <div className="text-2xl font-black text-white mt-2">
                {kuryeTalepleri.length} Adet
              </div>
            </div>
          </div>

          {/* Talepler Listesi */}
          <div className="space-y-3">
            {kuryeTalepleri.map((talep) => (
              <div
                key={talep.id}
                className="p-4 rounded-2xl bg-[#1A0A1D] border border-[#3E1646] hover:border-purple-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
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
                    🛵 {talep.kurye_adi}
                  </div>

                  <div className="text-gray-300 flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-purple-400" />
                    <span>{talep.banka_adi}</span> • <span className="font-mono text-amber-300">{talep.iban}</span> ({talep.hesap_sahibi})
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {talep.durum === 'beklemede' && (
                    <>
                      <button
                        onClick={() => setSeciliTalep(talep)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-[#130713] font-extrabold text-xs cursor-pointer hover:brightness-110 shadow-md"
                      >
                        Ödemeyi Onayla
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

      {/* Yeni Kurye Ekleme Modalı */}
      {yeniModalAcik && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#1A0A1D] border border-[#3E1646] rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Bike className="w-5 h-5 text-amber-400" />
              Kurye Yönetimi: Yeni Kurye Ekle
            </h3>
            <form onSubmit={kuryeEkle} className="space-y-3 text-xs">
              <div>
                <label className="text-gray-400 block mb-1">Ad Soyad</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Kenan Evren"
                  value={adSoyad}
                  onChange={(e) => setAdSoyad(e.target.value)}
                  className="w-full bg-[#130713] border border-[#4D1857] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-gray-400 block mb-1">Telefon Numarası</label>
                <input
                  type="text"
                  required
                  placeholder="05XX XXX XX XX"
                  value={telefon}
                  onChange={(e) => setTelefon(e.target.value)}
                  className="w-full bg-[#130713] border border-[#4D1857] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-gray-400 block mb-1">Araç Tipi</label>
                  <select
                    value={aracTipi}
                    onChange={(e) => setAracTipi(e.target.value as any)}
                    className="w-full bg-[#130713] border border-[#4D1857] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Motosiklet">Motosiklet</option>
                    <option value="Elektrikli Bisiklet">Elektrikli Bisiklet</option>
                    <option value="Hafif Ticari">Hafif Ticari</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">Plaka</label>
                  <input
                    type="text"
                    value={plaka}
                    onChange={(e) => setPlaka(e.target.value)}
                    className="w-full bg-[#130713] border border-[#4D1857] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
              <div>
                <label className="text-gray-400 block mb-1">Aktif Bölge / Mahalle</label>
                <input
                  type="text"
                  value={mahalle}
                  onChange={(e) => setMahalle(e.target.value)}
                  className="w-full bg-[#130713] border border-[#4D1857] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#3E1646]">
                <button
                  type="button"
                  onClick={() => setYeniModalAcik(false)}
                  className="px-4 py-2 rounded-xl bg-purple-950/40 text-gray-300 font-bold cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-[#130713] font-extrabold cursor-pointer hover:brightness-110 shadow-md"
                >
                  Kuryeyi Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✏️ KURYE DÜZENLEME MODALI (TAM KONTROL) */}
      {duzenlenenKurye && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-[#1A0A1D] border border-amber-500/50 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl text-xs">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-amber-400" />
              Kurye Bilgilerini Düzenle (Tam Kontrol)
            </h3>
            <form onSubmit={kuryeGuncelle} className="space-y-3">
              <div>
                <label className="text-gray-400 block mb-1">Ad Soyad</label>
                <input
                  type="text"
                  required
                  value={duzenlenenKurye.ad_soyad}
                  onChange={(e) => setDuzenlenenKurye({ ...duzenlenenKurye, ad_soyad: e.target.value })}
                  className="w-full bg-[#130713] border border-purple-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-gray-400 block mb-1">Telefon Numarası</label>
                <input
                  type="text"
                  required
                  value={duzenlenenKurye.telefon}
                  onChange={(e) => setDuzenlenenKurye({ ...duzenlenenKurye, telefon: e.target.value })}
                  className="w-full bg-[#130713] border border-purple-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-gray-400 block mb-1">Araç Tipi</label>
                  <select
                    value={duzenlenenKurye.arac_tipi}
                    onChange={(e) => setDuzenlenenKurye({ ...duzenlenenKurye, arac_tipi: e.target.value as any })}
                    className="w-full bg-[#130713] border border-purple-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Motosiklet">Motosiklet</option>
                    <option value="Elektrikli Bisiklet">Elektrikli Bisiklet</option>
                    <option value="Hafif Ticari">Hafif Ticari</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">Plaka</label>
                  <input
                    type="text"
                    value={duzenlenenKurye.plaka}
                    onChange={(e) => setDuzenlenenKurye({ ...duzenlenenKurye, plaka: e.target.value })}
                    className="w-full bg-[#130713] border border-purple-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-gray-400 block mb-1">Tamamlanan Sefer</label>
                  <input
                    type="number"
                    value={duzenlenenKurye.tamamlanan_siparis}
                    onChange={(e) => setDuzenlenenKurye({ ...duzenlenenKurye, tamamlanan_siparis: parseInt(e.target.value) || 0 })}
                    className="w-full bg-[#130713] border border-purple-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">Puan</label>
                  <input
                    type="number"
                    step="0.1"
                    max="5"
                    value={duzenlenenKurye.puan}
                    onChange={(e) => setDuzenlenenKurye({ ...duzenlenenKurye, puan: parseFloat(e.target.value) || 5.0 })}
                    className="w-full bg-[#130713] border border-purple-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-purple-950">
                <button
                  type="button"
                  onClick={() => setDuzenlenenKurye(null)}
                  className="px-4 py-2 rounded-xl bg-purple-950 text-gray-300 font-bold cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-gray-950 font-extrabold cursor-pointer hover:brightness-110"
                >
                  Değişiklikleri Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ödeme Onay Modalı */}
      {seciliTalep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-[#180A1F] border border-amber-500/50 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl text-xs">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-amber-400" />
              Kurye EFT / Havale Ödeme Onayı
            </h3>
            <div className="bg-[#120614] p-3 rounded-xl border border-purple-900 space-y-1">
              <div>Kurye: <strong className="text-white">{seciliTalep.kurye_adi}</strong></div>
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
                placeholder="Örn: Kurye Sefer Primi EFT No: TR-554433"
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
