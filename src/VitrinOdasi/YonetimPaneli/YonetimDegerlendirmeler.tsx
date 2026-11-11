import React, { useState, useEffect } from 'react';
import { Star, Check, X, Edit3, Trash2, Save } from 'lucide-react';
import { canliDegerlendirmeleriCek, degerlendirmeOnayGuncelle, degerlendirmeDuzenle, degerlendirmeSil } from '@/src/MalzemeCekmeceleri/Degerlendirme/degerlendirmeDeposu';
import { SiparisDegerlendirmesi } from '@/src/MalzemeCekmeceleri/Degerlendirme/DegerlendirmeTipleri';

export const YonetimDegerlendirmeler: React.FC = () => {
  const [tumDegerlendirmeler, setTumDegerlendirmeler] = useState<SiparisDegerlendirmesi[]>([]);
  const [duzenlenenId, setDuzenlenenId] = useState<string | null>(null);
  const [duzenlenenMetin, setDuzenlenenMetin] = useState('');

  const yukle = async () => {
    const veriler = await canliDegerlendirmeleriCek();
    setTumDegerlendirmeler(veriler);
  };

  useEffect(() => {
    yukle();
  }, []);

  const onayla = async (kimlik: string, durum: boolean) => {
    setTumDegerlendirmeler(onceki => onceki.map(d => (d.kimlik || (d as any).id) === kimlik ? { ...d, onayli_mi: durum } : d));
    await degerlendirmeOnayGuncelle(kimlik, durum);
    yukle();
  };

  const sil = async (kimlik: string) => {
    if (window.confirm('Bu değerlendirmeyi silmek istediğinize emin misiniz?')) {
      setTumDegerlendirmeler(onceki => onceki.filter(d => (d.kimlik || (d as any).id) !== kimlik));
      await degerlendirmeSil(kimlik);
      yukle();
    }
  };

  const kaydet = async (kimlik: string) => {
    await degerlendirmeDuzenle(kimlik, duzenlenenMetin);
    setDuzenlenenId(null);
    setDuzenlenenMetin('');
    yukle();
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-white">Müşteri Değerlendirmeleri ve Tam Kontrol</h2>
      <div className="space-y-4">
        {tumDegerlendirmeler.map((d, index) => (
          <div key={d.kimlik || index} className={`p-4 rounded-xl border ${d.onayli_mi ? 'bg-[#1C1508] border-amber-500/30' : 'bg-[#1C0821] border-[#3E1646]'}`}>
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-amber-400">{d.musteri_adi}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onayla(d.kimlik || (d as any).id, true)}
                  className="px-2 py-1 rounded bg-emerald-950/60 text-emerald-400 hover:bg-emerald-900 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  title="Onayla ve Yayınla"
                >
                  <Check size={14} /> Onayla
                </button>
                <button
                  type="button"
                  onClick={() => onayla(d.kimlik || (d as any).id, false)}
                  className="px-2 py-1 rounded bg-amber-950/60 text-amber-400 hover:bg-amber-900 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  title="Beklemeye Al / Reddet"
                >
                  <X size={14} /> Reddet
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDuzenlenenId(d.kimlik || (d as any).id);
                    setDuzenlenenMetin(d.yorum_metni);
                  }}
                  className="px-2 py-1 rounded bg-purple-950/60 text-purple-300 hover:bg-purple-900 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  title="Düzenle"
                >
                  <Edit3 size={14} /> Düzenle
                </button>
                <button
                  type="button"
                  onClick={() => sil(d.kimlik || (d as any).id)}
                  className="px-2 py-1 rounded bg-rose-950/60 text-rose-400 hover:bg-rose-900 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  title="Tamamen Sil"
                >
                  <Trash2 size={14} /> Sil
                </button>
              </div>
            </div>
            
            <div className="text-xs text-gray-400 mb-2">Tarih: {d.tarih}</div>

            <div className="flex items-center gap-1 my-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < d.lezzet_puani ? 'fill-amber-500 text-amber-500' : 'text-gray-600'}`} />
              ))}
            </div>

            {duzenlenenId === (d.kimlik || (d as any).id) ? (
              <div className="mt-3 space-y-2">
                <textarea
                  value={duzenlenenMetin}
                  onChange={(e) => setDuzenlenenMetin(e.target.value)}
                  className="w-full bg-[#0C020E] border border-purple-800 rounded-lg p-2 text-white text-xs focus:outline-none"
                  rows={3}
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setDuzenlenenId(null)}
                    className="px-3 py-1 rounded bg-gray-800 text-gray-300 text-xs cursor-pointer"
                  >
                    İptal
                  </button>
                  <button
                    type="button"
                    onClick={() => kaydet(d.kimlik || (d as any).id)}
                    className="px-3 py-1 rounded bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Save size={14} /> Kaydet
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-200 text-sm mt-1">{d.yorum_metni}</p>
            )}

            <div className="text-xs font-semibold mt-3">
              {d.onayli_mi ? (
                <span className="text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-800/50">✅ Yayında (Onaylı)</span>
              ) : (
                <span className="text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-800/50">⏳ Onay Bekliyor</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
