import React, { useState } from 'react';
import { BookOpen, RefreshCw, ArrowDownLeft, ArrowUpRight, Store, Bike } from 'lucide-react';
import { HakedisHareketi } from '@/src/MalzemeCekmeceleri/Finans/hakedisDefteriTipleri';
import { gecmisKayitlariDeftereSenkronizeEt } from '@/src/MalzemeCekmeceleri/Finans/hakedisDefteriServisi';

interface HakedisHareketDefteriTablosuProps {
  hareketler: HakedisHareketi[];
  arama: string;
  onBilgiMesaji: (mesaj: string) => void;
}

export const HakedisHareketDefteriTablosu: React.FC<HakedisHareketDefteriTablosuProps> = ({
  hareketler,
  arama,
  onBilgiMesaji
}) => {
  const [rolFiltre, setRolFiltre] = useState<'hepsi' | 'mutfak' | 'kurye'>('hepsi');
  const [senkronYukleniyor, setSenkronYukleniyor] = useState(false);

  const filtrelenmis = hareketler.filter((h) => {
    const rolUygun = rolFiltre === 'hepsi' || h.rol === rolFiltre;
    const metin = `${h.alici_adi} ${h.siparis_kodu || ''} ${h.aciklama} ${h.hareket_tipi}`.toLowerCase();
    return rolUygun && metin.includes(arama.toLowerCase());
  });

  const gecmisiSenkronizeEt = async () => {
    setSenkronYukleniyor(true);
    try {
      const eklenen = await gecmisKayitlariDeftereSenkronizeEt();
      onBilgiMesaji(
        eklenen > 0
          ? `${eklenen} adet geçmiş sipariş/ödeme hareketi hakediş defterine işlendi.`
          : 'Tüm geçmiş teslimat ve ödemeler zaten hakediş defterinde güncel.'
      );
    } finally {
      setSenkronYukleniyor(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#180A1F] border border-[#3E1646]">
        <div className="flex items-center gap-2 flex-wrap">
          <BookOpen className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-white">Kalıcı Veritabanı Hakediş Defteri</span>
          <div className="flex items-center gap-1 ml-2">
            {(['hepsi', 'mutfak', 'kurye'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRolFiltre(r)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                  rolFiltre === r ? 'bg-amber-500 text-purple-950' : 'bg-[#120614] text-gray-400 border border-purple-900/60'
                }`}
              >
                {r === 'hepsi' ? 'Tümü' : r === 'mutfak' ? 'Mutfaklar' : 'Kuryeler'}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={gecmisiSenkronizeEt}
          disabled={senkronYukleniyor}
          className="px-3.5 py-2 rounded-xl bg-purple-900/50 hover:bg-purple-800/70 border border-purple-500/40 text-xs font-bold text-amber-300 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${senkronYukleniyor ? 'animate-spin' : ''}`} />
          <span>Geçmiş Teslimatları Deftere İşle</span>
        </button>
      </div>

      {filtrelenmis.length === 0 ? (
        <div className="p-8 rounded-2xl bg-[#180A1F] border border-[#3E1646] text-center text-xs text-gray-400">
          Henüz kayıtlı hakediş defteri hareketi bulunmuyor. Sipariş teslim edildiğinde veya geçmiş teslimatlar senkronize edildiğinde burada listelenir.
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtrelenmis.map((h) => {
            const girisMi = h.yon === 'giris';
            return (
              <div
                key={h.id}
                className="p-3.5 rounded-2xl bg-[#180A1F] border border-[#3E1646] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      girisMi ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                    }`}
                  >
                    {girisMi ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white flex items-center gap-1">
                        {h.rol === 'mutfak' ? <Store className="w-3.5 h-3.5 text-amber-400" /> : <Bike className="w-3.5 h-3.5 text-emerald-400" />}
                        {h.alici_adi}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-[#120614] border border-purple-900/60 text-[10px] font-bold text-purple-200">
                        {h.hareket_tipi === 'siparis_hakedis'
                          ? 'Sipariş Hakedişi'
                          : h.hareket_tipi === 'odeme_cikisi'
                          ? 'Banka Ödeme Çıkışı'
                          : 'İptal Kesintisi'}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-300 truncate">{h.aciklama}</p>
                    {Number(h.komisyon_tutari || 0) > 0 && (
                      <p className="text-[10px] text-gray-400">
                        Brüt: {Number(h.brut_tutar).toLocaleString('tr-TR')} ₺ • Komisyon (%{h.komisyon_orani || 10}): -
                        {Number(h.komisyon_tutari).toLocaleString('tr-TR')} ₺
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className={`text-sm font-black ${girisMi ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {girisMi ? '+' : '-'}
                    {Number(h.net_tutar || 0).toLocaleString('tr-TR')} ₺
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    {h.olusturma_tarihi ? new Date(h.olusturma_tarihi).toLocaleString('tr-TR') : ''}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
