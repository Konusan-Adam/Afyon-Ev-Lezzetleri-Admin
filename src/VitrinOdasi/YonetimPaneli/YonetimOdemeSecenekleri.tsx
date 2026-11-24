import React, { useState, useEffect } from 'react';
import { Banknote, CreditCard, ShieldCheck, Save, AlertTriangle } from 'lucide-react';
import {
  useCanliOdemeSecenekleri,
  type OdemeSecenekleriAyarlari,
  type OdemeSecenekTipi,
} from '@/src/MalzemeCekmeceleri/Finans/odemeSecenekleriServisi';
import { useCanliPaytrAyarlari } from '@/src/MalzemeCekmeceleri/Finans/paytrAyarServisi';
import { hukukiDelilDamgalaVeKaydet } from '@/src/MalzemeCekmeceleri/HukukVeSozlesmeler/hukukiDelilServisi';

export const YonetimOdemeSecenekleri: React.FC = () => {
  const { secenekler: canliSecenekler, odemeSecenekleriniKaydet } = useCanliOdemeSecenekleri();
  const { ayarlar: canliPaytr, paytrAyarlariniKaydet } = useCanliPaytrAyarlari();

  const [form, setForm] = useState<OdemeSecenekleriAyarlari>(canliSecenekler);
  const [onlineAktif, setOnlineAktif] = useState<boolean>(canliPaytr.onlineOdemeAktif);
  const [hataMesaji, setHataMesaji] = useState('');
  const [kaydedildi, setKaydedildi] = useState(false);

  useEffect(() => {
    setForm(canliSecenekler);
  }, [canliSecenekler]);

  useEffect(() => {
    setOnlineAktif(canliPaytr.onlineOdemeAktif);
  }, [canliPaytr.onlineOdemeAktif]);

  const gecerliVarsayilanSec = (
    nakit: boolean,
    kart: boolean,
    online: boolean,
    mevcut: OdemeSecenekTipi
  ): OdemeSecenekTipi => {
    if (mevcut === 'kapida_nakit' && nakit) return 'kapida_nakit';
    if (mevcut === 'kapida_kart' && kart) return 'kapida_kart';
    if (mevcut === 'online_cuzdan' && online) return 'online_cuzdan';
    if (nakit) return 'kapida_nakit';
    if (kart) return 'kapida_kart';
    return 'online_cuzdan';
  };

  const ayarlariKaydet = async (e: React.FormEvent) => {
    e.preventDefault();
    setHataMesaji('');

    if (!form.kapidaNakitAktif && !form.kapidaKartAktif && !onlineAktif) {
      setHataMesaji('Müşterilerin sipariş verebilmesi için en az bir ödeme seçeneği aktif olmalıdır.');
      return;
    }

    const duzeltilmisVarsayilan = gecerliVarsayilanSec(
      form.kapidaNakitAktif,
      form.kapidaKartAktif,
      onlineAktif,
      form.varsayilanYontem
    );

    const [secenekOk, paytrOk] = await Promise.all([
      odemeSecenekleriniKaydet({ ...form, varsayilanYontem: duzeltilmisVarsayilan }),
      paytrAyarlariniKaydet({ ...canliPaytr, onlineOdemeAktif: onlineAktif }),
    ]);

    if (secenekOk && paytrOk) {
      void hukukiDelilDamgalaVeKaydet({
        islemTuru: 'ozel_onay',
        sozlesmeTuru: 'finansal_ayar_degisikligi',
        sozlesmeVersiyonu: '1.0.0',
        ilgiliKayitId: 'odeme_secenekleri',
        onaylandiMi: true,
        ekDetay: {
          ayarGrubu: 'odeme_secenekleri',
          kapidaNakitAktif: form.kapidaNakitAktif,
          kapidaKartAktif: form.kapidaKartAktif,
          onlineOdemeAktif: onlineAktif,
          varsayilanYontem: duzeltilmisVarsayilan,
        },
      });
      setKaydedildi(true);
      setTimeout(() => setKaydedildi(false), 3000);
    } else {
      setHataMesaji('Ayarlar kaydedilirken bir bağlantı sorunu oluştu.');
    }
  };

  return (
    <div className="space-y-6 text-xs">
      <div className="pb-4 border-b border-purple-900/40">
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-amber-400" />
          <span>Sepet Ödeme Seçenekleri Yönetimi</span>
        </h2>
        <p className="text-xs text-purple-300 mt-1">
          Müşterinin sepet ve sipariş adımında göreceği tüm ödeme yöntemlerini canlı olarak açıp kapatabilir ve varsayılan seçimi belirleyebilirsiniz.
        </p>
      </div>

      {hataMesaji && (
        <div className="p-4 rounded-2xl border bg-amber-950/60 border-amber-500/50 text-amber-200 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <span>{hataMesaji}</span>
        </div>
      )}

      <form onSubmit={ayarlariKaydet} className="bg-[#1C0722] border border-purple-900/60 rounded-2xl p-6 space-y-4 max-w-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-purple-950">
          <h3 className="text-sm font-black text-white">Aktif Ödeme Yöntemleri</h3>
          {kaydedildi && <span className="text-emerald-400 font-bold">Kaydedildi ✓</span>}
        </div>

        <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#120415] border border-purple-900/60 cursor-pointer">
          <div className="flex items-center gap-3">
            <Banknote className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="font-bold text-white">Kapıda Nakit Ödeme</div>
              <div className="text-[11px] text-gray-400">Teslimat sırasında kuryeye nakit ödeme seçeneği.</div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={form.kapidaNakitAktif}
            onChange={(e) => setForm({ ...form, kapidaNakitAktif: e.target.checked })}
            className="w-4 h-4 accent-amber-500"
          />
        </label>

        <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#120415] border border-purple-900/60 cursor-pointer">
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-blue-400 shrink-0" />
            <div>
              <div className="font-bold text-white">Kapıda Kredi / Banka Kartı (POS)</div>
              <div className="text-[11px] text-gray-400">Kuryenin getireceği mobil POS cihazı ile kapıda ödeme.</div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={form.kapidaKartAktif}
            onChange={(e) => setForm({ ...form, kapidaKartAktif: e.target.checked })}
            className="w-4 h-4 accent-amber-500"
          />
        </label>

        <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#120415] border border-purple-900/60 cursor-pointer">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="font-bold text-white">Online Kredi Kartı / Cüzdan (PayTR 3D)</div>
              <div className="text-[11px] text-gray-400">Sanal POS (PayTR) üzerinden anında online kart ödemesi.</div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={onlineAktif}
            onChange={(e) => setOnlineAktif(e.target.checked)}
            className="w-4 h-4 accent-amber-500"
          />
        </label>

        <div className="p-3.5 rounded-xl bg-[#120415] border border-purple-900/60 space-y-2">
          <label className="font-bold text-white block">Sipariş Ekranı Varsayılan Yöntemi</label>
          <select
            value={gecerliVarsayilanSec(form.kapidaNakitAktif, form.kapidaKartAktif, onlineAktif, form.varsayilanYontem)}
            onChange={(e) => setForm({ ...form, varsayilanYontem: e.target.value as OdemeSecenekTipi })}
            className="w-full bg-[#1C0722] border border-purple-800 rounded-xl px-3 py-2 text-white"
          >
            {form.kapidaNakitAktif && <option value="kapida_nakit">Kapıda Nakit Ödeme</option>}
            {form.kapidaKartAktif && <option value="kapida_kart">Kapıda Kredi / Banka Kartı</option>}
            {onlineAktif && <option value="online_cuzdan">Online Kredi Kartı / Cüzdan (PayTR)</option>}
          </select>
        </div>

        <button
          type="submit"
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-purple-950 font-black flex items-center justify-center gap-2 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Ödeme Seçeneklerini Kaydet</span>
        </button>
      </form>
    </div>
  );
};
