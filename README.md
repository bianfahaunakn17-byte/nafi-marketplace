# NAFI Marketplace - Siap Upload ke Bolt

## Cara tercepat
1. Ekstrak ZIP.
2. Upload seluruh folder ke GitHub repository baru.
3. Di Bolt pilih **Import from GitHub**, lalu pilih repository tersebut.
4. Buka Terminal dan jalankan:
   ```bash
   npm install
   npm run typecheck
   npm run build
   npm run dev
   ```
5. URL Apps Script sudah ada di `.env`. Ganti bila deployment berubah.

## Backend
- Google Sheets = database
- Google Apps Script = API
- Google Drive = file produk dan bukti pembayaran
- Tidak menggunakan Supabase/Firebase.

## Tes
Produk → Register → Login → Cart → Checkout → Order → Upload bukti → Admin verifikasi → Download.
