import React, { useState } from 'react';
import { CreditCard } from 'lucide-react';
import { HakedisCekimTalebi } from '@/src/veritabani/GercekVeriYardimcisi';

interface TekilOnayProps {
  talep: HakedisCekimTalebi;
  onKapat: () => void;
  onOnayla: (talepId: string, dekontNotu: string) => Promise<void>;
}

export const TekilOdemeOnayModali: React.FC<TekilOnayProps> = ({ talep, onKapat, onOnayla }) => {
  const [dekontNotu, setDekontNotu] = useState('');
  const [isleniyor, setIsleniyor] = useState(false);

  const gonder = async () => {
    setIsleniyor(true);
    await onOnayla(talep.id, dekontNotu.trim() || 'EFT/Havale işlemi Afyon Merkez Muhasebe tarafından tamamlandı.');
    setIsleniyor(false);
    onKapat();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="bg-[#180A1F] border border-amber-500/50 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl text-xs">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-amber-400" />
          <span>EFT / Havale Ödeme Onayı & Gider Pusulası</span>
        </h3>
        <div className="bg-[#120614] p-3 rounded-xl border border-purple-900 space-y-1">
          <div>Alıcı: <strong className="text-white">{talep.mutfak_adi || talep.kurye_adi}</strong></div>
          <div>TCKN / VKN: <strong className="font-mono text-gray-200">{talep.tckn_vkn || 'Belirtilmemiş'}</strong></div>
          <div>Banka: <strong className="text-white">{talep.banka_adi}</strong></div>
          <div>IBAN: <strong className="font-mono text-amber-300">{talep.iban}</strong></div>
          <div>Tutar: <strong className="text-emerald-400 text-sm font-black">{talep.tutar.toLocaleString('tr-TR')} ₺</strong></div>
        </div>
        <div>
          <label className="text-gray-400 block mb-1">Muhasebe Dekont Notu</label>
          <input type="text" value={dekontNotu} onChange={e => setDekontNotu(e.target.value)}
            placeholder="Örn: EFT Ref No: TR-984321, İşlem Tamam"
            className="w-full bg-[#120614] border border-purple-900 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400" />
        </div>
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-purple-950">
          <button type="button" onClick={onKapat} className="px-4 py-2 rounded-xl bg-purple-950 text-gray-300 font-bold cursor-pointer">İptal</button>
          <button type="button" disabled={isleniyor} onClick={gonder}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-gray-950 font-extrabold cursor-pointer disabled:opacity-50">
            {isleniyor ? 'Kaydediliyor...' : 'Ödemeyi Onayla & Pusula Kes'}
          </button>
        </div>
      </div>
    </div>
  );
};
