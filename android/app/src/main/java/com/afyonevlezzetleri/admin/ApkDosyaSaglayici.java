package com.afyonevlezzetleri.admin;

import android.content.ContentProvider;
import android.content.ContentValues;
import android.database.Cursor;
import android.database.MatrixCursor;
import android.net.Uri;
import android.os.ParcelFileDescriptor;
import android.provider.OpenableColumns;

import java.io.File;
import java.io.FileNotFoundException;

public class ApkDosyaSaglayici extends ContentProvider {

    public static final String OTORITE = "com.afyonevlezzetleri.admin.dosya";

    public static Uri apkUriOlustur(String dosyaAdi) {
        return new Uri.Builder()
                .scheme("content")
                .authority(OTORITE)
                .appendPath("guncelleme")
                .appendPath(dosyaAdi)
                .build();
    }

    @Override
    public boolean onCreate() {
        return true;
    }

    @Override
    public String getType(Uri uri) {
        return "application/vnd.android.package-archive";
    }

    @Override
    public ParcelFileDescriptor openFile(Uri uri, String mode) throws FileNotFoundException {
        if (getContext() == null) {
            throw new FileNotFoundException("Baglam hazir degil");
        }
        String dosyaAdi = uri.getLastPathSegment();
        if (dosyaAdi == null || dosyaAdi.contains("..")) {
            throw new FileNotFoundException("Gecersiz dosya adi");
        }
        File dosya = new File(new File(getContext().getCacheDir(), "guncelleme"), dosyaAdi);
        if (!dosya.exists()) {
            throw new FileNotFoundException("APK dosyasi bulunamadi: " + dosya.getAbsolutePath());
        }
        return ParcelFileDescriptor.open(dosya, ParcelFileDescriptor.MODE_READ_ONLY);
    }

    @Override
    public Cursor query(Uri uri, String[] projection, String selection, String[] selectionArgs, String sortOrder) {
        String[] sutunlar = projection != null ? projection : new String[]{OpenableColumns.DISPLAY_NAME, OpenableColumns.SIZE};
        MatrixCursor imlec = new MatrixCursor(sutunlar);
        if (getContext() == null || uri.getLastPathSegment() == null) {
            return imlec;
        }
        File dosya = new File(new File(getContext().getCacheDir(), "guncelleme"), uri.getLastPathSegment());
        Object[] satir = new Object[sutunlar.length];
        for (int i = 0; i < sutunlar.length; i++) {
            if (OpenableColumns.DISPLAY_NAME.equals(sutunlar[i])) {
                satir[i] = dosya.getName();
            } else if (OpenableColumns.SIZE.equals(sutunlar[i])) {
                satir[i] = dosya.length();
            }
        }
        imlec.addRow(satir);
        return imlec;
    }

    @Override
    public Uri insert(Uri uri, ContentValues values) {
        return null;
    }

    @Override
    public int delete(Uri uri, String selection, String[] selectionArgs) {
        return 0;
    }

    @Override
    public int update(Uri uri, ContentValues values, String selection, String[] selectionArgs) {
        return 0;
    }
}
