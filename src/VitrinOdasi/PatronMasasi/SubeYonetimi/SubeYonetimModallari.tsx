import React from 'react';
import { GelAlSubesi } from '@/src/veritabani/VeriTipleri';
import { SubeDuzenleModali } from './SubeDuzenleModali';
import { SubeMudurAtamaModali } from './SubeMudurAtamaModali';

interface ModallarProps {
  duzenleModalAcik: boolean;
  duzenlenenSube: GelAlSubesi | null;
  onDuzenleKapat: () => void;
  onKaydet: (veri: Partial<GelAlSubesi>) => Promise<void>;
  mudurModalSube: GelAlSubesi | null;
  onMudurKapat: () => void;
  onMudurAtandi: (ad: string, telefon: string) => void;
  onMudurKaldirildi?: () => void;
}

export const SubeYonetimModallari: React.FC<ModallarProps> = ({
  duzenleModalAcik,
  duzenlenenSube,
  onDuzenleKapat,
  onKaydet,
  mudurModalSube,
  onMudurKapat,
  onMudurAtandi,
  onMudurKaldirildi
}) => (
  <>
    {duzenleModalAcik && (
      <SubeDuzenleModali
        acikMi={duzenleModalAcik}
        duzenlenen={duzenlenenSube}
        onKapat={onDuzenleKapat}
        onKaydet={onKaydet}
      />
    )}
    {mudurModalSube && (
      <SubeMudurAtamaModali
        sube={mudurModalSube}
        onKapat={onMudurKapat}
        onBasarili={onMudurAtandi}
        onKaldirildi={onMudurKaldirildi}
      />
    )}
  </>
);
