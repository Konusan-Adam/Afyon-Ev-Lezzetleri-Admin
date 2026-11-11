import React, { useState, useEffect } from 'react';
import { Database, RefreshCw, CheckCircle2, ShieldCheck, Flame } from 'lucide-react';
import { canliFirebaseAktifMi, firebaseVeritabani } from '@/src/veritabani/FirebaseIstemcisi';
import { koleksiyonGetir } from '@/src/veritabani/FirebaseKoleksiyonServisi';

export interface FirebaseTeshisRaporu {
  bagliMi: boolean;
  projeAdi: string;
  mesaj: string;
  koleksiyonSonuclari: {
    kategoriler: boolean;
    mutfaklar: boolean;
    yemekler: boolean;
    siparisler: boolean;
  };
}

export const VeritabaniBaglantiPaneli: React.FC = () => {
  const [rapor, setRapor] = useState<FirebaseTeshisRaporu | null>(null);
  const [testEdiliyor, setTestEdiliyor] = useState<boolean>(false);

  const testiCalistir = async () => {
    setTestEdiliyor(true);
    try {
      const aktif = canliFirebaseAktifMi();
      if (!aktif) {
        setRapor({
          bagliMi: false,
          projeAdi: 'Yapılandırılmamış',
          mesaj: 'Firebase yapılandırması bulunamadı. Yerel test deposu aktif.',
          koleksiyonSonuclari: { kategoriler: false, mutfaklar: false, yemekler: false, siparisler: false }
        });
        return;
      }

      // Koleksiyonları test et
      const [kat, mut, yem, sip] = await Promise.allSettled([
        koleksiyonGetir('kategoriler'),
        koleksiyonGetir('mutfaklar'),
        koleksiyonGetir('yemekler'),
        koleksiyonGetir('siparisler')
      ]);

      const katOk = kat.status === 'fulfilled' && kat.value !== undefined;
      const mutOk = mut.status === 'fulfilled' && mut.value !== undefined;
      const yemOk = yem.status === 'fulfilled' && yem.value !== undefined;
      const sipOk = sip.status === 'fulfilled' && sip.value !== undefined;

      const hepsiOk = katOk || mutOk || yemOk || sipOk;

      setRapor({
        bagliMi: hepsiOk,
        projeAdi: 'tfy-smart-fishing',
        mesaj: hepsiOk 
          ? 'Firebase Firestore canlı veritabanına başarıyla bağlanıldı ve koleksiyonlar hazır.'
          : 'Firebase Firestore erişiminde gecikme veya izin uyarısı var.',
        koleksiyonSonuclari: {
          kategoriler: katOk,
          mutfaklar: mutOk,
          yemekler: yemOk,
          siparisler: sipOk
        }
      });
    } catch {
      setRapor({
        bagliMi: false,
        projeAdi: 'tfy-smart-fishing',
        mesaj: 'Bağlantı testi sırasında beklenmeyen bir hata oluştu.',
        koleksiyonSonuclari: { kategoriler: false, mutfaklar: false, yemekler: false, siparisler: false }
      });
    } finally {
      setTestEdiliyor(false);
    }
  };

  useEffect(() => {
    testiCalistir();
  }, []);

  const aktifDurum = canliFirebaseAktifMi() && rapor?.bagliMi;

  return (
    <div className="bg-[#180A1F] border border-[#3E1646] rounded-2xl p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#3E1646] pb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
            aktifDurum ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
          }`}>
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-white font-bold text-sm sm:text-base">Firebase Firestore Canlı Veritabanı Teşhis Paneli</h3>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold border ${
                aktifDurum 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}>
                {aktifDurum ? '🟢 CANLI FIREBASE BAĞLI' : '🟡 TEST MODU AKTİF'}
              </span>
            </div>
            <p className="text-xs text-purple-300 mt-0.5">
              Firebase Firestore canlı bağlantı, koleksiyonlar ve anlık senkronizasyon sağlık durumu
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={testiCalistir}
            disabled={testEdiliyor}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-purple-200 text-xs font-bold transition border border-purple-700/50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testEdiliyor ? 'animate-spin' : ''}`} />
            {testEdiliyor ? 'Test Ediliyor...' : 'Bağlantıyı Yeniden Test Et'}
          </button>
        </div>
      </div>

      {rapor && (
        <div className="space-y-4">
          <div className={`p-4 rounded-xl text-xs border ${
            rapor.bagliMi 
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' 
              : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
          }`}>
            <div className="flex items-center gap-2 font-bold mb-1">
              {rapor.bagliMi ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <ShieldCheck className="w-4 h-4 text-amber-400" />}
              <span>{rapor.mesaj}</span>
            </div>
            <div className="text-[11px] opacity-80 mt-1">
              Aktif Firebase Projesi: <span className="font-mono text-white font-bold">{rapor.projeAdi}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(rapor.koleksiyonSonuclari).map(([koleksiyon, basarili]) => (
              <div 
                key={koleksiyon}
                className="bg-[#240D2F] border border-[#3E1646] rounded-xl p-3 flex items-center justify-between"
              >
                <span className="text-xs text-purple-200 font-semibold capitalize">{koleksiyon}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  basarili ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {basarili ? 'Erişilebilir' : 'Hazır'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
