import React from 'react';
import { Building, CheckSquare, Square, ShieldCheck, AlertTriangle } from 'lucide-react';
import { HakedisCekimTalebi } from '@/src/veritabani/GercekVeriYardimcisi';
import { ibanGecerliMi, tcknVknGecerliMi } from '@/src/MalzemeCekmeceleri/Finans/ibanVeKimlikDogrulama';

interface TalepKartiProps {
  talep: HakedisCekimTalebi;
  seciliMi: boolean;
  secimDegistir: (id: string) => void;
  tekilOnaylaAc: (talep: HakedisCekimTalebi) => void;
  reddet: (id: string) => void;
}

export const HakedisTalepKarti: React.FC<TalepKartiProps> = ({
  talep, seciliMi, secimDegistir, tekilOnaylaAc, reddet
}) => {
  const bekleyenMi = talep.durum === 'beklemede';
  const ibanOk = ibanGecerliMi(talep.iban).gecerli;
  const kimlikOk = tcknVknGecerliMi(talep.tckn_vkn || '').gecerli;

  return (
    <div className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs ${
      seciliMi ? 'bg-[#250D2C] border-amber-400' : 'bg-[#180A1F] border-[#3E1646] hover:border-purple-700'
    }`}>
      <div className="flex items-start gap-3 flex-1">
        {bekleyenMi && (
          <button type="button" onClick={() => secimDegistir(talep.id)} className="mt-1 text-amber-400 cursor-pointer">
            {seciliMi ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5 text-gray-500" />}
          </button>
        )}
        <div className="space-y-1.5 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-extrabold text-amber-400 text-base">{talep.tutar.toLocaleString('tr-TR')} ₺</span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
              bekleyenMi ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
              talep.durum === 'odendi' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
              'bg-rose-500/20 text-rose-300 border-rose-500/40'
            }`}>
              {bekleyenMi ? 'Ödeme Bekliyor' : talep.durum === 'odendi' ? 'Ödendi ✓' : 'Reddedildi ✕'}
            </span>
            {talep.toplu_parti_no && (
              <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-700 font-mono text-[10px]">
                Parti: {talep.toplu_parti_no}
              </span>
            )}
            {ibanOk && kimlikOk ? (
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" /> IBAN & Kimlik Doğrulandı
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] text-rose-400 font-semibold">
                <AlertTriangle className="w-3.5 h-3.5" /> {!ibanOk ? 'IBAN Hatalı' : 'TCKN/VKN Eksik'}
              </span>
            )}
          </div>
          <div className="font-bold text-white text-sm">{talep.mutfak_adi || talep.kurye_adi}</div>
          <div className="text-gray-300 flex flex-wrap items-center gap-2">
            <Building className="w-3.5 h-3.5 text-purple-400" />
            <span>{talep.banka_adi}</span> • <span className="font-mono text-amber-300">{talep.iban}</span>
            <span>({talep.hesap_sahibi}{talep.tckn_vkn ? ` • Kimlik: ${talep.tckn_vkn}` : ''})</span>
          </div>
          <div className="text-[11px] text-gray-500">
            Talep: {talep.talep_tarihi} {talep.odeme_tarihi && `• Ödeme: ${talep.odeme_tarihi}`} {talep.dekont_notu && `• Not: ${talep.dekont_notu}`}
          </div>
        </div>
      </div>

      {bekleyenMi && (
        <div className="flex items-center gap-2 shrink-0">
          <button type="button" onClick={() => tekilOnaylaAc(talep)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-[#130713] font-extrabold text-xs cursor-pointer hover:brightness-110">
            Tekil Öde & Pusula Kes
          </button>
          <button type="button" onClick={() => reddet(talep.id)}
            className="px-3 py-2 rounded-xl bg-rose-950/60 border border-rose-900 text-rose-300 hover:bg-rose-900 cursor-pointer text-xs font-semibold">
            Reddet
          </button>
        </div>
      )}
    </div>
  );
};
