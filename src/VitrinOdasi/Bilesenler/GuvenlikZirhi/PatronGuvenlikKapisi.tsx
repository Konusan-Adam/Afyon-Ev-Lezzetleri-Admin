import React, { useState } from 'react';
import { ShieldCheck, Lock, ArrowLeft, AlertCircle } from 'lucide-react';
import { kullaniciHafizasiKullan } from '@/src/OrtakHavuz/KullaniciHafizasi';

const GUVENLIK_ANAHTARI = 'afyon_patron_guvenlik_muhru';
const VARSAYILAN_PIN = '0303'; // Afyonkarahisar Plaka Kodu

interface PatronGuvenlikKapisiProps {
  onYetkilendirildi: () => void;
}

export const PatronGuvenlikKapisi: React.FC<PatronGuvenlikKapisiProps> = ({ onYetkilendirildi }) => {
  const { panelDegistir } = kullaniciHafizasiKullan();
  const [girilenPin, setGirilenPin] = useState('');
  const [hataMesaji, setHataMesaji] = useState('');
  const [hataliDenemeSayisi, setHataliDenemeSayisi] = useState(0);

  const pinDogrula = (e: React.FormEvent) => {
    e.preventDefault();
    if (hataliDenemeSayisi >= 3) {
      setHataMesaji('Çok fazla hatalı deneme! Lütfen 1 dakika bekleyiniz.');
      return;
    }

    const kayitliPin = localStorage.getItem('afyon_patron_ozel_pin') || VARSAYILAN_PIN;
    if (girilenPin === kayitliPin) {
      sessionStorage.setItem(GUVENLIK_ANAHTARI, 'onaylandi_' + Date.now());
      onYetkilendirildi();
    } else {
      const yeniSayi = hataliDenemeSayisi + 1;
      setHataliDenemeSayisi(yeniSayi);
      setHataMesaji(`Hatalı Güvenlik PIN'i! Kalan hak: ${3 - yeniSayi}`);
      setGirilenPin('');
    }
  };

  return (
    <div className="min-h-screen bg-[#110514] text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#1F0A24] border border-[#521E5C] rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-amber-300">👑 Patron Yönetim Masası</h2>
          <p className="text-xs text-gray-300">Bu alan yüksek güvenlikli yönetim bölgesidir. Lütfen 4 haneli Güvenlik PIN'inizi giriniz.</p>
        </div>

        <form onSubmit={pinDogrula} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5 text-center">GÜVENLİK PIN KODU</label>
            <input
              type="password"
              maxLength={4}
              value={girilenPin}
              onChange={(e) => setGirilenPin(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              className="w-full text-center text-2xl tracking-[1em] py-3 rounded-xl bg-[#2D0F34] border border-purple-800 text-white font-mono focus:outline-hidden focus:border-amber-400"
              autoFocus
            />
          </div>

          {hataMesaji && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{hataMesaji}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={girilenPin.length !== 4}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-purple-950 font-black text-sm rounded-xl transition-all cursor-pointer shadow-lg disabled:opacity-40"
          >
            Masaya Giriş Yap
          </button>
        </form>

        <div className="pt-2 border-t border-purple-950/80 flex justify-between items-center text-xs text-gray-400">
          <button
            type="button"
            onClick={() => panelDegistir('vitrin')}
            className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Vitrini İncele</span>
          </button>
          <span className="text-[10px] text-amber-500/60 font-mono">Varsayılan: 0303</span>
        </div>
      </div>
    </div>
  );
};

export const patronGirisOnayliMi = (): boolean => {
  if (typeof window === 'undefined') return false;
  return Boolean(sessionStorage.getItem(GUVENLIK_ANAHTARI));
};
