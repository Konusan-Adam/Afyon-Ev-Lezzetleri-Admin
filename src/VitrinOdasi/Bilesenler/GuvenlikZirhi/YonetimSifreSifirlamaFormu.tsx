import React, { useState } from 'react';
import { Phone, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { telefonMaskele } from '@/src/MalzemeCekmeceleri/Dogrulama/telefonDogrulayici';
import { yonetimSifreSifirla } from '@/src/MalzemeCekmeceleri/Kimlik/yonetimKimlikServisi';

interface YonetimSifreSifirlamaFormuProps {
  onGeriDon: () => void;
}

export const YonetimSifreSifirlamaFormu: React.FC<YonetimSifreSifirlamaFormuProps> = ({ onGeriDon }) => {
  const [telefon, setTelefon] = useState('');
  const [yeniSifre, setYeniSifre] = useState('');
  const [hataMesaji, setHataMesaji] = useState('');
  const [basariMesaji, setBasariMesaji] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);

  const gonder = async (e: React.FormEvent) => {
    e.preventDefault();
    setHataMesaji('');
    setBasariMesaji('');
    setYukleniyor(true);
    const sonuc = await yonetimSifreSifirla(telefon, 'super_admin', yeniSifre);
    setYukleniyor(false);
    if (!sonuc.basarili) {
      setHataMesaji(sonuc.hata || 'Şifre sıfırlanamadı.');
      return;
    }
    setBasariMesaji('Süper Admin şifresi güncellendi. Yeni şifre ile giriş yapabilirsiniz.');
    setYeniSifre('');
  };

  return (
    <form onSubmit={gonder} className="space-y-4">
      <div className="px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold text-center">
        Süper Admin (telefon_numarasi + super_admin) Şifre Sıfırlama
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-300 mb-1.5">Süper Admin Telefonu</label>
        <div className="relative">
          <Phone className="w-4 h-4 text-purple-400 absolute left-3 top-3" />
          <input
            type="tel"
            value={telefon}
            onChange={(e) => setTelefon(telefonMaskele(e.target.value))}
            placeholder="05XX XXX XX XX"
            maxLength={15}
            required
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#2D0F34] border border-purple-800 text-white font-mono text-sm focus:outline-hidden focus:border-amber-400"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-300 mb-1.5">Yeni Şifre</label>
        <div className="relative">
          <Lock className="w-4 h-4 text-purple-400 absolute left-3 top-3" />
          <input
            type="password"
            value={yeniSifre}
            onChange={(e) => setYeniSifre(e.target.value)}
            placeholder="En az 4 karakter"
            required
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#2D0F34] border border-purple-800 text-white text-sm focus:outline-hidden focus:border-amber-400"
          />
        </div>
      </div>

      {hataMesaji && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{hataMesaji}</span>
        </div>
      )}

      {basariMesaji && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/60 border border-emerald-700/80 text-emerald-300 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{basariMesaji}</span>
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onGeriDon}
          className="px-4 py-3 rounded-xl bg-purple-950/70 hover:bg-purple-900/70 text-gray-300 font-bold text-xs cursor-pointer"
        >
          Girişe Dön
        </button>
        <button
          type="submit"
          disabled={yukleniyor}
          className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-purple-950 font-black text-xs rounded-xl transition-all cursor-pointer disabled:opacity-40"
        >
          {yukleniyor ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
        </button>
      </div>
    </form>
  );
};
