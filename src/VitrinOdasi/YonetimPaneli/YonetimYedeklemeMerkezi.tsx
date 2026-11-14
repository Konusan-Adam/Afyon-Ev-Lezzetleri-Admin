import React, { useState, useEffect } from 'react';
import { Database, Download, CloudUpload, HardDrive, CheckCircle2, AlertCircle, Upload, Key, Link as LinkIcon, ShieldAlert } from 'lucide-react';
import { 
  yedeklemeAyarlariniGetir, 
  bulutYedeklemeAyarlariniGetir,
  yedeklemeAyarlariniKaydet, 
  tumVeritabaniPaketiniOlustur, 
  bulutaYedekGonder,
  yedekDosyasindanGeriYukle,
  YedeklemeAyarlari 
} from '@/src/MalzemeCekmeceleri/yedeklemeServisi';

export const YonetimYedeklemeMerkezi: React.FC = () => {
  const [ayarlar, setAyarlar] = useState<YedeklemeAyarlari>(yedeklemeAyarlariniGetir());
  const [urlInput, setUrlInput] = useState(ayarlar.hedefUrl);
  const [apiKeyInput, setApiKeyInput] = useState(ayarlar.apiKey || '');
  const [otomatikAktif, setOtomatikAktif] = useState(ayarlar.otomatikYedekleme);
  const [periyot, setPeriyot] = useState<'saatlik' | 'gunluk' | 'haftalik'>(ayarlar.otomatikPeriyot || 'gunluk');
  const [yukleniyor, setYukleniyor] = useState(false);
  const [bulutYukleniyor, setBulutYukleniyor] = useState(false);
  const [mesaj, setMesaj] = useState<{ tip: 'basarili' | 'hata'; metin: string } | null>(null);
  const [istatistik, setIstatistik] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    bulutYedeklemeAyarlariniGetir().then((guncel) => {
      setAyarlar(guncel);
      setUrlInput(guncel.hedefUrl);
      setOtomatikAktif(guncel.otomatikYedekleme);
      setPeriyot(guncel.otomatikPeriyot || 'gunluk');
    });
    tumVeritabaniPaketiniOlustur().then((paket) => {
      setIstatistik(paket.kayitIstatistikleri);
    });
  }, []);

  const mesajGoster = (tip: 'basarili' | 'hata', metin: string) => {
    setMesaj({ tip, metin });
    setTimeout(() => setMesaj(null), 4000);
  };

  const ayarlariKaydet = (e: React.FormEvent) => {
    e.preventDefault();
    const yeniAyarlar: YedeklemeAyarlari = {
      ...ayarlar,
      hedefUrl: urlInput.trim(),
      apiKey: apiKeyInput.trim(),
      otomatikYedekleme: otomatikAktif,
      otomatikPeriyot: periyot
    };
    yedeklemeAyarlariniKaydet(yeniAyarlar);
    setAyarlar(yeniAyarlar);
    mesajGoster('basarili', 'Arşiv, DirectAdmin bağlantısı ve otomatik yedekleme tercihleri kaydedildi!');
  };

  const yerelDosyaIndir = async () => {
    setYukleniyor(true);
    try {
      const paket = await tumVeritabaniPaketiniOlustur();
      const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(paket, null, 2));
      const link = document.createElement('a');
      link.setAttribute('href', jsonStr);
      link.setAttribute('download', `Afyon_Ev_Lezzetleri_Tam_Veritabani_Yedegi_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      mesajGoster('basarili', 'Veritabanı yedeği JSON paketi olarak bilgisayarınıza indirildi!');
    } catch (e) {
      mesajGoster('hata', 'Yedek dosyası oluşturulurken hata meydana geldi.');
    } finally {
      setYukleniyor(false);
    }
  };

  const bulutaGonderTiklandi = async () => {
    if (!urlInput || urlInput === 'https://') {
      mesajGoster('hata', 'Lütfen geçerli bir DirectAdmin veya Bulut arşiv URL adresi giriniz.');
      return;
    }

    setBulutYukleniyor(true);
    const sonuc = await bulutaYedekGonder(urlInput, apiKeyInput);
    setBulutYukleniyor(false);

    if (sonuc.basarili) {
      mesajGoster('basarili', sonuc.mesaj);
      setAyarlar(yedeklemeAyarlariniGetir());
    } else {
      mesajGoster('hata', sonuc.mesaj);
    }
  };

  return (
    <div className="space-y-6">
      {/* Üst Başlık */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-purple-900/40">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-amber-400" />
            <span>Veritabanı Arşiv, Yedekleme ve DirectAdmin Entegrasyon Masası</span>
          </h2>
          <p className="text-xs text-purple-300">
            Firebase veritabanına girmeden tüm önemli tabloları tek tıkla yerel bilgisayarınıza indirin veya harici bulut / DirectAdmin arşiv sunucunuza otomatik gönderin.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-[11px] text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold">Otomatik Yedekleme Servisi: 7/24 Aktif ({ayarlar.otomatikPeriyot || 'günlük'})</span>
          </div>

          {ayarlar.sonYedeklemeZamani && (
            <div className="px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-800/60 text-[11px] text-purple-200">
              <span>Son Bulut Yedek: </span>
              <span className="font-bold text-amber-400">{ayarlar.sonYedeklemeZamani}</span>
            </div>
          )}
        </div>
      </div>

      {/* Bildirim Çubuğu */}
      {mesaj && (
        <div className={`flex items-center gap-2 p-3.5 rounded-xl text-xs font-bold ${
          mesaj.tip === 'basarili' ? 'bg-emerald-950/80 border border-emerald-500/60 text-emerald-300' : 'bg-red-950/80 border border-red-500/60 text-red-300'
        }`}>
          {mesaj.tip === 'basarili' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
          <span>{mesaj.metin}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sol 2 Sütun: DirectAdmin / Bulut Depo Bağlantı Ayarları */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#1C0722] border border-purple-900/60 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-black text-white flex items-center gap-2 pb-3 border-b border-purple-950">
              <CloudUpload className="w-4 h-4 text-amber-400" />
              <span>Harici Bulut Depo veya DirectAdmin Hedef URL Ayarları</span>
            </h3>

            <form onSubmit={ayarlariKaydet} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-purple-400" />
                  <span>Hedef Arşiv URL Adresi (Webhook / Endpoint)</span>
                </label>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://senin-sunucun.com/yedek-al.php veya API adresi"
                  className="w-full bg-[#120415] border border-purple-900/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
                <p className="text-[11px] text-purple-400/80">
                  DirectAdmin hesabınızda veya bulut sunucunuzda POST isteklerini karşılayacak bir betik (PHP/Node.js vb.) adresi yazın.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-purple-400" />
                  <span>Güvenlik Anahtarı / API Token (İsteğe bağlı)</span>
                </label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="Bearer Token veya Secret API Key"
                  className="w-full bg-[#120415] border border-purple-900/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div className="bg-[#120415] p-4 rounded-xl border border-purple-900/60 space-y-3">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={otomatikAktif}
                    onChange={(e) => setOtomatikAktif(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                  <span className="text-xs font-bold text-white">
                    Belirtilen DirectAdmin / Bulut Linkine Otomatik Arşivleme Aktif Olsun
                  </span>
                </label>

                {otomatikAktif && (
                  <div className="flex items-center gap-3 pt-2 border-t border-purple-900/40 pl-6">
                    <span className="text-xs text-purple-300">Gönderim Sıklığı:</span>
                    <select
                      value={periyot}
                      onChange={(e) => setPeriyot(e.target.value as any)}
                      className="bg-[#1C0722] border border-purple-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="saatlik">Her Saat Başı</option>
                      <option value="gunluk">Günde Bir Kez</option>
                      <option value="haftalik">Haftada Bir Kez</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-xs font-bold text-amber-300 border border-purple-700/60 transition-all cursor-pointer"
                >
                  Bağlantı ve Otomasyon Ayarlarını Kaydet
                </button>

                <button
                  type="button"
                  disabled={bulutYukleniyor}
                  onClick={bulutaGonderTiklandi}
                  className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-black text-sm hover:brightness-110 shadow-lg shadow-emerald-500/30 transition-all cursor-pointer disabled:opacity-50 border-2 border-emerald-300"
                >
                  <CloudUpload className="w-5 h-5" />
                  <span>{bulutYukleniyor ? 'Arşive Gönderiliyor...' : 'Şimdi Buluta / DirectAdmin\'e Gönder'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Yerel Bilgisayara İndir Kutusu */}
          <div className="bg-[#1C0722] border border-purple-900/60 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3.5">
              <span className="p-3 rounded-2xl bg-amber-500/20 text-amber-400">
                <HardDrive className="w-6 h-6" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-white">Yerel Bilgisayara Tam JSON Yedeği İndir</h4>
                <p className="text-xs text-purple-300">Tüm veritabanı tablolarını anında tek dosyada bilgisayarınıza kaydedin.</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <label className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-950/60 hover:bg-amber-900 border border-amber-600/50 text-amber-200 font-bold text-xs cursor-pointer transition-all">
                <Upload className="w-4 h-4 text-amber-400" />
                <span>JSON Yedekten Geri Yükle</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={async (e) => {
                    const dosya = e.target.files?.[0];
                    if (!dosya) return;
                    setYukleniyor(true);
                    try {
                      const icerik = JSON.parse(await dosya.text());
                      const sonuc = await yedekDosyasindanGeriYukle(icerik);
                      const paket = await tumVeritabaniPaketiniOlustur();
                      setIstatistik(paket.kayitIstatistikleri);
                      mesajGoster('basarili', `${sonuc.yuklenenKoleksiyon} tablodan ${sonuc.yuklenenKayit} kayıt geri yüklendi.`);
                    } catch {
                      mesajGoster('hata', 'Seçilen dosya geçerli bir yedek paketi değil.');
                    } finally {
                      setYukleniyor(false);
                      e.target.value = '';
                    }
                  }}
                />
              </label>

              <button
                type="button"
                disabled={yukleniyor}
                onClick={yerelDosyaIndir}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-700 to-purple-800 hover:from-purple-600 hover:to-purple-700 text-white font-bold text-xs shadow-lg transition-all cursor-pointer shrink-0 disabled:opacity-50"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>{yukleniyor ? 'Paketleniyor...' : 'Yedeği Bilgisayara İndir'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sağ 1 Sütun: Veritabanı Tablo İstatistikleri */}
        <div className="bg-[#1C0722] border border-purple-900/60 rounded-2xl p-6 space-y-4 shadow-xl">
          <h3 className="text-sm font-black text-white flex items-center gap-2 pb-3 border-b border-purple-950">
            <Database className="w-4 h-4 text-amber-400" />
            <span>Yedeklenecek Tablolar & Kayıtlar</span>
          </h3>

          <div className="space-y-2.5">
            {istatistik ? (
              Object.entries(istatistik).map(([tabloAdi, adet]) => (
                <div key={tabloAdi} className="flex items-center justify-between bg-[#120415] px-3.5 py-2.5 rounded-xl border border-purple-900/50">
                  <span className="text-xs font-bold text-gray-200 font-mono capitalize">{tabloAdi.replace(/_/g, ' ')}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-900/60 text-amber-300 text-[11px] font-bold font-mono">
                    {adet} Kayıt
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-xs text-purple-400">Tablolar taranıyor...</div>
            )}
          </div>

          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-start gap-2 text-[11px] text-amber-200">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>Tüm hassas veriler şifrelenmiş paket halinde aktarılır. Güvenlik anahtarınızı başkalarıyla paylaşmayın.</span>
          </div>
        </div>

      </div>
    </div>
  );
};
