package com.afyonevlezzetleri.admin;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.media.AudioAttributes;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.PowerManager;
import android.os.VibrationEffect;
import android.os.Vibrator;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

public class DinleyiciServisi extends Service {

    public static final String EYLEM_BASLAT = "com.afyonevlezzetleri.admin.BASLAT";
    public static final String EYLEM_DURDUR = "com.afyonevlezzetleri.admin.DURDUR";
    public static final String EYLEM_ZIL_CAL = "com.afyonevlezzetleri.admin.ZIL_CAL";
    public static final String EYLEM_ZIL_SUSTUR = "com.afyonevlezzetleri.admin.ZIL_SUSTUR";

    private static final String DURUM_KANALI_ID = "afyon_servis_durum";
    private static final String ALARM_KANALI_ID = "afyon_kritik_alarm";
    private static final int SERVIS_BILDIRIM_ID = 1001;
    private static final int ALARM_BILDIRIM_ID = 2002;

    private static final String FIRESTORE_PROJE = "tfy-smart-fishing-511521";
    private static final String FIRESTORE_VERITABANI = "ai-studio-afyonevlezzetler-373e291d-b34e-4126-ac5e-613533550d71";
    private static final String FIRESTORE_TABAN_URL =
            "https://firestore.googleapis.com/v1/projects/" + FIRESTORE_PROJE +
            "/databases/" + FIRESTORE_VERITABANI + "/documents/";

    private ScheduledExecutorService zamanlayici;
    private final Set<String> bilinenKimlikler = new HashSet<>();
    private boolean ilkTaramaTamamlandi = false;
    private MediaPlayer aktifOynatici;
    private PowerManager.WakeLock uyanmaKilidi;
    private final Handler anaIsParcacigi = new Handler(Looper.getMainLooper());
    private Runnable otomatikSusturmaGorevi;

    @Override
    public void onCreate() {
        super.onCreate();
        bildirimKanallariniOlustur();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        String eylem = intent != null ? intent.getAction() : EYLEM_BASLAT;

        if (EYLEM_DURDUR.equals(eylem)) {
            zilSustur();
            stopForeground(true);
            stopSelf();
            return START_NOT_STICKY;
        }

        if (EYLEM_ZIL_SUSTUR.equals(eylem)) {
            zilSustur();
            return START_STICKY;
        }

        if (EYLEM_ZIL_CAL.equals(eylem) && intent != null) {
            String baslik = intent.getStringExtra("baslik");
            String detay = intent.getStringExtra("detay");
            boolean kesintisiz = intent.getBooleanExtra("kesintisiz", true);
            int sureSn = intent.getIntExtra("sureSn", 20);
            olayiBildirVeCal(
                    baslik != null ? baslik : "Acil İşlem",
                    detay != null ? detay : "Yeni kritik olay bekliyor.",
                    kesintisiz,
                    sureSn,
                    true
            );
            return START_STICKY;
        }

        startForeground(SERVIS_BILDIRIM_ID, durumBildirimiOlustur());
        dinlemeyiBaslat();
        return START_STICKY;
    }

    private void dinlemeyiBaslat() {
        if (zamanlayici != null && !zamanlayici.isShutdown()) {
            return;
        }
        zamanlayici = Executors.newSingleThreadScheduledExecutor();
        zamanlayici.scheduleWithFixedDelay(this::firestoreKontrolEt, 2, 9, TimeUnit.SECONDS);
    }

