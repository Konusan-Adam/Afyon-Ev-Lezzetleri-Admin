import { KullaniciRolu } from '@/src/veritabani/VeriTipleri';

export const YETKILI_SUPER_ADMIN_ROLLERI: ReadonlyArray<KullaniciRolu> = [
  'super_admin',
  'yonetici',
];

export function telefonuOnHaneliyeCevir(telefon: string): string {
  const rakamlar = (telefon || '').replace(/\D/g, '');
  if (rakamlar.startsWith('90') && rakamlar.length === 12) {
    return rakamlar.substring(2);
  }
  if (rakamlar.startsWith('0') && rakamlar.length === 11) {
    return rakamlar.substring(1);
  }
  return rakamlar.length > 10 ? rakamlar.slice(-10) : rakamlar;
}

export function telefonuOnBirHaneliyeCevir(telefon: string): string {
  const onHane = telefonuOnHaneliyeCevir(telefon);
  if (!onHane) return '';
  return onHane.startsWith('0') ? onHane : `0${onHane}`;
}

export function kullaniciBelgeIdOlustur(telefon: string, rol: KullaniciRolu): string {
  const onBirHane = telefonuOnBirHaneliyeCevir(telefon);
  return `${onBirHane}_${rol}`;
}

export function yonetimYetkisiVarMi(rol?: string): boolean {
  return Boolean(rol && YETKILI_SUPER_ADMIN_ROLLERI.includes(rol));
}

export function superAdminMi(rol?: string): boolean {
  return Boolean(rol && YETKILI_SUPER_ADMIN_ROLLERI.includes(rol));
}

export function subeMuduruMu(rol?: string): boolean {
  return rol === 'sube_muduru' || rol === 'sube_admin';
}
