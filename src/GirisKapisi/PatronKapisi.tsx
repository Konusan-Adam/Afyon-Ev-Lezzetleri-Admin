import React, { useState } from 'react';
import {
  PatronGuvenlikKapisi,
  patronGirisOnayliMi,
} from '@/src/VitrinOdasi/Bilesenler/GuvenlikZirhi/PatronGuvenlikKapisi';
import { YonetimPaneli } from '@/src/VitrinOdasi/YonetimPaneli/YonetimPaneli';
import { kullaniciHafizasiKullan } from '@/src/OrtakHavuz/KullaniciHafizasi';

/**
 * 👑 Patron & Süper Admin Giriş Kapısı
 * Yalnızca yetkili super_admin oturumu doğrulandığında Patron Masası'nı açar.
 */
export const PatronKapisi: React.FC = () => {
  const { aktifKullanici } = kullaniciHafizasiKullan();
  const [, setGirisAnahtari] = useState(0);

  if (!patronGirisOnayliMi(aktifKullanici)) {
    return <PatronGuvenlikKapisi onYetkilendirildi={() => setGirisAnahtari((s) => s + 1)} />;
  }

  return <YonetimPaneli />;
};
