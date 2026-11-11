import React from 'react';
import { kullaniciHafizasiKullan } from '@/src/OrtakHavuz/KullaniciHafizasi';
import { AnaSayfaVitrini } from '@/src/VitrinOdasi/AnaSayfaVitrini';
import { MutfakPaneli } from '@/src/VitrinOdasi/MutfakPaneli/MutfakPaneli';
import { KuryePaneli } from '@/src/VitrinOdasi/KuryePaneli/KuryePaneli';
import { MusteriPaneli } from '@/src/VitrinOdasi/MusteriPaneli/MusteriPaneli';
import { PatronKapisi } from './PatronKapisi';
import { ApkGecisBari } from './ApkGecisBari';

/**
 * 🚪 Ana Giriş Kapısı (Router & Dağıtıcı)
 * Sistemin 4 bağımsız APK / Web portalını yönetir:
 * 1. Müşteri Ana Vitrini (/)
 * 2. Mutfak Paneli (/mutfak)
 * 3. Kurye Kokpiti (/kurye)
 * 4. Patron / Admin Paneli (/admin)
 */
export const AnaKapi: React.FC = () => {
  const { goruntulenenPanel } = kullaniciHafizasiKullan();

  const seciliOdayiGoster = () => {
    switch (goruntulenenPanel) {
      case 'patron':
        return <PatronKapisi />;
      case 'mutfak':
        return <MutfakPaneli />;
      case 'kurye':
        return <KuryePaneli />;
      case 'musteri':
        return <MusteriPaneli />;
      case 'vitrin':
      default:
        return <AnaSayfaVitrini />;
    }
  };

  return (
    <div className="w-full min-h-screen bg-stone-50/50">
      {seciliOdayiGoster()}
      <ApkGecisBari />
    </div>
  );
};
