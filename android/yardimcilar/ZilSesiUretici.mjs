import fs from 'node:fs';
import path from 'node:path';

const ORNEK_HIZI = 22050;

function wavTamponuUret(ornekler) {
  const veriBoyutu = ornekler.length * 2;
  const tampon = Buffer.alloc(44 + veriBoyutu);

  tampon.write('RIFF', 0);
  tampon.writeUInt32LE(36 + veriBoyutu, 4);
  tampon.write('WAVE', 8);
  tampon.write('fmt ', 12);
  tampon.writeUInt32LE(16, 16); // PCM alt boyutu
  tampon.writeUInt16LE(1, 20);  // PCM format
  tampon.writeUInt16LE(1, 22);  // Mono
  tampon.writeUInt32LE(ORNEK_HIZI, 24);
  tampon.writeUInt32LE(ORNEK_HIZI * 2, 28);
  tampon.writeUInt16LE(2, 32);
  tampon.writeUInt16LE(16, 34); // 16-bit
  tampon.write('data', 36);
  tampon.writeUInt32LE(veriBoyutu, 40);

  for (let i = 0; i < ornekler.length; i++) {
    const deger = Math.max(-1, Math.min(1, ornekler[i]));
    tampon.writeInt16LE(Math.round(deger * 32767), 44 + i * 2);
  }
  return tampon;
}

function notaEkle(ornekler, baslangicSn, sureSn, frekansHz, genlik = 0.65, dalga = 'sine') {
  const basIdx = Math.floor(baslangicSn * ORNEK_HIZI);
  const uzunluk = Math.floor(sureSn * ORNEK_HIZI);
  for (let i = 0; i < uzunluk && basIdx + i < ornekler.length; i++) {
    const t = i / ORNEK_HIZI;
    const zarf =
      Math.min(1, i / (ORNEK_HIZI * 0.012)) *
      Math.max(0, 1 - Math.pow(i / uzunluk, 1.8));
    let dalgaDegeri = Math.sin(2 * Math.PI * frekansHz * t);
    if (dalga === 'triangle') {
      dalgaDegeri = (2 / Math.PI) * Math.asin(dalgaDegeri);
    } else if (dalga === 'square') {
      dalgaDegeri = dalgaDegeri >= 0 ? 0.85 : -0.85;
    }
    ornekler[basIdx + i] += dalgaDegeri * genlik * zarf;
  }
}

export function hazirZilSesleriniUret(rawDizini) {
  fs.mkdirSync(rawDizini, { recursive: true });

  // 1. Acil Siparis Sireni (acil_siren.wav)
  const siren = new Float32Array(Math.floor(ORNEK_HIZI * 1.4));
  notaEkle(siren, 0.0, 0.25, 987.77, 0.7, 'square');
  notaEkle(siren, 0.28, 0.25, 1318.51, 0.7, 'square');
  notaEkle(siren, 0.6, 0.25, 987.77, 0.7, 'square');
  notaEkle(siren, 0.88, 0.35, 1318.51, 0.72, 'square');
  fs.writeFileSync(path.join(rawDizini, 'acil_siren.wav'), wavTamponuUret(siren));

  // 2. Afyon Mutfak Zili (mutfak_zili.wav)
  const mutfakZili = new Float32Array(Math.floor(ORNEK_HIZI * 1.0));
  notaEkle(mutfakZili, 0.0, 0.4, 1046.5, 0.68, 'triangle');
  notaEkle(mutfakZili, 0.16, 0.65, 1318.51, 0.72, 'sine');
  fs.writeFileSync(path.join(rawDizini, 'mutfak_zili.wav'), wavTamponuUret(mutfakZili));

  // 3. Altin Kasa Melodisi (kasa_melodisi.wav)
  const kasaMelodisi = new Float32Array(Math.floor(ORNEK_HIZI * 1.1));
  notaEkle(kasaMelodisi, 0.0, 0.22, 783.99, 0.6, 'triangle');
  notaEkle(kasaMelodisi, 0.16, 0.22, 987.77, 0.62, 'triangle');
  notaEkle(kasaMelodisi, 0.32, 0.55, 1567.98, 0.7, 'sine');
  fs.writeFileSync(path.join(rawDizini, 'kasa_melodisi.wav'), wavTamponuUret(kasaMelodisi));

  // 4. Yumusak Uyari (yumusak_uyari.wav)
  const yumusak = new Float32Array(Math.floor(ORNEK_HIZI * 0.9));
  notaEkle(yumusak, 0.0, 0.35, 659.25, 0.55, 'sine');
  notaEkle(yumusak, 0.22, 0.5, 880.0, 0.58, 'sine');
  fs.writeFileSync(path.join(rawDizini, 'yumusak_uyari.wav'), wavTamponuUret(yumusak));

  return ['acil_siren.wav', 'mutfak_zili.wav', 'kasa_melodisi.wav', 'yumusak_uyari.wav'];
}
