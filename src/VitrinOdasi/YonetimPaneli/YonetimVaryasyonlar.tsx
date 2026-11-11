import React, { useState } from 'react';
import { Layers, Plus, Trash2, Edit3, Check, Sparkles, AlertCircle } from 'lucide-react';
import { 
  varyasyonSablonlariniGetir, 
  sablonKaydet, 
  sablonSil, 
  type VaryasyonSablonu,
  type SecenekGrubu
} from '@/src/MalzemeCekmeceleri';
import { kategorileriGetir } from '@/src/MalzemeCekmeceleri/kategorileriGetir';

export const YonetimVaryasyonlar: React.FC = () => {
  const { kategoriler } = kategorileriGetir();
  const [sablonlar, setSablonlar] = useState<VaryasyonSablonu[]>(varyasyonSablonlariniGetir());
  const [secilenSablon, setSecilenSablon] = useState<VaryasyonSablonu | null>(null);
  const [yeniMod, setYeniMod] = useState<boolean>(false);
  const [baslik, setBaslik] = useState('');
  const [kategori, setKategori] = useState(kategoriler[1]?.ad || 'Hamur İşleri & Bükme');
  const [aciklama, setAciklama] = useState('');
  const [secenekGruplari, setSecenekGruplari] = useState<SecenekGrubu[]>([]);

  const listeyiYenile = () => {
    setSablonlar([...varyasyonSablonlariniGetir()]);
  };

  const duzenlemeyiBaslat = (sablon: VaryasyonSablonu) => {
    setSecilenSablon(sablon);
    setYeniMod(false);
    setBaslik(sablon.baslik);
    setKategori(sablon.kategori);
    setAciklama(sablon.aciklama || '');
    setSecenekGruplari(JSON.parse(JSON.stringify(sablon.secenek_gruplari || [])));
  };

  const yeniOlustur = () => {
    setSecilenSablon(null);
    setYeniMod(true);
    setBaslik('');
    setKategori(kategoriler[1]?.ad || 'Hamur İşleri & Bükme');
    setAciklama('');
    setSecenekGruplari([
      {
        kimlik: `grp_${Date.now()}`,
        baslik: 'Tercih / Seçenek',
        zorunlu_mu: true,
        coklu_secim_mi: false,
        ogeler: [
          { kimlik: `oge_${Date.now()}_1`, baslik: 'Klasik', ek_ucret: 0 },
          { kimlik: `oge_${Date.now()}_2`, baslik: 'Ekstra', ek_ucret: 15 }
        ]
      }
    ]);
  };

  const kaydet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!baslik.trim()) return;

    const id = secilenSablon?.kimlik || secilenSablon?.id || `sablon_${Date.now()}`;
    const kaydedilecek: VaryasyonSablonu = {
      id,
      kimlik: id,
      ad: baslik.trim(),
      baslik: baslik.trim(),
      kategori,
      aciklama: aciklama.trim() || 'Afyon ev lezzeti standart varyasyon şablonu.',
      secenek_gruplari: secenekGruplari,
      secenekler: []
    };

    sablonKaydet(kaydedilecek);
    listeyiYenile();
    setSecilenSablon(null);
    setYeniMod(false);
  };

  const sil = (kimlik: string) => {
    if (window.confirm('Bu şablonu silmek istediğinize emin misiniz?')) {
      sablonSil(kimlik);
      listeyiYenile();
      if (secilenSablon?.kimlik === kimlik) {
        setSecilenSablon(null);
        setYeniMod(false);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Üst Başlık */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#1F0724] border border-[#481552] p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
            <Layers className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Varyasyon & Seçenek Şablonları (Merkez Havuz)
            </h2>
            <p className="text-xs text-purple-200/70">
              Mutfakların yemek eklerken tek tıkla kullanabileceği standart porsiyon, iç harç ve sos kuralları.
            </p>
          </div>
        </div>
        <button
          onClick={yeniOlustur}
          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-purple-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Yeni Şablon Ekle
        </button>
      </div>

      {/* Ana Gövde: Liste ve Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Sol: Şablon Kartları */}
        <div className="lg:col-span-6 space-y-3">
          {sablonlar.map((sablon) => (
            <div
              key={sablon.kimlik}
              className={`p-4 rounded-2xl border transition-all ${
                secilenSablon?.kimlik === sablon.kimlik
                  ? 'bg-[#290c30] border-amber-500 shadow-lg'
                  : 'bg-[#18051b] border-purple-950/70 hover:border-purple-800'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-900/60 text-amber-300 font-semibold border border-purple-800/40">
                    {sablon.kategori}
                  </span>
                  <h3 className="font-bold text-white text-sm mt-1">{sablon.baslik}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{sablon.aciklama}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => duzenlemeyiBaslat(sablon)}
                    className="p-1.5 text-gray-400 hover:text-amber-400 rounded-lg hover:bg-purple-900/40 cursor-pointer"
                    title="Düzenle"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => sil(sablon.kimlik || sablon.id || '')}
                    className="p-1.5 text-gray-400 hover:text-rose-400 rounded-lg hover:bg-rose-950/40 cursor-pointer"
                    title="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Alt Bilgi: Grup Özeti */}
              <div className="mt-3 pt-2.5 border-t border-purple-900/40 flex flex-wrap gap-1.5">
                {(sablon.secenek_gruplari || []).map((grp: any, idx: number) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded bg-[#100312] border border-purple-900/50 text-gray-300"
                  >
                    {grp.baslik} ({grp.ogeler.length} seçenek)
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Sağ: Düzenleme Formu */}
        <div className="lg:col-span-6">
          {(secilenSablon || yeniMod) ? (
            <form onSubmit={kaydet} className="bg-[#19051d] border border-[#52175c] rounded-2xl p-4 space-y-3.5">
              <div className="flex items-center justify-between border-b border-purple-900/50 pb-2">
                <h3 className="font-bold text-white text-xs flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  {yeniMod ? 'Yeni Varyasyon Şablonu' : 'Şablonu Düzenle'}
                </h3>
                <button
                  type="button"
                  onClick={() => { setSecilenSablon(null); setYeniMod(false); }}
                  className="text-xs text-gray-400 hover:text-white cursor-pointer"
                >
                  İptal
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-300 mb-1">Şablon Başlığı</label>
                <input
                  type="text"
                  value={baslik}
                  onChange={(e) => setBaslik(e.target.value)}
                  placeholder="Örn: Hakiki Bükme İç Harç Şablonu"
                  className="w-full bg-[#110313] border border-purple-900/60 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">Bağlı Kategori</label>
                  <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value)}
                    className="w-full bg-[#110313] border border-purple-900/60 rounded-xl px-2.5 py-2 text-white text-xs outline-none focus:border-amber-400 cursor-pointer"
                  >
                    {kategoriler.filter(k => k.id !== 'hepsi').map(k => (
                      <option key={k.id} value={k.ad}>{k.ad}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">Kısa Açıklama</label>
                  <input
                    type="text"
                    value={aciklama}
                    onChange={(e) => setAciklama(e.target.value)}
                    placeholder="Şablon hakkında bilgi"
                    className="w-full bg-[#110313] border border-purple-900/60 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Seçenek Grupları Alanı */}
              <div className="space-y-2 pt-2">
                <label className="block text-[11px] font-bold text-amber-400">Şablonun Seçenek Grupları</label>
                {secenekGruplari.map((grup, gIdx) => (
                  <div key={gIdx} className="bg-[#120414] border border-purple-900/60 rounded-xl p-2.5 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={grup.baslik}
                        onChange={(e) => {
                          const guncel = [...secenekGruplari];
                          guncel[gIdx].baslik = e.target.value;
                          setSecenekGruplari(guncel);
                        }}
                        className="flex-1 bg-[#1c0821] border border-purple-900/40 rounded px-2 py-1 text-xs text-white"
                        placeholder="Grup başlığı (Örn: İç Harç)"
                      />
                      <label className="flex items-center gap-1 text-[10px] text-gray-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={grup.zorunlu_mu}
                          onChange={(e) => {
                            const guncel = [...secenekGruplari];
                            guncel[gIdx].zorunlu_mu = e.target.checked;
                            setSecenekGruplari(guncel);
                          }}
                        />
                        Zorunlu
                      </label>
                      <button
                        type="button"
                        onClick={() => setSecenekGruplari(secenekGruplari.filter((_, idx) => idx !== gIdx))}
                        className="text-gray-400 hover:text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Öğeler */}
                    <div className="space-y-1 pl-2 border-l border-purple-900/40">
                      {grup.ogeler.map((oge, oIdx) => (
                        <div key={oIdx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={oge.baslik}
                            onChange={(e) => {
                              const guncel = [...secenekGruplari];
                              guncel[gIdx].ogeler[oIdx].baslik = e.target.value;
                              setSecenekGruplari(guncel);
                            }}
                            className="flex-1 bg-[#1c0821] border border-purple-900/30 rounded px-2 py-0.5 text-[11px] text-white"
                          />
                          <div className="flex items-center gap-1 w-20">
                            <span className="text-[10px] text-gray-400">+₺</span>
                            <input
                              type="number"
                              value={oge.ek_ucret}
                              onChange={(e) => {
                                const guncel = [...secenekGruplari];
                                guncel[gIdx].ogeler[oIdx].ek_ucret = Number(e.target.value);
                                setSecenekGruplari(guncel);
                              }}
                              className="w-full bg-[#1c0821] border border-purple-900/30 rounded px-1 py-0.5 text-[11px] text-amber-300 text-right"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const guncel = [...secenekGruplari];
                              guncel[gIdx].ogeler = guncel[gIdx].ogeler.filter((_, idx) => idx !== oIdx);
                              setSecenekGruplari(guncel);
                            }}
                            className="text-gray-500 hover:text-rose-400 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const guncel = [...secenekGruplari];
                          guncel[gIdx].ogeler.push({
                            kimlik: `oge_${Date.now()}`,
                            baslik: 'Yeni Seçenek',
                            ek_ucret: 0
                          });
                          setSecenekGruplari(guncel);
                        }}
                        className="text-[10px] text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 cursor-pointer pt-1"
                      >
                        <Plus className="w-3 h-3" /> Seçenek Ekle
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    setSecenekGruplari([
                      ...secenekGruplari,
                      {
                        kimlik: `grp_${Date.now()}`,
                        baslik: 'Yeni Seçenek Grubu',
                        zorunlu_mu: false,
                        coklu_secim_mi: false,
                        ogeler: [{ kimlik: `oge_${Date.now()}`, baslik: 'Standart', ek_ucret: 0 }]
                      }
                    ]);
                  }}
                  className="w-full py-1.5 border border-dashed border-purple-800/80 hover:border-amber-500/80 text-purple-300 hover:text-amber-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Yeni Grup Ekle
                </button>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Şablonu Kaydet
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-[#18051b] border border-purple-950/60 rounded-2xl p-8 text-center text-gray-400 flex flex-col items-center justify-center h-full">
              <AlertCircle className="w-8 h-8 text-purple-400 mb-2 opacity-60" />
              <p className="text-xs">
                Düzenlemek için sol taraftan bir şablon seçiniz veya <strong>Yeni Şablon Ekle</strong> butonuna basınız.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
