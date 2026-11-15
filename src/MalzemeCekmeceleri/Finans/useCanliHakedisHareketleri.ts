import { useEffect, useMemo, useState } from 'react';
import { canliFirebaseAktifMi } from '@/src/veritabani/FirebaseIstemcisi';
import { belgeGetir, koleksiyonGetir, koleksiyonuCanliDinle } from '@/src/veritabani/FirebaseKoleksiyonServisi';
import {
  DefterBakiyeOzeti,
  HakedisHareketi,
  HakedisRolTipi,
  hareketlerdenBakiyeHesapla
} from './hakedisDefteriTipleri';

export function useCanliHakedisHareketleri(aliciId?: string, rol?: HakedisRolTipi) {
  const [tumHareketler, setTumHareketler] = useState<HakedisHareketi[]>([]);
  const [tabanKuryeUcreti, setTabanKuryeUcreti] = useState<number>(70);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    if (!canliFirebaseAktifMi()) {
      setYukleniyor(false);
      return;
    }

    let aktif = true;
    const sirala = (liste: HakedisHareketi[]) =>
      [...(liste || [])].sort((a, b) =>
        String(b.olusturma_tarihi || '').localeCompare(String(a.olusturma_tarihi || ''))
      );

    koleksiyonGetir<HakedisHareketi>('hakedis_hareketleri')
      .then((veri) => {
        if (!aktif) return;
        setTumHareketler(sirala(veri));
        setYukleniyor(false);
      })
      .catch(() => {
        if (aktif) setYukleniyor(false);
      });

    belgeGetir<any>('genel_ayarlar', 'genel_ayarlar')
      .then((ayar) => {
        if (aktif && Number(ayar?.taban_ucret) > 0) {
          setTabanKuryeUcreti(Number(ayar.taban_ucret));
        }
      })
      .catch(() => {});

    const durdur = koleksiyonuCanliDinle<HakedisHareketi>('hakedis_hareketleri', (veri) => {
      if (!aktif) return;
      setTumHareketler(sirala(veri));
      setYukleniyor(false);
    });

    return () => {
      aktif = false;
      durdur();
    };
  }, []);

  const hareketler = useMemo(
    () =>
      tumHareketler.filter((h) => {
        const idEslesir = !aliciId || h.alici_id === aliciId;
        const rolEslesir = !rol || h.rol === rol;
        return idEslesir && rolEslesir;
      }),
    [tumHareketler, aliciId, rol]
  );

  const bakiyeOzeti: DefterBakiyeOzeti = useMemo(
    () => hareketlerdenBakiyeHesapla(tumHareketler, aliciId, rol),
    [tumHareketler, aliciId, rol]
  );

  return { hareketler, tumHareketler, bakiyeOzeti, tabanKuryeUcreti, yukleniyor };
}
