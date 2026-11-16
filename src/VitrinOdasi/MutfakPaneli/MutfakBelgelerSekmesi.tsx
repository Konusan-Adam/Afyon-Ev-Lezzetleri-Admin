import React, { useState, useEffect } from 'react';
import { 
  Award, 
  FileCheck2, 
  ShieldCheck, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Save 
} from 'lucide-react';
import { RESMI_BELGE_REHBERI } from '@/src/MalzemeCekmeceleri/MutfakYonetimi/BelgelerVeIzinler';
import { canliFirebaseAktifMi } from '@/src/veritabani/FirebaseIstemcisi';
import { belgeGetir, belgeKaydet } from '@/src/veritabani/FirebaseKoleksiyonServisi';
import { patronBildirimiEkle } from '@/src/MalzemeCekmeceleri/PatronBildirimServisi';

interface MutfakBelgelerSekmesiProps {
  mutfakId: string;
  mutfakAdi: string;
}

export const MutfakBelgelerSekmesi: React.FC<MutfakBelgelerSekmesiProps> = ({ mutfakId, mutfakAdi }) => {
  const [hijyenNo, setHijyenNo] = useState('MEB-2026-AFY-847291');
  const [hijyenKurum, setHijyenKurum] = useState('Afyonkarahisar Halk Eğitimi Merkezi');
  const [hijyenTarih, setHijyenTarih] = useState('2026-03-15');
  const [hijyenOnayDurumu, setHijyenOnayDurumu] = useState<'onaylandi' | 'beklemede' | 'reddedildi'>('onaylandi');

  const [muafiyetNo, setMuafiyetNo] = useState('GVK-03-2026-8812');
  const [vergiDairesi, setVergiDairesi] = useState('Afyonkarahisar Kocatepe Vergi Dairesi');
  const [muafiyetTarih, setMuafiyetTarih] = useState('2026-02-10');
  const [muafiyetOnayDurumu, setMuafiyetOnayDurumu] = useState<'onaylandi' | 'beklemede' | 'reddedildi'>('onaylandi');

  const [kaydedildi, setKaydedildi] = useState(false);

  useEffect(() => {
    let aktif = true;
    async function belgeleriCek() {
      if (canliFirebaseAktifMi() && mutfakId) {
        try {
          const mutfak = await belgeGetir<any>('mutfaklar', mutfakId);
          if (mutfak && mutfak.belgeler && aktif) {
            const b = mutfak.belgeler;
            setHijyenNo(b.hijyenBarkodNo || hijyenNo);
            setHijyenKurum(b.hijyenKurum || hijyenKurum);
            setHijyenTarih(b.hijyenVerilisTarihi || hijyenTarih);
            setHijyenOnayDurumu(b.hijyenOnayDurumu || (mutfak.hijyen_onayli_mi ? 'onaylandi' : 'beklemede'));

            setMuafiyetNo(b.vergiMuafiyetNo || muafiyetNo);
            setVergiDairesi(b.vergiDairesi || vergiDairesi);
            setMuafiyetTarih(b.muafiyetVerilisTarihi || muafiyetTarih);
            setMuafiyetOnayDurumu(b.muafiyetOnayDurumu || (mutfak.esnaf_muafiyet_onayli_mi ? 'onaylandi' : 'beklemede'));
          }
        } catch (err) {
          console.warn('Belge çekme hatası:', err);
        }
      }
    }
    belgeleriCek();
    return () => { aktif = false; };
  }, [mutfakId]);

  const guncelle = async (e: React.FormEvent) => {
    e.preventDefault();
    setKaydedildi(true);
    setTimeout(() => setKaydedildi(false), 4000);

    const yeniBelgeler = {
      hijyenBarkodNo: hijyenNo,
      hijyenKurum,
      hijyenVerilisTarihi: hijyenTarih,
      hijyenOnayDurumu: 'beklemede',
      vergiMuafiyetNo: muafiyetNo,
      vergiDairesi,
      muafiyetVerilisTarihi: muafiyetTarih,
      muafiyetOnayDurumu: 'beklemede'
    };

    setHijyenOnayDurumu('beklemede');
    setMuafiyetOnayDurumu('beklemede');

    if (canliFirebaseAktifMi() && mutfakId) {
      try {
        await belgeKaydet('mutfaklar', mutfakId, {
          belgeler: yeniBelgeler,
          hijyen_onayli_mi: false,
          esnaf_muafiyet_onayli_mi: false,
          onay_durumu: 'beklemede',
          onayli_mi: false
        });
        patronBildirimiEkle(
          'eksik_belge',
          'Resmi Belge Güncellemesi 📜',
          `${mutfakAdi} yasal hijyen ve muafiyet belgelerini güncelledi. Patron onayı bekleniyor.`,
          mutfakId,
          { hedefSekme: 'mutfaklar' }
        );
      } catch (err) {
        console.warn('Belge kaydetme hatası:', err);
      }
    }
  };

  const hijyenOnayli = hijyenOnayDurumu === 'onaylandi';
  const muafiyetOnayli = muafiyetOnayDurumu === 'onaylandi';

  return (
    <div className="space-y-6 text-white animate-fadeIn">
      {/* Üst Bilgilendirme Kartı */}
      <div className="p-4 rounded-2xl bg-[#1A081D] border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-purple-900/50 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-sm sm:text-base flex items-center gap-2">
              <span>{mutfakAdi} — Resmi Yasal İzin & Belge Dosyası</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                hijyenOnayli && muafiyetOnayli
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                  : 'bg-amber-950 text-amber-300 border-amber-700'
              }`}>
                {hijyenOnayli && muafiyetOnayli ? '✓ Yasal Satışa Uygun' : '⏳ Patron Onayı Bekliyor'}
              </span>
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Afyon Ev Lezzetleri platformunda ev mutfağınızın yasal koruma altında faaliyet göstermesi için gerekli resmi kayıtlar.
            </p>
          </div>
        </div>
      </div>

      {kaydedildi && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-600 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Belge bilgileriniz başarıyla Patron Masası inceleme onayına iletildi.</span>
        </div>
      )}

      {/* 2 Temel Belge Kartı Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        
        {/* 1. KART: MEB Hijyen Eğitimi Belgesi */}
        <div className="p-5 rounded-2xl bg-[#180A1F] border border-[#3E1646] space-y-4 shadow-lg flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-purple-950 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-amber-400" />
                <h4 className="font-bold text-white sm:text-sm">MEB Hijyen Eğitimi Belgesi</h4>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                hijyenOnayDurumu === 'onaylandi'
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                  : hijyenOnayDurumu === 'reddedildi'
                  ? 'bg-rose-950/80 text-rose-300 border-rose-700'
                  : 'bg-amber-950/80 text-amber-300 border-amber-700'
              }`}>
                {hijyenOnayDurumu === 'onaylandi' ? '✓ Patron Onaylı' : hijyenOnayDurumu === 'reddedildi' ? '✕ Reddedildi' : '⏳ İncelemede'}
              </span>
            </div>

            <div className="text-[11px] text-gray-300 bg-purple-950/30 p-2.5 rounded-xl border border-purple-900/40 leading-relaxed">
              <p className="font-semibold text-[#DDAF53]">{RESMI_BELGE_REHBERI.hijyen.kanun}</p>
              <p className="mt-1 text-gray-400">{RESMI_BELGE_REHBERI.hijyen.nasilAlinir}</p>
              <a
                href={RESMI_BELGE_REHBERI.hijyen.eDevletLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 text-amber-300 hover:text-white flex items-center gap-1 font-bold underline cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>e-Devlet MEB Sertifika Sorgulama Ekranı</span>
              </a>
            </div>

            <div className="space-y-2 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-gray-300 mb-1">e-Devlet Belge Barkod No</label>
                <input
                  type="text"
                  value={hijyenNo}
                  onChange={(e) => setHijyenNo(e.target.value)}
                  className="w-full bg-[#240C28] border border-purple-800/50 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-300 mb-1">Veren Kurum</label>
                <input
                  type="text"
                  value={hijyenKurum}
                  onChange={(e) => setHijyenKurum(e.target.value)}
                  className="w-full bg-[#240C28] border border-purple-800/50 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-300 mb-1">Belge Veriliş Tarihi</label>
                <input
                  type="date"
                  value={hijyenTarih}
                  onChange={(e) => setHijyenTarih(e.target.value)}
                  className="w-full bg-[#240C28] border border-purple-800/50 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. KART: GVK Esnaf Vergi Muafiyet Belgesi */}
        <div className="p-5 rounded-2xl bg-[#180A1F] border border-[#3E1646] space-y-4 shadow-lg flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-purple-950 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <h4 className="font-bold text-white sm:text-sm">GVK 9/10 Esnaf Vergi Muafiyeti</h4>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                muafiyetOnayDurumu === 'onaylandi'
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                  : muafiyetOnayDurumu === 'reddedildi'
                  ? 'bg-rose-950/80 text-rose-300 border-rose-700'
                  : 'bg-amber-950/80 text-amber-300 border-amber-700'
              }`}>
                {muafiyetOnayDurumu === 'onaylandi' ? '✓ Patron Onaylı' : muafiyetOnayDurumu === 'reddedildi' ? '✕ Reddedildi' : '⏳ İncelemede'}
              </span>
            </div>

            <div className="text-[11px] text-gray-300 bg-purple-950/30 p-2.5 rounded-xl border border-purple-900/40 leading-relaxed">
              <p className="font-semibold text-[#DDAF53]">{RESMI_BELGE_REHBERI.esnafMuafiyeti.kanun}</p>
              <p className="mt-1 text-gray-400">{RESMI_BELGE_REHBERI.esnafMuafiyeti.nasilAlinir}</p>
              <a
                href={RESMI_BELGE_REHBERI.esnafMuafiyeti.eDevletLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 text-amber-300 hover:text-white flex items-center gap-1 font-bold underline cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Dijital Vergi Dairesi (ivd.gib.gov.tr)</span>
              </a>
            </div>

            <div className="space-y-2 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-gray-300 mb-1">Muafiyet Belge / Sicil No</label>
                <input
                  type="text"
                  value={muafiyetNo}
                  onChange={(e) => setMuafiyetNo(e.target.value)}
                  className="w-full bg-[#240C28] border border-purple-800/50 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-300 mb-1">Bağlı Olunan Vergi Dairesi</label>
                <input
                  type="text"
                  value={vergiDairesi}
                  onChange={(e) => setVergiDairesi(e.target.value)}
                  className="w-full bg-[#240C28] border border-purple-800/50 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-300 mb-1">Belge Veriliş Tarihi</label>
                <input
                  type="date"
                  value={muafiyetTarih}
                  onChange={(e) => setMuafiyetTarih(e.target.value)}
                  className="w-full bg-[#240C28] border border-purple-800/50 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Kaydet Butonu */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={guncelle}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-gray-950 font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Belge Bilgilerini Patron Onayına Gönder</span>
        </button>
      </div>
    </div>
  );
};
