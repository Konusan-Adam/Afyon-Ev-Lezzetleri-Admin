import React, { useState, useEffect } from 'react';
import { ClipboardList, TrendingUp, DollarSign, XCircle, RefreshCcw, Search, Calendar, Store, Filter } from 'lucide-react';
import { canliFirebaseAktifMi } from '@/src/veritabani/FirebaseIstemcisi';
import { koleksiyonuCanliDinle } from '@/src/veritabani/FirebaseKoleksiyonServisi';

interface SiparisRaporKaydi {
  id: string;
  siparisKodu: string;
  musteriAdi: string;
  telefon: string;
  mutfakAdi: string;
  tutar: number;
  durum: string;
  odemeYontemi: string;
  tarih: string;
  iptalGerekcesi?: string;
}

export const YonetimAkilliSiparisTakip: React.FC = () => {
  const [siparisler, setSiparisler] = useState<SiparisRaporKaydi[]>([]);
  const [aramaMetni, setAramaMetni] = useState('');
  const [durumFiltresi, setDurumFiltresi] = useState<string>('tumu');

  useEffect(() => {
    let aktif = true;

    const durdur = koleksiyonuCanliDinle<any>('siparisler', (liste) => {
      if (!aktif || !liste) return;
      const formatli: SiparisRaporKaydi[] = liste.map((s) => ({
        id: s.id || s.siparis_kodu,
        siparisKodu: s.siparis_kodu || s.id || 'AFY-000',
        musteriAdi: s.musteri_adi || s.musteriAdi || 'Müşteri',
        telefon: s.musteri_telefon || s.telefon || '-',
        mutfakAdi: s.mutfak_adi || s.mutfakAdi || 'Afyon Ev Mutfağı',
        tutar: Number(s.toplam_tutar || s.tutar || s.toplamTutar) || 0,
        durum: s.durum || 'hazirlaniyor',
        odemeYontemi: s.odeme_yontemi || s.odemeYontemi || 'kapida_nakit',
        tarih: s.olusturma_tarihi || new Date().toLocaleDateString('tr-TR') + ' ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        iptalGerekcesi: s.iptal_gerekcesi || s.iptalGerekcesi
      }));
      setSiparisler(formatli);
    });

    return () => {
      aktif = false;
      durdur();
    };
  }, []);

  // İstatistik Hesaplamaları
  const toplamCiro = siparisler.filter(s => s.durum !== 'iptal').reduce((acc, s) => acc + s.tutar, 0);
  const toplamSiparisAdeti = siparisler.length;
  const teslimEdilenAdet = siparisler.filter(s => s.durum === 'teslim_edildi').reduce((acc, s) => acc + 1, 0);
  const iptalIadeAdeti = siparisler.filter(s => s.durum === 'iptal' || s.durum === 'iade').length;

  const filtrelenmisListe = siparisler.filter((s) => {
    const aramaUygun =
      s.siparisKodu.toLowerCase().includes(aramaMetni.toLowerCase()) ||
      s.musteriAdi.toLowerCase().includes(aramaMetni.toLowerCase()) ||
      s.telefon.includes(aramaMetni) ||
      s.mutfakAdi.toLowerCase().includes(aramaMetni.toLowerCase());

    const durumUygun =
      durumFiltresi === 'tumu' ? true : s.durum === durumFiltresi;

    return aramaUygun && durumUygun;
  });

  return (
    <div className="space-y-6">
      {/* Üst Başlık & Özet Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1C0722] border border-purple-900/60 rounded-2xl p-4 space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-purple-300 text-xs font-semibold">
            <span>Bugünkü Net Ciro</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400">{toplamCiro} ₺</p>
          <p className="text-[10px] text-gray-400">Tüm aktif ve tamamlanan siparişler</p>
        </div>

        <div className="bg-[#1C0722] border border-purple-900/60 rounded-2xl p-4 space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-purple-300 text-xs font-semibold">
            <span>Toplam Sipariş</span>
            <ClipboardList className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-white">{toplamSiparisAdeti}</p>
          <p className="text-[10px] text-gray-400">Sistemdeki toplam kayıt</p>
        </div>

        <div className="bg-[#1C0722] border border-purple-900/60 rounded-2xl p-4 space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-purple-300 text-xs font-semibold">
            <span>Teslim Edilen</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400">{teslimEdilenAdet}</p>
          <p className="text-[10px] text-gray-400">Başarıyla tamamlanan sevkler</p>
        </div>

        <div className="bg-[#1C0722] border border-purple-900/60 rounded-2xl p-4 space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-purple-300 text-xs font-semibold">
            <span>İptal / İade Edilen</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-black text-rose-400">{iptalIadeAdeti}</p>
          <p className="text-[10px] text-gray-400">İptal veya iade olan siparişler</p>
        </div>
      </div>

      {/* Arama ve Filtreleme Çubuğu */}
      <div className="bg-[#1C0722] border border-purple-900/60 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={aramaMetni}
            onChange={(e) => setAramaMetni(e.target.value)}
            placeholder="Sipariş kodu, müşteri adı veya telefon..."
            className="w-full bg-[#120415] border border-purple-900/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-purple-400 shrink-0" />
          {[
            { id: 'tumu', etiket: 'Tümü' },
            { id: 'hazirlaniyor', etiket: 'Hazırlanıyor' },
            { id: 'kuryede', etiket: 'Kuryede' },
            { id: 'teslim_edildi', etiket: 'Teslim Edildi' },
            { id: 'iptal', etiket: 'İptal / İade' }
          ].map((sekme) => (
            <button
              key={sekme.id}
              type="button"
              onClick={() => setDurumFiltresi(sekme.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors whitespace-nowrap ${
                durumFiltresi === sekme.id
                  ? 'bg-amber-500 text-purple-950 shadow-sm'
                  : 'bg-[#120415] text-purple-300 hover:bg-purple-900/40 border border-purple-900/80'
              }`}
            >
              {sekme.etiket}
            </button>
          ))}
        </div>
      </div>

      {/* Detaylı Sipariş Takip Tablosu */}
      <div className="bg-[#1C0722] border border-purple-900/60 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-purple-900/60 flex items-center justify-between">
          <h4 className="font-bold text-sm text-white flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-amber-400" />
            <span>Nokta Atışı Sipariş Takip ve Denetim Raporu ({filtrelenmisListe.length} Kayıt)</span>
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#130713] text-purple-300 border-b border-purple-900/60 uppercase font-mono text-[10px]">
              <tr>
                <th className="p-3.5">Sipariş Kodu</th>
                <th className="p-3.5">Müşteri & Telefon</th>
                <th className="p-3.5">İlgili Mutfak</th>
                <th className="p-3.5">Ödeme Tipi</th>
                <th className="p-3.5">Tutar</th>
                <th className="p-3.5">Durum</th>
                <th className="p-3.5">Zaman / Tarih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-900/30">
              {filtrelenmisListe.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500">
                    Kriterlere uygun sipariş kaydı bulunamadı.
                  </td>
                </tr>
              ) : (
                filtrelenmisListe.map((sip) => (
                  <tr key={sip.id} className="hover:bg-purple-950/20 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-amber-300">{sip.siparisKodu}</td>
                    <td className="p-3.5">
                      <p className="font-bold text-white">{sip.musteriAdi}</p>
                      <p className="text-[11px] text-gray-400">{sip.telefon}</p>
                    </td>
                    <td className="p-3.5 text-purple-200 font-semibold">{sip.mutfakAdi}</td>
                    <td className="p-3.5">
                      <span className="bg-purple-950 px-2 py-1 rounded-lg border border-purple-800 text-[11px] text-gray-300 font-medium">
                        {sip.odemeYontemi === 'kapida_nakit' ? 'Kapıda Nakit' : sip.odemeYontemi === 'kapida_kart' ? 'Kapıda Kart' : 'Online Cüzdan'}
                      </span>
                    </td>
                    <td className="p-3.5 font-black text-white text-sm">{sip.tutar} ₺</td>
                    <td className="p-3.5">
                      {sip.durum === 'hazirlaniyor' && (
                        <span className="bg-amber-950/60 border border-amber-500/40 text-amber-300 px-2.5 py-1 rounded-full text-[11px] font-bold">
                          Hazırlanıyor
                        </span>
                      )}
                      {sip.durum === 'kuryede' || sip.durum === 'yolda' ? (
                        <span className="bg-blue-950/60 border border-blue-500/40 text-blue-300 px-2.5 py-1 rounded-full text-[11px] font-bold">
                          Kuryede
                        </span>
                      ) : null}
                      {sip.durum === 'teslim_edildi' && (
                        <span className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 px-2.5 py-1 rounded-full text-[11px] font-bold">
                          Teslim Edildi
                        </span>
                      )}
                      {(sip.durum === 'iptal' || sip.durum === 'iade') && (
                        <span className="bg-rose-950/60 border border-rose-500/40 text-rose-300 px-2.5 py-1 rounded-full text-[11px] font-bold" title={sip.iptalGerekcesi}>
                          İptal / İade {sip.iptalGerekcesi ? `(${sip.iptalGerekcesi})` : ''}
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-gray-400 text-[11px]">{sip.tarih}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
