import { useState, useEffect, useCallback } from 'react';
import {
  androidOrtamindaMi,
  apkGuncelleIndirVeKur,
  uygulamaSurumuGetir,
} from './AndroidKopruServisi';

export interface ApkMetaBilgisi {
  rol: string;
  paketKimligi: string;
  uygulamaAdi: string;
  apkDosyaAdi: string;
  surumKodu: number;
  surumAdi: string;
  boyutByte: number;
  boyutMb: number;
  sha256: string;
  imzaliMi: boolean;
  imzaYontemleri: string[];
  derlemeModu: string;
  indirmeYolu: string;
  olusturmaTarihi: string;
}

function surumKarsilastir(yeni: string, mevcut: string): number {
  const a = yeni.replace(/^v/i, '').split('.').map((n) => parseInt(n, 10) || 0);
  const b = mevcut.replace(/^v/i, '').split('.').map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const fark = (a[i] || 0) - (b[i] || 0);
    if (fark !== 0) return fark;
  }
  return 0;
}

export function useApkGuncelleme() {
  const [meta, setMeta] = useState<ApkMetaBilgisi | null>(null);
  const [githubIndirmeUrl, setGithubIndirmeUrl] = useState<string | null>(null);
  const [githubSurumAdi, setGithubSurumAdi] = useState<string | null>(null);
  const [kontrolEdiliyor, setKontrolEdiliyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  const androidIcindeMi = androidOrtamindaMi();
  const kuruluSurum = uygulamaSurumuGetir();

  const simdiKontrolEt = useCallback(async () => {
    setKontrolEdiliyor(true);
    setHata(null);
    try {
      const yerelYanit = await fetch('/api/apk/meta', { cache: 'no-store' });
      if (yerelYanit.ok) {
        const veri = (await yerelYanit.json()) as ApkMetaBilgisi;
        setMeta(veri);
      } else {
        setMeta(null);
      }

      const githubRepo = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_GITHUB_APK_REPO;
      if (githubRepo) {
        const ghYanit = await fetch(`https://api.github.com/repos/${githubRepo}/releases/latest`);
        if (ghYanit.ok) {
          const release = await ghYanit.json();
          const apkVarlik = Array.isArray(release.assets)
            ? release.assets.find((a: { name?: string }) => a.name?.endsWith('.apk'))
            : null;
          if (apkVarlik?.browser_download_url && release.tag_name) {
            setGithubIndirmeUrl(apkVarlik.browser_download_url);
            setGithubSurumAdi(release.tag_name);
          }
        }
      }
    } catch (e) {
      setHata(e instanceof Error ? e.message : 'APK güncelleme kontrolü başarısız oldu.');
    } finally {
      setKontrolEdiliyor(false);
    }
  }, []);

  useEffect(() => {
    void simdiKontrolEt();
  }, [simdiKontrolEt]);

  const guncelSurumAdi = githubSurumAdi || meta?.surumAdi || null;
  const guncellemeVarMi = Boolean(
    androidIcindeMi &&
      kuruluSurum &&
      ((meta && meta.surumKodu > kuruluSurum.surumKodu) ||
        (guncelSurumAdi && surumKarsilastir(guncelSurumAdi, kuruluSurum.surumAdi) > 0))
  );

  const indirVeKur = useCallback(() => {
    const hedefUrl =
      githubIndirmeUrl ||
      (typeof window !== 'undefined' && meta?.indirmeYolu
        ? `${window.location.origin}${meta.indirmeYolu}`
        : '/api/apk/indir');

    if (androidIcindeMi) {
      apkGuncelleIndirVeKur(hedefUrl);
    } else if (typeof window !== 'undefined') {
      const baglanti = document.createElement('a');
      baglanti.href = hedefUrl;
      baglanti.download = meta?.apkDosyaAdi || 'afyon-admin.apk';
      document.body.appendChild(baglanti);
      baglanti.click();
      document.body.removeChild(baglanti);
    }
  }, [androidIcindeMi, githubIndirmeUrl, meta]);

  return {
    meta,
    kuruluSurum,
    androidIcindeMi,
    guncellemeVarMi,
    guncelSurumAdi,
    kontrolEdiliyor,
    hata,
    indirVeKur,
    simdiKontrolEt,
  };
}
