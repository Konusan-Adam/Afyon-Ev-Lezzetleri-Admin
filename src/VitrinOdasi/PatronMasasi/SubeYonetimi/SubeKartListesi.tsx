import React from 'react';
import { GelAlSubesi, SubeSiparisTipi } from '@/src/veritabani/VeriTipleri';
import { SubeKarti } from './SubeKarti';

interface KartListesiProps {
  subeler: GelAlSubesi[];
  seciliSubeId: string;
  siparisler: SubeSiparisTipi[];
  onSubeSec: (id: string) => void;
  onDurumDegistir: (sube: GelAlSubesi) => void;
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
  onYayinDegistir,
  onDuzenle,
  onMudurAta,
  onSil
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {subeler.map((sube, index) => {
        const id = sube.id || sube.kimlik || `sube-${index}`;
        const acikSiparis = siparisler.filter(
          s => s.sube_id === id && (s.durum === 'hazirlaniyor' || s.durum === 'teslime_hazir')
        ).length;

        return (
          <SubeKarti
            key={id}
            sube={sube}
            seciliMi={seciliSubeId === id}
            acikSiparisSayisi={acikSiparis}
            onSec={() => onSubeSec(id)}
            onDurumDegistir={() => onDurumDegistir(sube)}
            onYayinDegistir={() => onYayinDegistir(sube)}
            onDuzenle={() => onDuzenle(sube)}
            onMudurAta={() => onMudurAta(sube)}
            onSil={() => onSil(sube)}
          />
        );
      })}
    </div>
  );
};
