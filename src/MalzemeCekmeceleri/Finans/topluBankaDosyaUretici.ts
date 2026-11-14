import { HakedisCekimTalebi } from '@/src/veritabani/GercekVeriYardimcisi';
import { ibanTemizle } from './ibanVeKimlikDogrulama';

function dosyaIndir(icerik: string, dosyaAdi: string, mimeTipi: string) {
  const blob = new Blob([icerik], { type: mimeTipi });
  const baglanti = document.createElement('a');
  baglanti.href = URL.createObjectURL(blob);
  baglanti.download = dosyaAdi;
  document.body.appendChild(baglanti);
  baglanti.click();
  document.body.removeChild(baglanti);
  URL.revokeObjectURL(baglanti.href);
}

export function partiNumarasiUret(): string {
  const tarih = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rastgele = Math.floor(100 + Math.random() * 900);
  return `TOP-${tarih}-${rastgele}`;
}

export function topluOdemeCsvIndir(
  talepler: HakedisCekimTalebi[],
  partiNo: string,
  aciklama = 'Afyon Ev Lezzetleri Hakediş Ödemesi'
) {
  const basliklar = [
    'Sira',
    'Parti No',
    'Alici Unvan / Ad Soyad',
    'TCKN / VKN',
    'Banka Adi',
    'IBAN',
    'Tutar (TL)',
    'Odeme Tipi',
    'Aciklama'
  ];

  const satirlar = talepler.map((t, idx) => {
    const alici = (t.hesap_sahibi || t.mutfak_adi || t.kurye_adi || '').replace(/;/g, ' ');
    const kimlik = (t.tckn_vkn || '').replace(/\D/g, '');
    const banka = (t.banka_adi || 'Belirtilmedi').replace(/;/g, ' ');
    const iban = ibanTemizle(t.iban);
    const tutar = Number(t.tutar || 0).toFixed(2).replace('.', ',');
    const tip = t.kurye_id || t.rol_tipi === 'kurye' ? 'Kurye Prim' : 'Mutfak Hakedis';
    const not = `${partiNo} - ${aciklama} (${t.id})`.replace(/;/g, ' ');
    return [idx + 1, partiNo, alici, kimlik, banka, iban, tutar, tip, not].join(';');
  });

  const icerik = '\uFEFF' + [basliklar.join(';'), ...satirlar].join('\n');
  dosyaIndir(icerik, `banka_toplu_odeme_${partiNo}.csv`, 'text/csv;charset=utf-8;');
}

export function topluOdemeTxtIndir(
  talepler: HakedisCekimTalebi[],
  partiNo: string
) {
  const satirlar = talepler.map((t, idx) => {
    const iban = ibanTemizle(t.iban);
    const alici = (t.hesap_sahibi || t.mutfak_adi || t.kurye_adi || '').slice(0, 40);
    const tckn = (t.tckn_vkn || '00000000000').replace(/\D/g, '');
    const tutar = Number(t.tutar || 0).toFixed(2);
    return `${idx + 1}|${iban}|${alici}|${tckn}|${tutar}|TRY|${partiNo} Hakedis`;
  });
  dosyaIndir(satirlar.join('\n'), `banka_fast_listesi_${partiNo}.txt`, 'text/plain;charset=utf-8;');
}
