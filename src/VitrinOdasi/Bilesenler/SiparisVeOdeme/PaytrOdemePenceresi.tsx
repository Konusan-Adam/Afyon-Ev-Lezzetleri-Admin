import React, { useEffect, useState } from 'react';
import { ShieldCheck, X, Lock } from 'lucide-react';
import { paytrOdemeDurumuSorgula } from '@/src/MalzemeCekmeceleri/Finans/paytrOdemeServisi';
import { PaytrDemoOdemeEkrani } from './PaytrDemoOdemeEkrani';

interface PaytrPencereProps {
  merchantOid: string;
  iframeUrl?: string;
  demoMod?: boolean;
  tutar: number;
  onOdemeBasarili: (merchantOid: string) => void;
  onIptal: (mesaj?: string) => void;
}

export const PaytrOdemePenceresi: React.FC<PaytrPencereProps> = ({
  merchantOid,
  iframeUrl,
  demoMod = false,
  tutar,
  onOdemeBasarili,
  onIptal
}) => {
  const [durumMetni, setDurumMetni] = useState(
    demoMod ? 'PayTR Demo 3D Secure simülasyonu hazır.' : 'PayTR 3D Secure ödeme ekranı yüklendi.'
  );

  useEffect(() => {
    const zamanlayici = window.setInterval(async () => {
      const sonuc = await paytrOdemeDurumuSorgula(merchantOid);
      if (sonuc.durum === 'odendi') {
        window.clearInterval(zamanlayici);
        onOdemeBasarili(merchantOid);
      } else if (sonuc.durum === 'basarisiz') {
        window.clearInterval(zamanlayici);
        onIptal(sonuc.hataNedeni || 'Kart ödemesi onaylanmadı.');
      }
    }, 1500);

    const mesajDinle = (e: MessageEvent) => {
      if (typeof e.data === 'string' && e.data.includes('paytr=basarili')) {
        setDurumMetni('Ödeme onayı doğrulandı, siparişiniz kaydediliyor...');
      }
    };
    window.addEventListener('message', mesajDinle);

    return () => {
      window.clearInterval(zamanlayici);
      window.removeEventListener('message', mesajDinle);
    };
  }, [merchantOid, onOdemeBasarili, onIptal]);

  return (
    <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-xl bg-[#180A1F] border border-amber-500/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        <div className="px-5 py-3.5 bg-[#220B2B] border-b border-[#3E1646] flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-xs sm:text-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>PayTR Güvenli Ödeme ({tutar.toLocaleString('tr-TR')} ₺)</span>
          </div>
          <button
            type="button"
            onClick={() => onIptal('Ödeme işlemi kullanıcı tarafından iptal edildi.')}
            className="p-1.5 rounded-xl bg-[#2D1233] text-gray-300 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {demoMod || !iframeUrl ? (
            <PaytrDemoOdemeEkrani
              merchantOid={merchantOid}
              tutar={tutar}
              onDurumDegisti={setDurumMetni}
            />
          ) : (
            <iframe
              src={iframeUrl}
              title="PayTR 3D Secure Ödeme"
              className="w-full h-[480px] border-0 bg-white"
              allow="payment"
            />
          )}
        </div>

        <div className="px-5 py-2.5 bg-[#120614] border-t border-[#3E1646] flex items-center justify-between text-[11px] text-purple-300">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>{durumMetni}</span>
          </span>
          <span className="font-mono text-gray-400">{merchantOid}</span>
        </div>
      </div>
    </div>
  );
};