    private void firestoreKontrolEt() {
        try {
            SharedPreferences tercihler = getSharedPreferences(MainActivity.TERCIH_DOSYASI, MODE_PRIVATE);
            boolean oturumAktif = tercihler.getBoolean("oturum_aktif", false);
            if (!oturumAktif) return;

            String rol = tercihler.getString("kullanici_rol", "admin");
            String subeId = tercihler.getString("sube_id", "");
            String kullaniciId = tercihler.getString("kullanici_id", "");

            if ("kurye".equals(rol)) {
                koleksiyonuDenetle("siparisler", kullaniciId, subeId, rol);
            } else if ("sube".equals(rol)) {
                koleksiyonuDenetle("siparisler", kullaniciId, subeId, rol);
            } else {
                koleksiyonuDenetle("patron_bildirimleri", kullaniciId, subeId, "admin");
                koleksiyonuDenetle("siparisler", kullaniciId, subeId, "admin");
            }

            if (!ilkTaramaTamamlandi) {
                ilkTaramaTamamlandi = true;
            }
        } catch (Exception ignored) {
        }
    }

    private void koleksiyonuDenetle(String koleksiyonAdi, String kullaniciId, String subeId, String rol) {
        HttpURLConnection baglanti = null;
        try {
            URL url = new URL(FIRESTORE_TABAN_URL + koleksiyonAdi + "?pageSize=25");
            baglanti = (HttpURLConnection) url.openConnection();
            baglanti.setRequestMethod("GET");
            baglanti.setConnectTimeout(6000);
            baglanti.setReadTimeout(6000);

            if (baglanti.getResponseCode() != 200) return;

            StringBuilder yanit = new StringBuilder();
            try (BufferedReader okuyucu = new BufferedReader(
                    new InputStreamReader(baglanti.getInputStream(), StandardCharsets.UTF_8))) {
                String satir;
                while ((satir = okuyucu.readLine()) != null) {
                    yanit.append(satir);
                }
            }

            JSONObject json = new JSONObject(yanit.toString());
            JSONArray belgeler = json.optJSONArray("documents");
            if (belgeler == null) return;

            for (int i = 0; i < belgeler.length(); i++) {
                JSONObject belge = belgeler.optJSONObject(i);
                if (belge == null) continue;
                String tamAd = belge.optString("name", "");
                String anahtar = koleksiyonAdi + ":" + tamAd;

                if (!ilkTaramaTamamlandi) {
                    bilinenKimlikler.add(anahtar);
                    continue;
                }

                if (bilinenKimlikler.contains(anahtar)) continue;
                bilinenKimlikler.add(anahtar);

                JSONObject alanlar = belge.optJSONObject("fields");
                if (alanlar == null) continue;

                if (!olayRolIcinKritikMi(koleksiyonAdi, alanlar, rol, kullaniciId, subeId)) {
                    continue;
                }

                String baslik = metinAlaniOku(alanlar, "baslik");
                String detay = metinAlaniOku(alanlar, "detay");

                if (baslik.isEmpty()) {
                    baslik = "siparisler".equals(koleksiyonAdi)
                            ? "Yeni Sipariş / Kritik Güncelleme"
                            : "Afyon Patron Kritik Bildirim";
                }
                if (detay.isEmpty()) {
                    String durum = metinAlaniOku(alanlar, "durum");
                    detay = durum.isEmpty() ? "Panelde yeni bir işlem kaydı oluştu." : "Durum: " + durum;
                }

                olayiBildirVeCal(baslik, detay, true, 25, false);
                break;
            }
        } catch (Exception ignored) {
        } finally {
            if (baglanti != null) baglanti.disconnect();
        }
    }

    private boolean olayRolIcinKritikMi(String koleksiyon, JSONObject alanlar, String rol, String kullaniciId, String subeId) {
        String durum = metinAlaniOku(alanlar, "durum").toLowerCase();
        if ("patron_bildirimleri".equals(koleksiyon)) {
            boolean okundu = alanlar.has("okundu_mu") && alanlar.optJSONObject("okundu_mu").optBoolean("booleanValue", false);
            return !okundu;
        }
        if ("kurye".equals(rol)) {
            String kuryeId = metinAlaniOku(alanlar, "kurye_id");
            boolean havuzda = "hazir".equals(durum) || "kurye_bekliyor".equals(durum);
            boolean banaAtandi = !kullaniciId.isEmpty() && kullaniciId.equals(kuryeId);
            boolean iptal = durum.contains("iptal");
            return havuzda || banaAtandi || iptal;
        }
        if ("sube".equals(rol)) {
            String kayitSubeId = metinAlaniOku(alanlar, "sube_id");
            if (!subeId.isEmpty() && !subeId.equals(kayitSubeId)) return false;
            return "beklemede".equals(durum) || "yeni".equals(durum) || durum.contains("iptal");
        }
        return "beklemede".equals(durum) || "yeni".equals(durum) || durum.contains("iptal") || "patron_bildirimleri".equals(koleksiyon);
    }

