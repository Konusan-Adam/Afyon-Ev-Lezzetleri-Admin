import { FaturaKaydi } from './faturaServisi';

export function faturalariCsvIndir(faturalar: FaturaKaydi[]) {
  const basliklar = [
    'Belge No',
    'Tarih',
    'Belge Tipi',
    'Durum',
    'Kesen Unvan',
    'Kesen VKN/TCKN',
    'Alan Unvan',
    'Alan VKN/TCKN',
    'Vergi Dairesi',
    'Matrah (TL)',
    'KDV Oran (%)',
    'KDV Tutari (TL)',
    'Stopaj (%)',
    'Stopaj (TL)',
    'Genel Toplam (TL)',
    'Parti No',
    'Aciklama'
  ];

  const satirlar = faturalar.map((f) => [
    f.fatura_no,
    f.tarih,
    f.tip,
    f.durum,
    f.kesen_unvan.replace(/;/g, ' '),
    f.kesen_vergi_no || '',
    f.alan_unvan.replace(/;/g, ' '),
    f.alan_vergi_no || '',
    (f.vergi_dairesi || '').replace(/;/g, ' '),
    f.net_tutar.toFixed(2).replace('.', ','),
    f.kdv_orani,
    f.kdv_tutari.toFixed(2).replace('.', ','),
    f.stopaj_orani || 0,
    (f.stopaj_tutari || 0).toFixed(2).replace('.', ','),
    f.tutar.toFixed(2).replace('.', ','),
    f.toplu_parti_no || '',
    (f.aciklama || '').replace(/;/g, ' ')
  ].join(';'));

  const icerik = '\uFEFF' + [basliklar.join(';'), ...satirlar].join('\n');
  const blob = new Blob([icerik], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `afyon_faturalar_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}
