import React, { useState } from 'react';
import { X, User, ShoppingCart, Home, Building2, Bike, Check, ShieldCheck, Lock, Phone, AlertCircle, CheckCircle2, FileText, Award, FileCheck2, ExternalLink } from 'lucide-react';
import { kullaniciHafizasiKullan } from '@/src/OrtakHavuz/KullaniciHafizasi';
import { KullaniciRolu } from '@/src/veritabani/VeriTipleri';
import { telefonMaskele, telefonGecerliMi, telefonCanliDurumunuGetir } from '@/src/MalzemeCekmeceleri/Dogrulama/telefonDogrulayici';
import { SozlesmePenceresi } from '@/src/VitrinOdasi/Bilesenler';
import { hukukiLogKaydet, type SozlesmeTuru } from '@/src/MalzemeCekmeceleri';
import { RESMI_BELGE_REHBERI } from '@/src/MalzemeCekmeceleri/MutfakYonetimi/BelgelerVeIzinler';

export const KullaniciGirisPenceresi: React.FC = () => {
  const {
    pencereAcik,
    pencereKapat,
    girisYap,
    kayitOl,
    yukleniyor,
    baslangicSekmesi,
    baslangicRolu
  } = kullaniciHafizasiKullan();

  const [sekme, setSekme] = useState<'giris' | 'kayit'>('giris');
  const [seciliRol, setSeciliRol] = useState<KullaniciRolu>('musteri');
  const [hataMesaji, setHataMesaji] = useState<string>('');

  // Pencere açıldığında başlangıç sekmesi ve rolünü otomatik ayarla
  React.useEffect(() => {
    if (pencereAcik) {
      if (baslangicSekmesi) setSekme(baslangicSekmesi);
      if (baslangicRolu) setSeciliRol(baslangicRolu);
      setHataMesaji('');
    }
  }, [pencereAcik, baslangicSekmesi, baslangicRolu]);

  // Form Durumları
  const [telefon, setTelefon] = useState<string>('');
  const [sifre, setSifre] = useState<string>('');
  const [adSoyad, setAdSoyad] = useState<string>('');
  const [isletmeAdi, setIsletmeAdi] = useState<string>('');
  const [aracTipi, setAracTipi] = useState<string>('');
  const [ilce, setIlce] = useState<string>('Merkez');

  // Ev Mutfağı Yasal Belgeler
  const [hijyenVarMi, setHijyenVarMi] = useState<boolean>(true);
  const [hijyenBarkodNo, setHijyenBarkodNo] = useState<string>('');
  const [muafiyetVarMi, setMuafiyetVarMi] = useState<boolean>(true);
  const [vergiMuafiyetNo, setVergiMuafiyetNo] = useState<string>('');
  const [belgeRehberiAcik, setBelgeRehberiAcik] = useState<boolean>(false);

  // Hukuki Sözleşme ve KVKK Onay Kilidi
  const [sozlesmeOnaylandi, setSozlesmeOnaylandi] = useState<boolean>(false);
  const [aktifSozlesmeTuru, setAktifSozlesmeTuru] = useState<SozlesmeTuru | null>(null);

  if (!pencereAcik) return null;

  const girisGonder = async (e: React.FormEvent) => {
    e.preventDefault();
    setHataMesaji('');
    if (!telefon.trim() || !sifre.trim()) {
      setHataMesaji('Lütfen telefon numaranızı ve şifrenizi giriniz.');
      return;
    }

    const telSonuc = telefonGecerliMi(telefon);
    if (!telSonuc.gecerli) {
      setHataMesaji(telSonuc.hata || 'Lütfen geçerli bir cep telefonu numarası giriniz.');
      return;
    }

    const basarili = await girisYap(telefon, sifre);
    if (!basarili) {
      setHataMesaji('Giriş başarısız. Telefon numaranızı veya şifrenizi kontrol ediniz.');
    }
  };

  const kayitGonder = async (e: React.FormEvent) => {
    e.preventDefault();
    setHataMesaji('');
    if (!adSoyad.trim() || !telefon.trim() || !sifre.trim()) {
      setHataMesaji('Lütfen ad, telefon ve şifre alanlarını eksiksiz doldurunuz.');
      return;
    }

    const telSonuc = telefonGecerliMi(telefon);
    if (!telSonuc.gecerli) {
      setHataMesaji(telSonuc.hata || 'Lütfen geçerli bir cep telefonu numarası giriniz.');
      return;
    }

    if (sifre.length < 4) {
      setHataMesaji('Şifreniz en az 4 karakter olmalıdır.');
      return;
    }

    if (!sozlesmeOnaylandi) {
      setHataMesaji('Kayıt işlemine devam edebilmek için Kullanıcı Sözleşmesi ve KVKK Metnini onaylamanız zorunludur.');
      return;
    }

    // ROL BAZLI VERİ TEMİZLİĞİ: Hangi role basıldıysa sadece onun verileri paketleniyor
    const gonderilecekVeri: any = {
      ad_soyad: adSoyad,
      telefon,
      rol: seciliRol,
      ilce,
      sifre,
      // Müşteri seçildiyse işletme adı ve araç tipi tamamen kesilip boş gönderiliyor
      isletme_adi: (seciliRol === 'ev_mutfagi' || seciliRol === 'ticari_restoran') ? isletmeAdi : "",
      arac_tipi: seciliRol === 'kurye' ? aracTipi : ""
    };

    // Ev mutfağı ve restoran başvurularında belgeler kaydedilir fakat onay daima patrona aittir (false)
    if (seciliRol === 'ev_mutfagi' || seciliRol === 'ticari_restoran') {
      gonderilecekVeri.hijyen_onayli_mi = false;
      gonderilecekVeri.esnaf_muafiyet_onayli_mi = false;
      gonderilecekVeri.onayli_mi = false;
      gonderilecekVeri.onay_durumu = 'beklemede';
      gonderilecekVeri.belgeler = {
        hijyenVarMi,
        hijyenBarkodNo: hijyenBarkodNo.trim(),
        muafiyetVarMi,
        vergiMuafiyetNo: vergiMuafiyetNo.trim(),
        basvuruTarihi: new Date().toLocaleDateString('tr-TR')
      };
    }

    const basarili = await kayitOl(gonderilecekVeri);

    if (basarili) {
      // Role göre dinamik sözleşme onay delil logu kaydet
      const anaSozlesmeTuru = 
        (seciliRol === 'ev_mutfagi' || seciliRol === 'ticari_restoran') ? 'mutfak_kayit_sozlesmesi' :
        seciliRol === 'kurye' ? 'kurye_kayit_sozlesmesi' : 'kullanici_sozlesmesi';

      hukukiLogKaydet({
        sozlesmeTuru: anaSozlesmeTuru,
        sozlesmeVersiyonu: '1.0.0',
        kullaniciTelefon: telefon,
        kullaniciAdSoyad: adSoyad,
        islemTuru: 'kayit',
        onaylandiMi: true
      });
      hukukiLogKaydet({
        sozlesmeTuru: 'kvkk_aydinlatma',
        sozlesmeVersiyonu: '1.0.0',
        kullaniciTelefon: telefon,
        kullaniciAdSoyad: adSoyad,
        islemTuru: 'kayit',
        onaylandiMi: true
      });
    } else {
      setHataMesaji('Kayıt oluşturulamadı. Bu telefon numarası sistemde kayıtlı olabilir.');
    }
  };


  return (
    <div className="fixed inset-0 z-50 overflow-y-auto select-none bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#180A1F] border border-[#521E5C] text-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Üst Başlık Barı */}
        <div className="p-4 border-b border-[#3E1646] bg-[#1A0A1D] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#DDAF53]" />
            <h3 className="font-bold text-base text-white">Afyon Ev Lezzetleri — Kullanıcı Girişi</h3>
          </div>
          <button
            type="button"
            onClick={pencereKapat}
            className="w-8 h-8 rounded-full bg-[#2A102E] hover:bg-[#4D1857] text-[#CFA353] hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-[#521E5C]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Ana Gövde */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          
          {/* Hata Bildirimi */}
          {hataMesaji && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{hataMesaji}</span>
            </div>
          )}

          {/* Giriş / Kayıt Sekme Butonları */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#2A102E] border border-[#521E5C] rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setSekme('giris');
                setHataMesaji('');
              }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                sekme === 'giris' ? 'bg-[#6D237A] text-white shadow-md' : 'text-[#A872B5] hover:text-white'
              }`}
            >
              Giriş Yap
            </button>
            <button
              type="button"
              onClick={() => {
                setSekme('kayit');
                setHataMesaji('');
              }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                sekme === 'kayit' ? 'bg-[#6D237A] text-white shadow-md' : 'text-[#A872B5] hover:text-white'
              }`}
            >
              Yeni Kayıt Ol
            </button>
          </div>

          {sekme === 'giris' ? (
            /* Giriş Yap Formu */
            <form onSubmit={girisGonder} className="space-y-3.5">
              <div>
                <label className="block text-[#CFA353] font-semibold mb-1 text-xs">Telefon Numarası</label>
                <div className="relative">
                  <Phone
                    className={`w-4 h-4 absolute left-3 top-3 ${
                      telefonCanliDurumunuGetir(telefon).hata
                        ? 'text-rose-400'
                        : telefonCanliDurumunuGetir(telefon).gecerliMi
                        ? 'text-emerald-400'
                        : 'text-gray-400'
                    }`}
                  />
                  <input
                    type="tel"
                    value={telefon}
                    onChange={(e) => {
                      setHataMesaji('');
                      setTelefon(telefonMaskele(e.target.value));
                    }}
                    placeholder="05XX XXX XX XX"
                    maxLength={15}
                    className={`w-full bg-[#2A102E] border rounded-xl pl-9 pr-24 py-2.5 text-white placeholder-gray-500 focus:outline-none font-mono text-sm transition-colors ${
                      telefonCanliDurumunuGetir(telefon).hata
                        ? 'border-rose-500 bg-rose-950/20'
                        : telefonCanliDurumunuGetir(telefon).gecerliMi
                        ? 'border-emerald-500/60'
                        : 'border-[#521E5C] focus:border-[#DDAF53]'
                    }`}
                    required
                  />
                  {telefonCanliDurumunuGetir(telefon).operator && (
                    <span
                      className={`absolute right-3 top-3 text-[11px] font-semibold pointer-events-none ${
                        telefonCanliDurumunuGetir(telefon).operator?.renk
                      }`}
                    >
                      {telefonCanliDurumunuGetir(telefon).operator?.ad}
                    </span>
                  )}
                </div>
                {telefonCanliDurumunuGetir(telefon).hata && (
                  <p className="text-[11px] text-rose-400 mt-1.5 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{telefonCanliDurumunuGetir(telefon).hata}</span>
                  </p>
                )}
                {telefonCanliDurumunuGetir(telefon).gecerliMi && (
                  <p className="text-[11px] text-emerald-400 mt-1.5 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Geçerli {telefonCanliDurumunuGetir(telefon).operator?.ad || 'Mobil'} Numarası</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[#CFA353] font-semibold mb-1 text-xs">Şifre</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={sifre}
                    onChange={(e) => setSifre(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#2A102E] border border-[#521E5C] rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#DDAF53]"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={yukleniyor || Boolean(telefonCanliDurumunuGetir(telefon).hata)}
                className="w-full mt-2 bg-[#6D237A] hover:bg-[#852C94] disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 border border-[#9633A7] shadow-lg transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-[#DDAF53]" />
                <span>{yukleniyor ? 'Giriş Yapılıyor...' : 'Giriş Yap'}</span>
              </button>
            </form>
          ) : (
            /* 4 Rol Seçimli Kayıt Formu */
            <form onSubmit={kayitGonder} className="space-y-3.5">
              {/* Rol Seçim Kartları */}
              <div>
                <label className="block text-[#CFA353] font-semibold mb-2 text-xs">Hangi Sıfatla Katılıyorsunuz?</label>
                <div className="grid grid-cols-2 gap-2">
                  {/* Rol 1: Müşteri */}
                  <div
                    onClick={() => setSeciliRol('musteri')}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2 ${
                      seciliRol === 'musteri'
                        ? 'bg-[#3D1843] border-[#DDAF53] shadow-md'
                        : 'bg-[#2A102E]/60 border-[#521E5C] hover:bg-[#321338]'
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4 text-[#DDAF53] shrink-0" />
                    <div>
                      <div className="font-bold text-white text-[11px]">Müşteri</div>
                      <div className="text-[9px] text-[#A872B5]">Sipariş Veren</div>
                    </div>
                  </div>

                  {/* Rol 2: Ev Mutfağı */}
                  <div
                    onClick={() => setSeciliRol('ev_mutfagi')}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2 ${
                      seciliRol === 'ev_mutfagi'
                        ? 'bg-[#3D1843] border-[#DDAF53] shadow-md'
                        : 'bg-[#2A102E]/60 border-[#521E5C] hover:bg-[#321338]'
                    }`}
                  >
                    <Home className="w-4 h-4 text-[#DDAF53] shrink-0" />
                    <div>
                      <div className="font-bold text-white text-[11px]">Ev Mutfağı</div>
                      <div className="text-[9px] text-[#A872B5]">Ev Hanımı / Yöresel</div>
                    </div>
                  </div>

                  {/* Rol 3: Ticari Restoran */}
                  <div
                    onClick={() => setSeciliRol('ticari_restoran')}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2 ${
                      seciliRol === 'ticari_restoran'
                        ? 'bg-[#3D1843] border-[#DDAF53] shadow-md'
                        : 'bg-[#2A102E]/60 border-[#521E5C] hover:bg-[#321338]'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-[#DDAF53] shrink-0" />
                    <div>
                      <div className="font-bold text-white text-[11px]">Ticari Restoran</div>
                      <div className="text-[9px] text-[#A872B5]">Lokanta / Fırın</div>
                    </div>
                  </div>

                  {/* Rol 4: Kurye */}
                  <div
                    onClick={() => setSeciliRol('kurye')}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2 ${
                      seciliRol === 'kurye'
                        ? 'bg-[#3D1843] border-[#DDAF53] shadow-md'
                        : 'bg-[#2A102E]/60 border-[#521E5C] hover:bg-[#321338]'
                    }`}
                  >
                    <Bike className="w-4 h-4 text-[#DDAF53] shrink-0" />
                    <div>
                      <div className="font-bold text-white text-[11px]">Kurye</div>
                      <div className="text-[9px] text-[#A872B5]">Paket Servis</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dinamik Alanlar */}
              <div>
                <label className="block text-gray-300 font-medium mb-1 text-xs">Ad Soyad</label>
                <input
                  type="text"
                  value={adSoyad}
                  onChange={(e) => setAdSoyad(e.target.value)}
                  placeholder="Örn: Şerife Yılmaz"
                  className="w-full bg-[#2A102E] border border-[#521E5C] rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#DDAF53]"
                  required
                />
              </div>

              {(seciliRol === 'ev_mutfagi' || seciliRol === 'ticari_restoran') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[#DDAF53] font-semibold mb-1 text-xs">
                      {seciliRol === 'ev_mutfagi' ? 'Ev Mutfak Adı' : 'İşletme / Restoran Unvanı'}
                    </label>
                    <input
                      type="text"
                      value={isletmeAdi}
                      onChange={(e) => setIsletmeAdi(e.target.value)}
                      placeholder={seciliRol === 'ev_mutfagi' ? 'Örn: Şerife Abla Yöresel Mutfak' : 'Örn: Afyon İkbal Bükme & Pide'}
                      className="w-full bg-[#2A102E] border border-[#521E5C] rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#DDAF53]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[#DDAF53] font-semibold mb-1 text-xs">Hizmet Bölgesi / İlçe</label>
                    <select
                      value={ilce}
                      onChange={(e) => setIlce(e.target.value)}
                      className="w-full bg-[#2A102E] border border-[#521E5C] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#DDAF53]"
                    >
                      <option value="Merkez">Afyon Merkez</option>
                      <option value="Sandıklı">Sandıklı / Afyon</option>
                      <option value="Bolvadin">Bolvadin / Afyon</option>
                      <option value="Dinar">Dinar / Afyon</option>
                      <option value="Emirdağ">Emirdağ / Afyon</option>
                      <option value="Çay">Çay / Afyon</option>
                      <option value="İscehisar">İscehisar / Afyon</option>
                      <option value="Şuhut">Şuhut / Afyon</option>
                      <option value="Sinanpaşa">Sinanpaşa / Afyon</option>
                    </select>
                  </div>
                </div>
              )}

              {/* 🛡️ EV MUTFAĞI YASAL BELGELER VE İZİNLER BÖLÜMÜ */}
              {seciliRol === 'ev_mutfagi' && (
                <div className="bg-[#210927] border border-amber-500/40 rounded-2xl p-3.5 space-y-3 shadow-inner">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[#DDAF53] font-bold text-xs">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span>Resmi İzinler & Hukuki Belgeler</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setBelgeRehberiAcik(!belgeRehberiAcik)}
                      className="text-[10px] text-amber-300 hover:text-white underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>{belgeRehberiAcik ? 'Rehberi Gizle' : 'Nasıl Alınır? (Rehber)'}</span>
                    </button>
                  </div>

                  {belgeRehberiAcik && (
                    <div className="p-2.5 rounded-xl bg-purple-950/50 border border-purple-800/40 space-y-2 text-[10px] text-gray-300">
                      <div>
                        <strong className="text-amber-300 block">1. Hijyen Belgesi:</strong>
                        {RESMI_BELGE_REHBERI.hijyen.nasilAlinir}
                        <a
                          href={RESMI_BELGE_REHBERI.hijyen.eDevletLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#DDAF53] font-semibold flex items-center gap-1 mt-0.5 hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" /> e-Devlet MEB Sertifika Sorgulama
                        </a>
                      </div>
                      <div className="pt-1 border-t border-purple-900/50">
                        <strong className="text-amber-300 block">2. Esnaf Vergi Muafiyeti:</strong>
                        {RESMI_BELGE_REHBERI.esnafMuafiyeti.nasilAlinir}
                        <a
                          href={RESMI_BELGE_REHBERI.esnafMuafiyeti.eDevletLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#DDAF53] font-semibold flex items-center gap-1 mt-0.5 hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" /> Dijital Vergi Dairesi (ivd.gib.gov.tr)
                        </a>
                      </div>
                    </div>
                  )}

                  {/* 1. Hijyen Belgesi Alanı */}
                  <div className="bg-[#18051D] p-2.5 rounded-xl border border-purple-900/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-white flex items-center gap-1.5">
                        <FileCheck2 className="w-3.5 h-3.5 text-amber-400" />
                        <span>MEB Hijyen Eğitimi Belgesi</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <label className="text-[10px] flex items-center gap-1 cursor-pointer text-gray-300">
                          <input
                            type="radio"
                            name="hijyenVarMi"
                            checked={hijyenVarMi}
                            onChange={() => setHijyenVarMi(true)}
                            className="accent-amber-400 cursor-pointer"
                          />
                          <span>Var</span>
                        </label>
                        <label className="text-[10px] flex items-center gap-1 cursor-pointer text-gray-400">
                          <input
                            type="radio"
                            name="hijyenVarMi"
                            checked={!hijyenVarMi}
                            onChange={() => setHijyenVarMi(false)}
                            className="accent-amber-400 cursor-pointer"
                          />
                          <span>Başvuracağım</span>
                        </label>
                      </div>
                    </div>
                    {hijyenVarMi ? (
                      <input
                        type="text"
                        value={hijyenBarkodNo}
                        onChange={(e) => setHijyenBarkodNo(e.target.value)}
                        placeholder="e-Devlet Belge Barkod No (Örn: MEB-2026-AFY-XXXX)"
                        className="w-full bg-[#240C28] border border-purple-800/50 rounded-lg px-2.5 py-1.5 text-[11px] text-white placeholder-gray-500 font-mono focus:outline-none focus:border-amber-400"
                      />
                    ) : (
                      <p className="text-[10px] text-amber-400/90 leading-tight">
                        ⚠️ Hijyen belgeniz onaylanana kadar menünüz müşterilere kapalı tutulacaktır.
                      </p>
                    )}
                  </div>

                  {/* 2. Esnaf Vergi Muafiyet Belgesi Alanı */}
                  <div className="bg-[#18051D] p-2.5 rounded-xl border border-purple-900/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-white flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                        <span>GVK 9/10 Esnaf Muafiyet Belgesi</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <label className="text-[10px] flex items-center gap-1 cursor-pointer text-gray-300">
                          <input
                            type="radio"
                            name="muafiyetVarMi"
                            checked={muafiyetVarMi}
                            onChange={() => setMuafiyetVarMi(true)}
                            className="accent-amber-400 cursor-pointer"
                          />
                          <span>Var</span>
                        </label>
                        <label className="text-[10px] flex items-center gap-1 cursor-pointer text-gray-400">
                          <input
                            type="radio"
                            name="muafiyetVarMi"
                            checked={!muafiyetVarMi}
                            onChange={() => setMuafiyetVarMi(false)}
                            className="accent-amber-400 cursor-pointer"
                          />
                          <span>Alacağım</span>
                        </label>
                      </div>
                    </div>
                    {muafiyetVarMi ? (
                      <input
                        type="text"
                        value={vergiMuafiyetNo}
                        onChange={(e) => setVergiMuafiyetNo(e.target.value)}
                        placeholder="Muafiyet Belge / Sicil No (Örn: GVK-03-2026-XXXX)"
                        className="w-full bg-[#240C28] border border-purple-800/50 rounded-lg px-2.5 py-1.5 text-[11px] text-white placeholder-gray-500 font-mono focus:outline-none focus:border-amber-400"
                      />
                    ) : (
                      <p className="text-[10px] text-amber-400/90 leading-tight">
                        ℹ️ Vergi muafiyet belgeniz ile evden vergisiz yasal satış yapabilirsiniz.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {seciliRol === 'kurye' && (
                <div>
                  <label className="block text-[#DDAF53] font-semibold mb-1 text-xs">Dağıtım Araç Tipi</label>
                  <select
                    value={aracTipi}
                    onChange={(e) => setAracTipi(e.target.value)}
                    className="w-full bg-[#2A102E] border border-[#521E5C] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#DDAF53]"
                  >
                    <option value="">Araç tipi seçiniz...</option>
                    <option value="Motosiklet">Motosiklet / Scooter</option>
                    <option value="Araba">Binek / Hafif Ticari Araba</option>
                    <option value="Elektrikli Bisiklet">Elektrikli Bisiklet / Yaya</option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-300 font-medium mb-1 text-xs">Telefon Numarası</label>
                  <input
                    type="tel"
                    value={telefon}
                    onChange={(e) => {
                      setHataMesaji('');
                      setTelefon(telefonMaskele(e.target.value));
                    }}
                    placeholder="05XX XXX XX XX"
                    maxLength={15}
                    className={`w-full bg-[#2A102E] border rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none font-mono text-xs transition-colors ${
                      telefonCanliDurumunuGetir(telefon).hata
                        ? 'border-rose-500 bg-rose-950/20'
                        : telefonCanliDurumunuGetir(telefon).gecerliMi
                        ? 'border-emerald-500/60'
                        : 'border-[#521E5C] focus:border-[#DDAF53]'
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-1 text-xs">Şifre Oluştur</label>
                  <input
                    type="password"
                    value={sifre}
                    onChange={(e) => setSifre(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#2A102E] border border-[#521E5C] rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#DDAF53]"
                    required
                  />
                </div>
              </div>

              {telefonCanliDurumunuGetir(telefon).hata && (
                <p className="text-[11px] text-rose-400 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{telefonCanliDurumunuGetir(telefon).hata}</span>
                </p>
              )}

              {telefonCanliDurumunuGetir(telefon).gecerliMi && (
                <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Geçerli {telefonCanliDurumunuGetir(telefon).operator?.ad || 'Mobil'} Hattı</span>
                </p>
              )}

              {/* Hukuki Sözleşmeler ve KVKK Onay Kutusu (Zorunlu Kilitleme) */}
              <div className="bg-[#240C28] p-3 rounded-xl border border-[#521E5C] space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={sozlesmeOnaylandi}
                    onChange={(e) => {
                      setHataMesaji('');
                      setSozlesmeOnaylandi(e.target.checked);
                    }}
                    className="mt-0.5 w-4 h-4 accent-[#DDAF53] rounded cursor-pointer shrink-0"
                  />
                  <div className="text-[11px] text-gray-300 leading-snug">
                    {(seciliRol === 'ev_mutfagi' || seciliRol === 'ticari_restoran') ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setAktifSozlesmeTuru('mutfak_kayit_sozlesmesi')}
                          className="text-[#DDAF53] font-semibold underline hover:text-amber-300 cursor-pointer inline"
                        >
                          Ev Mutfağı & Aşçı İş Ortaklığı ve Hijyen Sözleşmesi
                        </button>
                        'ni ve{' '}
                      </>
                    ) : seciliRol === 'kurye' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setAktifSozlesmeTuru('kurye_kayit_sozlesmesi')}
                          className="text-[#DDAF53] font-semibold underline hover:text-amber-300 cursor-pointer inline"
                        >
                          Kurye Taşıma ve Hizmet Sözleşmesi
                        </button>
                        'ni ve{' '}
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setAktifSozlesmeTuru('kullanici_sozlesmesi')}
                          className="text-[#DDAF53] font-semibold underline hover:text-amber-300 cursor-pointer inline"
                        >
                          Kullanıcı ve Üyelik Sözleşmesi
                        </button>
                        'ni ve{' '}
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => setAktifSozlesmeTuru('kvkk_aydinlatma')}
                      className="text-[#DDAF53] font-semibold underline hover:text-amber-300 cursor-pointer inline"
                    >
                      KVKK Aydınlatma Metni
                    </button>
                    'ni okudum, kabul ediyorum. <span className="text-rose-400 font-bold">* (Zorunlu)</span>
                  </div>
                </label>
                {!sozlesmeOnaylandi && (
                  <p className="text-[10px] text-amber-300/80 flex items-center gap-1 pl-6">
                    <ShieldCheck className="w-3 h-3 text-amber-400" />
                    <span>Sözleşmeyi onaylamadan kayıt ol butonu aktifleşmez.</span>
                  </p>
                )}
              </div>

              {/* Bilgilendirme Uyarısı */}
              {seciliRol !== 'musteri' && (
                <div className="p-2.5 rounded-xl bg-[#2A102E] border border-[#521E5C] text-[10px] text-[#A872B5]">
                  ℹ️ <span className="font-bold text-gray-200">{seciliRol === 'ev_mutfagi' ? 'Ev Mutfağı' : seciliRol === 'ticari_restoran' ? 'Ticari Restoran' : 'Kurye'}</span> başvurunuz başlangıç için oluşturulacak, detaylı evrak doğrulama adımları onay sürecinde tamamlanacaktır.
                </div>
              )}

              <button
                type="submit"
                disabled={
                  yukleniyor ||
                  !sozlesmeOnaylandi ||
                  Boolean(telefonCanliDurumunuGetir(telefon).hata) ||
                  telefonCanliDurumunuGetir(telefon).tamamlandiMi === false
                }
                className="w-full mt-2 bg-[#6D237A] hover:bg-[#852C94] disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 border border-[#9633A7] shadow-lg transition-all cursor-pointer"
              >
                <Check className="w-4 h-4 text-[#DDAF53]" />
                <span>{yukleniyor ? 'Kaydediliyor...' : 'Kayıt Ol ve Başlat'}</span>
              </button>
            </form>
          )}
        </div>

      </div>

      {/* Hukuki Sözleşme Okuma Penceresi */}
      <SozlesmePenceresi
        tur={aktifSozlesmeTuru}
        acikMi={Boolean(aktifSozlesmeTuru)}
        onKapat={() => setAktifSozlesmeTuru(null)}
        onOnayla={() => {
          setSozlesmeOnaylandi(true);
          setAktifSozlesmeTuru(null);
        }}
      />
    </div>
  );
};

