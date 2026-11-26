package com.afyonevlezzetleri.admin;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;

public class BootReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null || intent.getAction() == null) return;
        String eylem = intent.getAction();
        if (Intent.ACTION_BOOT_COMPLETED.equals(eylem) || Intent.ACTION_MY_PACKAGE_REPLACED.equals(eylem)) {
            SharedPreferences tercihler = context.getSharedPreferences(MainActivity.TERCIH_DOSYASI, Context.MODE_PRIVATE);
            boolean oturumAktif = tercihler.getBoolean("oturum_aktif", false);
            if (!oturumAktif) return;

            Intent servisIntent = new Intent(context, DinleyiciServisi.class);
            servisIntent.setAction(DinleyiciServisi.EYLEM_BASLAT);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(servisIntent);
            } else {
                context.startService(servisIntent);
            }
        }
    }
}
