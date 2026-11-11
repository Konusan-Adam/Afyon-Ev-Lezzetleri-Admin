import React, { useState, useEffect } from 'react';
import { Sparkles, Power, CheckCircle, Save, MessageSquare, Bot } from 'lucide-react';
import { useLezzetDanismaniAyarlari } from '@/src/MalzemeCekmeceleri/YapayZekaDanismani/LezzetDanismaniAyarKancasi';

export const YonetimLezzetDanismani: React.FC = () => {
  const { ayarlar, ayarlariGuncelle } = useLezzetDanismaniAyarlari();
  const [aktif, setAktif] = useState<boolean>(ayarlar.aktifMi);
  const [karsilama, setKarsilama] = useState<string>(ayarlar.karsilamaMesaji);
  const [baloncuk, setBaloncuk] = useState<string>(ayarlar.baloncukMetni);
  const [kaydedildi, setKaydedildi] = useState<boolean>(false);

  // Veritabanından veya yerelden yeni ayar geldiğinde form alanlarını senkronize tut
  useEffect(() => {
    setAktif(ayarlar.aktifMi);
    setKarsilama(ayarlar.karsilamaMesaji);
    setBaloncuk(ayarlar.baloncukMetni);
  }, [ayarlar]);

  // Canlı Test Alanı
  const [testMesaji, setTestMesaji] = useState<string>('Öğle yemeği için yöresel ne tavsiye edersiniz?');
  const [testCevabi, setTestCevabi] = useState<string>('');
  const [testYukleniyor, setTestYukleniyor] = useState<boolean>(false);

  const kaydet = async () => {
    await ayarlariGuncelle({
      aktifMi: aktif,
      karsilamaMesaji: karsilama,
      baloncukMetni: baloncuk,
    });
    setKaydedildi(true);
    setTimeout(() => setKaydedildi(false), 2500);
  };

  const testCalistir = async () => {
    if (!testMesaji.trim() || testYukleniyor) return;
    setTestYukleniyor(true);
    setTestCevabi('');
    try {
      const res = await fetch('/api/lezzet-danismani', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mesaj: testMesaji, gecmis: [] }),
      });
      const veri = await res.json();
      setTestCevabi(veri.cevap || 'Danışmandan yanıt alınamadı.');
    } catch {
      setTestCevabi('Bağlantı hatası oluştu.');
    } finally {
      setTestYukleniyor(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fadeIn">
      {/* 🌟 ÜST BİLGİ & DURUM KARTI */}
      <div className="p-6 rounded-2xl bg-[#180A1F] border border-[#3E1646] shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-purple-950/80">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-inner">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg lg:text-xl font-extrabold text-white tracking-wide flex items-center gap-2">
                <span>Yapay Zeka Lezzet Danışmanı</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Canlı Motor
                </span>
              </h2>
              <p className="text-xs text-purple-300/80 mt-0.5">
                Müşterilerimize Afyon mutfağını saygılı ve kurumsal bir dille tanıtan akıllı asistan
              </p>
            </div>
          </div>

          {/* Aç/Kapat Butonu (Lüks Koyu Tema) */}
          <button
            type="button"
            onClick={() => setAktif(!aktif)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-md ${
              aktif
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-900/90'
                : 'bg-rose-950/70 text-rose-300 border border-rose-800/50 hover:bg-rose-900/80'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{aktif ? 'Danışman: Açık (Vitrinde Yayında)' : 'Danışman: Kapalı (Devre Dışı)'}</span>
          </button>
        </div>

        {/* ⚙️ AYAR ALANLARI */}
        <div className="mt-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-purple-200 mb-1.5">
              Hareketli Logo Yanında Görünen Selam Baloncuğu
            </label>
            <input
              type="text"
              value={baloncuk}
              onChange={(e) => setBaloncuk(e.target.value)}
              placeholder="Örn: Ne arzu edersiniz? Yardımcı olayım."
              className="w-full px-4 py-2.5 text-sm bg-[#130713] border border-purple-800/80 rounded-xl text-white placeholder-purple-400/40 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all font-medium"
            />
            <span className="text-[11px] text-purple-300/60 mt-1 block">
              Müşteri vitrini açtığında hareketli logonun yanında beliren nazik davet mesajıdır.
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-purple-200 mb-1.5">
              Sohbet Penceresi Açıldığında İlk Karşılama Cümlesi
            </label>
            <textarea
              rows={3}
              value={karsilama}
              onChange={(e) => setKarsilama(e.target.value)}
              placeholder="Örn: Merhabalar, Afyon Ev Lezzetleri'ne hoş geldiniz! Bugün sizin için hangi lezzetimizi hazırlayalım?"
              className="w-full px-4 py-2.5 text-sm bg-[#130713] border border-purple-800/80 rounded-xl text-white placeholder-purple-400/40 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all font-medium leading-relaxed resize-none"
            />
            <span className="text-[11px] text-purple-300/60 mt-1 block">
              Sohbet kutusu tıklandığında danışmanın müşteriyi karşıladığı kurumsal ve samimi açılış metni.
            </span>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={kaydet}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-extrabold cursor-pointer transition-all shadow-md active:scale-95 text-xs sm:text-sm"
            >
              <Save className="w-4 h-4" />
              <span>Ayarları Kaydet</span>
            </button>

            {kaydedildi && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 px-3 py-1.5 rounded-xl animate-fadeIn">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Ayarlarınız başarıyla kaydedildi!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 🧪 CANLI TEST & DENEME ALANI */}
      <div className="p-6 rounded-2xl bg-[#180A1F] border border-[#3E1646] shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-purple-950/80 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Bot className="w-4 h-4 text-amber-400" />
            <span>Yapay Zekayı Buradan Doğrudan Test Et</span>
          </h3>
          <span className="text-[11px] text-purple-300/60">
            Patron özel deneme kanalı
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={testMesaji}
            onChange={(e) => setTestMesaji(e.target.value)}
            placeholder="Örn: Akşama kalabalık misafirim var, hangi menüyü önerirsiniz?"
            className="flex-1 px-4 py-2.5 text-sm bg-[#130713] border border-purple-800/80 rounded-xl text-white placeholder-purple-400/40 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 font-medium"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                testCalistir();
              }
            }}
          />
          <button
            type="button"
            onClick={testCalistir}
            disabled={testYukleniyor}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-800 to-purple-900 hover:from-purple-700 hover:to-purple-800 border border-purple-600/50 text-amber-200 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md disabled:opacity-50 whitespace-nowrap flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{testYukleniyor ? 'Düşünüyor...' : 'Soru Sor'}</span>
          </button>
        </div>

        {testCevabi && (
          <div className="mt-3 p-4 bg-[#23092A] rounded-xl border border-amber-500/30 text-xs sm:text-sm text-purple-100 shadow-inner">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1.5 text-xs uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Danışmanın Yanıtı:</span>
            </div>
            <p className="leading-relaxed whitespace-pre-wrap">{testCevabi}</p>
          </div>
        )}
      </div>
    </div>
  );
};
