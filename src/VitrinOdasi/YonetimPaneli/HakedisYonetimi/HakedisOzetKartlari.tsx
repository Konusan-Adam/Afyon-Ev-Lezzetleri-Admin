import React from 'react';
import { Clock, CheckCircle2, Wallet, Layers } from 'lucide-react';

interface HakedisOzetKartlariProps {
  toplamBekleyen: number;
  toplamOdenen: number;
  toplamAdet: number;
  seciliAdet: number;
  seciliTutar: number;
}

export const HakedisOzetKartlari: React.FC<HakedisOzetKartlariProps> = ({
  toplamBekleyen,
  toplamOdenen,
  toplamAdet,
  seciliAdet,
  seciliTutar
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
    <div className="p-4 rounded-2xl bg-[#180A1F] border border-amber-500/40">
      <div className="flex items-center justify-between text-xs font-semibold text-amber-200">
        <span>Onay Bekleyen Çekimler</span>
        <Clock className="w-4 h-4 text-amber-400" />
      </div>
      <div className="text-2xl font-black text-amber-400 mt-2">
        {toplamBekleyen.toLocaleString('tr-TR')} ₺
      </div>
      <p className="text-[10px] text-gray-400 mt-1">EFT/FAST bekleyen aşçı & kurye talepleri</p>
    </div>

    <div className="p-4 rounded-2xl bg-[#180A1F] border border-emerald-500/40">
      <div className="flex items-center justify-between text-xs font-semibold text-emerald-200">
        <span>Tamamlanan Ödemeler</span>
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
      </div>
      <div className="text-2xl font-black text-emerald-400 mt-2">
        {toplamOdenen.toLocaleString('tr-TR')} ₺
      </div>
      <p className="text-[10px] text-gray-400 mt-1">Banka hesaplarına aktarılan toplam</p>
    </div>

    <div className="p-4 rounded-2xl bg-[#180A1F] border border-blue-500/40">
      <div className="flex items-center justify-between text-xs font-semibold text-blue-200">
        <span>Seçili Toplu Ödeme</span>
        <Layers className="w-4 h-4 text-blue-400" />
      </div>
      <div className="text-2xl font-black text-blue-300 mt-2">
        {seciliTutar.toLocaleString('tr-TR')} ₺
      </div>
      <p className="text-[10px] text-gray-400 mt-1">{seciliAdet} adet talep toplu aktarım için seçili</p>
    </div>

    <div className="p-4 rounded-2xl bg-[#180A1F] border border-[#3E1646]">
      <div className="flex items-center justify-between text-xs font-semibold text-gray-300">
        <span>Toplam Hakediş Kaydı</span>
        <Wallet className="w-4 h-4 text-purple-300" />
      </div>
      <div className="text-2xl font-black text-white mt-2">{toplamAdet} Adet</div>
      <p className="text-[10px] text-gray-400 mt-1">Sistemdeki tüm hakediş hareketleri</p>
    </div>
  </div>
);
