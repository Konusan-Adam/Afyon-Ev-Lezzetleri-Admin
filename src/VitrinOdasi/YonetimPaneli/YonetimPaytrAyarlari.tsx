import React, { useState, useEffect } from 'react';
import { CreditCard, Copy, Check, RefreshCw, CheckCircle2, AlertTriangle, Save } from 'lucide-react';
import {
  useCanliPaytrAyarlari,
  paytrSunucuHazirlikGetir,
  paytrBaglantiTestEt,
  PaytrOperasyonAyarlari
} from '@/src/MalzemeCekmeceleri/Finans/paytrAyarServisi';
import { hukukiDelilDamgalaVeKaydet } from '@/src/MalzemeCekmeceleri/HukukVeSozlesmeler/hukukiDelilServisi';

export const YonetimPaytrAyarlari: React.FC = () => {
  const { ayarlar: canliAyarlar, paytrAyarlariniKaydet } = useCanliPaytrAyarlari();
  const [form, setForm] = useState<PaytrOperasyonAyarlari>(canliAyarlar);
  const [sunucuHazir, setSunucuHazir] = useState<boolean | null>(null);
  const [testYukleniyor, setTestYukleniyor] = useState(false);
  const [testSonucu, setTestSonucu] = useState<{ basarili: boolean; mesaj: string } | null>(null);
  const [kaydedildi, setKaydedildi] = useState(false);
  const [kopyalandi, setKopyalandi] = useState(false);

  const callbackUrl =
    typeof window !== 'undefined' ? `${window.location.origin}/api/paytr/callback` : '/api/paytr/callback';

  useEffect(() => {
    setForm(canliAyarlar);
  }, [canliAyarlar]);

  useEffect(() => {
    paytrSunucuHazirlikGetir().then((s) => setSunucuHazir(s.yapilandirildi));
  }, []);

  const baglantiTestiCalistir = async () => {
    setTestYukleniyor(true);
    setTestSonucu(null);
    const sonuc = await paytrBaglantiTestEt(form.testModu);
    setTestYukleniyor(false);
    setSunucuHazir(!sonuc.yapilandirmaEksik);
    setTestSonucu({ basarili: sonuc.basarili, mesaj: sonuc.mesaj });
  };

  const ayarlariKaydet = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await paytrAyarlariniKaydet(form);
    if (ok) {
      void hukukiDelilDamgalaVeKaydet({
        islemTuru: 'ozel_onay',
        sozlesmeTuru: 'finansal_ayar_degisikligi',
        sozlesmeVersiyonu: '1.0.0',
        ilgiliKayitId: 'paytr_ayarlari',
        onaylandiMi: true,
        ekDetay: {
          ayarGrubu: 'paytr_ayarlari',
          onlineOdemeAktif: form.onlineOdemeAktif,
          testModu: form.testModu,
          taksitAktif: form.taksitAktif,
          maksimumTaksit: form.maksimumTaksit,
          demoSimulasyonAktif: form.demoSimulasyonAktif,
        },
      });
      setKaydedildi(true);
      setTimeout(() => setKaydedildi(false), 3000);
    }
  };

  return (
    <div className="space-y-6 text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-purple-900/40">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-400" />
            <span>Sanal POS (PayTR) Kontrol & Test Merkezi</span>
          </h2>
          <p className="text-xs text-purple-300">
            PayTR gizli anahtarları sunucuda güvenle saklanır; buradan canlı bağlantıyı test edebilir, callback adresini alabilir ve ödeme kurallarını yönetebilirsiniz.
          </p>
        </div>

        <button
          type="button"
          disabled={testYukleniyor}
          onClick={baglantiTestiCalistir}
          className="px-4 py-2.5 rounded-xl bg-blue-950/80 hover:bg-blue-900 border border-blue-500/60 text-blue-200 font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${testYukleniyor ? 'animate-spin' : ''}`} />
          <span>{testYukleniyor ? 'PayTR Test Ediliyor...' : 'PayTR Bağlantısını Test Et (1 TL Token)'}</span>
        </button>
      </div>

      {testSonucu && (
        <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
          testSonucu.basarili
            ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
            : 'bg-amber-950/60 border-amber-500/50 text-amber-200'
        }`}>
          {testSonucu.basarili ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> : <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />}
          <div className="space-y-1">
            <div className="font-black">{testSonucu.basarili ? 'PayTR Bağlantısı Doğrulandı' : 'PayTR Doğrulama Uyarısı'}</div>
            <div>{testSonucu.mesaj}</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form onSubmit={ayarlariKaydet} className="bg-[#1C0722] border border-purple-900/60 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-purple-950">
            <h3 className="text-sm font-black text-white">Ödeme Operasyon Ayarları</h3>
            {kaydedildi && <span className="text-emerald-400 font-bold">Kaydedildi ✓</span>}
          </div>

          <label className="flex items-center justify-between p-3 rounded-xl bg-[#120415] border border-purple-900/60 cursor-pointer">
            <div>
              <div className="font-bold text-white">Sepette Online Kart Ödeme Aktif</div>
              <div className="text-[11px] text-gray-400">Kapatılırsa müşteriye sadece kapıda ödeme seçenekleri görünür.</div>
            </div>
            <input type="checkbox" checked={form.onlineOdemeAktif} onChange={(e) => setForm({ ...form, onlineOdemeAktif: e.target.checked })} className="w-4 h-4 accent-amber-500" />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-[#120415] border border-purple-900/60 cursor-pointer">
            <div>
              <div className="font-bold text-white">PayTR Test Modu (Sandbox)</div>
              <div className="text-[11px] text-gray-400">Gerçek kart çekimi açılmadan önce açık bırakılmalıdır.</div>
            </div>
            <input type="checkbox" checked={form.testModu} onChange={(e) => setForm({ ...form, testModu: e.target.checked })} className="w-4 h-4 accent-amber-500" />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-[#120415] border border-purple-900/60 cursor-pointer">
            <div>
              <div className="font-bold text-white">Demo 3D Secure Simülasyonu (Anahtar Yokken)</div>
              <div className="text-[11px] text-gray-400">Sunucuda PayTR anahtarları tanımlı değilken test siparişi verebilmeyi sağlar.</div>
            </div>
            <input type="checkbox" checked={form.demoSimulasyonAktif} onChange={(e) => setForm({ ...form, demoSimulasyonAktif: e.target.checked })} className="w-4 h-4 accent-amber-500" />
          </label>

          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#120415] border border-purple-900/60">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.taksitAktif} onChange={(e) => setForm({ ...form, taksitAktif: e.target.checked })} className="w-4 h-4 accent-amber-500" />
              <span className="font-bold text-white">Taksit Seçeneği Açık</span>
            </label>
            <select
              value={form.maksimumTaksit}
              disabled={!form.taksitAktif}
              onChange={(e) => setForm({ ...form, maksimumTaksit: Number(e.target.value) })}
              className="bg-[#1C0722] border border-purple-800 rounded-lg px-3 py-1.5 text-white disabled:opacity-40"
            >
              <option value={0}>PayTR Varsayılan Taksit</option>
              <option value={3}>En Fazla 3 Taksit</option>
              <option value={6}>En Fazla 6 Taksit</option>
              <option value={9}>En Fazla 9 Taksit</option>
            </select>
          </div>

          <button type="submit" className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-purple-950 font-black flex items-center justify-center gap-2 cursor-pointer">
            <Save className="w-4 h-4" /><span>Sanal POS Ayarlarını Kaydet</span>
          </button>
        </form>

        <div className="bg-[#1C0722] border border-purple-900/60 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-black text-white pb-3 border-b border-purple-950">PayTR Mağaza Paneli Kurulum Bilgileri</h3>

          <div className="p-3.5 rounded-xl bg-[#120415] border border-purple-900/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-300">Sunucu Secrets Durumu:</span>
              <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                sunucuHazir ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'bg-amber-950 text-amber-300 border border-amber-700'
              }`}>
                {sunucuHazir === null ? 'Kontrol Ediliyor...' : sunucuHazir ? 'PAYTR Anahtarları Tanımlı' : 'Anahtarlar Henüz Girilmemiş'}
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              AI Studio → Secrets (veya sunucu <span className="font-mono text-amber-300">.env</span>) içine <span className="font-mono text-purple-200">PAYTR_MERCHANT_ID</span>, <span className="font-mono text-purple-200">PAYTR_MERCHANT_KEY</span> ve <span className="font-mono text-purple-200">PAYTR_MERCHANT_SALT</span> eklendiğinde otomatik aktif olur.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-gray-300 block">PayTR Bildirim URL (Callback URL)</label>
            <div className="flex gap-2">
              <input type="text" readOnly value={callbackUrl} className="flex-1 bg-[#120415] border border-purple-900/80 rounded-xl px-3 py-2 text-amber-300 font-mono text-[11px]" />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(callbackUrl);
                  setKopyalandi(true);
                  setTimeout(() => setKopyalandi(false), 2000);
                }}
                className="px-3 py-2 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-white font-bold flex items-center gap-1 cursor-pointer"
              >
                {kopyalandi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{kopyalandi ? 'Kopyalandı' : 'Kopyala'}</span>
              </button>
            </div>
            <p className="text-[11px] text-gray-400">Bu adresi PayTR Mağaza Paneli → Ayarlar → Bildirim URL bölümüne yapıştırın.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
