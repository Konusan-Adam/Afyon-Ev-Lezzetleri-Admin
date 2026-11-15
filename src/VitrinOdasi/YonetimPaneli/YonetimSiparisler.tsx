import React, { useState, useEffect } from 'react';
import { ShoppingBag, Clock, CheckCircle2, Bike, AlertCircle, RefreshCw, XCircle, UserCheck } from 'lucide-react';
import { canliFirebaseAktifMi } from '@/src/veritabani/FirebaseIstemcisi';
import { koleksiyonuCanliDinle, koleksiyonGetir, belgeKaydet } from '@/src/veritabani/FirebaseKoleksiyonServisi';
import { patronBildirimiEkle } from '@/src/MalzemeCekmeceleri/PatronBildirimServisi';
import { siparistenOtomatikBelgeKes, siparistenIadeBelgesiKes } from '@/src/MalzemeCekmeceleri/Finans/otomatikFaturaUretici';
import { siparisTeslimHakedisKaydet, siparisIptalHakedisGeriAl } from '@/src/MalzemeCekmeceleri/Finans/hakedisDefteriServisi';

interface YonetimSiparis {
  id: string;
  musteri: string;
  telefon: string;
  mutfak: string;
  mutfakId?: string;
  kuryeId?: string;
  teslimatUcreti?: number;
  urunler: string;
  tutar: number;
  durum: 'hazirlaniyor' | 'kuryede' | 'teslim_edildi' | 'iptal';
  durumMetni: string;
  saat: string;
  adres: string;
  atananKurye?: string;
}

const BASLANGIC_SIPARISLER: YonetimSiparis[] = [
  {
    id: 'SİP-1049',
    musteri: 'Ahmet Karahan',
    telefon: '0555 345 67 89',
    mutfak: 'Fatma Teyze Afyon Ev Mutfağı',
    urunler: 'Mercimekli Bükme (4 adet), Çömlek Keşkek',
    tutar: 340,
    durum: 'hazirlaniyor',
    durumMetni: 'Fırında Pişiyor',
    saat: '18:42',
    adres: 'Ali Çetinkaya Mah. No:12 D:4',
    atananKurye: 'Ali Can'
  },
  {
    id: 'SİP-1048',
    musteri: 'Ayşe Demir',
    telefon: '0542 123 45 67',
    mutfak: 'Hacer Anne Katmer & Tatlı Ocağı',
    urunler: 'Hakiki Kaymaklı Ekmek Kadayıfı (2 Porsiyon)',
    tutar: 280,
    durum: 'kuryede',
    durumMetni: 'Kuryede Yolda',
    saat: '18:35',
    adres: 'Dumlupınar Mah. Yeşilyol Cad. 8/A',
    atananKurye: 'Mehmet Yılmaz'
  },
  {
    id: 'SİP-1047',
    musteri: 'Mehmet Yılmaz',
    telefon: '0532 987 65 43',
    mutfak: 'Meliha Anne Yöresel Tencere Yemekleri',
    urunler: 'Kuru Fasulye & Pilav Menü, Afyon Yoğurdu',
    tutar: 220,
    durum: 'teslim_edildi',
    durumMetni: 'Teslim Edildi',
    saat: '18:15',
    adres: 'Selçuklu Mah. Park Afyon Arkası',
    atananKurye: undefined
  }
];

