import React, { useState, useEffect } from 'react';
import { FileText, Receipt, Plus, Search, CheckCircle2, Building, User, Download, Printer, ShieldCheck, Wallet } from 'lucide-react';
import { BASLANGIC_FATURALARI, FaturaKaydi, yeniFaturaEkle, faturalariCanliDinle } from './faturaVeritabani';

export const FaturaMerkezi: React.FC = () => {
  const [faturaListesi, setFaturaListesi] = useState<FaturaKaydi[]>(BASLANGIC_FATURALARI);
  const [tipFiltresi, setTipFiltresi] = useState<string>('hepsi');
  const [aramaMetni, setAramaMetni] = useState('');
  const [yeniFaturaModalAcik, setYeniFaturaModalAcik] = useState(false);
  const [seciliFatura, setSeciliFatura] = useState<FaturaKaydi | null>(null);

  useEffect(() => {
    const abonelikDurdur = faturalariCanliDinle((guncel) => {
      setFaturaListesi(guncel);
    });
    return () => abonelikDurdur();
  }, []);

  // Form state
  const [faturaNo, setFaturaNo] = useState(`GPS-2026-${Math.floor(100 + Math.random() * 900)}`);
  const [faturaTipi, setFaturaTipi] = useState<'gider_pusulasi' | 'earSiv_fatura' | 'komisyon_faturasi' | 'kurye_makbuz'>('gider_pusulasi');
  const [kesen, setKesen] = useState('Afyon Ev Lezzetleri A.Ş.');
  const [alan, setAlan] = useState('Hatice Teyze Mantı Evi');
  const [tutar, setTutar] = useState('1250');
  const [kdvOrani, setKdvOrani] = useState('0');
  const [aciklama, setAciklama] = useState('Esnaf muafiyetli ev mutfağı ürün alım belgesi');

  const faturaOlustur = async (e: React.FormEvent) => {
    e.preventDefault();
    const brut = parseFloat(tutar) || 0;
    const kdvOranNum = parseFloat(kdvOrani) || 0;
    const kdvTutar = (brut * kdvOranNum) / (100 + kdvOranNum);
    const net = brut - kdvTutar;

    const yeni: FaturaKaydi = {
      id: `fat-${Date.now()}`,
      fatura_no: faturaNo,
      tip: faturaTipi,
      kesen_unvan: kesen,
      alan_unvan: alan,
      tutar: brut,
      kdv_orani: kdvOranNum,
      kdv_tutari: parseFloat(kdvTutar.toFixed(2)),
      net_tutar: parseFloat(net.toFixed(2)),
      tarih: new Date().toISOString().split('T')[0],
      durum: 'onaylandi',
      aciklama
    };

    await yeniFaturaEkle(yeni);
    setYeniFaturaModalAcik(false);
  };

  const filtrelenmisFaturalar = faturaListesi.filter(f => {
    const uyumTip = tipFiltresi === 'hepsi' || f.tip === tipFiltresi;
    const uyumArama = f.fatura_no.toLowerCase().includes(aramaMetni.toLowerCase()) ||
      f.kesen_unvan.toLowerCase().includes(aramaMetni.toLowerCase()) ||
      f.alan_unvan.toLowerCase().includes(aramaMetni.toLowerCase());
    return uyumTip && uyumArama;
  });

  const toplamCiro = faturaListesi.reduce((acc, f) => acc + f.tutar, 0);
  const toplamKdv = faturaListesi.reduce((acc, f) => acc + f.kdv_tutari, 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* 🌟 ÜST ÖZET KARTLARI */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#180A1F] border border-amber-500/40">
          <div className="flex items-center justify-between text-xs text-amber-200">
            <span>Toplam Fatura Hacmi</span>
            <FileText className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 mt-2">
            {toplamCiro.toLocaleString('tr-TR')} ₺
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Sistemdeki tüm fatura ve pusulalar</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#180A1F] border border-purple-500/40">
          <div className="flex items-center justify-between text-xs text-purple-200">
            <span>Gider Pusulaları (Ev Mutfak)</span>
            <Receipt className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">
            {faturaListesi.filter(f => f.tip === 'gider_pusulasi').length} Adet
          </div>
          <p className="text-[10px] text-gray-400 mt-1">GVK 9/10 Esnaf Muafiyet belgeleri</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#180A1F] border border-emerald-500/40">
          <div className="flex items-center justify-between text-xs text-emerald-200">
            <span>E-Arşiv / Satış Faturaları</span>
            <Building className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-2">
            {faturaListesi.filter(f => f.tip === 'earSiv_fatura').length} Adet
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Ticari mutfak ve müşteri faturaları</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#180A1F] border border-[#3E1646]">
          <div className="flex items-center justify-between text-xs text-gray-300">
            <span>Toplam KDV Toplamı</span>
            <Wallet className="w-4 h-4 text-purple-300" />
          </div>
          <div className="text-2xl font-black text-white mt-2">
            {toplamKdv.toLocaleString('tr-TR')} ₺
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Maliye beyanname KDV toplamı</p>
        </div>
      </div>

      {/* 🔍 FİLTRELEME & YENİ FATURA EKLEME */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-[#180A1F] border border-[#3E1646]">
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'hepsi', baslik: 'Tüm Belgeler' },
            { id: 'gider_pusulasi', baslik: 'Gider Pusulaları' },
            { id: 'earSiv_fatura', baslik: 'E-Arşiv Faturaları' },
            { id: 'komisyon_faturasi', baslik: 'Komisyon Faturaları' },
            { id: 'kurye_makbuz', baslik: 'Kurye Makbuzları' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTipFiltresi(t.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                tipFiltresi === t.id
                  ? 'bg-amber-500 text-purple-950 shadow-md'
                  : 'bg-[#120614] text-gray-400 hover:text-white border border-purple-900/60'
              }`}
            >
              {t.baslik}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-60">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={aramaMetni}
              onChange={(e) => setAramaMetni(e.target.value)}
              placeholder="Fatura no veya unvan ara..."
              className="w-full bg-[#120614] border border-purple-900 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
            />
          </div>
          <button
            onClick={() => setYeniFaturaModalAcik(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-[#130713] font-bold text-xs flex items-center gap-1.5 cursor-pointer hover:brightness-110 shadow-md shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Belge / Pusula Kes</span>
          </button>
        </div>
      </div>

      {/* 📋 FATURALAR LİSTESİ */}
      <div className="space-y-3">
        {filtrelenmisFaturalar.map((fatura) => (
          <div
            key={fatura.id}
            className="p-4 rounded-2xl bg-[#180A1F] border border-[#3E1646] hover:border-purple-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-amber-400 text-sm bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {fatura.fatura_no}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  fatura.tip === 'gider_pusulasi' ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                  fatura.tip === 'earSiv_fatura' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                  fatura.tip === 'komisyon_faturasi' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                  'bg-amber-950 text-amber-300 border border-amber-800'
                }`}>
                  {fatura.tip.replace('_', ' ')}
                </span>
                <span className="text-gray-400 text-[11px]">• {fatura.tarih}</span>
              </div>

              <div className="text-white font-bold flex items-center gap-2">
                <span>{fatura.kesen_unvan}</span>
                <span className="text-gray-500">→</span>
                <span>{fatura.alan_unvan}</span>
              </div>

              <p className="text-gray-300 text-[11px]">{fatura.aciklama}</p>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right">
                <div className="text-base font-black text-white">{fatura.tutar.toLocaleString('tr-TR')} ₺</div>
                <div className="text-[10px] text-gray-400">KDV: {fatura.kdv_tutari.toLocaleString('tr-TR')} ₺ (%{fatura.kdv_orani})</div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setSeciliFatura(fatura)}
                  className="px-3 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-800 border border-purple-700 text-purple-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  title="Faturayı Görüntüle / Yazdır"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-400" />
                  <span>Görüntüle</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 🌟 YENİ FATURA / PUSULA KESME MODALI */}
      {yeniFaturaModalAcik && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-[#180A1F] border border-amber-500/50 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl text-xs">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              Yeni Fatura / Gider Pusulası Kes
            </h3>
            <form onSubmit={faturaOlustur} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 block mb-1">Belge Tipi</label>
                  <select
                    value={faturaTipi}
                    onChange={(e) => setFaturaTipi(e.target.value as any)}
                    className="w-full bg-[#130713] border border-purple-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="gider_pusulasi">Gider Pusulası (Ev Mutfak)</option>
                    <option value="earSiv_fatura">E-Arşiv Fatura (Ticari)</option>
                    <option value="komisyon_faturasi">Komisyon Faturası</option>
                    <option value="kurye_makbuz">Kurye Gider Pusulası</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">Fatura / Belge No</label>
                  <input
                    type="text"
                    required
                    value={faturaNo}
                    onChange={(e) => setFaturaNo(e.target.value)}
                    className="w-full bg-[#130713] border border-purple-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 block mb-1">Kesen (Unvan / Ad Soyad)</label>
                  <input
                    type="text"
                    required
                    value={kesen}
                    onChange={(e) => setKesen(e.target.value)}
                    className="w-full bg-[#130713] border border-purple-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">Alan (Müşteri / Mutfak)</label>
                  <input
                    type="text"
                    required
                    value={alan}
                    onChange={(e) => setAlan(e.target.value)}
                    className="w-full bg-[#130713] border border-purple-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 block mb-1">Toplam Tutar (TL)</label>
                  <input
                    type="number"
                    required
                    value={tutar}
                    onChange={(e) => setTutar(e.target.value)}
                    className="w-full bg-[#130713] border border-purple-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400 font-bold"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">KDV Oranı (%)</label>
                  <select
                    value={kdvOrani}
                    onChange={(e) => setKdvOrani(e.target.value)}
                    className="w-full bg-[#130713] border border-purple-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="0">%0 (Muaf / Gider Pusulası)</option>
                    <option value="1">%1 (Temel Gıda)</option>
                    <option value="10">%10 (Gıda / Yemek)</option>
                    <option value="20">%20 (Genel Hizmet)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Açıklama / Not</label>
                <input
                  type="text"
                  value={aciklama}
                  onChange={(e) => setAciklama(e.target.value)}
                  className="w-full bg-[#130713] border border-purple-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-purple-950">
                <button
                  type="button"
                  onClick={() => setYeniFaturaModalAcik(false)}
                  className="px-4 py-2 rounded-xl bg-purple-950 text-gray-300 font-bold cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-gray-950 font-extrabold cursor-pointer hover:brightness-110"
                >
                  Belgeyi Kes & Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🖨️ FATURA GÖRÜNTÜLEME & YAZDIRMA MODALI */}
      {seciliFatura && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-white text-gray-900 rounded-3xl w-full max-w-lg p-8 space-y-6 shadow-2xl relative text-xs">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-lg font-black text-[#180A1F]">AFYON EV LEZZETLERİ A.Ş.</h2>
                <p className="text-[10px] text-gray-500">Merkez Vergi Dairesi: 0123456789 • Afyonkarahisar</p>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 rounded-lg bg-purple-100 text-purple-900 font-mono font-bold text-sm">
                  {seciliFatura.fatura_no}
                </span>
                <p className="text-[10px] text-gray-500 mt-1">{seciliFatura.tarih}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
              <div>
                <span className="text-[10px] text-gray-500 block font-bold uppercase">Kesen / Düzenleyen:</span>
                <strong className="text-sm">{seciliFatura.kesen_unvan}</strong>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 block font-bold uppercase">Alıcı / Müşteri:</span>
                <strong className="text-sm">{seciliFatura.alan_unvan}</strong>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-gray-600 font-medium">Açıklama: {seciliFatura.aciklama}</div>
              <div className="flex justify-between py-2 border-b">
                <span>Belge Türü:</span>
                <strong className="uppercase">{seciliFatura.tip.replace('_', ' ')}</strong>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span>Matrah / Tutar:</span>
                <strong className="font-mono">{seciliFatura.net_tutar.toLocaleString('tr-TR')} ₺</strong>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span>KDV (%{seciliFatura.kdv_orani}):</span>
                <strong className="font-mono">{seciliFatura.kdv_tutari.toLocaleString('tr-TR')} ₺</strong>
              </div>
              <div className="flex justify-between py-3 text-base font-black text-[#180A1F] border-t-2">
                <span>Genel Toplam:</span>
                <span className="font-mono">{seciliFatura.tutar.toLocaleString('tr-TR')} ₺</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-purple-900 text-white font-bold flex items-center gap-1.5 cursor-pointer hover:bg-purple-800"
              >
                <Printer className="w-4 h-4" />
                <span>Yazdır / PDF İndir</span>
              </button>
              <button
                onClick={() => setSeciliFatura(null)}
                className="px-5 py-2 rounded-xl bg-gray-200 text-gray-800 font-bold cursor-pointer hover:bg-gray-300"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
