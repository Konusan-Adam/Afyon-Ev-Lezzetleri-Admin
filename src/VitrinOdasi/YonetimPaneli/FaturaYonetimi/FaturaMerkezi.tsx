import React, { useState, useEffect, useMemo } from 'react';
import { FileText } from 'lucide-react';
import { faturalariCsvIndir } from '@/src/MalzemeCekmeceleri/Finans/faturaDisaAktarici';
import { siparisVeHakedistenOtomatikUret } from '@/src/MalzemeCekmeceleri/Finans/otomatikFaturaUretici';
import {
  FaturaKaydi, yeniFaturaEkle, faturaGuncelle,
  faturaIptalEt, faturaSil, faturalariCanliDinle
} from './faturaVeritabani';
import { FaturaOzetKartlari } from './FaturaOzetKartlari';
import { FaturaFiltreCubugu } from './FaturaFiltreCubugu';
import { FaturaSatirKarti } from './FaturaSatirKarti';
import { FaturaFormModali } from './FaturaFormModali';
import { FaturaYazdirModali } from './FaturaYazdirModali';

export const FaturaMerkezi: React.FC = () => {
  const [faturaListesi, setFaturaListesi] = useState<FaturaKaydi[]>([]);
  const [tipFiltresi, setTipFiltresi] = useState('hepsi');
  const [durumFiltresi, setDurumFiltresi] = useState('hepsi');
  const [aramaMetni, setAramaMetni] = useState('');
  const [baslangicTarih, setBaslangicTarih] = useState('');
  const [bitisTarih, setBitisTarih] = useState('');
  const [formAcik, setFormAcik] = useState(false);
  const [duzenlenen, setDuzenlenen] = useState<FaturaKaydi | null>(null);
  const [yazdirilan, setYazdirilan] = useState<FaturaKaydi | null>(null);
  const [otomatikYukleniyor, setOtomatikYukleniyor] = useState(false);
  const [bilgiNotu, setBilgiNotu] = useState('');

  useEffect(() => {
    const durdur = faturalariCanliDinle(setFaturaListesi);
    return () => durdur();
  }, []);

  const filtrelenmis = useMemo(() => {
    const ara = aramaMetni.trim().toLowerCase();
    return faturaListesi.filter((f) => {
      if (tipFiltresi !== 'hepsi' && f.tip !== tipFiltresi) return false;
      if (durumFiltresi !== 'hepsi' && f.durum !== durumFiltresi) return false;
      if (baslangicTarih && f.tarih < baslangicTarih) return false;
      if (bitisTarih && f.tarih > bitisTarih) return false;
      if (!ara) return true;
      return [f.fatura_no, f.kesen_unvan, f.alan_unvan, f.kesen_vergi_no, f.alan_vergi_no, f.toplu_parti_no]
        .some((v) => (v || '').toLowerCase().includes(ara));
    });
  }, [faturaListesi, tipFiltresi, durumFiltresi, aramaMetni, baslangicTarih, bitisTarih]);

  const otomatikBelgeUret = async () => {
    setOtomatikYukleniyor(true);
    const { eklenenSayi } = await siparisVeHakedistenOtomatikUret(faturaListesi);
    setOtomatikYukleniyor(false);
    setBilgiNotu(eklenenSayi > 0
      ? `${eklenenSayi} adet teslim edilen sipariş ve ödenen hakediş için otomatik belge üretildi.`
      : 'Tüm tamamlanmış siparişler ve ödenmiş hakedişler zaten faturalandırılmış.');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="yazdirma-gizle space-y-6">
        <FaturaOzetKartlari faturalar={filtrelenmis} />

        <FaturaFiltreCubugu
          tipFiltresi={tipFiltresi} setTipFiltresi={setTipFiltresi}
          durumFiltresi={durumFiltresi} setDurumFiltresi={setDurumFiltresi}
          aramaMetni={aramaMetni} setAramaMetni={setAramaMetni}
          baslangicTarih={baslangicTarih} setBaslangicTarih={setBaslangicTarih}
          bitisTarih={bitisTarih} setBitisTarih={setBitisTarih}
          otomatikUretYukleniyor={otomatikYukleniyor}
          onOtomatikUret={otomatikBelgeUret}
          onCsvIndir={() => faturalariCsvIndir(filtrelenmis)}
          onYeniAc={() => { setDuzenlenen(null); setFormAcik(true); }}
        />

        {bilgiNotu && (
          <div className="px-4 py-2.5 rounded-xl bg-emerald-950/60 border border-emerald-700/60 text-emerald-200 text-xs flex justify-between items-center">
            <span>{bilgiNotu}</span>
            <button type="button" onClick={() => setBilgiNotu('')} className="text-emerald-400 font-bold cursor-pointer">Kapat</button>
          </div>
        )}

        <div className="space-y-3">
          {filtrelenmis.length === 0 ? (
            <div className="p-10 rounded-2xl bg-[#180A1F] border border-[#3E1646] text-center space-y-2 text-xs text-gray-400">
              <FileText className="w-8 h-8 text-amber-400/50 mx-auto" />
              <p className="text-white font-bold">Kayıtlı veya filtreye uygun belge bulunamadı.</p>
              <p>Yukarıdan manuel belge kesebilir veya tamamlanan sipariş/hakedişlerden otomatik üretebilirsiniz.</p>
            </div>
          ) : (
            filtrelenmis.map((fatura) => (
              <FaturaSatirKarti
                key={fatura.id}
                fatura={fatura}
                onGoruntule={setYazdirilan}
                onDuzenle={(f) => { setDuzenlenen(f); setFormAcik(true); }}
                onIptalEt={(id) => faturaIptalEt(id, 'Yönetim tarafından iptal edildi')}
                onSil={faturaSil}
              />
            ))
          )}
        </div>
      </div>

      {formAcik && (
        <FaturaFormModali
          duzenlenen={duzenlenen}
          onKaydet={async (kayit) => {
            if (duzenlenen) await faturaGuncelle(duzenlenen.id, kayit);
            else await yeniFaturaEkle(kayit);
            setFormAcik(false);
            setDuzenlenen(null);
          }}
          onKapat={() => { setFormAcik(false); setDuzenlenen(null); }}
        />
      )}

      {yazdirilan && <FaturaYazdirModali fatura={yazdirilan} onKapat={() => setYazdirilan(null)} />}
    </div>
  );
};
