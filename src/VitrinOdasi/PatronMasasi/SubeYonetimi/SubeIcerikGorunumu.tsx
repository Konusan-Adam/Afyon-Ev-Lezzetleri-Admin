import React from 'react';
import { GelAlSubesi, SubeSiparisTipi } from '@/src/veritabani/VeriTipleri';
import { SubeAltSekme } from './SubeAltNavigasyon';
import { SubeKartListesi } from './SubeKartListesi';
import { SubeStokDenetimi } from './SubeStokDenetimi';
import { SubeSiparisListesi } from './SubeSiparisListesi';
import { SubeSaatDurumVerisi } from './SubeCalismaSaatiKontrolu';

interface IcerikProps {
  altSekme: SubeAltSekme;
  subeler: GelAlSubesi[];
  seciliSubeId: string;
  seciliSubeAdi: string;
  siparisler: SubeSiparisTipi[];
  onSubeSec: (id: string) => void;
  onDurumDegistir: (sube: GelAlSubesi) => void;
  onSaatVeDurumKaydet: (sube: GelAlSubesi, veri: SubeSaatDurumVerisi) => Promise<boolean>;
  onYayinDegistir: (sube: GelAlSubesi) => void;
  onDuzenle: (sube: GelAlSubesi) => void;
  onMudurAta: (sube: GelAlSubesi) => void;
  onSil: (sube: GelAlSubesi) => void;
}

export const SubeIcerikGorunumu: React.FC<IcerikProps> = ({
  altSekme, subeler, seciliSubeId, seciliSubeAdi, siparisler,
  onSubeSec, onDurumDegistir, onSaatVeDurumKaydet, onYayinDegistir, onDuzenle, onMudurAta, onSil
}) => {
  if (altSekme === 'stoklar') {
    return <SubeStokDenetimi seciliSubeId={seciliSubeId} subeAdi={seciliSubeAdi} />;
  }
  if (altSekme === 'siparisler') {
    return <SubeSiparisListesi seciliSubeId={seciliSubeId} subeAdi={seciliSubeAdi} />;
  }
  return (
    <SubeKartListesi
      subeler={subeler}
      seciliSubeId={seciliSubeId}
      siparisler={siparisler}
      onSubeSec={onSubeSec}
      onDurumDegistir={onDurumDegistir}
      onSaatVeDurumKaydet={onSaatVeDurumKaydet}
      onYayinDegistir={onYayinDegistir}
      onDuzenle={onDuzenle}
      onMudurAta={onMudurAta}
      onSil={onSil}
    />
  );
};
