import React from 'react';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Store, 
  Users, 
  Bike, 
  UtensilsCrossed, 
  AlertTriangle, 
  Wallet, 
  ShoppingBag, 
  ShieldAlert, 
  Volume2,
  X,
  RefreshCw,
  Clock,
  Megaphone
} from 'lucide-react';
import { 
  usePatronBildirimleri,
  PatronBildirimi,
  masaustuBildirimIzniIste
} from '@/src/MalzemeCekmeceleri/PatronBildirimServisi';

export interface BildirimYonlendirmeHedefi {
  sekme: string;
  altSekme?:
    | 'genel_bakis'
    | 'stoklar'
    | 'siparisler'
    | 'ev_mutfaklari'
    | 'mutfak_afisleri'
    | 'hakedisler_odemeler'
    | 'coklu_menuler';
  subeId?: string;
  metinIpucu?: string;
}

interface PatronBildirimKutusuProps {
  acikMi: boolean;
  onKapat: () => void;
  onSekmeSec?: (sekme: string, hedef?: BildirimYonlendirmeHedefi) => void;
}

export const PatronBildirimKutusu: React.FC<PatronBildirimKutusuProps> = ({ 
  acikMi, 
  onKapat,
  onSekmeSec 
}) => {
  const { bildirimler, okunduIsaretle, tekOkunduIsaretle, bildirimSil: hookBildirimSil, zilSesiCal } = usePatronBildirimleri();
  const [izinDurumu, setIzinDurumu] = React.useState<NotificationPermission | 'desteklenmiyor'>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'desteklenmiyor';
  });

  if (!acikMi) return null;

  const izinVerVeTestEt = async () => {
    const onaylandi = await masaustuBildirimIzniIste();
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setIzinDurumu(Notification.permission);
    }
    if (onaylandi) {
      zilSesiCal();
    }
  };

  const tumunuOkunduYap = () => {
    okunduIsaretle();
  };

  const bildirimSil = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    hookBildirimSil(id);
  };

  const bildirimeTiklandi = (b: PatronBildirimi) => {
    tekOkunduIsaretle(b.id);
    if (onSekmeSec) {
      const baslikKucuk = (b.baslik || '').toLocaleLowerCase('tr-TR');
      const detayKucuk = (b.detay || '').toLocaleLowerCase('tr-TR');

      const afisBildirimiMi =
        b.hedefSekme === 'mutfak_afisleri' ||
        b.tur === 'mutfak_afis_talebi' ||
        baslikKucuk.includes('afiş') ||
        baslikKucuk.includes('afis') ||
        detayKucuk.includes('afiş') ||
        detayKucuk.includes('afis');

      if (afisBildirimiMi) {
        onSekmeSec('mutfak_afisleri', {
          sekme: 'mutfak_afisleri',
          altSekme: 'mutfak_afisleri',
          metinIpucu: b.ilgiliKimlik || `${b.baslik || ''} ${b.detay || ''}`.trim(),
        });
        onKapat();
        return;
      }

      const subeBildirimiMi =
        b.hedefSekme === 'sube_siparisleri' ||
        baslikKucuk.includes('şube') ||
        baslikKucuk.includes('sube');

      if (subeBildirimiMi) {
        onSekmeSec('gel_al_subeleri', {
          sekme: 'gel_al_subeleri',
          altSekme: 'siparisler',
          subeId: b.subeId || (b.ilgiliKimlik?.startsWith('sube-') ? b.ilgiliKimlik : undefined),
          metinIpucu: `${b.baslik || ''} ${b.detay || ''}`.trim(),
        });
        onKapat();
        return;
      }

      const hakedisBildirimiMi =
        b.tur === 'hakedis_talebi' ||
        baslikKucuk.includes('hakediş') ||
        baslikKucuk.includes('hakedis');

      if (hakedisBildirimiMi) {
        onSekmeSec('mutfaklar', {
          sekme: 'mutfaklar',
          altSekme: 'hakedisler_odemeler',
          metinIpucu: b.ilgiliKimlik,
        });
        onKapat();
        return;
      }

      const mutfakBelgeBildirimiMi =
        b.hedefSekme === 'mutfaklar' ||
        b.tur === 'yeni_mutfak' ||
        b.tur === 'eksik_belge' ||
        baslikKucuk.includes('belge') ||
        baslikKucuk.includes('hijyen') ||
        baslikKucuk.includes('muafiyet');

      if (mutfakBelgeBildirimiMi) {
        onSekmeSec('mutfaklar', {
          sekme: 'mutfaklar',
          altSekme: 'ev_mutfaklari',
          metinIpucu: b.ilgiliKimlik,
        });
        onKapat();
        return;
      }

      const cokluMenuBildirimiMi =
        b.hedefSekme === 'coklu_menuler' ||
        baslikKucuk.includes('çoklu menü') ||
        baslikKucuk.includes('coklu menu') ||
        detayKucuk.includes('çoklu menü') ||
        detayKucuk.includes('coklu menu');

      if (cokluMenuBildirimiMi) {
        onSekmeSec('yemekler', {
          sekme: 'yemekler',
          altSekme: 'coklu_menuler',
          metinIpucu: b.ilgiliKimlik,
        });
        onKapat();
        return;
      }

      if (b.tur === 'yeni_siparis' || b.tur === 'iade_talebi' || b.tur === 'siparis_durumu' || b.tur === 'genel') {
        onSekmeSec('siparisler');
      } else if (b.tur === 'yeni_kurye') {
        onSekmeSec('kuryeler');
      } else if (b.tur === 'yeni_musteri') {
        onSekmeSec('musteriler');
      } else if (b.tur === 'yeni_yemek') {
        onSekmeSec('yemekler');
      }
    }
    onKapat();
  };

  const ikonGetir = (b: PatronBildirimi) => {
    const baslikKucuk = (b.baslik || '').toLocaleLowerCase('tr-TR');
    if (b.tur === 'mutfak_afis_talebi' || b.hedefSekme === 'mutfak_afisleri' || baslikKucuk.includes('afiş') || baslikKucuk.includes('afis')) {
      return <Megaphone className="w-4 h-4 text-amber-400" />;
    }
    switch (b.tur) {
      case 'yeni_musteri': return <Users className="w-4 h-4 text-sky-400" />;
      case 'yeni_mutfak': return <Store className="w-4 h-4 text-amber-400" />;
      case 'yeni_kurye': return <Bike className="w-4 h-4 text-emerald-400" />;
      case 'yeni_yemek': return <UtensilsCrossed className="w-4 h-4 text-purple-400" />;
      case 'iade_talebi': return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case 'hakedis_talebi': return <Wallet className="w-4 h-4 text-amber-400" />;
      case 'yeni_siparis': return <ShoppingBag className="w-4 h-4 text-orange-400" />;
      case 'eksik_belge': return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      case 'siparis_durumu': return <RefreshCw className="w-4 h-4 text-blue-400" />;
      case 'genel': return <Clock className="w-4 h-4 text-blue-400" />;
      default: return <Bell className="w-4 h-4 text-purple-300" />;
    }
  };

  return (
    <div className="fixed sm:absolute right-3 sm:right-0 top-16 sm:top-full mt-2 w-[calc(100vw-24px)] max-w-sm sm:w-96 bg-[#1C0722] border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden z-[70] animate-fadeIn select-none">
      {/* Üst Bar */}
      <div className="p-3.5 bg-[#120415] border-b border-purple-900/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
            <Bell className="w-4 h-4" />
          </span>
          <div>
            <h4 className="font-bold text-sm text-white">Patron Canlı Bildirimler</h4>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              Sesli Canlı Hat Aktif
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Zil Testi Butonu */}
          <button
            type="button"
            onClick={zilSesiCal}
            className="text-[10px] font-bold text-purple-300 hover:text-amber-300 bg-purple-950/60 hover:bg-purple-900 px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
            title="Zil Sesini Çal"
          >
            <Volume2 className="w-3 h-3 text-amber-400" />
            <span>Zil Çal</span>
          </button>

          <button
            type="button"
            onClick={tumunuOkunduYap}
            className="text-[10px] font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer"
            title="Tümünü Okundu İşaretle"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Okundu</span>
          </button>
          
          <button
            type="button"
            onClick={onKapat}
            className="text-purple-400 hover:text-white p-1 cursor-pointer ml-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Arka Plan & Masaüstü Sesli Bildirim Aktivasyon Şeridi */}
      {izinDurumu !== 'granted' && izinDurumu !== 'desteklenmiyor' && (
        <div className="p-2.5 bg-amber-500/15 border-b border-amber-500/30 flex items-center justify-between gap-2">
          <div className="text-[11px] text-amber-200 leading-tight">
            <span className="font-bold text-amber-300 block">🔔 Arka Planda Ses Çalma</span>
            Sayfa kapalıyken veya simge durumundayken ses duymak için izin verin.
          </div>
          <button
            type="button"
            onClick={izinVerVeTestEt}
            className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-purple-950 font-black text-[10px] rounded-lg shrink-0 cursor-pointer shadow-md transition-all active:scale-95"
          >
            Sesi Aç
          </button>
        </div>
      )}

      {/* Liste */}
      <div className="max-h-[380px] overflow-y-auto divide-y divide-purple-950">
        {bildirimler.length === 0 ? (
          <div className="py-10 px-4 text-center text-xs text-purple-300 tracking-wide">
            Yeni canlı bildirim bulunmuyor.
          </div>
        ) : (
          bildirimler.map((b) => (
            <div
              key={b.id}
              onClick={() => bildirimeTiklandi(b)}
              className={`p-3.5 transition-colors flex items-start gap-3 relative group cursor-pointer hover:bg-[#320C3B] ${
                b.okundu_mu ? 'bg-[#1C0722]' : 'bg-[#27092E]/90 border-l-2 border-amber-400'
              }`}
            >
              <div className="p-2 rounded-xl bg-[#120415] border border-purple-900/60 shrink-0 mt-0.5">
                {ikonGetir(b)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h5 className="font-bold text-xs text-white truncate">{b.baslik}</h5>
                  <span className="text-[10px] text-purple-400 shrink-0 font-mono">
                    {b.tarihSaat.split(' ')[1] || b.tarihSaat}
                  </span>
                </div>
                <p className="text-[11px] text-purple-200/80 mt-1 leading-snug">{b.detay}</p>
                <span className="text-[9px] text-amber-400/80 mt-1 inline-block font-semibold">
                  Görüntülemek için tıkla →
                </span>
              </div>

              <button
                type="button"
                onClick={(e) => bildirimSil(b.id, e)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-rose-400 hover:text-rose-300 p-1 cursor-pointer shrink-0"
                title="Bildirimi Sil"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
