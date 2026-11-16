export const RESMI_MUTFAK_LOGOSU = '/assets/aistudio/image_48081a60_bc73ebae.jpg';

export function mutfakGorseliniSabitle<T extends { gorsel_url?: string }>(mutfak: T): T {
  return {
    ...mutfak,
    gorsel_url: RESMI_MUTFAK_LOGOSU,
  };
}
