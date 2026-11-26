package com.afyonevlezzetleri.admin;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageInfo;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.PowerManager;
import android.provider.Settings;
import android.util.Base64;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import org.json.JSONObject;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class MainActivity extends Activity {

    public static final String TERCIH_DOSYASI = "afyon_patron_tercihler";
    private static final String SANAL_ALAN_ADI = "appassets.androidplatform.net";

    private WebView webGorunumu;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true);
            setTurnScreenOn(true);
        }
        getWindow().addFlags(
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED
                        | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
                        | WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
        );

        webGorunumu = new WebView(this);
        WebSettings ayarlar = webGorunumu.getSettings();
        ayarlar.setJavaScriptEnabled(true);
        ayarlar.setDomStorageEnabled(true);
        ayarlar.setDatabaseEnabled(true);
        ayarlar.setAllowFileAccess(false);
        ayarlar.setMediaPlaybackRequiresUserGesture(false);

        webGorunumu.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (uri != null && SANAL_ALAN_ADI.equals(uri.getHost())) {
                    return yerelVarlikSun(uri.getPath());
                }
                return super.shouldInterceptRequest(view, request);
            }
        });

        webGorunumu.addJavascriptInterface(new AndroidKopru(), "AfyonAndroidKopru");
        setContentView(webGorunumu);
        webGorunumu.loadUrl("https://" + SANAL_ALAN_ADI + "/index.html");
    }

    private WebResourceResponse yerelVarlikSun(String hamYol) {
        String yol = (hamYol == null || "/".equals(hamYol) || hamYol.isEmpty())
                ? "index.html"
                : hamYol.startsWith("/") ? hamYol.substring(1) : hamYol;

        if (yol.contains("..")) {
            return new WebResourceResponse("text/plain", "utf-8", new ByteArrayInputStream(new byte[0]));
        }

        try {
            InputStream akis;
            try {
                akis = getAssets().open("www/" + yol);
            } catch (Exception bulunamadi) {
                yol = "index.html";
                akis = getAssets().open("www/index.html");
            }
            return new WebResourceResponse(mimeTuruBelirle(yol), "utf-8", akis);
        } catch (Exception hata) {
            return new WebResourceResponse("text/plain", "utf-8", new ByteArrayInputStream(new byte[0]));
        }
    }

    private String mimeTuruBelirle(String yol) {
        String kucuk = yol.toLowerCase();
        if (kucuk.endsWith(".html")) return "text/html";
        if (kucuk.endsWith(".js") || kucuk.endsWith(".mjs")) return "application/javascript";
        if (kucuk.endsWith(".css")) return "text/css";
        if (kucuk.endsWith(".json")) return "application/json";
        if (kucuk.endsWith(".png")) return "image/png";
        if (kucuk.endsWith(".jpg") || kucuk.endsWith(".jpeg")) return "image/jpeg";
        if (kucuk.endsWith(".svg")) return "image/svg+xml";
        if (kucuk.endsWith(".wav")) return "audio/wav";
        if (kucuk.endsWith(".mp3")) return "audio/mpeg";
        if (kucuk.endsWith(".woff2")) return "font/woff2";
        return "application/octet-stream";
    }

    @Override
    protected void onResume() {
        super.onResume();
        getSharedPreferences(TERCIH_DOSYASI, MODE_PRIVATE)
                .edit()
                .putBoolean("uygulama_on_planda", true)
                .apply();
    }

    @Override
    protected void onPause() {
        getSharedPreferences(TERCIH_DOSYASI, MODE_PRIVATE)
                .edit()
                .putBoolean("uygulama_on_planda", false)
                .apply();
        super.onPause();
    }

    @Override
    public void onBackPressed() {
        if (webGorunumu != null && webGorunumu.canGoBack()) {
            webGorunumu.goBack();
        } else {
            super.onBackPressed();
        }
    }

    private class AndroidKopru {

        @JavascriptInterface
        public void oturumAyarla(String kullaniciId, String adSoyad, String rol, String telefon, String mutfakId, String subeId) {
            getSharedPreferences(TERCIH_DOSYASI, MODE_PRIVATE)
                    .edit()
                    .putBoolean("oturum_aktif", true)
                    .putString("kullanici_id", kullaniciId != null ? kullaniciId : "")
                    .putString("ad_soyad", adSoyad != null ? adSoyad : "")
                    .putString("kullanici_rol", rol != null ? rol : "admin")
                    .putString("telefon", telefon != null ? telefon : "")
                    .putString("mutfak_id", mutfakId != null ? mutfakId : "")
                    .putString("sube_id", subeId != null ? subeId : "")
                    .apply();

            Intent servis = new Intent(MainActivity.this, DinleyiciServisi.class);
            servis.setAction(DinleyiciServisi.EYLEM_BASLAT);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                startForegroundService(servis);
            } else {
                startService(servis);
            }
        }

        @JavascriptInterface
        public void oturumKapat() {
            getSharedPreferences(TERCIH_DOSYASI, MODE_PRIVATE)
                    .edit()
                    .putBoolean("oturum_aktif", false)
                    .apply();

            Intent servis = new Intent(MainActivity.this, DinleyiciServisi.class);
            servis.setAction(DinleyiciServisi.EYLEM_DURDUR);
            startService(servis);
        }

        @JavascriptInterface
        public void zilAyarla(String seciliKimlik, float sesSeviyesi, String ozelSesVeriUrl) {
            float kisitliSeviye = Math.max(0.2f, Math.min(1.0f, sesSeviyesi));
            SharedPreferences.Editor duzenleyici = getSharedPreferences(TERCIH_DOSYASI, MODE_PRIVATE).edit();
            duzenleyici.putString("zil_secili_kimlik", seciliKimlik != null ? seciliKimlik : "acil_siren");
            duzenleyici.putFloat("zil_ses_seviyesi", kisitliSeviye);
            duzenleyici.apply();

            File ozelDosya = new File(getFilesDir(), "ozel_zil_sesi.audio");
            if (ozelSesVeriUrl != null && !ozelSesVeriUrl.isEmpty()) {
                try {
                    String temizBase64 = ozelSesVeriUrl.contains(",")
                            ? ozelSesVeriUrl.substring(ozelSesVeriUrl.indexOf(',') + 1)
                            : ozelSesVeriUrl;
                    byte[] ham = Base64.decode(temizBase64, Base64.DEFAULT);
                    try (FileOutputStream cikti = new FileOutputStream(ozelDosya)) {
                        cikti.write(ham);
                    }
                } catch (Exception ignored) {
                }
            } else if (!"ozel".equals(seciliKimlik) && ozelDosya.exists()) {
                // Hazir sese gecildiginde gereksiz ozel dosyayi koruyabilir veya bos birakabiliriz
            }
        }

        @JavascriptInterface
        public void zilCal(String baslik, String detay, boolean kesintisiz, int sureSn) {
            Intent servis = new Intent(MainActivity.this, DinleyiciServisi.class);
            servis.setAction(DinleyiciServisi.EYLEM_ZIL_CAL);
            servis.putExtra("baslik", baslik);
            servis.putExtra("detay", detay);
            servis.putExtra("kesintisiz", kesintisiz);
            servis.putExtra("sureSn", sureSn);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                startForegroundService(servis);
            } else {
                startService(servis);
            }
        }

        @JavascriptInterface
        public void zilSustur() {
            Intent servis = new Intent(MainActivity.this, DinleyiciServisi.class);
            servis.setAction(DinleyiciServisi.EYLEM_ZIL_SUSTUR);
            startService(servis);
        }

        @JavascriptInterface
        public void pilOptimizasyonuIste() {
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) return;
            PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
            if (pm != null && !pm.isIgnoringBatteryOptimizations(getPackageName())) {
                Intent izinIntent = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
                izinIntent.setData(Uri.parse("package:" + getPackageName()));
                izinIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(izinIntent);
            }
        }

        @JavascriptInterface
        public String uygulamaSurumu() {
            try {
                PackageInfo bilgi = getPackageManager().getPackageInfo(getPackageName(), 0);
                JSONObject json = new JSONObject();
                json.put("paketKimligi", getPackageName());
                json.put("surumKodu", Build.VERSION.SDK_INT >= Build.VERSION_CODES.P
                        ? bilgi.getLongVersionCode()
                        : bilgi.versionCode);
                json.put("surumAdi", bilgi.versionName != null ? bilgi.versionName : "1.0.0");
                json.put("rol", "admin");
                return json.toString();
            } catch (Exception e) {
                return "{\"paketKimligi\":\"com.afyonevlezzetleri.admin\",\"surumKodu\":1,\"surumAdi\":\"1.0.0\",\"rol\":\"admin\"}";
            }
        }

        @JavascriptInterface
        public void apkGuncelleIndirVeKur(String indirmeUrl) {
            if (indirmeUrl == null || indirmeUrl.isEmpty()) return;
            new Thread(() -> {
                HttpURLConnection baglanti = null;
                try {
                    File guncellemeDizini = new File(getCacheDir(), "guncelleme");
                    if (!guncellemeDizini.exists()) {
                        guncellemeDizini.mkdirs();
                    }
                    File hedefApk = new File(guncellemeDizini, "afyon-admin.apk");

                    URL url = new URL(indirmeUrl);
                    baglanti = (HttpURLConnection) url.openConnection();
                    baglanti.setConnectTimeout(15000);
                    baglanti.setReadTimeout(30000);
                    baglanti.connect();

                    try (InputStream giris = baglanti.getInputStream();
                         FileOutputStream cikti = new FileOutputStream(hedefApk)) {
                        byte[] tampon = new byte[8192];
                        int okunan;
                        while ((okunan = giris.read(tampon)) != -1) {
                            cikti.write(tampon, 0, okunan);
                        }
                    }

                    Uri icerikUri = ApkDosyaSaglayici.apkUriOlustur("afyon-admin.apk");
                    Intent kurulum = new Intent(Intent.ACTION_VIEW);
                    kurulum.setDataAndType(icerikUri, "application/vnd.android.package-archive");
                    kurulum.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
                    startActivity(kurulum);
                } catch (Exception ignored) {
                } finally {
                    if (baglanti != null) baglanti.disconnect();
                }
            }).start();
        }
    }
}
