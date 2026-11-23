import React from 'react';
import { Store } from 'lucide-react';
import { GelAlSubesi, SubeSiparisTipi } from '@/src/veritabani/VeriTipleri';
import { SubeKarti } from './SubeKarti';
import { SubeSaatDurumVerisi } from './SubeCalismaSaatiKontrolu';

interface KartListesiProps {
  subeler: GelAlSubesi[];
  seciliSubeId: string;
  siparisler: SubeSiparisTipi[];
  onSubeSec: (id: string) => void;
  onDurumDegistir: (sube: GelAlSubesi) => void;
  onSaatVeDurumKaydet: (sube: GelAlSubesi, veri: SubeSaatDurumVerisi) => Promise<boolean>;
  onYayinDegistir: (sube: GelAlSubesi) => void;
  onDuzenle: (sube: GelAlSubesi) => void;
  onMudurAta: (sube: GelAlSubesi) => void;
  onSil: (sube: GelAlSubesi) => void;
}

export const SubeKartListesi: React.FC<KartListesiProps> = ({
  subeler,
  seciliSubeId,
  siparisler,
  onSubeSec,
  onDurumDegistir,
  onSaatVeDurumKaydet,
  onYayinDegistir,
  onDuzenle,
  onMudurAta,
  onSil,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Store className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-black text-white">Kayıtlı Gel-Al Şubeleri</h3>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-900/50 text-amber-300 border border-purple-800/50 font-bold">
            {subeler.length} Şube
          </span>
        </div>
        <span className="text-[11px] text-purple-300/80 hidden sm:inline">
          Açık/Kapalı ve saat değişiklikleri ana vitrine anında yansır
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subeler.map((sube, index) => {
          const id = sube.id || sube.kimlik || `sube-${index}`;
          const acikSiparis = siparisler.filter(
            (s) => s.sube_id === id && (s.durum === 'hazirlaniyor' || s.durum === 'teslime_hazir')
          ).length;

          return (
            <SubeKarti
              key={id}
              sube={sube}
              seciliMi={seciliSubeId === id}
              acikSiparisSayisi={acikSiparis}
              onSec={() => onSubeSec(id)}
              onDurumDegistir={() => onDurumDegistir(sube)}
              onSaatVeDurumKaydet={(veri) => onSaatVeDurumKaydet(sube, veri)}
              onYayinDegistir={() => onYayinDegistir(sube)}
              onDuzenle={() => onDuzenle(sube)}
              onMudurAta={() => onMudurAta(sube)}
              onSil={() => onSil(sube)}
            />
          );
        })}
      </div>
    </div>
  );
};