export const YonetimSiparisler: React.FC = () => {
  const [siparisler, setSiparisler5] = useState<YonetimSiparis[]>(BASLANGIC_SIPARISLER);
  const [kuryeler, setKuryeler] = useState<{ id: string; ad_soyad: string; arac_tipi?: string }[]>([]);

  useEffect(() => {
    let aktif = true;

    // 1. Canlı kuryeleri çek (Yalnızca veritabanındaki gerçek kuryeler)
    if (canliFirebaseAktifMi()) {
      koleksiyonGetir<any>('kullanicilar').then((kullanicilar) => {
        if (!aktif) return;
        const kuryeList = kullanicilar
          .filter((k) => k.rol === 'kurye')
          .map((k) => ({
            id: k.id || k.kimlik,
            ad_soyad: k.ad_soyad || 'Kurye',
            arac_tipi: k.arac_tipi || 'Motosiklet'
          }));
        setKuryeler(kuryeList);
      }).catch(() => {});
    }

    // 2. Canlı siparişleri dinle
    const abonelikDurdur = koleksiyonuCanliDinle<any>('siparisler', (fbSiparisler) => {
      if (!aktif || !fbSiparisler || fbSiparisler.length === 0) return;
      const donusturulen: YonetimSiparis[] = fbSiparisler.map((s) => ({
        id: s.id,
        musteri: s.musteri_adi || s.musteri || 'Müşteri',
        telefon: s.musteri_telefon || s.telefon || '',
        mutfak: s.mutfak_adi || s.mutfak || 'Ev Mutfağı',
        mutfakId: s.mutfak_id,
        kuryeId: s.kurye_id,
        teslimatUcreti: Number(s.teslimat_ucreti || s.teslimatUcreti || 0),
        urunler: Array.isArray(s.elemanlar)
          ? s.elemanlar.map((e: any) => `${e.yemek_baslik || e.baslik || 'Ürün'} (${e.adet}x)`).join(', ')
          : s.urunler || 'Ev Lezzeti Menüsü',
        tutar: Number(s.toplam_tutar) || Number(s.tutar) || 0,
        durum: s.durum === 'kuryede' || s.durum === 'yolda' ? 'kuryede' : (s.durum || 'hazirlaniyor'),
        durumMetni: s.durum_aciklamasi || (s.durum === 'kuryede' || s.durum === 'yolda' ? 'Kurye Yolda' : 'Fırında Pişiyor'),
        saat: s.olusturma_tarihi ? s.olusturma_tarihi.slice(11, 16) : '12:00',
        adres: s.teslimat_adresi_metni || s.adres || 'Afyonkarahisar',
        atananKurye: s.kurye_adi || s.atananKurye || ''
      }));
      setSiparisler5(donusturulen);
    });

    return () => {
      aktif = false;
      abonelikDurdur();
    };
  }, []);

  const durumGuncelle = async (id: string, yeniDurum: 'hazirlaniyor' | 'kuryede' | 'teslim_edildi' | 'iptal') => {
    const metinMap = {
      hazirlaniyor: 'Fırında Pişiyor',
      kuryede: 'Kurye Yolda 🛵',
      teslim_edildi: 'Başarıyla Teslim Edildi ✓',
      iptal: 'İptal Edildi ✕'
    };

    setSiparisler5(siparisler.map(s => s.id === id ? { ...s, durum: yeniDurum, durumMetni: metinMap[yeniDurum] } : s));

    try {
      await belgeKaydet('siparisler', id, {
        durum: yeniDurum === 'kuryede' ? 'yolda' : yeniDurum,
        durum_aciklamasi: metinMap[yeniDurum],
        guncellenme_tarihi: new Date().toISOString()
      });

      // 🔔 Durum Bildirimi Ekle
      patronBildirimiEkle(
        'siparis_durumu',
        'Sipariş Durumu Güncellendi',
        `#${id} nolu sipariş durumu: ${metinMap[yeniDurum]}`,
        id
      );

      if (yeniDurum === 'teslim_edildi') {
        const hedef = siparisler.find(s => s.id === id);
        if (hedef) {
          const teslimVerisi = {
            id: hedef.id,
            siparis_kodu: hedef.id,
            musteri_adi: hedef.musteri,
            mutfak_id: hedef.mutfakId,
            mutfak_adi: hedef.mutfak,
            kurye_id: hedef.kuryeId,
            kurye_adi: hedef.atananKurye,
            teslimat_ucreti: hedef.teslimatUcreti,
            toplam_tutar: hedef.tutar,
            durum: 'teslim_edildi'
          };
          siparistenOtomatikBelgeKes(teslimVerisi).catch(() => {});
          siparisTeslimHakedisKaydet(teslimVerisi).catch(() => {});
        }
      } else if (yeniDurum === 'iptal') {
        siparistenIadeBelgesiKes(id, 'Yönetim tarafından sipariş iptal edildi').catch(() => {});
        siparisIptalHakedisGeriAl(id, 'Yönetim tarafından sipariş iptal edildi').catch(() => {});
      }
    } catch (hata) {
      console.warn('Sipariş durum güncelleme hatası:', hata);
    }
  };

  const kuryeAta = async (siparisId: string, kuryeAdi: string) => {
    const secilenKurye = kuryeler.find((k) => k.ad_soyad === kuryeAdi);
    const kuryeId = secilenKurye?.id || '';
    setSiparisler5(siparisler.map(s => s.id === siparisId ? { ...s, atananKurye: kuryeAdi, kuryeId } : s));
    try {
      await belgeKaydet('siparisler', siparisId, {
        ...(kuryeId ? { kurye_id: kuryeId } : {}),
        kurye_adi: kuryeAdi,
        atananKurye: kuryeAdi,
        guncellenme_tarihi: new Date().toISOString()
      });

      // 🔔 Kurye Atama Bildirimi
      patronBildirimiEkle(
        'siparis_durumu',
        'Kurye Atandı',
        `#${siparisId} nolu siparişe ${kuryeAdi} atandı.`,
        siparisId
      );
    } catch (hata) {
      console.warn('Kurye atama hatası:', hata);
    }
  };

  return (
    <div className="space-y-4">
      {/* Üst Bilgi */}
      <div className="p-4 rounded-2xl bg-[#180A1F] border border-[#3E1646] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-white text-sm">Canlı Sevk, Kurye Atama & Sipariş Durum Kontrolü</h3>
        </div>
        <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-900/40">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          Tam Yetkili Sevk Masası (%100 Canlı)
        </span>
      </div>

      {/* Sipariş Listesi Kartları */}
      <div className="grid grid-cols-1 gap-3.5">
        {siparisler.map((sip) => (
          <div
            key={sip.id}
            className="p-4 rounded-2xl bg-[#180A1F] border border-[#3E1646] hover:border-amber-500/40 transition-all space-y-3 shadow-md"
          >
            {/* Kart Üst Satırı */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-purple-950 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono font-extrabold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                  {sip.id}
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-300 font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-gray-500" /> {sip.saat}
                </span>
              </div>

              {/* Anlık Durum Rozeti */}
              <div>
                {sip.durum === 'hazirlaniyor' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-300 font-bold">
                    <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
                    <span>{sip.durumMetni}</span>
                  </span>
                )}
                {sip.durum === 'kuryede' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-950/60 border border-blue-500/40 text-blue-300 font-bold">
                    <Bike className="w-3.5 h-3.5 text-blue-400" />
                    <span>{sip.durumMetni}</span>
                  </span>
                )}
                {sip.durum === 'teslim_edildi' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{sip.durumMetni}</span>
                  </span>
                )}
                {sip.durum === 'iptal' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 font-bold">
                    <XCircle className="w-3.5 h-3.5 text-rose-400" />
                    <span>{sip.durumMetni}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Bilgi Gövdesi */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-gray-400 block text-[11px]">Müşteri & Teslimat:</span>
                <p className="text-white font-bold">{sip.musteri}</p>
                <p className="text-gray-400 font-mono text-[11px]">{sip.telefon}</p>
                <p className="text-amber-200/80 text-[11px] line-clamp-1">{sip.adres}</p>
              </div>

              <div className="space-y-1">
                <span className="text-gray-400 block text-[11px]">Ürünler & Mutfak:</span>
                <p className="text-amber-300 font-semibold">{sip.mutfak}</p>
                <p className="text-gray-300 text-[11px] line-clamp-2">{sip.urunler}</p>
              </div>

              <div className="space-y-1 flex flex-col justify-between">
                <div>
                  <span className="text-gray-400 block text-[11px]">Sipariş Tutarı:</span>
                  <p className="text-lg font-black text-white">{sip.tutar} ₺</p>
                </div>
              </div>
            </div>

            {/* Aksiyon Çubuğu: Durum Değiştir & Kurye Ata */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-purple-300 font-medium flex items-center gap-1">
                  <Bike className="w-3.5 h-3.5 text-amber-400" /> Atanan Kurye:
                </span>
                <select
                  value={sip.atananKurye || ''}
                  onChange={(e) => kuryeAta(sip.id, e.target.value)}
                  className="bg-[#130713] border border-purple-800/60 rounded-xl px-2.5 py-1 text-xs text-amber-300 focus:outline-none focus:border-amber-400 font-semibold"
                >
                  <option value="">Kurye Seçilmedi</option>
                  {kuryeler.map((k) => (
                    <option key={k.id} value={k.ad_soyad}>
                      {k.ad_soyad} ({k.arac_tipi || 'Motor'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-gray-400 mr-1">Durum Güncelle:</span>
                <button
                  type="button"
                  onClick={() => durumGuncelle(sip.id, 'hazirlaniyor')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                    sip.durum === 'hazirlaniyor' ? 'bg-amber-500 text-purple-950' : 'bg-[#240A2C] text-gray-300 hover:bg-[#3D1446]'
                  }`}
                >
                  Hazırlanıyor
                </button>
                <button
                  type="button"
                  onClick={() => durumGuncelle(sip.id, 'kuryede')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                    sip.durum === 'kuryede' ? 'bg-blue-500 text-white' : 'bg-[#240A2C] text-gray-300 hover:bg-[#3D1446]'
                  }`}
                >
                  Kurye Yolda
                </button>
                <button
                  type="button"
                  onClick={() => durumGuncelle(sip.id, 'teslim_edildi')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                    sip.durum === 'teslim_edildi' ? 'bg-emerald-500 text-white' : 'bg-[#240A2C] text-gray-300 hover:bg-[#3D1446]'
                  }`}
                >
                  Teslim Edildi
                </button>
                <button
                  type="button"
                  onClick={() => durumGuncelle(sip.id, 'iptal')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                    sip.durum === 'iptal' ? 'bg-rose-600 text-white' : 'bg-[#240A2C] text-gray-300 hover:bg-[#3D1446]'
                  }`}
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
