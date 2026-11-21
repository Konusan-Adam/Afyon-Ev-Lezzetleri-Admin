import React, { useState, useMemo } from 'react';
import {
  Megaphone,
  Plus,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Image,
  LayoutTemplate,
} from 'lucide-react';
import {
  useCanliMutfakAfisleri,
  afisDurumunuGetir,
  afisleriSirala,
  type MutfakAfisiKaydi,
} from '@/src/MalzemeCekmeceleri/useCanliMutfakAfisleri';
import {
  afisOnaylaVeYayinla,
  afisReddetVeKaldir,
  afisSiraGuncelle,
  afisKaydetVeyaGuncelle,
  afisSil,
  type MutfakAfisFormVerisi,
} from '@/src/MalzemeCekmeceleri/MutfakAfisServisi';
import { mutfaklariGetir } from '@/src/MalzemeCekmeceleri/Mutfak/mutfaklariGetir';
import { AfisYonetimKarti } from './AfisYonetimKarti';
import { AfisDuzenleEkleModali } from './AfisDuzenleEkleModali';
import { AfisRedModali, AfisSilModali } from './AfisRedVeSilModal';

type DurumFiltresi = 'hepsi' | 'beklemede' | 'yayinda' | 'reddedildi';

export const YonetimMutfakAfisleri: React.FC = () => {
  const { afisler, setAfisler, vitrinAfisleri, bekleyenSayisi, yukleniyor } =
    useCanliMutfakAfisleri();
  const { mutfaklar: onayliMutfaklar } = mutfaklariGetir();

  const [filtre, setFiltre] = useState<DurumFiltresi>('hepsi');
  const [arama, setArama] = useState('');
  const [formModalAcik, setFormModalAcik] = useState(false);
  const [duzenlenecekAfis, setDuzenlenecekAfis] = useState<MutfakAfisiKaydi | null>(null);
  const [redModalAfis, setRedModalAfis] = useState<MutfakAfisiKaydi | null>(null);
  const [silModalAfis, setSilModalAfis] = useState<MutfakAfisiKaydi | null>(null);

  const yayindaSayisi = vitrinAfisleri.length;
  const reddedilenSayisi = useMemo(
    () =>
      afisler.filter((a) => {
        const d = afisDurumunuGetir(a);
        return d === 'reddedildi' || d === 'onayli_pasif';
      }).length,
    [afisler]
  );

  const filtrelenmisAfisler = useMemo(() => {
    const aramaKucuk = arama.trim().toLocaleLowerCase('tr-TR');
    const sirali = [...afisler].sort((a, b) => {
      if (filtre === 'hepsi') {
        const oncelik = (k: MutfakAfisiKaydi) => {
          const d = afisDurumunuGetir(k);
          if (d === 'beklemede') return 0;
          if (d === 'yayinda') return 1;
          return 2;
        };
        const f = oncelik(a) - oncelik(b);
        if (f !== 0) return f;
      }
      return Number(a.sira ?? 999) - Number(b.sira ?? 999);
    });

    return sirali.filter((afis) => {
      const durum = afisDurumunuGetir(afis);
      const durumUyumu =
        filtre === 'hepsi' ||
        (filtre === 'beklemede' && durum === 'beklemede') ||
        (filtre === 'yayinda' && durum === 'yayinda') ||
        (filtre === 'reddedildi' && (durum === 'reddedildi' || durum === 'onayli_pasif'));

      if (!durumUyumu) return false;
      if (!aramaKucuk) return true;

      return (
        (afis.baslik || '').toLocaleLowerCase('tr-TR').includes(aramaKucuk) ||
        (afis.mutfak_adi || '').toLocaleLowerCase('tr-TR').includes(aramaKucuk) ||
        (afis.rozet || '').toLocaleLowerCase('tr-TR').includes(aramaKucuk)
      );
    });
  }, [afisler, filtre, arama]);

  const onaylaIslemi = async (afis: MutfakAfisiKaydi) => {
    setAfisler((onceki) =>
      afisleriSirala(
        onceki.map((a) =>
          a.id === afis.id
            ? {
                ...a,
                onayli_mi: true,
                aktif_mi: true,
                onay_durumu: 'onaylandi',
                red_nedeni: '',
                red_gerekcesi: '',
              }
            : a
        )
      )
    );
    await afisOnaylaVeYayinla(afis.id);
  };

  const reddetIslemi = async (afisId: string, gerekce: string) => {
    setAfisler((onceki) =>
      onceki.map((a) =>
        a.id === afisId
          ? {
              ...a,
              onayli_mi: false,
              aktif_mi: false,
              onay_durumu: 'reddedildi',
              red_nedeni: gerekce,
              red_gerekcesi: gerekce,
            }
          : a
      )
    );
    await afisReddetVeKaldir(afisId, gerekce);
  };

  const silIslemi = async (afisId: string) => {
    setAfisler((onceki) => onceki.filter((a) => a.id !== afisId));
    await afisSil(afisId);
  };

  const formKaydetIslemi = async (form: MutfakAfisFormVerisi) => {
    const { kayit } = await afisKaydetVeyaGuncelle(form);
    setAfisler((onceki) => {
      const varMi = onceki.some((a) => a.id === kayit.id);
      const yeniListe = varMi
        ? onceki.map((a) => (a.id === kayit.id ? kayit : a))
        : [kayit, ...onceki];
      return afisleriSirala(yeniListe);
    });
  };

  const siraDegistirIslemi = async (afis: MutfakAfisiKaydi, yon: -1 | 1) => {
    const mevcutIndex = filtrelenmisAfisler.findIndex((a) => a.id === afis.id);
    const hedefIndex = mevcutIndex + yon;
    if (mevcutIndex < 0 || hedefIndex < 0 || hedefIndex >= filtrelenmisAfisler.length) return;

    const komsu = filtrelenmisAfisler[hedefIndex];
    const mevcutSira = Number(afis.sira ?? mevcutIndex + 1);
    const komsuSira = Number(komsu.sira ?? hedefIndex + 1);
    const yeniMevcutSira = komsuSira === mevcutSira ? Math.max(1, mevcutIndex + 1 + yon) : komsuSira;
    const yeniKomsuSira = komsuSira === mevcutSira ? Math.max(1, mevcutIndex + 1) : mevcutSira;

    setAfisler((onceki) =>
      afisleriSirala(
        onceki.map((a) => {
          if (a.id === afis.id) return { ...a, sira: yeniMevcutSira };
          if (a.id === komsu.id) return { ...a, sira: yeniKomsuSira };
          return a;
        })
      )
    );

    await Promise.all([
      afisSiraGuncelle(afis.id, yeniMevcutSira),
      afisSiraGuncelle(komsu.id, yeniKomsuSira),
    ]);
  };

  return (
    <div className="space-y-6 text-white animate-fadeIn">
      <div className="p-4 sm:p-5 rounded-2xl bg-[#180A1F] border border-[#3E1646] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base">
              Mutfak Afişleri ve Tepe Vitrin Yönetimi
            </h3>
            <p className="text-xs text-purple-300">
              `mutfak_afisleri` koleksiyonunu yönetin; onaylanan afişler masaüstü ve mobil tepe vitrin slaytlarında sıraya göre yayınlanır.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setDuzenlenecekAfis(null);
            setFormModalAcik(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-purple-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg cursor-pointer whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Onaylı Mutfaktan Vitrin Slaytı Ekle</span>
        </button>
      </div>

      <div className="p-3.5 rounded-2xl bg-[#14061A] border border-purple-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-purple-200">
          <LayoutTemplate className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            Tepe Banner Yayını (`AnaAfisBannerVitrini` & `MobilKampanyaSlider`):
            <strong className="text-emerald-300 font-mono tabular-nums ml-1.5">
              {yayindaSayisi} aktif onaylı slayt
            </strong>
          </span>
        </div>

        <div className="text-[11px] text-purple-300/90">
          Yalnızca <code className="text-amber-300">onayli_mi: true</code> ve <code className="text-amber-300">aktif_mi: true</code> afişler vitrine çıkar.
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center flex-wrap gap-1.5 bg-[#120614] p-1.5 rounded-xl border border-purple-900/60 text-[11px] font-bold w-fit">
          <button
            type="button"
            onClick={() => setFiltre('hepsi')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
              filtre === 'hepsi' ? 'bg-[#7B258B] text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Tümü (<span className="tabular-nums">{afisler.length}</span>)
          </button>
          <button
            type="button"
            onClick={() => setFiltre('beklemede')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors flex items-center gap-1 ${
              filtre === 'beklemede'
                ? 'bg-amber-500 text-gray-950 font-black'
                : 'text-amber-300 hover:bg-amber-500/10'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>Onay Bekleyen (<span className="tabular-nums">{bekleyenSayisi}</span>)</span>
          </button>
          <button
            type="button"
            onClick={() => setFiltre('yayinda')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors flex items-center gap-1 ${
              filtre === 'yayinda'
                ? 'bg-emerald-700 text-white'
                : 'text-emerald-300 hover:bg-emerald-900/30'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Yayında (<span className="tabular-nums">{yayindaSayisi}</span>)</span>
          </button>
          <button
            type="button"
            onClick={() => setFiltre('reddedildi')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors flex items-center gap-1 ${
              filtre === 'reddedildi'
                ? 'bg-rose-700 text-white'
                : 'text-rose-300 hover:bg-rose-900/30'
            }`}
          >
            <XCircle className="w-3 h-3" />
            <span>Reddedilen / Pasif (<span className="tabular-nums">{reddedilenSayisi}</span>)</span>
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={arama}
            onChange={(e) => setArama(e.target.value)}
            placeholder="Mutfak veya afiş başlığı ara..."
            className="w-full bg-[#180A1F] border border-[#3E1646] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {yukleniyor ? (
        <div className="p-12 text-center text-amber-300 text-xs bg-[#180A1F] rounded-2xl border border-purple-900/40 flex flex-col items-center gap-2">
          <Loader2 className="w-7 h-7 animate-spin" />
          <span>Mutfak afişleri canlı dinleniyor...</span>
        </div>
      ) : filtrelenmisAfisler.length === 0 ? (
        <div className="p-12 text-center text-gray-400 text-xs bg-[#180A1F] rounded-2xl border border-purple-900/40 space-y-3">
          <Image className="w-10 h-10 mx-auto text-amber-400 opacity-50" />
          <div>
            <p className="font-bold text-white text-sm">
              {afisler.length === 0
                ? 'Henüz kayıtlı mutfak afişi bulunmuyor.'
                : 'Bu filtrede gösterilecek mutfak afişi yok.'}
            </p>
            <p className="text-gray-400 mt-1">
              Mutfakların gönderdiği afişler burada onay bekler; isterseniz onaylı mutfaklardan tepe vitrin slaytı da ekleyebilirsiniz.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setDuzenlenecekAfis(null);
              setFormModalAcik(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-purple-950 font-black text-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>İlk Vitrin Slaytını Ekle</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtrelenmisAfisler.map((afis, index) => (
            <AfisYonetimKarti
              key={afis.id}
              afis={afis}
              index={index}
              toplam={filtrelenmisAfisler.length}
              onaylaVeYayinla={onaylaIslemi}
              reddetModalAc={setRedModalAfis}
              duzenleModalAc={(secilen) => {
                setDuzenlenecekAfis(secilen);
                setFormModalAcik(true);
              }}
              silModalAc={setSilModalAfis}
              siraDegistir={siraDegistirIslemi}
            />
          ))}
        </div>
      )}

      <AfisDuzenleEkleModali
        acikMi={formModalAcik}
        duzenlenecekAfis={duzenlenecekAfis}
        onayliMutfaklar={onayliMutfaklar}
        varsayilanSira={afisler.length + 1}
        onKapat={() => {
          setFormModalAcik(false);
          setDuzenlenecekAfis(null);
        }}
        onKaydet={formKaydetIslemi}
      />

      <AfisRedModali
        afis={redModalAfis}
        onKapat={() => setRedModalAfis(null)}
        onOnayla={reddetIslemi}
      />

      <AfisSilModali
        afis={silModalAfis}
        onKapat={() => setSilModalAfis(null)}
        onSil={silIslemi}
      />
    </div>
  );
};
