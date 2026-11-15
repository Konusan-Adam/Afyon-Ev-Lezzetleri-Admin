export type HakedisHareketTipi = 'siparis_hakedis' | 'odeme_cikisi' | 'iptal_kesintisi';
export type HakedisHareketYon = 'giris' | 'cikis';
export type HakedisRolTipi = 'mutfak' | 'kurye';

export interface HakedisHareketi {
  id: string;
  alici_id: string;
  alici_adi: string;
  rol: HakedisRolTipi;
  hareket_tipi: HakedisHareketTipi;
  yon: HakedisHareketYon;
  brut_tutar: number;
  komisyon_orani?: number;
  komisyon_tutari?: number;
  net_tutar: number;
  siparis_id?: string;
  siparis_kodu?: string;
  talep_id?: string;
  aciklama: string;
  olusturma_tarihi: string;
}

export const belgeIdTemizle = (deger: string): string =>
  String(deger || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 96);

export const siparisKuryeUcretiBul = (siparis: any, tabanUcret = 70): number => {
  const kayitli = Number(
    siparis?.kurye_hakedis ||
      siparis?.kurye_ucreti ||
      siparis?.teslimat_ucreti ||
      siparis?.teslimatUcreti ||
      0
  );
  return kayitli > 0 ? Number(kayitli.toFixed(2)) : Number(tabanUcret || 70);
};

export interface DefterBakiyeOzeti {
  toplamGiris: number;
  iptalKesintisi: number;
  netHakEdilen: number;
  odenenCikis: number;
  kalanBakiye: number;
  hareketSayisi: number;
}

export const hareketlerdenBakiyeHesapla = (
  hareketler: HakedisHareketi[],
  aliciId?: string,
  rol?: HakedisRolTipi
): DefterBakiyeOzeti => {
  const ilgili = (hareketler || []).filter((h) => {
    const idEslesir = !aliciId || h.alici_id === aliciId;
    const rolEslesir = !rol || h.rol === rol;
    return idEslesir && rolEslesir;
  });

  const toplamGiris = ilgili
    .filter((h) => h.yon === 'giris')
    .reduce((acc, h) => acc + Number(h.net_tutar || 0), 0);

  const iptalKesintisi = ilgili
    .filter((h) => h.hareket_tipi === 'iptal_kesintisi')
    .reduce((acc, h) => acc + Number(h.net_tutar || 0), 0);

  const odenenCikis = ilgili
    .filter((h) => h.hareket_tipi === 'odeme_cikisi')
    .reduce((acc, h) => acc + Number(h.net_tutar || 0), 0);

  const netHakEdilen = Math.max(0, Number((toplamGiris - iptalKesintisi).toFixed(2)));
  const kalanBakiye = Math.max(0, Number((netHakEdilen - odenenCikis).toFixed(2)));

  return {
    toplamGiris: Number(toplamGiris.toFixed(2)),
    iptalKesintisi: Number(iptalKesintisi.toFixed(2)),
    netHakEdilen,
    odenenCikis: Number(odenenCikis.toFixed(2)),
    kalanBakiye,
    hareketSayisi: ilgili.length
  };
};
