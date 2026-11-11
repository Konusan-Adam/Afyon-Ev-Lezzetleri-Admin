import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Store, 
  UtensilsCrossed, 
  ShoppingBag, 
  DollarSign, 
  Users
} from 'lucide-react';
import { VeritabaniBaglantiPaneli } from './VeritabaniBaglantiPaneli';
import { canliFirebaseAktifMi } from '@/src/veritabani/FirebaseIstemcisi';
import { koleksiyonGetir } from '@/src/veritabani/FirebaseKoleksiyonServisi';

export const YonetimOzeti: React.FC = () => {
  const [mutfakSayisi, setMutfakSayisi] = useState(0);
  const [yemekSayisi, setYemekSayisi] = useState(0);
  const [siparisSayisi, setSiparisSayisi] = useState(0);

  useEffect(() => {
    if (canliFirebaseAktifMi()) {
      koleksiyonGetir('mutfaklar').then((m) => {
        if (m.length > 0) setMutfakSayisi(m.length);
      }).catch(() => {});

      koleksiyonGetir('yemekler').then((y) => {
        if (y.length > 0) setYemekSayisi(y.length);
      }).catch(() => {});

      koleksiyonGetir('siparisler').then((s) => {
        if (s.length > 0) setSiparisSayisi(s.length);
      }).catch(() => {});
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Canlı Firebase Veritabanı Teşhis ve Kontrol Paneli */}
      <VeritabaniBaglantiPaneli />

      {/* 4 Ana Sayaç Kartı */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#1C0922] border border-amber-500/30 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-amber-300 font-semibold">Bugünkü Toplam Ciro</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">18.450 ₺</div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>Düne göre +%18 artış</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#1C0922] border border-purple-800/40 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-purple-300 font-semibold">Aktif Ev Mutfakları</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{mutfakSayisi} Mutfak</div>
          <div className="text-[11px] text-purple-400 mt-1">Onaylı ve kayıtlı mutfaklar</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#1C0922] border border-emerald-800/40 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-emerald-300 font-semibold">Bugünkü Siparişler</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{siparisSayisi} Adet</div>
          <div className="text-[11px] text-emerald-400 mt-1">Canlı sipariş akışı</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#1C0922] border border-rose-800/40 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-rose-300 font-semibold">Menüdeki Lezzetler</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{yemekSayisi} Çeşit</div>
          <div className="text-[11px] text-rose-400 mt-1">%100 onaylı anne lezzeti</div>
        </div>
      </div>

      {/* İki Kolonlu Canlı Akış Paneli */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Canlı Sipariş Akışı */}
        <div className="p-5 rounded-2xl bg-[#180A1F] border border-[#3E1646] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-purple-950">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              Canlı Fırın & Kurye Akışı
            </h4>
            <span className="text-[11px] text-purple-300">Anlık Güncel</span>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-[#240E2A] border border-purple-900/40 flex items-center justify-between">
              <div>
                <div className="font-bold text-white text-xs">#SİP-1048 — Mercimekli Bükme (6'lı Paket)</div>
                <div className="text-[11px] text-purple-300">Fatma Teyze Ev Mutfağı → Selçuklu Mah.</div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Fırında Pişiyor
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#240E2A] border border-purple-900/40 flex items-center justify-between">
              <div>
                <div className="font-bold text-white text-xs">#SİP-1047 — Çömlek Keşkek & Güveç Menü</div>
                <div className="text-[11px] text-purple-300">Meliha Anne Yöresel → Dumlupınar Mah.</div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Kuryede Yolda
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#240E2A] border border-purple-900/40 flex items-center justify-between">
              <div>
                <div className="font-bold text-white text-xs">#SİP-1046 — Kaymaklı Ekmek Kadayıfı</div>
                <div className="text-[11px] text-purple-300">Hacer Anne Tatlı Ocağı → Yeşilyol</div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Teslim Edildi
              </span>
            </div>
          </div>
        </div>

        {/* Onay Bekleyen Ev Hanımları & Hızlı Notlar */}
        <div className="p-5 rounded-2xl bg-[#180A1F] border border-[#3E1646] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-purple-950">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              Onay Bekleyen Ev Mutfağı Başvuruları
            </h4>
            <span className="text-[11px] text-amber-400 font-semibold">2 Yeni Başvuru</span>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-[#240E2A] border border-purple-900/40 flex items-center justify-between">
              <div>
                <div className="font-bold text-white text-xs">Zehra Bacı Gözleme & Mantı Evi</div>
                <div className="text-[11px] text-gray-400">Marulcu Mah. • Hijyen Belgesi Yüklendi</div>
              </div>
              <div className="flex items-center gap-1.5">
                <button className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold cursor-pointer">
                  Onayla
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#240E2A] border border-purple-900/40 flex items-center justify-between">
              <div>
                <div className="font-bold text-white text-xs">Şükran Hanım Taş Fırın Katmerleri</div>
                <div className="text-[11px] text-gray-400">Çavuşbaş Mah. • Kimlik Doğrulandı</div>
              </div>
              <div className="flex items-center gap-1.5">
                <button className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold cursor-pointer">
                  Onayla
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
