import React, { useState } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Download, 
  Search, 
  CheckCircle2, 
  Save, 
  RefreshCw, 
  Layers, 
  Check,
  Plus,
  Trash2,
  AlertTriangle,
  FilePlus2,
  X
} from 'lucide-react';
import { 
  hukukiSozlesmeleriGetir, 
  hukukiSozlesmeleriCanliSenkronizeEt,
  sozlesmeGuncelle, 
  yeniSozlesmeEkle,
  sozlesmeSil,
  hukukiLoglariGetir, 
  hukukiLoglariCanliGetir,
  VARSAYILAN_SOZLESMELER 
} from '@/src/MalzemeCekmeceleri/HukukVeSozlesmeler/hukukDeposu';
import { HukukiSozlesme, SozlesmeTuru, HukukiOnayLogu, SozlesmeKonumu } from '@/src/MalzemeCekmeceleri/HukukVeSozlesmeler/tipler';

export const SuperAdminHukukPaneli: React.FC = () => {
  const [sekme, setSekme] = useState<'sozlesmeler' | 'loglar'>('sozlesmeler');
  const [sozlesmeler, setSozlesmeler] = useState(hukukiSozlesmeleriGetir());
  
  const sozlesmeAnahtarlari = Object.keys(sozlesmeler);
  const ilkAnahtar = sozlesmeAnahtarlari.includes('mutfak_kayit_sozlesmesi') 
    ? 'mutfak_kayit_sozlesmesi' 
    : (sozlesmeAnahtarlari[0] || 'mesafeli_satis');
  const [seciliTur, setSeciliTur] = useState<string>(ilkAnahtar);
  const [duzenlenenMetin, setDuzenlenenMetin] = useState(sozlesmeler[ilkAnahtar]?.icerik || '');
  const [duzenlenenVersiyon, setDuzenlenenVersiyon] = useState(sozlesmeler[ilkAnahtar]?.versiyon || '1.0.0');
  const [kaydedildiMesaji, setKaydedildiMesaji] = useState(false);
  const [silmeOnayTur, setSilmeOnayTur] = useState<string | null>(null);

  // Canlı Firebase'den güncel sözleşmeleri ve logları getir
  React.useEffect(() => {
    hukukiSozlesmeleriCanliSenkronizeEt().then((guncel) => {
      setSozlesmeler(guncel);
      if (guncel[seciliTur]) {
        setDuzenlenenMetin(guncel[seciliTur].icerik);
        setDuzenlenenVersiyon(guncel[seciliTur].versiyon || '1.0.0');
      }
    });
    hukukiLoglariCanliGetir().then((guncelLoglar) => {
      setLoglar(guncelLoglar);
    });
  }, []);

  // Yeni Sözleşme Ekleme Modalı
  const [yeniModalAcik, setYeniModalAcik] = useState(false);
  const [yeniBaslik, setYeniBaslik] = useState('');
  const [yeniKisaBaslik, setYeniKisaBaslik] = useState('');
  const [yeniKod, setYeniKod] = useState('');
  const [yeniVersiyon, setYeniVersiyon] = useState('1.0.0');
  const [yeniZorunlu, setYeniZorunlu] = useState(true);
  const [yeniKonum, setYeniKonum] = useState<SozlesmeKonumu>('genel');
  const [yeniIcerik, setYeniIcerik] = useState('');
  const [modalHata, setModalHata] = useState('');

  // Log Arama ve Filtreleme
  const [loglar, setLoglar] = useState<HukukiOnayLogu[]>(hukukiLoglariGetir());
  const [aramaMetni, setAramaMetni] = useState('');
  const [filtreTuru, setFiltreTuru] = useState<string>('hepsi');

  const sozlesmeDegistir = (tur: string) => {
    setSeciliTur(tur);
    setDuzenlenenMetin(sozlesmeler[tur]?.icerik || '');
    setDuzenlenenVersiyon(sozlesmeler[tur]?.versiyon || '1.0.0');
    setKaydedildiMesaji(false);
  };

  const sozlesmeyiKaydet = () => {
    if (!sozlesmeler[seciliTur]) return;
    const guncel: HukukiSozlesme = {
      ...sozlesmeler[seciliTur],
      versiyon: duzenlenenVersiyon.trim() || sozlesmeler[seciliTur].versiyon || '1.0.0',
      icerik: duzenlenenMetin
    };
    sozlesmeGuncelle(guncel);
    setSozlesmeler(hukukiSozlesmeleriGetir());
    setKaydedildiMesaji(true);
    setTimeout(() => setKaydedildiMesaji(false), 3000);
  };

  const varsayilanaSifirla = () => {
    if (VARSAYILAN_SOZLESMELER[seciliTur]) {
      const varsayilan = VARSAYILAN_SOZLESMELER[seciliTur];
      sozlesmeGuncelle(varsayilan);
      setSozlesmeler(hukukiSozlesmeleriGetir());
      setDuzenlenenMetin(varsayilan.icerik);
      setDuzenlenenVersiyon(varsayilan.versiyon || '1.0.0');
      setKaydedildiMesaji(true);
      setTimeout(() => setKaydedildiMesaji(false), 3000);
    }
  };

  const sozlesmeyiKaldir = (tur: string) => {
    const hedef = sozlesmeler[tur];
    if (!hedef) return;
    sozlesmeSil(tur);
    setSilmeOnayTur(null);
    const guncel = hukukiSozlesmeleriGetir();
    setSozlesmeler(guncel);
    const kalanlar = Object.keys(guncel);
    if (kalanlar.length > 0) {
      setSeciliTur(kalanlar[0]);
      setDuzenlenenMetin(guncel[kalanlar[0]]?.icerik || '');
    }
  };

  const yeniSozlesmeKaydet = (e: React.FormEvent) => {
    e.preventDefault();
    setModalHata('');

    if (!yeniBaslik.trim() || !yeniIcerik.trim()) {
      setModalHata('Lütfen Sözleşme Başlığı ve Sözleşme İçeriği alanlarını doldurunuz.');
      return;
    }

    const kod = (yeniKod.trim() || yeniBaslik.trim().toLowerCase().replace(/[^a-z0-9]/g, '_')) + '_' + Date.now().toString().slice(-4);

    const basarili = yeniSozlesmeEkle({
      tur: kod,
      baslik: yeniBaslik.trim(),
      kisaBaslik: yeniKisaBaslik.trim() || yeniBaslik.trim(),
      versiyon: yeniVersiyon.trim() || '1.0.0',
      zorunluMu: yeniZorunlu,
      konum: yeniKonum,
      icerik: yeniIcerik.trim()
    });

    if (basarili) {
      const guncel = hukukiSozlesmeleriGetir();
      setSozlesmeler(guncel);
      setSeciliTur(kod);
      setDuzenlenenMetin(yeniIcerik.trim());
      setYeniModalAcik(false);
      // Formu sıfırla
      setYeniBaslik('');
      setYeniKisaBaslik('');
      setYeniKod('');
      setYeniIcerik('');
      setYeniVersiyon('1.0.0');
    } else {
      setModalHata('Sözleşme eklenirken bir hata oluştu.');
    }
  };

  const filtrelenmisLoglar = loglar.filter((log) => {
    const aramaUyumu =
      !aramaMetni ||
      (log.kullaniciTelefon && log.kullaniciTelefon.includes(aramaMetni)) ||
      (log.kullaniciAdSoyad && log.kullaniciAdSoyad.toLowerCase().includes(aramaMetni.toLowerCase())) ||
      log.ipAdresi.includes(aramaMetni) ||
      log.kimlik.includes(aramaMetni);

    const turUyumu = filtreTuru === 'hepsi' || log.islemTuru === filtreTuru;
    return aramaUyumu && turUyumu;
  });

  // Logları CSV İndir
  const loglariCsvIndir = () => {
    if (loglar.length === 0) {
      return;
    }

    const basliklar = [
      'Log ID',
      'Tarih Saat',
      'İşlem Türü',
      'Sözleşme',
      'Kullanıcı Ad Soyad',
      'Telefon',
      'IP Adresi',
      'Cihaz Bilgisi',
      'Onay Durumu'
    ];

    const satirlar = loglar.map((l) => [
      `"${l.kimlik}"`,
      `"${l.tarihSaat}"`,
      `"${l.islemTuru}"`,
      `"${l.sozlesmeTuru}"`,
      `"${l.kullaniciAdSoyad || 'Misafir'}"`,
      `"${l.kullaniciTelefon || '-'}"`,
      `"${l.ipAdresi}"`,
      `"${l.cihazBilgisi.replace(/"/g, '""')}"`,
      `"${l.onaylandiMi ? 'ONAYLANDI' : 'REDDEDİLDİ'}"`
    ]);

    const csvIcerik = '\uFEFF' + [basliklar.join(','), ...satirlar.map((s) => s.join(','))].join('\n');
    const blob = new Blob([csvIcerik], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Afyon_Hukuki_Onay_Loglari_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const loglariJsonIndir = () => {
    const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(loglar, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', jsonStr);
    link.setAttribute('download', `Afyon_Hukuk_Log_Yedegi_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const aktifSozlesme = sozlesmeler[seciliTur];

  return (
    <div className="bg-[#1A081D] border border-[#521E5C] rounded-3xl p-6 shadow-2xl space-y-6">
      
      {/* Üst Başlık ve Sekmeler */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#3D1445] pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7B258B] to-[#3D1445] flex items-center justify-center border border-[#9633A7] shadow-lg shadow-purple-950">
            <ShieldCheck className="w-6 h-6 text-[#DDAF53]" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span>Hukuki Sözleşmeler, Taahhütnameler & KVKK Masası</span>
              <span className="text-[11px] bg-emerald-950 text-emerald-400 border border-emerald-700 px-2.5 py-0.5 rounded-full font-mono">
                Süper Admin
              </span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Sözleşme ekleme, yasal şartları revize etme ve müşteri onay delil kayıtları yönetimi.
            </p>
          </div>
        </div>

        {/* Sekme Butonları ve Yeni Sözleşme Ekle Butonu */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setYeniModalAcik(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-gray-950 font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Sözleşme / Protokol Ekle</span>
          </button>

          <div className="flex items-center gap-1 bg-[#240C28] p-1.5 rounded-2xl border border-[#3D1445]">
            <button
              onClick={() => setSekme('sozlesmeler')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                sekme === 'sozlesmeler'
                  ? 'bg-[#7B258B] text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4 text-[#DDAF53]" />
              <span>Sözleşmeler ({Object.keys(sozlesmeler).length})</span>
            </button>
            <button
              onClick={() => {
                setSekme('loglar');
                setLoglar(hukukiLoglariGetir());
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                sekme === 'loglar'
                  ? 'bg-[#7B258B] text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4 text-[#DDAF53]" />
              <span>Onay Delil Logları ({loglar.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. SEKME: SÖZLEŞME METİNLERİ DÜZENLEME & YÖNETİM */}
      {sekme === 'sozlesmeler' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Sol Menü: Sözleşme Listesi */}
          <div className="space-y-2 lg:col-span-1">
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="text-xs font-bold text-[#DDAF53] uppercase tracking-wider block">
                Yasal Dokümanlar
              </span>
              <button
                onClick={() => setYeniModalAcik(true)}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Ekle
              </button>
            </div>

            {Object.keys(sozlesmeler).map((tur) => {
              const soz = sozlesmeler[tur];
              const secili = seciliTur === tur;
              return (
                <div
                  key={tur}
                  className={`w-full group rounded-2xl border transition-all flex items-center justify-between p-3 ${
                    secili
                      ? 'bg-[#3D1445] border-[#DDAF53] text-white shadow-lg shadow-purple-950/50'
                      : 'bg-[#240C28]/60 border-[#3D1445] text-gray-300 hover:bg-[#2E1033]'
                  }`}
                >
                  <button
                    onClick={() => sozlesmeDegistir(tur)}
                    className="flex-1 text-left cursor-pointer space-y-0.5"
                  >
                    <span className="text-xs font-bold block">{soz.kisaBaslik || soz.baslik}</span>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                      <span>v{soz.versiyon}</span>
                      <span>•</span>
                      <span className="text-[#DDAF53] font-mono">{soz.konum || 'genel'}</span>
                    </div>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {soz.zorunluMu && (
                      <span className="text-[9px] bg-rose-950 text-rose-300 border border-rose-800 px-1.5 py-0.5 rounded font-bold">
                        Zorunlu
                      </span>
                    )}
                    {soz.silinebilirMi !== false && (
                      silmeOnayTur === tur ? (
                        <div className="flex items-center gap-1 bg-black/80 px-1.5 py-0.5 rounded-lg border border-rose-500/60 shadow-lg">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              sozlesmeyiKaldir(tur);
                            }}
                            className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-[10px] cursor-pointer shadow-sm active:scale-95"
                            title="Silmeyi Onayla"
                          >
                            Sil
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSilmeOnayTur(null);
                            }}
                            className="px-1.5 py-0.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-[10px] cursor-pointer"
                            title="Vazgeç"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSilmeOnayTur(tur);
                          }}
                          className="p-1.5 text-gray-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Sözleşmeyi sistemden sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sağ Alan: Düzenleme Editörü */}
          {aktifSozlesme ? (
            <div className="lg:col-span-3 bg-[#240C28] border border-[#3D1445] rounded-3xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#3D1445] pb-3">
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <span>{aktifSozlesme.baslik}</span>
                    <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded font-mono">
                      Kod: {aktifSozlesme.tur}
                    </span>
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-400 mt-1">
                    <label className="inline-flex items-center gap-1.5">
                      <span>Versiyon:</span>
                      <input
                        type="text"
                        value={duzenlenenVersiyon}
                        onChange={(e) => setDuzenlenenVersiyon(e.target.value)}
                        className="w-20 bg-[#1A081D] border border-[#521E5C] rounded-lg px-2 py-0.5 text-amber-300 font-mono text-[11px] focus:outline-none focus:border-[#DDAF53]"
                      />
                    </label>
                    <span>| Son Güncelleme: {aktifSozlesme.guncellenmeTarihi} | Konum: {aktifSozlesme.konum || 'genel'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {VARSAYILAN_SOZLESMELER[seciliTur] && (
                    <button
                      onClick={varsayilanaSifirla}
                      className="px-3 py-1.5 rounded-xl border border-gray-700 text-gray-400 hover:text-gray-200 text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Fabrika Ayarına Dön</span>
                    </button>
                  )}
                  <button
                    onClick={sozlesmeyiKaydet}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-gray-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Değişiklikleri Kaydet</span>
                  </button>
                </div>
              </div>

              {kaydedildiMesaji && (
                <div className="bg-emerald-950/80 border border-emerald-600 text-emerald-300 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Sözleşme başarıyla güncellendi ve tüm vitrinde aktif edildi.</span>
                </div>
              )}

              <textarea
                value={duzenlenenMetin}
                onChange={(e) => setDuzenlenenMetin(e.target.value)}
                rows={15}
                className="w-full bg-[#1A081D] border border-[#521E5C] rounded-2xl p-4 text-xs font-mono text-gray-200 focus:outline-none focus:border-[#DDAF53] leading-relaxed resize-y"
              />
            </div>
          ) : (
            <div className="lg:col-span-3 flex items-center justify-center p-12 bg-[#240C28] rounded-3xl border border-[#3D1445] text-gray-500 text-xs">
              Lütfen sol menüden düzenlemek istediğiniz sözleşmeyi seçiniz veya yeni bir sözleşme ekleyiniz.
            </div>
          )}

        </div>
      )}

      {/* 2. SEKME: ONAY DELİL LOGLARI */}
      {sekme === 'loglar' && (
        <div className="space-y-4">
          
          {/* Arama ve İndirme Araç Çubuğu */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#240C28] p-3 rounded-2xl border border-[#3D1445]">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={aramaMetni}
                  onChange={(e) => setAramaMetni(e.target.value)}
                  placeholder="Telefon, İsim, IP veya Log ID ara..."
                  className="w-full bg-[#1A081D] border border-[#521E5C] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#DDAF53]"
                />
              </div>

              <select
                value={filtreTuru}
                onChange={(e) => setFiltreTuru(e.target.value)}
                className="bg-[#1A081D] border border-[#521E5C] text-xs text-gray-300 rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#DDAF53]"
              >
                <option value="hepsi">Tüm İşlemler</option>
                <option value="siparis">Sipariş Onayları</option>
                <option value="kayit">Hesap Kayıtları</option>
                <option value="cerez_onayi">Çerez Tercihleri</option>
                <option value="ozel_onay">Özel Onaylar</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loglariCsvIndir}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950 cursor-pointer"
                title="Excel uyumlu CSV formatında indir"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Excel (CSV) İndir</span>
              </button>
              <button
                onClick={loglariJsonIndir}
                className="px-3 py-1.5 rounded-xl bg-purple-950 hover:bg-purple-900 border border-[#521E5C] text-gray-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                title="Yedek JSON indir"
              >
                <Download className="w-3.5 h-3.5" />
                <span>JSON Yedek</span>
              </button>
            </div>
          </div>

          {/* Log Tablosu */}
          <div className="overflow-x-auto rounded-2xl border border-[#3D1445] bg-[#240C28]">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#1A081D] text-[#DDAF53] uppercase font-mono text-[11px] border-b border-[#3D1445]">
                <tr>
                  <th className="p-3">Tarih & Saat</th>
                  <th className="p-3">İşlem</th>
                  <th className="p-3">Kullanıcı / Tel</th>
                  <th className="p-3">Sözleşme</th>
                  <th className="p-3">IP Adresi</th>
                  <th className="p-3 text-center">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3D1445]/60 font-sans">
                {filtrelenmisLoglar.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      Henüz kayıtlı bir hukuki log bulunamadı veya aramayla eşleşmedi.
                    </td>
                  </tr>
                ) : (
                  filtrelenmisLoglar.map((log) => (
                    <tr key={log.kimlik} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-3 font-mono text-[11px] text-gray-400 whitespace-nowrap">
                        {log.tarihSaat}
                      </td>
                      <td className="p-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                            log.islemTuru === 'siparis'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : log.islemTuru === 'kayit'
                              ? 'bg-purple-950 text-purple-300 border border-purple-800'
                              : 'bg-sky-950 text-sky-300 border border-sky-800'
                          }`}
                        >
                          {log.islemTuru}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="font-medium text-white">
                          {log.kullaniciAdSoyad || 'Misafir Ziyaretçi'}
                        </div>
                        <div className="text-[11px] text-gray-400 font-mono">
                          {log.kullaniciTelefon || 'Telefon Yok'}
                        </div>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-amber-200/90">
                        {log.sozlesmeTuru} (v{log.sozlesmeVersiyonu})
                      </td>
                      <td className="p-3 font-mono text-[11px] text-gray-400">
                        {log.ipAdresi}
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>HUKUKEN ONAYLANDI</span>
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ➕ YENİ SÖZLEŞME EKLEME MODAL PENCERESİ */}
      {yeniModalAcik && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#1A081D] border border-[#7B258B] rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scaleUp">
            
            {/* Modal Başlık */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#3D1445] bg-[#240C28]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/40">
                  <FilePlus2 className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Sisteme Yeni Sözleşme / Protokol Ekle</h3>
                  <p className="text-[11px] text-gray-400">Özel taahhütname, aşçı hijyen protokolü veya VIP sözleşme oluşturun.</p>
                </div>
              </div>
              <button
                onClick={() => setYeniModalAcik(false)}
                className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/5 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Alanı */}
            <form onSubmit={yeniSozlesmeKaydet} className="p-6 overflow-y-auto flex-1 space-y-4">
              {modalHata && (
                <div className="p-3 bg-rose-950/80 border border-rose-600 text-rose-300 rounded-xl text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{modalHata}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    Sözleşme Tam Başlığı <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={yeniBaslik}
                    onChange={(e) => setYeniBaslik(e.target.value)}
                    placeholder="Örn: Ev Aşçısı Hijyen ve Gıda Güvenliği Protokolü"
                    className="w-full bg-[#240C28] border border-[#521E5C] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#DDAF53]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    Kısa Başlık (Menü Görünümü)
                  </label>
                  <input
                    type="text"
                    value={yeniKisaBaslik}
                    onChange={(e) => setYeniKisaBaslik(e.target.value)}
                    placeholder="Örn: Aşçı Hijyen Protokolü"
                    className="w-full bg-[#240C28] border border-[#521E5C] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#DDAF53]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Versiyon</label>
                  <input
                    type="text"
                    value={yeniVersiyon}
                    onChange={(e) => setYeniVersiyon(e.target.value)}
                    placeholder="1.0.0"
                    className="w-full bg-[#240C28] border border-[#521E5C] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#DDAF53] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Görüneceği Alan</label>
                  <select
                    value={yeniKonum}
                    onChange={(e) => setYeniKonum(e.target.value as SozlesmeKonumu)}
                    className="w-full bg-[#240C28] border border-[#521E5C] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#DDAF53]"
                  >
                    <option value="genel">Genel / Bilgi Amaçlı</option>
                    <option value="kayit">Kayıt Olma Ekranı</option>
                    <option value="siparis">Sipariş & Ödeme Ekranı</option>
                    <option value="asci_basvuru">Aşçı Başvuru Süreci</option>
                    <option value="kurye_basvuru">Kurye Başvuru Süreci</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={yeniZorunlu}
                      onChange={(e) => setYeniZorunlu(e.target.checked)}
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                    <span className="text-xs text-gray-200 font-bold">Zorunlu Onay Kilidi</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  Sözleşme Maddeleri ve Hukuki İçerik <span className="text-amber-400">*</span>
                </label>
                <textarea
                  value={yeniIcerik}
                  onChange={(e) => setYeniIcerik(e.target.value)}
                  placeholder="MADDE 1 - TARAFLAR&#10;MADDE 2 - HİJYEN VE KALİTE KURALLARI..."
                  rows={8}
                  className="w-full bg-[#120514] border border-[#521E5C] rounded-xl p-3 text-xs font-mono text-gray-200 focus:outline-none focus:border-[#DDAF53] leading-relaxed resize-y"
                  required
                />
              </div>

              {/* Alt Butonlar */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#3D1445]">
                <button
                  type="button"
                  onClick={() => setYeniModalAcik(false)}
                  className="px-4 py-2 rounded-xl border border-gray-700 text-gray-300 hover:bg-white/5 text-xs font-bold cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-gray-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Sözleşmeyi Oluştur ve Yayınla</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
