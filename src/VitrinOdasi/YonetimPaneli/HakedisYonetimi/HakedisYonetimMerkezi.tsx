import React, { useState, useMemo } from 'react';
import { Search, CheckCircle2, ListChecks, Gauge, BookOpen } from 'lucide-react';
import { useCanliHakedisTalepleri } from '@/src/MalzemeCekmeceleri/useCanliHakedisTalepleri';
import { useHakedisLimitleri } from '@/src/MalzemeCekmeceleri/Finans/hakedisLimitServisi';
import { useTumCuzdanDurumlari } from '@/src/MalzemeCekmeceleri/Finans/useTumCuzdanDurumlari';
import { useCanliHakedisHareketleri } from '@/src/MalzemeCekmeceleri/Finans/useCanliHakedisHareketleri';
import { HakedisCekimTalebi } from '@/src/veritabani/GercekVeriYardimcisi';
import { ibanGecerliMi, tcknVknGecerliMi } from '@/src/MalzemeCekmeceleri/Finans/ibanVeKimlikDogrulama';
import { partiNumarasiUret, topluOdemeCsvIndir, topluOdemeTxtIndir } from '@/src/MalzemeCekmeceleri/Finans/topluBankaDosyaUretici';
import { HakedisOzetKartlari } from './HakedisOzetKartlari';
import { HakedisTopluIslemCubugu } from './HakedisTopluIslemCubugu';
import { HakedisTalepKarti } from './HakedisTalepKarti';
import { TopluOdemeOnayModali } from './TopluOdemeOnayModali';
import { TekilOdemeOnayModali } from './TekilOdemeOnayModali';
import { HakedisLimitAyarKutusu } from './HakedisLimitAyarKutusu';
import { HakedisBakiyeLimitListesi } from './HakedisBakiyeLimitListesi';
import { HakedisHareketDefteriTablosu } from './HakedisHareketDefteriTablosu';

