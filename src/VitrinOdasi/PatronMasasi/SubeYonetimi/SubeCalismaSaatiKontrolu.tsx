import React, { useState, useEffect } from 'react';
import { Clock, Check, AlertCircle } from 'lucide-react';
import { GelAlSubesi } from '@/src/veritabani/VeriTipleri';

export interface SubeSaatDurumVerisi {
  acik_mi: boolean;
  acilis_saati: string;
  kapanis_saati: string;
  calisma_saatleri: string;
}

interface SubeCalismaSaatiKontroluProps {
  sube: GelAlSubesi;
  onKaydet: (veri: SubeSaatDurumVerisi) => Promise<boolean>;
}

function saatleriAyristir(sube: GelAlSubesi): { acilis: string; kapanis: string } {
  if (sube.acilis_saati && sube.kapanis_saati) {
    return { acilis: sube.acilis_saati, kapanis: sube.kapanis_saati };
  }
  const parcalar = (sube.calisma_saatleri || '').split('-').map((s) => s.trim());
  const saatDeseni = /^\d{2}:\d{2}$/;
  return {
    acilis: saatDeseni.test(parcalar[0] || '') ? parcalar[0] : '08:30',
    kapanis: saatDeseni.test(parcalar[1] || '') ? parcalar[1] : '22:00',
  };
}

export const SubeCalismaSaatiKontrolu: React.FC<SubeCalismaSaatiKontroluProps> = ({ sube, onKaydet }) => {
  const baslangic = saatleriAyristir(sube);
  const [acikMi, setAcikMi] = useState<boolean>(sube.acik_mi !== false);
  const [acilisSaati, setAcilisSaati] = useState<string>(baslangic.acilis);
  const [kapanisSaati, setKapanisSaati] = useState<string>(baslangic.kapanis);
  const [kaydediliyor, setKaydediliyor] = useState<boolean>(false);
  const [durumMesaji, setDurumMesaji] = useState<'basarili' | 'hata' | null>(null);

  useEffect(() => {
    const guncel = saatleriAyristir(sube);
    setAcikMi(sube.acik_mi !== false);
    setAcilisSaati(guncel.acilis);
    setKapanisSaati(guncel.kapanis);
  }, [sube.acik_mi, sube.acilis_saati, sube.kapanis_saati, sube.calisma_saatleri]);

  const degisikligiYaz = async (hedefAcik: boolean, acilis: string, kapanis: string) => {
    setKaydediliyor(true);
    setDurumMesaji(null);
    const basarili = await onKaydet({
      acik_mi: hedefAcik,
      acilis_saati: acilis,
      kapanis_saati: kapanis,
      calisma_saatleri: `${acilis} - ${kapanis}`,
    });
    setKaydediliyor(false);
    setDurumMesaji(basarili ? 'basarili' : 'hata');
    if (basarili) setTimeout(() => setDurumMesaji(null), 2000);
  };

  const anahtarDegistir = () => {
    const yeniAcik = !acikMi;
    setAcikMi(yeniAcik);
    degisikligiYaz(yeniAcik, acilisSaati, kapanisSaati);
  };

  return (
    <div className="p-2.5 rounded-xl bg-[#120415] border border-purple-900/50 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold text-purple-200 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Anlık Şube Durumu</span>
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={acikMi}
          disabled={kaydediliyor}
          onClick={anahtarDegistir}
          className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-black border transition-all cursor-pointer disabled:opacity-50 ${
            acikMi
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
              : 'bg-rose-950/80 text-rose-300 border-rose-500/50'
          }`}
        >
          <span>{acikMi ? 'Açık' : 'Kapalı'}</span>
          <span className={`w-7 h-4 rounded-full p-0.5 flex items-center transition-colors ${acikMi ? 'bg-emerald-500 justify-end' : 'bg-rose-600 justify-start'}`}>
            <span className="w-3 h-3 rounded-full bg-white shadow" />
          </span>
        </button>
      </div>

      <div className="grid grid-cols-[1fr_1fr_auto] items-end gap-1.5">
        <div>
          <label className="block text-[10px] font-semibold text-gray-400 mb-0.5">Açılış</label>
          <input
            type="time"
            value={acilisSaati}
            onChange={(e) => setAcilisSaati(e.target.value)}
            className="w-full bg-[#1C0722] border border-purple-800/70 rounded-lg px-2 py-1 text-[11px] text-white font-mono focus:outline-hidden focus:border-amber-400"
          />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-gray-400 mb-0.5">Kapanış</label>
          <input
            type="time"
            value={kapanisSaati}
            onChange={(e) => setKapanisSaati(e.target.value)}
            className="w-full bg-[#1C0722] border border-purple-800/70 rounded-lg px-2 py-1 text-[11px] text-white font-mono focus:outline-hidden focus:border-amber-400"
          />
        </div>
        <button
          type="button"
          disabled={kaydediliyor || !acilisSaati || !kapanisSaati}
          onClick={() => degisikligiYaz(acikMi, acilisSaati, kapanisSaati)}
          className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-[11px] transition-all cursor-pointer disabled:opacity-50"
        >
          {kaydediliyor ? '...' : 'Kaydet'}
        </button>
      </div>

      {durumMesaji === 'basarili' && (
        <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
          <Check className="w-3 h-3" />
          <span>Durum ve çalışma saatleri canlı güncellendi.</span>
        </p>
      )}
      {durumMesaji === 'hata' && (
        <p className="text-[10px] text-rose-400 font-semibold flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          <span>Kaydedilemedi, lütfen tekrar deneyin.</span>
        </p>
      )}
    </div>
  );
};
