import React, { useState, useEffect } from 'react';
import { kullaniciHafizasiKullan } from '@/src/OrtakHavuz/KullaniciHafizasi';
import { gelAlSubeleriGetir } from '@/src/MalzemeCekmeceleri/gelAlSubeleriGetir';
import { subeStokServisi } from '@/src/MalzemeCekmeceleri/Sube/subeStokServisi';
import { subeSiparisServisi } from '@/src/MalzemeCekmeceleri/Sube/subeSiparisServisi';
import { GelAlSubesi } from '@/src/veritabani/VeriTipleri';
import { SubeOzetIstatistikleri } from './SubeOzetIstatistikleri';
import { SubeAltNavigasyon, SubeAltSekme } from './SubeAltNavigasyon';
import { SubeIcerikGorunumu } from './SubeIcerikGorunumu';
import { SubeYonetimModallari } from './SubeYonetimModallari';

export interface SubeYonlendirmeBilgisi {
  altSekme: SubeAltSekme;
  subeId?: string;
  metinIpucu?: string;
  anahtar: number;
}

interface SubeYonetimSekmesiProps {
  subeYonlendirme?: SubeYonlendirmeBilgisi | null;
}

export const SubeYonetimSekmesi: React.FC<SubeYonetimSekmesiProps> = ({ subeYonlendirme }) => {
  const { aktifKullanici } = kullaniciHafizasiKullan();
  const { subeler, subeEkle, subeGuncelle, subeSil } = gelAlSubeleriGetir();
  const { stoklar } = subeStokServisi();
  const { siparisler } = subeSiparisServisi();

  const subeAdminMi = aktifKullanici?.rol === 'sube_admin' && Boolean(aktifKullanici?.sube_id);
  const goruntulenenSubeler = subeAdminMi ? subeler.filter(s => (s.id || s.kimlik) === aktifKullanici?.sube_id) : subeler;
  const varsayilanId = subeAdminMi ? (aktifKullanici?.sube_id || '') : (goruntulenenSubeler[0]?.id || 'sube-1');

  const [seciliSubeId, setSeciliSubeId] = useState<string>(varsayilanId);
  const [altSekme, setAltSekme] = useState<SubeAltSekme>(
    subeYonlendirme?.altSekme || (subeAdminMi ? 'stoklar' : 'genel_bakis')
  );
  const [duzenleModalAcik, setDuzenleModalAcik] = useState(false);
  const [duzenlenenSube, setDuzenlenenSube] = useState<GelAlSubesi | null>(null);
  const [mudurModalSube, setMudurModalSube] = useState<GelAlSubesi | null>(null);

  useEffect(() => {
    if (!subeYonlendirme) return;
    setAltSekme(subeYonlendirme.altSekme);
    if (subeYonlendirme.subeId) {
      setSeciliSubeId(subeYonlendirme.subeId);
    } else if (subeYonlendirme.metinIpucu && goruntulenenSubeler.length > 0) {
      const ipucuKucuk = subeYonlendirme.metinIpucu.toLocaleLowerCase('tr-TR');
      const eslesen = goruntulenenSubeler.find((s) =>
        s.ad && ipucuKucuk.includes(s.ad.toLocaleLowerCase('tr-TR'))
      );
      if (eslesen) {
        setSeciliSubeId(eslesen.id || eslesen.kimlik || varsayilanId);
      }
    }
  }, [subeYonlendirme?.anahtar, goruntulenenSubeler.length]);

  const seciliSube = goruntulenenSubeler.find(s => (s.id || s.kimlik) === seciliSubeId) || goruntulenenSubeler[0];
  const teslimEdilenler = siparisler.filter(s => s.durum === 'teslim_edildi');
  const gunlukCiro = teslimEdilenler.reduce((toplam, s) => toplam + s.toplam_tutar, 0);

  return (
    <div className="space-y-5">
      <SubeOzetIstatistikleri
        toplamSube={goruntulenenSubeler.length}
        acikSube={goruntulenenSubeler.filter(s => s.acik_mi !== false).length}
        canliYayinSube={goruntulenenSubeler.filter(s => s.canli_yayin_aktif_mi === true).length}
        kritikStokSayisi={stoklar.filter(s => s.stok_adedi <= (s.kritik_esik ?? 5)).length}
        gunlukCiro={gunlukCiro}
        gunlukTeslimat={teslimEdilenler.length}
      />
      <SubeAltNavigasyon
        aktifAltSekme={altSekme} onSekmeDegistir={setAltSekme} seciliSubeAdi={seciliSube?.ad || 'Şube'}
        onYeniSubeAc={() => { setDuzenlenenSube(null); setDuzenleModalAcik(true); }}
      />
      <SubeIcerikGorunumu
        altSekme={altSekme} subeler={goruntulenenSubeler} seciliSubeId={seciliSubeId} seciliSubeAdi={seciliSube?.ad || 'Şube'}
        siparisler={siparisler} onSubeSec={id => { setSeciliSubeId(id); setAltSekme('stoklar'); }}
        onDurumDegistir={s => subeGuncelle(s.id || s.kimlik || '', { acik_mi: !(s.acik_mi !== false) })}
        onYayinDegistir={s => subeGuncelle(s.id || s.kimlik || '', { canli_yayin_aktif_mi: !(s.canli_yayin_aktif_mi === true) })}
        onDuzenle={s => { setDuzenlenenSube(s); setDuzenleModalAcik(true); }}
        onMudurAta={s => setMudurModalSube(s)}
        onSil={s => { if (window.confirm(`"${s.ad}" şubesini silmek istiyor musunuz?`)) subeSil(s.id || s.kimlik || ''); }}
      />
      <SubeYonetimModallari
        duzenleModalAcik={duzenleModalAcik} duzenlenenSube={duzenlenenSube} onDuzenleKapat={() => setDuzenleModalAcik(false)}
        onKaydet={async (v) => { if (duzenlenenSube) await subeGuncelle(duzenlenenSube.id || duzenlenenSube.kimlik || '', v); else await subeEkle(v as any); setDuzenleModalAcik(false); }}
        mudurModalSube={mudurModalSube} onMudurKapat={() => setMudurModalSube(null)}
        onMudurAtandi={(ad, tel) => { if (mudurModalSube) subeGuncelle(mudurModalSube.id || mudurModalSube.kimlik || '', { yetkili_adi: ad, yetkili_telefon: tel }); }}
        onMudurKaldirildi={() => { if (mudurModalSube) subeGuncelle(mudurModalSube.id || mudurModalSube.kimlik || '', { yetkili_adi: '', yetkili_telefon: '' }); }}
      />
    </div>
  );
};
