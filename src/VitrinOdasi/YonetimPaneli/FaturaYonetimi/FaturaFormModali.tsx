import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import { tcknVknGecerliMi } from '@/src/MalzemeCekmeceleri/Finans/ibanVeKimlikDogrulama';
import { FaturaKaydi, FaturaTipi, belgeNoUret } from './faturaVeritabani';
import { FaturaFormGirdileri, FaturaFormVeri } from './FaturaFormGirdileri';

interface ModalProps {
  duzenlenen: FaturaKaydi | null;
  onKaydet: (kayit: FaturaKaydi) => Promise<void>;
  onKapat: () => void;
}

const VARSAYILAN_SABLON: Record<FaturaTipi, Partial<FaturaFormVeri>> = {
  gider_pusulasi: { kesen_unvan: 'Ev Mutfağı İş Ortağı', alan_unvan: 'Afyon Ev Lezzetleri A.Ş.', alan_vergi_no: '0123456789', kdv_orani: '0', stopaj_orani: '0', aciklama: 'Esnaf muafiyetli ev mutfağı ürün alım belgesi' },
  earSiv_fatura: { kesen_unvan: 'Afyon Ev Lezzetleri A.Ş.', kesen_vergi_no: '0123456789', alan_unvan: 'Perakende Müşteri', alan_vergi_no: '', kdv_orani: '10', stopaj_orani: '0', aciklama: 'Hazır ev yemeği satış E-Arşiv faturası' },
  komisyon_faturasi: { kesen_unvan: 'Afyon Ev Lezzetleri A.Ş.', kesen_vergi_no: '0123456789', alan_unvan: 'Ticari Mutfak Şubesi', alan_vergi_no: '', kdv_orani: '20', stopaj_orani: '0', aciklama: 'Platform aracılık ve hizmet komisyon faturası' },
  kurye_makbuz: { kesen_unvan: 'Taşıyıcı Kurye', alan_unvan: 'Afyon Ev Lezzetleri A.Ş.', alan_vergi_no: '0123456789', kdv_orani: '0', stopaj_orani: '0', aciklama: 'Kurye teslimat ve sefer primi gider pusulası' }
};

