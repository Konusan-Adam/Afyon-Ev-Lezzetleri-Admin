import React, { useState } from 'react';
import { FooterAyar, FooterKolon, FooterBaglanti } from '../../MasaustuAltBilgi/footerVeritabani';
import { Link as LinkIcon, Plus, Trash2, ArrowRight } from 'lucide-react';

interface Props {
  ayar: FooterAyar;
  guncelle: (yeniAyar: FooterAyar) => void;
}

const KATEGORI_SECENEKLERI = [
  { slug: 'Bükme & Hamur', ad: 'Bükme & Hamur' },
  { slug: 'Yöresel Ev Yemekleri', ad: 'Yöresel Ev Yemekleri' },
  { slug: 'Mantı & Sarma', ad: 'Mantı & Sarma' },
  { slug: 'Tatlılar', ad: 'Tatlılar' },
  { slug: 'Çorbalar', ad: 'Çorbalar' },
  { slug: 'Tüm Menü', ad: 'Tüm Menü' },
  { slug: '#', ad: 'Özel / Bağlantısız' }
];

export const FooterKolonVeLinkler: React.FC<Props> = ({ ayar, guncelle }) => {
  const [yeniKolonBaslik, setYeniKolonBaslik] = useState('');
  const [yeniKolonRenk, setYeniKolonRenk] = useState('#FFB703');

  // Link ekleme state
  const [linkBasliklari, setLinkBasliklari] = useState<{ [kolonId: string]: string }>({});
  const [linkKategorileri, setLinkKategorileri] = useState<{ [kolonId: string]: string }>({});

  const kolonSil = (id: string) => {
    const kopyalar = ayar.kolonlar.filter((k) => k.id !== id);
    guncelle({ ...ayar, kolonlar: kopyalar });
  };

  const kolonEkle = () => {
    if (!yeniKolonBaslik.trim()) return;
    const yeni: FooterKolon = {
      id: 'kol-' + Date.now(),
      baslik: yeniKolonBaslik.trim().toUpperCase(),
      noktaRengi: yeniKolonRenk,
      baglantilar: []
    };
    guncelle({ ...ayar, kolonlar: [...ayar.kolonlar, yeni] });
    setYeniKolonBaslik('');
  };

  const linkEkle = (kolonIndex: number, kolonId: string) => {
    const baslik = linkBasliklari[kolonId] || '';
    if (!baslik.trim()) return;
    const kategori = linkKategorileri[kolonId] || 'Bükme & Hamur';

    const yeniLink: FooterBaglanti = {
      id: 'bg-' + Date.now(),
      baslik: baslik.trim(),
      link: '#',
      kategoriSlug: kategori
    };

    const kopyalar = [...ayar.kolonlar];
    kopyalar[kolonIndex].baglantilar.push(yeniLink);
    guncelle({ ...ayar, kolonlar: kopyalar });

    setLinkBasliklari({ ...linkBasliklari, [kolonId]: '' });
  };

  const linkSil = (kolonIndex: number, linkIndex: number) => {
    const kopyalar = [...ayar.kolonlar];
    kopyalar[kolonIndex].baglantilar.splice(linkIndex, 1);
    guncelle({ ...ayar, kolonlar: kopyalar });
  };

  return (
    <div className="p-5 rounded-2xl bg-[#180A1F] border border-[#3E1646] space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-purple-950 pb-2">
        <h4 className="font-bold text-white text-sm flex items-center gap-2">
          <LinkIcon className="w-4 h-4 text-amber-400" />
          <span>Footer Dinamik Kolonları & Link Yönetimi</span>
        </h4>
        
        {/* Yeni Kolon Ekle */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="color"
            value={yeniKolonRenk}
            onChange={(e) => setYeniKolonRenk(e.target.value)}
            className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
            title="Nokta Rengi"
          />
          <input
            type="text"
            value={yeniKolonBaslik}
            onChange={(e) => setYeniKolonBaslik(e.target.value)}
            placeholder="Yeni Kolon Adı"
            className="bg-[#120614] border border-purple-900 rounded-xl px-3 py-1.5 text-xs text-white"
          />
          <button
            type="button"
            onClick={kolonEkle}
            className="px-3 py-1.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Kolon Ekle</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ayar.kolonlar.map((kolon, kolonIndex) => (
          <div key={kolon.id} className="p-4 rounded-xl bg-[#120614] border border-purple-900/60 space-y-3">
            <div className="flex items-center justify-between border-b border-purple-950 pb-2 gap-2">
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="color"
                  value={kolon.noktaRengi || '#FFB703'}
                  onChange={(e) => {
                    const kopyalar = [...ayar.kolonlar];
                    kopyalar[kolonIndex].noktaRengi = e.target.value;
                    guncelle({ ...ayar, kolonlar: kopyalar });
                  }}
                  className="w-6 h-6 rounded cursor-pointer bg-transparent border-0 shrink-0"
                  title="Nokta Rengi"
                />
                <input
                  type="text"
                  value={kolon.baslik}
                  onChange={(e) => {
                    const kopyalar = [...ayar.kolonlar];
                    kopyalar[kolonIndex].baslik = e.target.value;
                    guncelle({ ...ayar, kolonlar: kopyalar });
                  }}
                  className="bg-[#1E0E22] border border-purple-900 rounded-lg px-2.5 py-1 text-xs text-amber-400 font-black tracking-wider flex-1"
                />
              </div>

              <button
                type="button"
                onClick={() => kolonSil(kolon.id)}
                className="text-rose-400 hover:text-rose-300 text-xs flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sil</span>
              </button>
            </div>

            {/* Link Listesi */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {kolon.baglantilar.map((link, linkIndex) => (
                <div key={link.id || linkIndex} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[#1E0E22] text-xs">
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <ArrowRight className="w-3 h-3 text-purple-400 shrink-0" />
                    <span className="text-white font-medium truncate">{link.baslik}</span>
                    {link.kategoriSlug && (
                      <span className="text-[10px] text-amber-400/80 bg-amber-500/10 px-1.5 py-0.2 rounded truncate">
                        {link.kategoriSlug}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => linkSil(kolonIndex, linkIndex)}
                    className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                    title="Linki Sil"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Yeni Link Ekle Formu */}
            <div className="pt-2 border-t border-purple-950 flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                placeholder="Link Başlığı (Örn: Bükme)"
                value={linkBasliklari[kolon.id] || ''}
                onChange={(e) => setLinkBasliklari({ ...linkBasliklari, [kolon.id]: e.target.value })}
                className="flex-1 w-full sm:w-auto bg-[#1E0E22] border border-purple-900 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
              <select
                value={linkKategorileri[kolon.id] || 'Bükme & Hamur'}
                onChange={(e) => setLinkKategorileri({ ...linkKategorileri, [kolon.id]: e.target.value })}
                className="w-full sm:w-auto bg-[#1E0E22] border border-purple-900 rounded-lg px-2 py-1.5 text-xs text-purple-300"
              >
                {KATEGORI_SECENEKLERI.map((kat) => (
                  <option key={kat.slug} value={kat.slug}>{kat.ad}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => linkEkle(kolonIndex, kolon.id)}
                className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-purple-950 hover:bg-purple-800 text-purple-200 font-bold text-xs cursor-pointer shrink-0"
              >
                Ekle
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
