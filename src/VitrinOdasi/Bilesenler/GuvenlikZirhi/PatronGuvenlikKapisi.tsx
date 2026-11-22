import React, { useState } from 'react';
import { Lock, ArrowLeft, AlertCircle, Phone, KeyRound } from 'lucide-react';
import { kullaniciHafizasiKullan } from '@/src/OrtakHavuz/KullaniciHafizasi';
import { telefonMaskele } from '@/src/MalzemeCekmeceleri/Dogrulama/telefonDogrulayici';
import { yonetimYetkisiVarMi } from '@/src/MalzemeCekmeceleri/Kimlik/kullaniciAnahtarYardimcisi';
import { yonetimGirisDogrula } from '@/src/MalzemeCekmeceleri/Kimlik/yonetimKimlikServisi';
import { Kullanici } from '@/src/veritabani/VeriTipleri';
import { YonetimSifreSifirlamaFormu } from './YonetimSifreSifirlamaFormu';

const GUVENLIK_ANAHTARI = 'afyon_patron_guvenlik_muhru';

interface PatronGuvenlikKapisiProps {
  onYetkilendirildi: () => void;
}

export const PatronGuvenlikKapisi: React.FC<PatronGuvenlikKapisiProps> = ({ onYetkilendirildi }) => {
  const { panelDegistir, oturumKullanicisiniAyarla } = kullaniciHafizasiKullan();
  const [telefon, setTelefon] = useState('');
  const [sifre, setSifre] = useState('');
  const [hataMesaji, setHataMesaji] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);
  const [sifirlamaModu, setSifirlamaModu] = useState(false);

  const yonetimGirisiYap = async (e: React.FormEvent) => {
    e.preventDefault();
    setHataMesaji('');
    setYukleniyor(true);
    const sonuc = await yonetimGirisDogrula(telefon, sifre);
    setYukleniyor(false);

    if (!sonuc.basarili || !sonuc.kullanici) {
      setHataMesaji(sonuc.hata || 'Yetkisiz giriş denemesi.');
      return;
    }

    sessionStorage.setItem(GUVENLIK_ANAHTARI, `onaylandi_${sonuc.kullanici.rol}_${Date.now()}`);
    oturumKullanicisiniAyarla(sonuc.kullanici);
    onYetkilendirildi();
  };

  return (
    <div className="min-h-screen bg-[#110514] text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#1F0A24] border border-[#521E5C] rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-amber-300">👑 Süper Admin Giriş Kilidi</h2>
          <p className="text-xs text-gray-300">
            Bu portal yalnızca Süper Admin yetkisine açıktır. Şube müdürü veya diğer roller giriş yapamaz.
          </p>
        </div>

        {sifirlamaModu ? (
          <YonetimSifreSifirlamaFormu onGeriDon={() => setSifirlamaModu(false)} />
        ) : (
          <form onSubmit={yonetimGirisiYap} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">TELEFON NUMARASI</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-purple-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  value={telefon}
                  onChange={(e) => {
                    setHataMesaji('');
                    setTelefon(telefonMaskele(e.target.value));
                  }}
                  placeholder="05XX XXX XX XX"
                  maxLength={15}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#2D0F34] border border-purple-800 text-white font-mono text-sm focus:outline-hidden focus:border-amber-400"
                  autoFocus
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">YÖNETİCİ ŞİFRESİ</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-purple-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={sifre}
                  onChange={(e) => {
                    setHataMesaji('');
                    setSifre(e.target.value);
                  }}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#2D0F34] border border-purple-800 text-white text-sm focus:outline-hidden focus:border-amber-400"
                  required
                />
              </div>
            </div>

            {hataMesaji && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{hataMesaji}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={yukleniyor || !telefon.trim() || !sifre.trim()}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-purple-950 font-black text-sm rounded-xl transition-all cursor-pointer shadow-lg disabled:opacity-40"
            >
              {yukleniyor ? 'Doğrulanıyor...' : 'Yönetim Masasına Giriş Yap'}
            </button>
          </form>
        )}

        <div className="pt-2 border-t border-purple-950/80 flex justify-between items-center text-xs text-gray-400">
          <button
            type="button"
            onClick={() => panelDegistir('vitrin')}
            className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Vitrini İncele</span>
          </button>
          {!sifirlamaModu && (
            <button
              type="button"
              onClick={() => setSifirlamaModu(true)}
              className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
            >
              Şifremi Sıfırla
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const patronGirisOnayliMi = (aktifKullanici?: Kullanici | null): boolean => {
  if (typeof window === 'undefined') return false;
  if (!sessionStorage.getItem(GUVENLIK_ANAHTARI)) return false;
  if (aktifKullanici !== undefined) {
    return yonetimYetkisiVarMi(aktifKullanici?.rol);
  }
  try {
    const kayitli = localStorage.getItem('afyon_oturum_kullanici');
    const kullanici = kayitli ? (JSON.parse(kayitli) as Kullanici) : null;
    return yonetimYetkisiVarMi(kullanici?.rol);
  } catch {
    return false;
  }
};
