import React, { useState, useEffect } from 'react';
import { Users, Search, Wallet, Phone, Mail, Plus, Trash2, Edit3, Check, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { TestMusteri } from '@/src/veritabani/CanliVeriYardimcisi';
import { canliFirebaseAktifMi } from '@/src/veritabani/FirebaseIstemcisi';
import { koleksiyonGetir } from '@/src/veritabani/FirebaseKoleksiyonServisi';

export const YonetimMusteriler: React.FC = () => {
  const [musteriler, setMusteriler] = useState<(TestMusteri & { askida_mi?: boolean })[]>([]);
  const [aramaMetni, setAramaMetni] = useState<string>('');
  const [yeniModalAcik, setYeniModalAcik] = useState<boolean>(false);

  useEffect(() => {
    async function yukle() {
      if (canliFirebaseAktifMi()) {
        try {
          const tumKullanicilar = await koleksiyonGetir<any>('kullanicilar');
          const fbMusteriler: (TestMusteri & { askida_mi?: boolean })[] = tumKullanicilar
            .filter((k) => !k.rol || k.rol === 'musteri')
            .map((k) => ({
              id: k.id || k.kimlik,
              ad_soyad: k.ad_soyad || 'İsimsiz Müşteri',
              telefon: k.telefon || '',
              eposta: k.eposta || '',
              cuzdan_bakiyesi: k.cuzdan_bakiyesi ?? 0,
              varsayilan_adres_id: 'adr-1',
              kayit_tarihi: k.olusturma_tarihi ? k.olusturma_tarihi.split('T')[0] : 'Bugün',
              askida_mi: k.onayli_mi === false
            }));

          if (fbMusteriler.length > 0) {
            setMusteriler(fbMusteriler);
            return;
          }
        } catch (err) {
          console.warn('Firebase müşteri çekme hatası:', err);
        }
      }
      setMusteriler([]);
    }
    yukle();
  }, []);
  
  // Yeni müşteri formu
  const [adSoyad, setAdSoyad] = useState('');
  const [telefon, setTelefon] = useState('');
  const [eposta, setEposta] = useState('');
  const [bakiye, setBakiye] = useState('100');

  const musteriEkle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adSoyad || !telefon) return;

    const yeniMusteri: TestMusteri & { askida_mi?: boolean } = {
      id: `musteri-${Date.now()}`,
      ad_soyad: adSoyad,
      telefon,
      eposta: eposta || 'ornek@eposta.com',
      cuzdan_bakiyesi: parseFloat(bakiye) || 0,
      varsayilan_adres_id: 'adr-1',
      kayit_tarihi: new Date().toISOString().split('T')[0],
      askida_mi: false
    };

    setMusteriler([yeniMusteri, ...musteriler]);
    setAdSoyad('');
    setTelefon('');
    setEposta('');
    setBakiye('100');
    setYeniModalAcik(false);
  };

  const musteriSil = (id: string) => {
    if (confirm('Bu müşteriyi kalıcı olarak silmek istediğinize emin misiniz?')) {
      setMusteriler(musteriler.filter(m => m.id !== id));
    }
  };

  const askiyaAlDegistir = (id: string) => {
    setMusteriler(musteriler.map(m => {
      if (m.id === id) {
        return { ...m, askida_mi: !m.askida_mi };
      }
      return m;
    }));
  };

  const cuzdanGuncelle = (id: string) => {
    const m = musteriler.find(item => item.id === id);
    if (!m) return;
    const yeniBakiyeStr = prompt(`${m.ad_soyad} için yeni cüzdan bakiyesini girin (TL):`, m.cuzdan_bakiyesi.toString());
    if (yeniBakiyeStr !== null) {
      const yeniBakiye = parseFloat(yeniBakiyeStr);
      if (!isNaN(yeniBakiye)) {
        setMusteriler(musteriler.map(item => item.id === id ? { ...item, cuzdan_bakiyesi: yeniBakiye } : item));
      }
    }
  };

  const filtrelenmisMusteriler = musteriler.filter(
    (m) =>
      m.ad_soyad.toLowerCase().includes(aramaMetni.toLowerCase()) ||
      m.telefon.includes(aramaMetni) ||
      m.eposta.toLowerCase().includes(aramaMetni.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Üst Bilgi & Arama & Ekleme */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#1A0A1D] p-5 rounded-2xl border border-[#3E1646]">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-[#DDAF53]" />
            Müşteri Yönetimi & Tam Kontrol (CRUD, Askıya Al & Sil)
          </h2>
          <p className="text-xs text-[#9866A3] mt-1">
            Kayıtlı müşterileri ekleyin, cüzdanlarını düzenleyin, askıya alın veya kalıcı olarak silin.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="İsim veya telefon ara..."
              value={aramaMetni}
              onChange={(e) => setAramaMetni(e.target.value)}
              className="w-full sm:w-60 bg-[#130713] border border-[#4D1857] rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#DDAF53]"
            />
          </div>
          <button
            type="button"
            onClick={() => setYeniModalAcik(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-[#130713] font-bold text-xs flex items-center gap-1.5 cursor-pointer hover:brightness-110 shadow-md shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Müşteri Ekle</span>
          </button>
        </div>
      </div>

      {/* Müşteri Listesi Tablosu */}
      <div className="bg-[#1A0A1D] rounded-2xl border border-[#3E1646] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#140618] text-[#DDAF53] text-xs uppercase border-b border-[#3E1646]">
              <tr>
                <th className="px-5 py-3.5">Müşteri Bilgisi</th>
                <th className="px-5 py-3.5">İletişim</th>
                <th className="px-5 py-3.5">Cüzdan Bakiyesi</th>
                <th className="px-5 py-3.5">Hesap Durumu</th>
                <th className="px-5 py-3.5 text-right">Tam Kontrol (İşlemler)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3E1646] text-gray-300">
              {filtrelenmisMusteriler.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-gray-500">
                    Arama kriterine uygun müşteri bulunamadı.
                  </td>
                </tr>
              ) : (
                filtrelenmisMusteriler.map((musteri) => {
                  const askida = musteri.askida_mi;
                  return (
                    <tr key={musteri.id} className={`hover:bg-[#200C25] transition-colors ${askida ? 'bg-rose-950/20' : ''}`}>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-white flex items-center gap-2">
                          <span>{musteri.ad_soyad}</span>
                          {askida && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                              Askıda
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[#9866A3]">ID: {musteri.id}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-gray-300">
                          <Phone className="w-3.5 h-3.5 text-[#DDAF53]" />
                          {musteri.telefon}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                          <Mail className="w-3.5 h-3.5 text-purple-400" />
                          {musteri.eposta}
                        </div>
                      </td>
                      <td className="px-5 py-4 font-bold text-emerald-400">
                        <div className="flex items-center gap-1">
                          <Wallet className="w-4 h-4 text-emerald-500" />
                          {musteri.cuzdan_bakiyesi.toFixed(2)} ₺
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs">
                        <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                          askida ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}>
                          {askida ? '🔒 Askıda / Kısıtlı' : '🟢 Aktif Hesap'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => cuzdanGuncelle(musteri.id)}
                          className="px-3 py-1.5 rounded-xl bg-purple-900/40 border border-purple-800 text-purple-200 hover:bg-purple-800 text-xs font-medium transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Cüzdan
                        </button>
                        <button
                          type="button"
                          onClick={() => askiyaAlDegistir(musteri.id)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1 ${
                            askida ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300 hover:bg-emerald-900' : 'bg-amber-950/80 border-amber-800 text-amber-300 hover:bg-amber-900'
                          }`}
                        >
                          {askida ? 'Aktif Et' : 'Askıya Al'}
                        </button>
                        <button
                          type="button"
                          onClick={() => musteriSil(musteri.id)}
                          className="px-2.5 py-1.5 rounded-xl bg-rose-950/60 border border-rose-900 text-rose-300 hover:bg-rose-900 text-xs transition-colors cursor-pointer inline-flex items-center gap-1"
                          title="Müşteriyi Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Yeni Müşteri Modal */}
      {yeniModalAcik && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-[#1A0A1D] border border-amber-500/50 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl text-xs">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              Yeni Müşteri Kaydı Ekle
            </h3>
            <form onSubmit={musteriEkle} className="space-y-3">
              <div>
                <label className="text-gray-400 block mb-1">Ad Soyad</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Ayşe Yılmaz"
                  value={adSoyad}
                  onChange={(e) => setAdSoyad(e.target.value)}
                  className="w-full bg-[#130713] border border-purple-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-gray-400 block mb-1">Telefon</label>
                <input
                  type="text"
                  required
                  placeholder="05XX XXX XX XX"
                  value={telefon}
                  onChange={(e) => setTelefon(e.target.value)}
                  className="w-full bg-[#130713] border border-purple-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-gray-400 block mb-1">E-posta</label>
                <input
                  type="email"
                  placeholder="ornek@eposta.com"
                  value={eposta}
                  onChange={(e) => setEposta(e.target.value)}
                  className="w-full bg-[#130713] border border-purple-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-gray-400 block mb-1">Başlangıç Cüzdan Bakiyesi (TL)</label>
                <input
                  type="number"
                  value={bakiye}
                  onChange={(e) => setBakiye(e.target.value)}
                  className="w-full bg-[#130713] border border-purple-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-purple-950">
                <button
                  type="button"
                  onClick={() => setYeniModalAcik(false)}
                  className="px-4 py-2 rounded-xl bg-purple-950 text-gray-300 font-bold cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-gray-950 font-extrabold cursor-pointer hover:brightness-110"
                >
                  Müşteriyi Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