export const HakedisYonetimMerkezi: React.FC = () => {
  const { talepler, talepDurumGuncelle, topluTalepOde } = useCanliHakedisTalepleri();
  const { limitler, limitleriKaydet } = useHakedisLimitleri();
  const cuzdanDurumlari = useTumCuzdanDurumlari(talepler, limitler);
  const { tumHareketler } = useCanliHakedisHareketleri();

  const [gorunum, setGorunum] = useState<'talepler' | 'limit_listesi' | 'hareket_defteri'>('talepler');
  const [arama, setArama] = useState('');
  const [durumFiltre, setDurumFiltre] = useState<'hepsi' | 'beklemede' | 'odendi' | 'reddedildi'>('hepsi');
  const [seciliIdler, setSeciliIdler] = useState<string[]>([]);
  const [seciliTekil, setSeciliTekil] = useState<HakedisCekimTalebi | null>(null);
  const [topluModalAcik, setTopluModalAcik] = useState(false);
  const [bilgiMesaji, setBilgiMesaji] = useState('');
  const aktifPartiNo = useMemo(() => partiNumarasiUret(), [seciliIdler.length]);

  const filtrelenmis = talepler.filter(t =>
    `${t.mutfak_adi || t.kurye_adi || ''} ${t.hesap_sahibi || ''} ${t.iban} ${t.tckn_vkn || ''}`.toLowerCase().includes(arama.toLowerCase()) &&
    (durumFiltre === 'hepsi' || t.durum === durumFiltre)
  );
  const bekleyenler = filtrelenmis.filter(t => t.durum === 'beklemede');
  const seciliTalepler = talepler.filter(t => seciliIdler.includes(t.id) && t.durum === 'beklemede');
  const seciliTutar = seciliTalepler.reduce((acc, t) => acc + t.tutar, 0);
  const hataliSecimSayisi = seciliTalepler.filter(t => !ibanGecerliMi(t.iban).gecerli || !tcknVknGecerliMi(t.tckn_vkn || '').gecerli).length;
  const bildirimVer = (mesaj: string) => { setBilgiMesaji(mesaj); setTimeout(() => setBilgiMesaji(''), 5000); };

  return (
    <div className="space-y-5 animate-fadeIn">
      <HakedisOzetKartlari
        toplamBekleyen={talepler.filter(t => t.durum === 'beklemede').reduce((a, t) => a + t.tutar, 0)}
        toplamOdenen={talepler.filter(t => t.durum === 'odendi').reduce((a, t) => a + t.tutar, 0)}
        toplamAdet={talepler.length} seciliAdet={seciliTalepler.length} seciliTutar={seciliTutar}
      />

      <HakedisLimitAyarKutusu limitler={limitler} onKaydet={limitleriKaydet} />

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => setGorunum('talepler')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer ${gorunum === 'talepler' ? 'bg-amber-500 text-purple-950' : 'bg-[#180A1F] text-gray-300 border border-[#3E1646]'}`}>
          <ListChecks className="w-4 h-4" /><span>Çekim Talepleri & Toplu Ödeme ({bekleyenler.length})</span>
        </button>
        <button type="button" onClick={() => setGorunum('limit_listesi')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer ${gorunum === 'limit_listesi' ? 'bg-amber-500 text-purple-950' : 'bg-[#180A1F] text-gray-300 border border-[#3E1646]'}`}>
          <Gauge className="w-4 h-4" />
          <span>Bakiye & Çekim Sınırı Listesi</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px]">
            {cuzdanDurumlari.filter(c => c.siniraUlastiMi).length} Yeşil
          </span>
          <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px]">
            {cuzdanDurumlari.filter(c => !c.siniraUlastiMi).length} Kırmızı
          </span>
        </button>
        <button type="button" onClick={() => setGorunum('hareket_defteri')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer ${gorunum === 'hareket_defteri' ? 'bg-amber-500 text-purple-950' : 'bg-[#180A1F] text-gray-300 border border-[#3E1646]'}`}>
          <BookOpen className="w-4 h-4" />
          <span>Hakediş Defteri ({tumHareketler.length})</span>
        </button>
      </div>

      {bilgiMesaji && (
        <div className="p-3 rounded-2xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /><span>{bilgiMesaji}</span>
        </div>
      )}

      {gorunum === 'limit_listesi' ? (
        <div className="space-y-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input type="text" value={arama} onChange={e => setArama(e.target.value)} placeholder="Mutfak, kurye veya IBAN ara..."
              className="w-full bg-[#180A1F] border border-purple-900 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-amber-400" />
          </div>
          <HakedisBakiyeLimitListesi satirlar={cuzdanDurumlari} arama={arama} />
        </div>
      ) : gorunum === 'hareket_defteri' ? (
        <div className="space-y-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input type="text" value={arama} onChange={e => setArama(e.target.value)} placeholder="Alıcı, sipariş kodu veya açıklama ara..."
              className="w-full bg-[#180A1F] border border-purple-900 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-amber-400" />
          </div>
          <HakedisHareketDefteriTablosu hareketler={tumHareketler} arama={arama} onBilgiMesaji={bildirimVer} />
        </div>
      ) : (
        <>
          <HakedisTopluIslemCubugu
            bekleyenSayisi={bekleyenler.length} seciliSayisi={seciliTalepler.length} seciliTutar={seciliTutar} hataliKayitSayisi={hataliSecimSayisi}
            tumunuSec={() => setSeciliIdler(seciliTalepler.length === bekleyenler.length ? [] : bekleyenler.map(t => t.id))}
            csvIndir={() => { topluOdemeCsvIndir(seciliTalepler, aktifPartiNo); bildirimVer(`${aktifPartiNo} Excel/CSV dosyası indirildi.`); }}
            txtIndir={() => { topluOdemeTxtIndir(seciliTalepler, aktifPartiNo); bildirimVer(`${aktifPartiNo} FAST/TXT dosyası indirildi.`); }}
            topluOdeAc={() => setTopluModalAcik(true)}
          />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-[#180A1F] border border-[#3E1646]">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input type="text" value={arama} onChange={e => setArama(e.target.value)} placeholder="Mutfak, alıcı, TCKN veya IBAN ara..."
                className="w-full bg-[#120614] border border-purple-900 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-amber-400" />
            </div>
            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
              {(['hepsi', 'beklemede', 'odendi', 'reddedildi'] as const).map(d => (
                <button key={d} type="button" onClick={() => setDurumFiltre(d)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${durumFiltre === d ? 'bg-amber-500 text-purple-950' : 'bg-[#120614] text-gray-400 border border-purple-900/60'}`}>
                  {d === 'hepsi' ? 'Tümü' : d === 'beklemede' ? 'Bekleyenler' : d === 'odendi' ? 'Ödenenler' : 'Reddedilenler'}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {filtrelenmis.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#180A1F] border border-[#3E1646] text-center text-xs text-gray-400">Hakediş talebi bulunamadı.</div>
            ) : filtrelenmis.map(t => (
              <HakedisTalepKarti key={t.id} talep={t} seciliMi={seciliIdler.includes(t.id)}
                secimDegistir={id => setSeciliIdler(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])}
                tekilOnaylaAc={setSeciliTekil} reddet={id => talepDurumGuncelle(id, 'reddedildi', 'IBAN veya TCKN doğrulaması yapılamadı.', false)} />
            ))}
          </div>
        </>
      )}

      {seciliTekil && <TekilOdemeOnayModali talep={seciliTekil} onKapat={() => setSeciliTekil(null)} onOnayla={async (id, not) => { await talepDurumGuncelle(id, 'odendi', not, true); bildirimVer('Ödeme onaylandı ve Gider Pusulası Fatura Merkezi’ne işlendi.'); }} />}
      <TopluOdemeOnayModali acikMi={topluModalAcik} partiNo={aktifPartiNo} seciliSayisi={seciliTalepler.length} seciliTutar={seciliTutar} onKapat={() => setTopluModalAcik(false)}
        onOnayla={async (not, pusulaKes) => { const n = await topluTalepOde(seciliIdler, aktifPartiNo, not, pusulaKes); setSeciliIdler([]); bildirimVer(`${n} hakediş ödendi olarak işaretlendi (${aktifPartiNo}).`); }} />
    </div>
  );
};
