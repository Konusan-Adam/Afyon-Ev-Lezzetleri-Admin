export function ibanTemizle(iban: string): string {
  return (iban || '').replace(/\s+/g, '').toUpperCase();
}

export function ibanFormatla(iban: string): string {
  const temiz = ibanTemizle(iban);
  return temiz.replace(/(.{4})/g, '$1 ').trim();
}

export function ibanGecerliMi(iban: string): { gecerli: boolean; hata?: string } {
  const temiz = ibanTemizle(iban);
  if (!temiz) return { gecerli: false, hata: 'IBAN alanı boş bırakılamaz.' };
  if (!/^TR\d{24}$/.test(temiz)) {
    return { gecerli: false, hata: 'TR ile başlayan 26 haneli geçerli bir IBAN giriniz.' };
  }
  const duzenlenmis = temiz.slice(4) + temiz.slice(0, 4);
  const sayisal = duzenlenmis.replace(/[A-Z]/g, (c) => String(c.charCodeAt(0) - 55));
  let kalan = 0;
  for (let i = 0; i < sayisal.length; i++) {
    kalan = (kalan * 10 + Number(sayisal[i])) % 97;
  }
  if (kalan !== 1) {
    return { gecerli: false, hata: 'IBAN kontrol hanesi (Mod-97) geçersiz.' };
  }
  return { gecerli: true };
}

export function tcknVknGecerliMi(deger: string): {
  gecerli: boolean;
  tip?: 'TCKN' | 'VKN';
  hata?: string;
} {
  const rakam = (deger || '').replace(/\D/g, '');
  if (!rakam) return { gecerli: false, hata: 'TCKN veya VKN zorunludur.' };
  if (rakam.length === 10) return { gecerli: true, tip: 'VKN' };
  if (rakam.length === 11) {
    if (rakam[0] === '0') return { gecerli: false, hata: 'TCKN 0 ile başlayamaz.' };
    const d = rakam.split('').map(Number);
    const h10 = (((d[0] + d[2] + d[4] + d[6] + d[8]) * 7 - (d[1] + d[3] + d[5] + d[7])) % 10 + 10) % 10;
    const h11 = d.slice(0, 10).reduce((a, b) => a + b, 0) % 10;
    if (d[9] !== h10 || d[10] !== h11) {
      return { gecerli: false, hata: 'TCKN doğrulama rakamları hatalı.' };
    }
    return { gecerli: true, tip: 'TCKN' };
  }
  return { gecerli: false, hata: 'TCKN 11, VKN 10 haneli olmalıdır.' };
}
