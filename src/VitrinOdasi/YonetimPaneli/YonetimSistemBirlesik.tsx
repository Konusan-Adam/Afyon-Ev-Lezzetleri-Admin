import React, { useState } from 'react';
import { Database, ShieldCheck, LayoutTemplate, Megaphone, CreditCard, Wallet } from 'lucide-react';
import { YonetimYedeklemeMerkezi } from './YonetimYedeklemeMerkezi';
import { SuperAdminHukukPaneli } from '../Bilesenler/HukukVeSozlesmeler/SuperAdminHukukPaneli';
import { YonetimFooter } from './YonetimFooter';
import { YonetimReklamBanner } from './YonetimReklamBanner';
import { YonetimPaytrAyarlari } from './YonetimPaytrAyarlari';
import { YonetimOdemeSecenekleri } from './YonetimOdemeSecenekleri';

export const YonetimSistemBirlesik: React.FC = () => {
  const [sekme, setSekme] = useState<'yedek' | 'odeme_secenekleri' | 'paytr' | 'reklam' | 'hukuk' | 'footer'>('yedek');

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-[#180A1F] border border-[#3E1646] w-fit text-xs font-bold">
        <button type="button" onClick={() => setSekme('yedek')}
          className={`px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer ${sekme === 'yedek' ? 'bg-amber-500 text-purple-950 font-black' : 'text-gray-400 hover:text-white'}`}>
          <Database className="w-3.5 h-3.5" /><span>Veritabanı & Arşiv</span>
        </button>
        <button type="button" onClick={() => setSekme('odeme_secenekleri')}
          className={`px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer ${sekme === 'odeme_secenekleri' ? 'bg-amber-500 text-purple-950 font-black' : 'text-gray-400 hover:text-white'}`}>
          <Wallet className="w-3.5 h-3.5" /><span>Ödeme Seçenekleri</span>
        </button>
        <button type="button" onClick={() => setSekme('paytr')}
          className={`px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer ${sekme === 'paytr' ? 'bg-amber-500 text-purple-950 font-black' : 'text-gray-400 hover:text-white'}`}>
          <CreditCard className="w-3.5 h-3.5" /><span>Sanal POS (PayTR)</span>
        </button>
        <button type="button" onClick={() => setSekme('reklam')}
          className={`px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer ${sekme === 'reklam' ? 'bg-amber-500 text-purple-950 font-black' : 'text-gray-400 hover:text-white'}`}>
          <Megaphone className="w-3.5 h-3.5" /><span>Reklam & Banner</span>
        </button>
        <button type="button" onClick={() => setSekme('hukuk')}
          className={`px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer ${sekme === 'hukuk' ? 'bg-amber-500 text-purple-950 font-black' : 'text-gray-400 hover:text-white'}`}>
          <ShieldCheck className="w-3.5 h-3.5" /><span>Hukuk & KVKK</span>
        </button>
        <button type="button" onClick={() => setSekme('footer')}
          className={`px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer ${sekme === 'footer' ? 'bg-amber-500 text-purple-950 font-black' : 'text-gray-400 hover:text-white'}`}>
          <LayoutTemplate className="w-3.5 h-3.5" /><span>Footer (Alt Bilgi)</span>
        </button>
      </div>
      {sekme === 'yedek' && <YonetimYedeklemeMerkezi />}
      {sekme === 'odeme_secenekleri' && <YonetimOdemeSecenekleri />}
      {sekme === 'paytr' && <YonetimPaytrAyarlari />}
      {sekme === 'reklam' && <YonetimReklamBanner />}
      {sekme === 'hukuk' && <SuperAdminHukukPaneli />}
      {sekme === 'footer' && <YonetimFooter />}
    </div>
  );
};
