import React from 'react';
import { SubeYonetimSekmesi, type SubeYonlendirmeBilgisi } from '../PatronMasasi/SubeYonetimi/SubeYonetimSekmesi';

interface YonetimGelAlSubeleriProps {
  subeYonlendirme?: SubeYonlendirmeBilgisi | null;
}

export const YonetimGelAlSubeleri: React.FC<YonetimGelAlSubeleriProps> = ({ subeYonlendirme }) => {
  return <SubeYonetimSekmesi subeYonlendirme={subeYonlendirme} />;
};
