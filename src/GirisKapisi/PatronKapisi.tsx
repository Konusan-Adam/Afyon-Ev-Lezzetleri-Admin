import React, { useState } from 'react';
import { PatronGuvenlikKapisi, patronGirisOnayliMi } from '@/src/VitrinOdasi/Bilesenler/GuvenlikZirhi/PatronGuvenlikKapisi';
import { YonetimPaneli } from '@/src/VitrinOdasi/YonetimPaneli/YonetimPaneli';

/**
 * 👑 Patron & Yönetim Giriş Kapısı
 * Şifre onayını kontrol eder; yetkilendirildiğinde Yönetim Paneli'ni açar.
 */
export const PatronKapisi: React.FC = () => {
  const [patronOnayli, setPatronOnayli] = useState<boolean>(() => patronGirisOnayliMi());

  if (!patronOnayli && !patronGirisOnayliMi()) {
    return <PatronGuvenlikKapisi onYetkilendirildi={() => setPatronOnayli(true)} />;
  }

  return <YonetimPaneli />;
};
