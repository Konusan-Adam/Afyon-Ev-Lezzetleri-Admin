import React from 'react';
import { FaturaTipi, FaturaDurumu } from './faturaVeritabani';

export interface FaturaFormVeri {
  fatura_no: string;
  tip: FaturaTipi;
  tarih: string;
  durum: FaturaDurumu;
  kesen_unvan: string;
  kesen_vergi_no: string;
  alan_unvan: string;
  alan_vergi_no: string;
  vergi_dairesi: string;
  tutar: string;
  kdv_orani: string;
  stopaj_orani: string;
  aciklama: string;
}

interface GirdiProps {
  form: FaturaFormVeri;
  guncelle: (alan: keyof FaturaFormVeri, deger: string) => void;
  tipDegistir: (yeniTip: FaturaTipi) => void;
}

const girdiSinif =
  'w-full bg-[#130713] border border-purple-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400';

export const FaturaFormGirdileri: React.FC<GirdiProps> = ({ form, guncelle, tipDegistir }) => (
  <div className="space-y-3 text-xs">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
      <div className="col-span-2">
        <label className="text-gray-400 block mb-1">Belge Tipi</label>
        <select value={form.tip} onChange={e => tipDegistir(e.target.value as FaturaTipi)} className={girdiSinif}>
          <option value="gider_pusulasi">Gider Pusulası (Ev Mutfak)</option>
          <option value="earSiv_fatura">E-Arşiv Fatura (Ticari)</option>
          <option value="komisyon_faturasi">Komisyon Faturası</option>
          <option value="kurye_makbuz">Kurye Gider Pusulası</option>
        </select>
      </div>
      <div>
        <label className="text-gray-400 block mb-1">Belge No</label>
        <input type="text" required value={form.fatura_no} onChange={e => guncelle('fatura_no', e.target.value)} className={`${girdiSinif} font-mono`} />
      </div>
      <div>
        <label className="text-gray-400 block mb-1">Tarih</label>
        <input type="date" required value={form.tarih} onChange={e => guncelle('tarih', e.target.value)} className={girdiSinif} />
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      <div>
        <label className="text-gray-400 block mb-1">Kesen / Düzenleyen Unvan</label>
        <input type="text" required value={form.kesen_unvan} onChange={e => guncelle('kesen_unvan', e.target.value)} className={girdiSinif} />
      </div>
      <div>
        <label className="text-gray-400 block mb-1">Kesen VKN / TCKN (10-11 hane)</label>
        <input type="text" maxLength={11} value={form.kesen_vergi_no} onChange={e => guncelle('kesen_vergi_no', e.target.value.replace(/\D/g, ''))} placeholder="Opsiyonel" className={`${girdiSinif} font-mono`} />
      </div>
      <div>
        <label className="text-gray-400 block mb-1">Alıcı / Muhatap Unvan</label>
        <input type="text" required value={form.alan_unvan} onChange={e => guncelle('alan_unvan', e.target.value)} className={girdiSinif} />
      </div>
      <div>
        <label className="text-gray-400 block mb-1">Alıcı VKN / TCKN</label>
        <input type="text" maxLength={11} value={form.alan_vergi_no} onChange={e => guncelle('alan_vergi_no', e.target.value.replace(/\D/g, ''))} placeholder="Opsiyonel" className={`${girdiSinif} font-mono`} />
      </div>
    </div>

    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
      <div>
        <label className="text-gray-400 block mb-1">Brüt Tutar (₺)</label>
        <input type="number" step="0.01" min="0" required value={form.tutar} onChange={e => guncelle('tutar', e.target.value)} className={`${girdiSinif} font-bold`} />
      </div>
      <div>
        <label className="text-gray-400 block mb-1">KDV (%)</label>
        <select value={form.kdv_orani} onChange={e => guncelle('kdv_orani', e.target.value)} className={girdiSinif}>
          <option value="0">%0 (Muaf)</option>
          <option value="1">%1 (Temel Gıda)</option>
          <option value="10">%10 (Yemek)</option>
          <option value="20">%20 (Hizmet)</option>
        </select>
      </div>
      <div>
        <label className="text-gray-400 block mb-1">Stopaj (%)</label>
        <select value={form.stopaj_orani} onChange={e => guncelle('stopaj_orani', e.target.value)} className={girdiSinif}>
          <option value="0">%0 (GVK 9/10)</option>
          <option value="2">%2 (Tarım/Esnaf)</option>
          <option value="10">%10 (Hizmet)</option>
          <option value="20">%20 (Serbest Meslek)</option>
        </select>
      </div>
      <div>
        <label className="text-gray-400 block mb-1">Durum</label>
        <select value={form.durum} onChange={e => guncelle('durum', e.target.value)} className={girdiSinif}>
          <option value="onaylandi">Onaylı</option>
          <option value="beklemede">Beklemede</option>
          <option value="iptal">İptal</option>
        </select>
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      <div>
        <label className="text-gray-400 block mb-1">Vergi Dairesi</label>
        <input type="text" value={form.vergi_dairesi} onChange={e => guncelle('vergi_dairesi', e.target.value)} className={girdiSinif} />
      </div>
      <div>
        <label className="text-gray-400 block mb-1">Açıklama</label>
        <input type="text" required value={form.aciklama} onChange={e => guncelle('aciklama', e.target.value)} className={girdiSinif} />
      </div>
    </div>
  </div>
);