export const FaturaFormModali: React.FC<ModalProps> = ({ duzenlenen, onKaydet, onKapat }) => {
  const [hata, setHata] = useState('');
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [form, setForm] = useState<FaturaFormVeri>(() => duzenlenen ? {
    fatura_no: duzenlenen.fatura_no,
    tip: duzenlenen.tip,
    tarih: duzenlenen.tarih,
    durum: duzenlenen.durum,
    kesen_unvan: duzenlenen.kesen_unvan,
    kesen_vergi_no: duzenlenen.kesen_vergi_no || '',
    alan_unvan: duzenlenen.alan_unvan,
    alan_vergi_no: duzenlenen.alan_vergi_no || '',
    vergi_dairesi: duzenlenen.vergi_dairesi || 'Afyonkarahisar Tınaztepe V.D.',
    tutar: String(duzenlenen.tutar),
    kdv_orani: String(duzenlenen.kdv_orani),
    stopaj_orani: String(duzenlenen.stopaj_orani || 0),
    aciklama: duzenlenen.aciklama
  } : {
    fatura_no: belgeNoUret('gider_pusulasi'),
    tip: 'gider_pusulasi',
    tarih: new Date().toISOString().split('T')[0],
    durum: 'onaylandi',
    kesen_unvan: 'Ev Mutfağı İş Ortağı',
    kesen_vergi_no: '',
    alan_unvan: 'Afyon Ev Lezzetleri A.Ş.',
    alan_vergi_no: '0123456789',
    vergi_dairesi: 'Afyonkarahisar Tınaztepe V.D.',
    tutar: '1250',
    kdv_orani: '0',
    stopaj_orani: '0',
    aciklama: 'Esnaf muafiyetli ev mutfağı ürün alım belgesi'
  });

  const brut = parseFloat(form.tutar) || 0;
  const kdvOran = parseFloat(form.kdv_orani) || 0;
  const stopajOran = parseFloat(form.stopaj_orani) || 0;
  const kdvTutar = Number(((brut * kdvOran) / (100 + kdvOran)).toFixed(2));
  const matrah = Number((brut - kdvTutar).toFixed(2));
  const stopajTutar = Number(((matrah * stopajOran) / 100).toFixed(2));
  const net = Number((matrah - stopajTutar).toFixed(2));

  const gonder = async (e: React.FormEvent) => {
    e.preventDefault();
    setHata('');
    if (form.kesen_vergi_no && !tcknVknGecerliMi(form.kesen_vergi_no)) return setHata('Kesen VKN/TCKN geçerli değil.');
    if (form.alan_vergi_no && !tcknVknGecerliMi(form.alan_vergi_no)) return setHata('Alıcı VKN/TCKN geçerli değil.');
    setKaydediliyor(true);
    await onKaydet({
      ...(duzenlenen || {}),
      id: duzenlenen?.id || `fat-${Date.now()}`,
      fatura_no: form.fatura_no.trim(),
      tip: form.tip,
      tarih: form.tarih,
      durum: form.durum,
      kesen_unvan: form.kesen_unvan.trim(),
      kesen_vergi_no: form.kesen_vergi_no.trim(),
      alan_unvan: form.alan_unvan.trim(),
      alan_vergi_no: form.alan_vergi_no.trim(),
      vergi_dairesi: form.vergi_dairesi.trim(),
      tutar: brut,
      kdv_orani: kdvOran,
      kdv_tutari: kdvTutar,
      stopaj_orani: stopajOran,
      stopaj_tutari: stopajTutar,
      net_tutar: net,
      aciklama: form.aciklama.trim(),
      olusturma_zamani: duzenlenen?.olusturma_zamani || new Date().toISOString()
    });
    setKaydediliyor(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="bg-[#180A1F] border border-amber-500/50 rounded-3xl w-full max-w-xl p-6 space-y-4 shadow-2xl text-xs max-h-[92vh] overflow-y-auto">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-amber-400" />
          <span>{duzenlenen ? `Belge Düzenle (${duzenlenen.fatura_no})` : 'Yeni Fatura / Gider Pusulası Kes'}</span>
        </h3>
        <form onSubmit={gonder} className="space-y-4">
          <FaturaFormGirdileri form={form} guncelle={(a, d) => setForm(p => ({ ...p, [a]: d }))}
            tipDegistir={(yeniTip) => setForm(p => duzenlenen ? { ...p, tip: yeniTip } : { ...p, tip: yeniTip, fatura_no: belgeNoUret(yeniTip), ...VARSAYILAN_SABLON[yeniTip] })} />
          <div className="p-3 rounded-xl bg-[#120614] border border-purple-900/70 flex flex-wrap justify-between gap-2 text-[11px] text-gray-300">
            <span>Net/Matrah: <strong className="text-white">{net.toLocaleString('tr-TR')} ₺</strong></span>
            <span>KDV: <strong className="text-amber-300">{kdvTutar.toLocaleString('tr-TR')} ₺</strong></span>
            <span>Stopaj: <strong className="text-rose-300">{stopajTutar.toLocaleString('tr-TR')} ₺</strong></span>
            <span>Genel Toplam: <strong className="text-emerald-400">{brut.toLocaleString('tr-TR')} ₺</strong></span>
          </div>
          {hata && <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-700 text-rose-300 font-bold">{hata}</div>}
          <div className="flex justify-end gap-2 pt-2 border-t border-purple-950">
            <button type="button" onClick={onKapat} className="px-4 py-2 rounded-xl bg-purple-950 text-gray-300 font-bold cursor-pointer">İptal</button>
            <button type="submit" disabled={kaydediliyor} className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-gray-950 font-black cursor-pointer disabled:opacity-50">
              {kaydediliyor ? 'Kaydediliyor...' : duzenlenen ? 'Değişiklikleri Kaydet' : 'Belgeyi Kes & Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
