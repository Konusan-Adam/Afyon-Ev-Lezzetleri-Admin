import React from 'react';
import { Store, Clock, Phone, Video, ShieldCheck, UserCheck, Power, Edit3, Trash2, CheckCircle } from 'lucide-react';
import { GelAlSubesi } from '@/src/veritabani/VeriTipleri';

interface SubeKartiProps {
  sube: GelAlSubesi;
  seciliMi: boolean;
  acikSiparisSayisi: number;
  onSec: () => void;
  onDurumDegistir: () => void;
  onYayinDegistir: () => void;
  onDuzenle: () => void;
  onMudurAta: () => void;
  onSil: () => void;
}

export const SubeKarti: React.FC<SubeKartiProps> = ({
  sube,
  seciliMi,
  acikSiparisSayisi,
  onSec,
  onDurumDegistir,
  onYayinDegistir,
  onDuzenle,
  onMudurAta,
  onSil
}) => {
  const aktif = sube.acik_mi !== false;
  const yayinVar = sube.canli_yayin_aktif_mi === true;

  return (
    <div className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 shadow-lg ${
      seciliMi ? 'border-amber-400 bg-[#240A2C] ring-2 ring-amber-400/30' : 'border-purple-900/60 bg-[#180A1F]'
    }`}>
      <div className="space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={onSec}>
            <div className={`p-2.5 rounded-xl ${aktif ? 'bg-amber-500/20 text-amber-300' : 'bg-red-500/20 text-red-400'}`}>
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white hover:text-amber-300 transition-colors">{sube.ad}</h3>
              <p className="text-[11px] text-purple-300">{sube.ilce || 'Merkez'} • {sube.mahalle || 'Afyon'}</p>
            </div>
          </div>
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border flex items-center gap-1 ${
            aktif ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' : 'bg-red-950/80 text-red-300 border-red-500/40'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${aktif ? 'bg-emerald-400' : 'bg-red-400'}`} />
            {aktif ? 'Açık' : 'Kapalı'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px] py-1 border-y border-purple-900/30">
          <div className="flex items-center gap-1 text-purple-300">
            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{sube.acilis_saati && sube.kapanis_saati ? `${sube.acilis_saati} - ${sube.kapanis_saati}` : sube.calisma_saatleri || '08:30 - 22:00'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-300 font-semibold justify-end">
            <span className="text-amber-400 font-black">★ {sube.puan || 4.9}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />{sube.hijyen_puani || 98}/100</span>
          </div>
          <div className="flex items-center gap-1 text-purple-300">
            <Phone className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span>{sube.telefon || 'Tel Yok'}</span>
          </div>
          <div className="flex items-center gap-1 text-amber-300 font-bold justify-end">
            <span>⚡ {acikSiparisSayisi} Açık Sipariş</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-1">
          <div className="text-[11px] text-gray-300 flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>{sube.yetkili_adi || 'Müdür Atanmadı'}</span>
          </div>
          <button
            type="button"
            onClick={onYayinDegistir}
            className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
              yayinVar ? 'bg-rose-950/80 text-rose-300 border border-rose-600/50' : 'bg-purple-950/60 text-gray-400 border border-purple-900/40'
            }`}
          >
            <Video className="w-3 h-3 text-rose-400" />
            <span>{yayinVar ? 'Canlı Mutfak Açık' : 'Yayın Kapalı'}</span>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-purple-950/80 gap-1.5">
        <button
          type="button"
          onClick={onSec}
          className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer flex items-center gap-1 transition-all ${
            seciliMi ? 'bg-amber-400 text-purple-950' : 'bg-purple-900/50 hover:bg-purple-900 text-purple-200'
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5" />
          <span>{seciliMi ? 'Seçili Şube' : 'Yönet & İncele'}</span>
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onDurumDegistir}
            title={aktif ? 'Şubeyi Kapat' : 'Şubeyi Aç'}
            className="p-1.5 rounded-lg bg-purple-900/40 hover:bg-purple-800 text-purple-300 cursor-pointer"
          >
            <Power className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onMudurAta}
            title={sube.yetkili_telefon ? 'Müdür Bilgilerini Düzenle / Yetkiyi Kaldır' : 'Müdür Yetkilendir'}
            className="p-1.5 rounded-lg bg-blue-950/50 hover:bg-blue-900/60 text-blue-300 cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onDuzenle}
            title="Bilgileri Düzenle"
            className="p-1.5 rounded-lg bg-purple-900/40 hover:bg-purple-800 text-purple-300 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onSil}
            title="Şubeyi Kaldır"
            className="p-1.5 rounded-lg bg-red-950/50 hover:bg-red-900/60 text-red-400 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
