import React, { useState, useEffect } from 'react';
import { X, UserCheck, ShieldCheck, Trash2 } from 'lucide-react';
import { GelAlSubesi } from '@/src/veritabani/VeriTipleri';
import { subeyeMudurAta, subedenMudurKaldir, subeMudurKullanicisiGetir } from '@/src/MalzemeCekmeceleri/Sube/subeYetkiliServisi';
import { SubeMudurFormGirdileri } from './SubeMudurFormGirdileri';

interface MudurModaliProps {
  sube: GelAlSubesi;
  onKapat: () => void;
  onBasarili: (ad: string, telefon: string) => void;
  onKaldirildi?: () => void;
}

export const SubeMudurAtamaModali: React.FC<MudurModaliProps> = ({ sube, onKapat, onBasarili, onKaldirildi }) => {
  const mudurVarMi = Boolean(sube?.yetkili_telefon);
  const [adSoyad, setAdSoyad] = useState(sube?.yetkili_adi || '');
  const [telefon, setTelefon] = useState(sube?.yetkili_telefon || '');
  const [sifre, setSifre] = useState('1234');
  const [yukleniyor, setYukleniyor] = useState(false);
  const [silmeOnayModu, setSilmeOnayModu] = useState(false);

  useEffect(() => {
    if (sube?.yetkili_telefon) {
      subeMudurKullanicisiGetir(sube.yetkili_telefon).then(k => {
        if (k?.sifre) setSifre(k.sifre);
      });
    }
  }, [sube?.yetkili_telefon]);

  const kaydet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adSoyad.trim() || !telefon.trim()) return;
    setYukleniyor(true);
    const subeId = sube.id || sube.kimlik || '';
    const basarili = await subeyeMudurAta({
      sube_id: subeId, sube_adi: sube.ad, ad_soyad: adSoyad, telefon, sifre, eski_telefon: sube.yetkili_telefon
    });
    setYukleniyor(false);
    if (basarili) { onBasarili(adSoyad, telefon); onKapat(); }
  };

  const mudurSil = async () => {
    setYukleniyor(true);
    const subeId = sube.id || sube.kimlik || '';
    const basarili = await subedenMudurKaldir(subeId, sube.yetkili_telefon);
    setYukleniyor(false);
    if (basarili) { onKaldirildi?.(); onKapat(); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#1C0722] border border-blue-500/50 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-purple-900/60">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-black text-white">{mudurVarMi ? 'Müdür Bilgilerini Düzenle' : 'Şube Müdürü Yetkilendir'}</h3>
          </div>
          <button type="button" onClick={onKapat} className="text-purple-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={kaydet} className="space-y-4">
          <SubeMudurFormGirdileri adSoyad={adSoyad} telefon={telefon} sifre={sifre} onAdChange={setAdSoyad} onTelefonChange={setTelefon} onSifreChange={setSifre} />
          <div className="flex items-center justify-between pt-3 border-t border-purple-900/50 gap-2">
            {mudurVarMi ? (
              silmeOnayModu ? (
                <div className="flex items-center gap-1.5">
                  <button type="button" onClick={mudurSil} disabled={yukleniyor}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-600 text-white font-black text-xs hover:bg-red-700 cursor-pointer shadow-lg animate-pulse">
                    <Trash2 className="w-3.5 h-3.5" /><span>{yukleniyor ? 'Siliniyor...' : 'Eminim, Sil'}</span>
                  </button>
                  <button type="button" onClick={() => setSilmeOnayModu(false)} className="px-2 py-1.5 text-xs text-gray-400 hover:text-white cursor-pointer">Vazgeç</button>
                </div>
              ) : (
                <button type="button" onClick={() => setSilmeOnayModu(true)} disabled={yukleniyor}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl bg-red-950/60 text-red-400 hover:bg-red-900/70 border border-red-500/30 font-bold text-xs cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5" /><span>Yetkiyi Kaldır</span>
                </button>
              )
            ) : <div />}
            <div className="flex items-center gap-2">
              <button type="button" onClick={onKapat} className="px-3.5 py-2 rounded-xl bg-purple-900/40 text-gray-300 font-bold text-xs cursor-pointer">İptal</button>
              <button type="submit" disabled={yukleniyor} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-500 text-white font-black text-xs hover:bg-blue-600 disabled:opacity-50 cursor-pointer">
                <ShieldCheck className="w-4 h-4" /><span>{yukleniyor ? 'Kaydediliyor...' : mudurVarMi ? 'Güncelle' : 'sube_admin Yap'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
