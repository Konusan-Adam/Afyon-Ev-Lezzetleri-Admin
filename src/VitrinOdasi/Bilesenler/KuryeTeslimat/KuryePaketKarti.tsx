import React, { useState, useEffect } from 'react';
import { Store, User, Bike, Check, KeyRound, QrCode, MapPin, Lock, Clock, Ban, X } from 'lucide-react';

interface Props {
  paket: any;
  kuryeId: string;
  onPaketAl: (id: string, tahminiDakika?: number) => void;
  onPaketiTeslimAldi: (id: string) => void;
  onTeslimEt: (kod: string, pin: string) => void;
  onSiparisiIptalEt?: (id: string, gerekce: string) => void;
  onQrAc?: (kod: string) => void;
  onHaritaAc?: (paket: any) => void;
}

const KURYE_IPTAL_SEBEPLERI = [
  'Müşteriye ulaşılamıyor',
  'Teslimat adresi eksik / hatalı',
  'Araç arızası / yol durumu',
  'Mutfakta paket hazır değil / gecikme',
];

export const KuryePaketKarti: React.FC<Props> = ({
  paket,
  kuryeId,
  onPaketAl,
  onPaketiTeslimAldi,
  onTeslimEt,
  onSiparisiIptalEt,
  onQrAc,
  onHaritaAc,
}) => {
  const [pinGirdisi, setPinGirdisi] = useState('');
  const [pinAcik, setPinAcik] = useState(false);
  const [tahminiDakika, setTahminiDakika] = useState<number>(Number(paket.kurye_tahmini_dakika) || 15);
  const [iptalAcik, setIptalAcik] = useState(false);
  const [iptalGerekcesi, setIptalGerekcesi] = useState(KURYE_IPTAL_SEBEPLERI[0]);
  const [kalanSaniye, setKalanSaniye] = useState<number>(300); // 5 Dakika (300 sn)

  const benimPaketim = paket.kurye_id === kuryeId;
  const paketKodu = String(paket.siparis_kodu || paket.siparisKodu || paket.id || 'SIP-001');
  const teslimAldiMi = Boolean(paket.kurye_teslim_aldi_mi);
  const mutfakTeslimEttiMi = 
    paket.durum === 'yolda' || 
    paket.durum === 'teslim_edildi' || 
    paket.asama === 'kuryede' || 
    paket.asama === 'teslim_edildi';

  const alisZamani = Number(paket.kurye_alis_zamani || Date.now());

  // ⏱️ 5 Dakika Geri Sayım Sayacı (Kurye paketi aldığında başlar)
  useEffect(() => {
    if (benimPaketim && !teslimAldiMi) {
      const interval = setInterval(() => {
        const gecenSureMs = Date.now() - alisZamani;
        const kalanMs = (5 * 60 * 1000) - gecenSureMs;
        const kalanSn = Math.max(0, Math.floor(kalanMs / 1000));
        setKalanSaniye(kalanSn);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [benimPaketim, teslimAldiMi, alisZamani]);

  const dakikaGosterim = Math.floor(kalanSaniye / 60);
  const saniyeGosterim = kalanSaniye % 60;
  const zamanBittiMi = kalanSaniye <= 0;

  return (
    <div className={`p-4 rounded-2xl border shadow-lg space-y-3 text-xs transition-all ${
      zamanBittiMi 
        ? 'bg-rose-950/40 border-rose-500/80' 
        : benimPaketim && !teslimAldiMi
        ? 'bg-[#250D30] border-amber-500/80 ring-1 ring-amber-500/30'
        : 'bg-[#1C0922] border-emerald-500/40'
    }`}>
      {/* 🚨 GÖZE BATAN BÜYÜK 5 DAKİKA GERİ SAYIM SAYACI BANNERI */}
      {benimPaketim && !teslimAldiMi && (
        <div className={`p-3.5 rounded-2xl border-2 shadow-2xl flex items-center justify-between gap-3 transition-all ${
          zamanBittiMi 
            ? 'bg-gradient-to-r from-rose-950 via-red-900 to-rose-950 border-rose-500 animate-bounce' 
            : 'bg-gradient-to-r from-[#3A1048] via-[#521666] to-[#3A1048] border-amber-400 ring-2 ring-amber-500/50 animate-pulse'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 text-amber-300 animate-spin" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-amber-300 block">
                {zamanBittiMi ? '⚠️ SÜRE DOLDU - PAKET HAVUZA DÜŞTÜ!' : '⏱️ MUTFAKTAN TESLİM ALMA SÜRESİ'}
              </span>
              <span className="text-lg sm:text-xl font-black text-white tracking-tight">
                {zamanBittiMi ? '00:00' : `${dakikaGosterim}:${saniyeGosterim < 10 ? '0' : ''}${saniyeGosterim}`}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] bg-amber-400 text-black font-black px-2.5 py-1 rounded-lg uppercase shadow">
              {mutfakTeslimEttiMi ? 'ONAYLANDI' : 'SÜRE İŞLİYOR'}
            </span>
          </div>
        </div>
      )}

      {/* Kart Başlığı */}
      <div className="flex items-center justify-between pb-2 border-b border-purple-900/40">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-bold text-white text-xs">#{paketKodu}</span>
        </div>
        <div className="flex items-center gap-2">
          {teslimAldiMi && onHaritaAc && (
            <button
              type="button"
              onClick={() => onHaritaAc(paket)}
              className="px-2 py-1 rounded-lg bg-purple-900/60 hover:bg-purple-800 text-purple-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <MapPin className="w-3 h-3 text-amber-400" />
              <span>Harita & Rota</span>
            </button>
          )}
          <span className="font-black text-amber-400">{paket.toplam_tutar || paket.tutar || paket.toplamTutar || '0'} ₺</span>
        </div>
      </div>

      {/* Mutfak ve Gizli Müşteri Adresi Bilgisi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="p-2.5 rounded-xl bg-[#240E2A] border border-purple-800/40 space-y-1">
          <span className="text-amber-300 font-bold flex items-center gap-1">
            <Store className="w-3.5 h-3.5" /> Mutfak
          </span>
          <p className="text-gray-300 text-[11px]">{paket.mutfak_adi || paket.mutfakAdi || 'Afyon Ev Mutfağı'}</p>
        </div>

        {/* 🔒 GÜVENLİK KİLİDİ: Teslim Alınana Kadar Adres Gizlidir */}
        <div className={`p-2.5 rounded-xl border space-y-1 ${
          teslimAldiMi 
            ? 'bg-[#240E2A] border-emerald-500/40' 
            : 'bg-stone-900/90 border-amber-500/40'
        }`}>
          <span className={`font-bold flex items-center gap-1 ${teslimAldiMi ? 'text-emerald-300' : 'text-amber-300'}`}>
            {teslimAldiMi ? <User className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            <span>{teslimAldiMi ? 'Müşteri & Açık Adres' : '🔒 Müşteri Adresi (Kilitli)'}</span>
          </span>
          
          {teslimAldiMi ? (
            <p className="text-gray-200 text-[11px]">
              {paket.musteri_adi || paket.musteriAdi || 'Müşteri'} • {paket.teslimat_adresi_metni || paket.teslimatAdresiMetni || paket.adres || 'Afyon Merkez'}
            </p>
          ) : (
            <p className="text-amber-200/80 text-[10px] italic">
              Mutfağa varıp aşağıdan <strong>"Paketi Teslim Aldım"</strong> butonuna bastığınızda müşterinin açık adresi ve telefon bilgisi açılacaktır.
            </p>
          )}
        </div>
      </div>

      {/* Aksiyon Butonları */}
      <div className="pt-2 border-t border-purple-900/40 flex items-center justify-between flex-wrap gap-2">
        <span className="text-[11px] text-purple-300">
          Durum: <strong className="text-amber-300">{paket.durum_aciklamasi || paket.durumAciklamasi || 'Mutfakta hazır, kurye bekleniyor.'}</strong>
        </span>

        {!benimPaketim ? (
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={tahminiDakika}
              onChange={(e) => setTahminiDakika(Number(e.target.value) || 15)}
              className="bg-[#14071A] border border-purple-700/70 rounded-xl px-2.5 py-1.5 text-[11px] font-bold text-amber-300 focus:outline-none focus:border-amber-400"
              title="Tahmini varış süresi"
            >
              <option value={10}>~10 dk</option>
              <option value={15}>~15 dk</option>
              <option value={20}>~20 dk</option>
              <option value={30}>~30 dk</option>
            </select>
            <button
              type="button"
              onClick={() => onPaketAl(paket.id, tahminiDakika)}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95"
            >
              <Bike className="w-3.5 h-3.5" />
              <span>Paketi Kabul Et & Al</span>
            </button>
          </div>
        ) : !teslimAldiMi ? (
          <div className="flex items-center gap-2 flex-wrap">
            {mutfakTeslimEttiMi ? (
              <button
                type="button"
                onClick={() => onPaketiTeslimAldi(paket.id)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black flex items-center gap-1.5 shadow-lg shadow-emerald-950/50 cursor-pointer transition-all border border-emerald-400/50 active:scale-95 animate-pulse"
              >
                <Check className="w-4 h-4 text-emerald-200" />
                <span>📦 PAKETİ TESLİM ALDIM (Adresi Aç)</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/70 border border-amber-500/50 text-amber-300 text-[11px] font-bold">
                <Clock className="w-3.5 h-3.5 animate-spin" />
                <span>Mutfağın "Kuryeye Teslim Edildi" demesi bekleniyor...</span>
              </div>
            )}
            {onSiparisiIptalEt && (
              <button
                type="button"
                onClick={() => setIptalAcik(!iptalAcik)}
                className="px-3 py-1.5 rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-700/60 text-rose-200 font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>İptal</span>
              </button>
            )}
          </div>
        ) : !pinAcik ? (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => onQrAc?.(paketKodu)}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>QR Kod Tara 📷</span>
            </button>
            <button
              type="button"
              onClick={() => setPinAcik(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>PIN Gir</span>
            </button>
            {onSiparisiIptalEt && (
              <button
                type="button"
                onClick={() => setIptalAcik(!iptalAcik)}
                className="px-3 py-1.5 rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-700/60 text-rose-200 font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>İptal</span>
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              maxLength={4}
              placeholder="4 Haneli PIN"
              value={pinGirdisi}
              onChange={(e) => setPinGirdisi(e.target.value)}
              className="w-24 bg-purple-950 border border-amber-500 rounded-lg px-2 py-1 text-center font-black text-amber-300 text-xs focus:outline-none"
            />
            <button
              type="button"
              onClick={() => {
                onTeslimEt(paketKodu, pinGirdisi.trim());
                setPinGirdisi('');
              }}
              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer transition-colors"
            >
              Onayla
            </button>
            <button
              type="button"
              onClick={() => setPinAcik(false)}
              className="px-2 py-1 rounded-lg bg-purple-900/60 hover:bg-purple-900 text-gray-300 text-xs cursor-pointer"
            >
              İptal
            </button>
          </div>
        )}
      </div>

      {/* Kurye Sipariş İptal Alanı (iptal_kaynagi: 'kurye') */}
      {iptalAcik && onSiparisiIptalEt && (
        <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/50 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-200 flex items-center gap-1.5">
              <Ban className="w-3.5 h-3.5 text-rose-400" />
              Siparişi İptal Et (#{paketKodu})
            </span>
            <button
              type="button"
              onClick={() => setIptalAcik(false)}
              className="text-rose-300 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {KURYE_IPTAL_SEBEPLERI.map((sebep) => (
              <button
                key={sebep}
                type="button"
                onClick={() => setIptalGerekcesi(sebep)}
                className={`px-2 py-1 rounded-lg text-[10px] font-semibold border cursor-pointer ${
                  iptalGerekcesi === sebep
                    ? 'bg-rose-600 border-rose-400 text-white'
                    : 'bg-[#180A1F] border-rose-900/60 text-rose-200/80'
                }`}
              >
                {sebep}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={iptalGerekcesi}
            onChange={(e) => setIptalGerekcesi(e.target.value)}
            placeholder="İptal gerekçesi yazın..."
            className="w-full bg-[#120415] border border-rose-800/70 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-rose-400"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIptalAcik(false)}
              className="px-3 py-1 rounded-lg bg-purple-950 text-gray-300 text-[11px] font-bold cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="button"
              onClick={() => {
                onSiparisiIptalEt(paket.id, iptalGerekcesi);
                setIptalAcik(false);
              }}
              className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold cursor-pointer"
            >
              İptali Onayla
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
