import React, { useState, useEffect } from 'react';
import { XCircle, Trash2, X } from 'lucide-react';
import type { MutfakAfisiKaydi } from '@/src/MalzemeCekmeceleri/useCanliMutfakAfisleri';

interface AfisRedModalProps {
  afis: MutfakAfisiKaydi | null;
  onKapat: () => void;
  onOnayla: (afisId: string, gerekce: string) => Promise<void>;
}

export const AfisRedModali: React.FC<AfisRedModalProps> = ({ afis, onKapat, onOnayla }) => {
  const [gerekce, setGerekce] = useState('Görsel veya metin vitrin standartlarına uygun değil.');
  const [isleniyor, setIsleniyor] = useState(false);

  useEffect(() => {
    if (afis) {
      setGerekce(
        afis.red_nedeni ||
          afis.red_gerekcesi ||
          'Görsel veya metin vitrin standartlarına uygun değil.'
      );
    }
  }, [afis]);

  if (!afis) return null;

  const gonder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsleniyor(true);
    try {
      await onOnayla(afis.id, gerekce.trim() || 'Yönetici tarafından yayından kaldırıldı.');
      onKapat();
    } finally {
      setIsleniyor(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <form
        onSubmit={gonder}
        className="bg-[#180A1F] border border-rose-500/50 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl text-xs"
      >
        <div className="flex items-center justify-between border-b border-purple-950 pb-3">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-rose-400" />
            <div>
              <h4 className="text-sm font-extrabold text-white">Afişi Reddet / Yayından Kaldır</h4>
              <p className="text-[11px] text-purple-300 truncate max-w-[260px]">
                {afis.mutfak_adi || 'Ev Mutfağı'} — {afis.baslik}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onKapat}
            className="w-8 h-8 rounded-full bg-purple-950 text-gray-400 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <label className="text-gray-300 font-semibold block mb-1.5">Red / Kaldırma Nedeni</label>
          <textarea
            rows={3}
            required
            value={gerekce}
            onChange={(e) => setGerekce(e.target.value)}
            placeholder="Örn: Afiş görseli çözünürlüğü düşük veya kampanya süresi sona erdi."
            className="w-full bg-[#120614] border border-purple-800/70 rounded-xl p-3 text-white outline-none focus:border-rose-400 resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-purple-950">
          <button
            type="button"
            onClick={onKapat}
            className="px-4 py-2 rounded-xl bg-purple-950 text-gray-300 font-bold cursor-pointer"
          >
            Vazgeç
          </button>
          <button
            type="submit"
            disabled={isleniyor}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold cursor-pointer disabled:opacity-50"
          >
            {isleniyor ? 'Kaydediliyor...' : 'Reddet ve Yayından Kaldır'}
          </button>
        </div>
      </form>
    </div>
  );
};

interface AfisSilModalProps {
  afis: MutfakAfisiKaydi | null;
  onKapat: () => void;
  onSil: (afisId: string) => Promise<void>;
}

export const AfisSilModali: React.FC<AfisSilModalProps> = ({ afis, onKapat, onSil }) => {
  const [siliniyor, setSiliniyor] = useState(false);

  if (!afis) return null;

  const onay = async () => {
    setSiliniyor(true);
    try {
      await onSil(afis.id);
      onKapat();
    } finally {
      setSiliniyor(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="bg-[#180A1F] border border-rose-500/50 rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl text-xs">
        <div className="flex items-center gap-2.5 text-rose-400">
          <Trash2 className="w-5 h-5" />
          <h4 className="text-sm font-extrabold text-white">Afişi Kalıcı Olarak Sil</h4>
        </div>
        <p className="text-gray-300 leading-relaxed">
          <strong className="text-white">{afis.baslik}</strong> ({afis.mutfak_adi || 'Ev Mutfağı'}) afiş kaydını Firestore veritabanından silmek istediğinize emin misiniz?
        </p>
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-purple-950">
          <button
            type="button"
            onClick={onKapat}
            className="px-4 py-2 rounded-xl bg-purple-950 text-gray-300 font-bold cursor-pointer"
          >
            Vazgeç
          </button>
          <button
            type="button"
            disabled={siliniyor}
            onClick={onay}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold cursor-pointer disabled:opacity-50"
          >
            {siliniyor ? 'Siliniyor...' : 'Evet, Kalıcı Sil'}
          </button>
        </div>
      </div>
    </div>
  );
};
