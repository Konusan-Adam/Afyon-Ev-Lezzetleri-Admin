import React, { useState, useMemo } from 'react';
import { X, Plus, Minus, Check, ShoppingBag, Sparkles, MessageSquare } from 'lucide-react';
import { Yemek } from '@/src/veritabani/VeriTipleri';
import { yemekVaryasyonlariniGetir } from '@/src/MalzemeCekmeceleri/UrunSecenekleri/urunVaryasyonDeposu';
import { SecenekOgesi, SecilenUrunKonfigurasyonu } from '@/src/MalzemeCekmeceleri/UrunSecenekleri/UrunSecenekleriTipleri';
import { gorselUrlGuvenliYap } from '@/src/MalzemeCekmeceleri/sunucuGorselYukleyici';

interface UrunOzellestirmePenceresiOzellikleri {
  yemek: Yemek;
  onKapat: () => void;
  onSepeteEkle: (konfig: SecilenUrunKonfigurasyonu) => void;
  mutfakVitriniAc?: (mutfakId: string) => void;
}

export const UrunOzellestirmePenceresi: React.FC<UrunOzellestirmePenceresiOzellikleri> = ({
  yemek,
  onKapat,
  onSepeteEkle,
  mutfakVitriniAc,
}) => {
  const gruplar = useMemo(() => yemekVaryasyonlariniGetir(yemek), [yemek]);

  // Başlangıçta zorunlu grupların ilk öğelerini seçili yap
  const [seciliTekli, setSeciliTekli] = useState<{ [grupId: string]: SecenekOgesi }>(() => {
    const baslangic: { [grupId: string]: SecenekOgesi } = {};
    gruplar.forEach((grup: any) => {
      if (!grup.coklu_secim_mi && grup.ogeler.length > 0) {
        baslangic[grup.kimlik] = grup.ogeler[0];
      }
    });
    return baslangic;
  });

  const [seciliCoklu, setSeciliCoklu] = useState<SecenekOgesi[]>([]);
  const [adet, setAdet] = useState(1);
  const [ozelNot, setOzelNot] = useState('');

  // Tekli seçim değiştir
  const tekliSec = (grupId: string, oge: SecenekOgesi) => {
    setSeciliTekli((onceki) => ({ ...onceki, [grupId]: oge }));
  };

  // Çoklu seçim değiştir (toggle)
  const cokluDegistir = (oge: SecenekOgesi) => {
    setSeciliCoklu((onceki) => {
      const varMi = onceki.some((o) => o.kimlik === oge.kimlik);
      if (varMi) {
        return onceki.filter((o) => o.kimlik !== oge.kimlik);
      }
      return [...onceki, oge];
    });
  };

  // Toplam birim fiyat hesabı
  const birimFiyat = useMemo(() => {
    let ekler = 0;
    Object.values(seciliTekli).forEach((o) => {
      ekler += o.ek_ucret || 0;
    });
    seciliCoklu.forEach((o) => {
      ekler += o.ek_ucret || 0;
    });
    return yemek.fiyat + ekler;
  }, [yemek.fiyat, seciliTekli, seciliCoklu]);

  const toplamFiyat = birimFiyat * adet;

  const tamamlaVeEkle = () => {
    const tumSecilenler: SecenekOgesi[] = [
      ...Object.values(seciliTekli),
      ...seciliCoklu
    ];

    onSepeteEkle({
      adet,
      secilen_ogeler: tumSecilenler,
      ozel_not: ozelNot.trim(),
      birim_fiyat: birimFiyat,
      toplam_fiyat: toplamFiyat
    });
    onKapat();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#1C0821] border border-[#521E5C] w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-white">
        
        {/* Üst Başlık & Görsel */}
        <div className="relative">
          <img
            src={gorselUrlGuvenliYap(yemek.gorsel_url?.trim()) || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'}
            alt={yemek.baslik}
            className="w-full h-44 object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C0821] via-black/40 to-transparent" />

          <button
            type="button"
            onClick={onKapat}
            className="absolute top-3 right-3 w-8 h-8 bg-black/60 hover:bg-black/90 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-3 left-4 right-4">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#CFA353] text-[#130713]">
              {yemek.kategori}
            </span>
            <h2 className="text-lg font-bold text-[#F5D28A] mt-1 drop-shadow">
              {yemek.baslik}
            </h2>
            <p className="text-xs text-gray-300 line-clamp-1">
              {yemek.aciklama}
            </p>
            {mutfakVitriniAc && yemek.mutfak_id && (
              <button
                type="button"
                onClick={() => {
                  onKapat();
                  mutfakVitriniAc(yemek.mutfak_id);
                }}
                className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-300 hover:text-amber-200 bg-black/60 hover:bg-black/80 px-2.5 py-1 rounded-lg border border-amber-500/40 transition-all cursor-pointer shadow-sm"
              >
                <span>🏪 Bu Mutfağın Vitrinine Git</span>
              </button>
            )}
          </div>
        </div>

        {/* Seçenek Listesi (Kaydırılabilir Alan) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Varyasyon Grupları */}
          {gruplar.map((grup: any) => (
            <div key={grup.kimlik} className="bg-[#240C2A] border border-[#3E1646] p-3.5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs text-[#F5D28A] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#CFA353]" />
                  {grup.baslik}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#130713] text-[#A872B5] border border-[#3E1646]">
                  {grup.zorunlu_mu ? 'Zorunlu Seçim' : 'İsteğe Bağlı'}
                </span>
              </div>

              {/* Tekli Seçim Listesi (Radio tipi) */}
              {!grup.coklu_secim_mi && (
                <div className="space-y-1.5 pt-1">
                  {grup.ogeler.map((oge: any) => {
                    const seciliMi = seciliTekli[grup.kimlik]?.kimlik === oge.kimlik;
                    return (
                      <button
                        key={oge.kimlik}
                        type="button"
                        onClick={() => tekliSec(grup.kimlik, oge)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                          seciliMi
                            ? 'bg-[#37133E] border-[#CFA353] text-white'
                            : 'bg-[#18071B] border-[#3E1646] text-gray-300 hover:border-purple-600'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            seciliMi ? 'border-[#CFA353] bg-[#CFA353]' : 'border-gray-500'
                          }`}>
                            {seciliMi && <div className="w-1.5 h-1.5 rounded-full bg-[#130713]" />}
                          </div>
                          <span>{oge.baslik}</span>
                        </div>
                        {oge.ek_ucret > 0 && (
                          <span className="text-[11px] font-bold text-[#F5D28A]">+{oge.ek_ucret} ₺</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Çoklu Seçim Listesi (Checkbox tipi) */}
              {grup.coklu_secim_mi && (
                <div className="space-y-1.5 pt-1">
                  {grup.ogeler.map((oge: any) => {
                    const seciliMi = seciliCoklu.some((o) => o.kimlik === oge.kimlik);
                    return (
                      <button
                        key={oge.kimlik}
                        type="button"
                        onClick={() => cokluDegistir(oge)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                          seciliMi
                            ? 'bg-[#37133E] border-[#CFA353] text-white'
                            : 'bg-[#18071B] border-[#3E1646] text-gray-300 hover:border-purple-600'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                            seciliMi ? 'border-[#CFA353] bg-[#CFA353]' : 'border-gray-500'
                          }`}>
                            {seciliMi && <Check className="w-3 h-3 text-[#130713] stroke-[3]" />}
                          </div>
                          <span>{oge.baslik}</span>
                        </div>
                        {oge.ek_ucret > 0 && (
                          <span className="text-[11px] font-bold text-[#F5D28A]">+{oge.ek_ucret} ₺</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          {/* Sipariş Notu */}
          <div className="bg-[#240C2A] border border-[#3E1646] p-3.5 rounded-2xl space-y-1.5">
            <label className="font-bold text-xs text-[#F5D28A] flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[#CFA353]" />
              Aşçıya Özel Sipariş Notu
            </label>
            <textarea
              value={ozelNot}
              onChange={(e) => setOzelNot(e.target.value)}
              placeholder="Örn: Acısız olsun, sarımsağı ayrı kaba koyun..."
              rows={2}
              className="w-full bg-[#18071B] border border-[#3E1646] rounded-xl p-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#CFA353]"
            />
          </div>
        </div>

        {/* Alt Çubuk: Adet Seçici & Sepete Ekle Butonu */}
        <div className="p-4 bg-[#140616] border-t border-[#3E1646] flex items-center justify-between gap-3">
          {/* Adet */}
          <div className="flex items-center bg-[#230C27] border border-[#521E5C] rounded-xl px-2 py-1.5">
            <button
              type="button"
              onClick={() => setAdet((a) => Math.max(1, a - 1))}
              className="text-[#DDAF53] hover:text-white p-1 cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-bold text-sm text-white px-3 min-w-[28px] text-center">
              {adet}
            </span>
            <button
              type="button"
              onClick={() => setAdet((a) => a + 1)}
              className="text-[#DDAF53] hover:text-white p-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Sepete Ekle Butonu */}
          <button
            type="button"
            onClick={tamamlaVeEkle}
            className="flex-1 bg-[#CFA353] hover:bg-[#E0B25B] text-[#130713] font-bold py-2.5 px-4 rounded-xl flex items-center justify-between gap-2 shadow-lg cursor-pointer transition-transform active:scale-[0.98]"
          >
            <div className="flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4" />
              <span className="text-xs">Sepete Ekle</span>
            </div>
            <span className="text-sm font-black">{toplamFiyat} ₺</span>
          </button>
        </div>

      </div>
    </div>
  );
};
