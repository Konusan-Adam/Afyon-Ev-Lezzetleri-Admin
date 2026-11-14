const BIRLER = ['', 'Bir', 'İki', 'Üç', 'Dört', 'Beş', 'Altı', 'Yedi', 'Sekiz', 'Dokuz'];
const ONLAR = ['', 'On', 'Yirmi', 'Otuz', 'Kırk', 'Elli', 'Altmış', 'Yetmiş', 'Seksen', 'Doksan'];
const BINLIKLER = ['', 'Bin', 'Milyon', 'Milyar'];

function ucBasamakCevir(sayi: number): string {
  const yuz = Math.floor(sayi / 100);
  const on = Math.floor((sayi % 100) / 10);
  const bir = sayi % 10;
  const parcalar: string[] = [];
  if (yuz === 1) parcalar.push('Yüz');
  else if (yuz > 1) parcalar.push(`${BIRLER[yuz]} Yüz`);
  if (on > 0) parcalar.push(ONLAR[on]);
  if (bir > 0) parcalar.push(BIRLER[bir]);
  return parcalar.join(' ');
}

function tamSayiCevir(sayi: number): string {
  if (sayi === 0) return 'Sıfır';
  const gruplar: string[] = [];
  let kalan = sayi;
  let indeks = 0;
  while (kalan > 0) {
    const grup = kalan % 1000;
    if (grup > 0) {
      const metin = indeks === 1 && grup === 1 ? '' : ucBasamakCevir(grup);
      const ek = BINLIKLER[indeks] || '';
      gruplar.unshift([metin, ek].filter(Boolean).join(' '));
    }
    kalan = Math.floor(kalan / 1000);
    indeks++;
  }
  return gruplar.join(' ');
}

export function tutarYaziyaCevir(tutar: number): string {
  const pozitif = Math.max(0, Number(tutar || 0));
  const lira = Math.floor(pozitif + 0.0001);
  const kurus = Math.round((pozitif - lira) * 100);
  const kurusMetni = kurus > 0 ? ` ${tamSayiCevir(kurus)} Kuruştur.` : 'dır.';
  return `Yalnız ${tamSayiCevir(lira)} Türk Lirası${kurus > 0 ? kurusMetni : kurusMetni}`;
}

export function ettnGetir(ettn?: string, tohum?: string): string {
  if (ettn) return ettn;
  const kaynak = (tohum || 'afyon-ev-lezzetleri').padEnd(32, '0');
  let h = '';
  for (let i = 0; i < 32; i++) {
    const kod = (kaynak.charCodeAt(i % kaynak.length) * (i + 7) + i * 13) % 16;
    h += kod.toString(16);
  }
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
}
