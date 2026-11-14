import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';
import { paytrDemoSonucBildir } from '@/src/MalzemeCekmeceleri/Finans/paytrOdemeServisi';

interface DemoProps {
  merchantOid: string;
  tutar: number;
  onDurumDegisti: (mesaj: string) => void;
}

export const PaytrDemoOdemeEkrani: React.FC<DemoProps> = ({
  merchantOid,
  tutar,
  onDurumDegisti
}) => {
  const [islemde, setIslemde] = useState(false);

  const sonucGonder = async (basarili: boolean) => {
    setIslemde(true);
    onDurumDegisti(basarili ? 'Demo ödeme onaylandı, sipariş oluşturuluyor...' : 'Demo ödeme reddedildi...');
    await paytrDemoSonucBildir(
      merchantOid,
      basarili,
      tutar,
      basarili ? undefined : 'Demo 3D Secure doğrulaması başarısız olarak test edildi.'
    );
    setIslemde(false);
  };

  return (
    <div className="p-6 bg-[#140718] text-gray-200 space-y-5 min-h-[380px] flex flex-col justify-center">
      <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-start gap-3 text-xs">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-black text-amber-300">PayTR Demo / 3D Secure Simülasyon Modu</p>
          <p className="text-amber-100/80">
            Sunucuda henüz canlı PayTR mağaza anahtarları girilmediği için test simülasyonu açıldı. Gerçek PayTR
            anahtarları tanımlandığında bu alan otomatik olarak resmi PayTR kart ekranına dönüşür.
          </p>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-[#1E0C24] border border-purple-800/60 space-y-3 text-xs">
        <div className="flex justify-between border-b border-purple-900/50 pb-2">
          <span className="text-gray-400">İşlem Kodu:</span>
          <span className="font-mono font-bold text-white">{merchantOid}</span>
        </div>
        <div className="flex justify-between border-b border-purple-900/50 pb-2">
          <span className="text-gray-400">Ödenecek Tutar:</span>
          <span className="font-black text-emerald-400 text-base">{tutar.toLocaleString('tr-TR')} ₺</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">3D Doğrulama Kodu:</span>
          <span className="font-mono text-amber-300">123456 (Test SMS)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
        <button
          type="button"
          disabled={islemde}
          onClick={() => sonucGonder(false)}
          className="px-4 py-3 rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-700 text-rose-200 font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <XCircle className="w-4 h-4" />
          <span>Başarısız Ödeme Testi</span>
        </button>
        <button
          type="button"
          disabled={islemde}
          onClick={() => sonucGonder(true)}
          className="px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-black flex items-center justify-center gap-2 cursor-pointer hover:brightness-110 disabled:opacity-50"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>3D Onayla & Ödemeyi Tamamla</span>
        </button>
      </div>
    </div>
  );
};