    private String metinAlaniOku(JSONObject alanlar, String anahtar) {
        JSONObject alan = alanlar.optJSONObject(anahtar);
        return alan != null ? alan.optString("stringValue", "") : "";
    }

    private void olayiBildirVeCal(String baslik, String detay, boolean kesintisiz, int sureSn, boolean zorlaCal) {
        SharedPreferences tercihler = getSharedPreferences(MainActivity.TERCIH_DOSYASI, MODE_PRIVATE);
        boolean onPlanda = tercihler.getBoolean("uygulama_on_planda", false);
        PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
        boolean ekranAcik = pm != null && pm.isInteractive();

        // Ekran acik ve uygulama on plandaysa cift ses olmamasi icin sesi WebView calar
        if (!zorlaCal && onPlanda && ekranAcik) {
            return;
        }

        tamEkranBildirimGoster(baslik, detay);
        alarmSesiniCal(kesintisiz, sureSn);
        titresimCal();
    }

    private void alarmSesiniCal(boolean kesintisiz, int sureSn) {
        anaIsParcacigi.post(() -> {
            zilSustur();
            try {
                PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
                if (pm != null) {
                    uyanmaKilidi = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "AfyonPatron::AlarmKilidi");
                    uyanmaKilidi.acquire(Math.max(10, sureSn) * 1000L);
                }

                SharedPreferences tercihler = getSharedPreferences(MainActivity.TERCIH_DOSYASI, MODE_PRIVATE);
                String seciliKimlik = tercihler.getString("zil_secili_kimlik", "acil_siren");
                float sesSeviyesi = Math.max(0.2f, Math.min(1.0f, tercihler.getFloat("zil_ses_seviyesi", 0.9f)));

                MediaPlayer oynatici = new MediaPlayer();
                AudioAttributes nitelikler = new AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_ALARM)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .build();
                oynatici.setAudioAttributes(nitelikler);

                File ozelDosya = new File(getFilesDir(), "ozel_zil_sesi.audio");
                if ("ozel".equals(seciliKimlik) && ozelDosya.exists() && ozelDosya.length() > 0) {
                    oynatici.setDataSource(ozelDosya.getAbsolutePath());
                } else {
                    int rawId = getResources().getIdentifier(seciliKimlik, "raw", getPackageName());
                    if (rawId == 0) {
                        rawId = getResources().getIdentifier("acil_siren", "raw", getPackageName());
                    }
                    if (rawId != 0) {
                        Uri uri = Uri.parse("android.resource://" + getPackageName() + "/" + rawId);
                        oynatici.setDataSource(this, uri);
                    }
                }

                oynatici.setLooping(kesintisiz);
                oynatici.setVolume(sesSeviyesi, sesSeviyesi);
                oynatici.prepare();
                oynatici.start();
                aktifOynatici = oynatici;

                int kisitSure = Math.max(5, Math.min(120, sureSn));
                otomatikSusturmaGorevi = this::zilSustur;
                anaIsParcacigi.postDelayed(otomatikSusturmaGorevi, kisitSure * 1000L);
            } catch (Exception ignored) {
            }
        });
    }

    private void zilSustur() {
        if (otomatikSusturmaGorevi != null) {
            anaIsParcacigi.removeCallbacks(otomatikSusturmaGorevi);
            otomatikSusturmaGorevi = null;
        }
        if (aktifOynatici != null) {
            try {
                if (aktifOynatici.isPlaying()) aktifOynatici.stop();
                aktifOynatici.release();
            } catch (Exception ignored) {
            }
            aktifOynatici = null;
        }
        if (uyanmaKilidi != null && uyanmaKilidi.isHeld()) {
            try {
                uyanmaKilidi.release();
            } catch (Exception ignored) {
            }
            uyanmaKilidi = null;
        }
    }

    private void titresimCal() {
        Vibrator titresim = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
        if (titresim == null || !titresim.hasVibrator()) return;
        long[] desen = new long[]{0, 450, 200, 450, 200, 600};
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            titresim.vibrate(VibrationEffect.createWaveform(desen, -1));
        } else {
            titresim.vibrate(desen, -1);
        }
    }

    private void tamEkranBildirimGoster(String baslik, String detay) {
        Intent acIntent = new Intent(this, MainActivity.class);
        acIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);

        int flags = PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE;
        PendingIntent icerikIntent = PendingIntent.getActivity(this, 0, acIntent, flags);

        Intent susturIntent = new Intent(this, DinleyiciServisi.class);
        susturIntent.setAction(EYLEM_ZIL_SUSTUR);
        PendingIntent susturPending = PendingIntent.getService(this, 1, susturIntent, flags);

        Notification.Builder kurucu = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
                ? new Notification.Builder(this, ALARM_KANALI_ID)
                : new Notification.Builder(this);

        kurucu.setContentTitle(baslik)
                .setContentText(detay)
                .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
                .setCategory(Notification.CATEGORY_ALARM)
                .setPriority(Notification.PRIORITY_MAX)
                .setAutoCancel(true)
                .setContentIntent(icerikIntent)
                .setFullScreenIntent(icerikIntent, true)
                .addAction(new Notification.Action.Builder(
                        android.R.drawable.ic_media_pause,
                        "Zili Sustur",
                        susturPending
                ).build());

        NotificationManager yonetici = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (yonetici != null) {
            yonetici.notify(ALARM_BILDIRIM_ID, kurucu.build());
        }
    }

    private Notification durumBildirimiOlustur() {
        Intent acIntent = new Intent(this, MainActivity.class);
        PendingIntent pending = PendingIntent.getActivity(
                this, 0, acIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        Notification.Builder kurucu = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
                ? new Notification.Builder(this, DURUM_KANALI_ID)
                : new Notification.Builder(this);

        return kurucu
                .setContentTitle("Afyon Patron Canlı Dinleme Aktif")
                .setContentText("Yeni sipariş ve kritik işlemler arka planda dinleniyor.")
                .setSmallIcon(android.R.drawable.ic_popup_sync)
                .setOngoing(true)
                .setContentIntent(pending)
                .build();
    }

    private void bildirimKanallariniOlustur() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationManager yonetici = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (yonetici == null) return;

        NotificationChannel durumKanali = new NotificationChannel(
                DURUM_KANALI_ID,
                "Arka Plan Bağlantı Durumu",
                NotificationManager.IMPORTANCE_LOW
        );
        yonetici.createNotificationChannel(durumKanali);

        NotificationChannel alarmKanali = new NotificationChannel(
                ALARM_KANALI_ID,
                "Acil Sipariş ve Kritik Alarmlar",
                NotificationManager.IMPORTANCE_HIGH
        );
        alarmKanali.enableVibration(true);
        alarmKanali.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
        alarmKanali.setSound(null, null); // Alarm sesi MediaPlayer uzerinden USAGE_ALARM ile calinir
        yonetici.createNotificationChannel(alarmKanali);
    }

    @Override
    public void onDestroy() {
        zilSustur();
        if (zamanlayici != null) {
            zamanlayici.shutdownNow();
        }
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
