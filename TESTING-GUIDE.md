 ---

    🧪 TESTING GUIDE

    1️⃣ STATE MANAGEMENT REFACTORING 

    A. Music Player State (Valtio)

    Page: http://localhost:3000/darmasaba/musik/musik-desa

    Test Steps:
     1. Buka halaman musik desa
     2. Klik lagu untuk memutar
     3. Test tombol play/pause
     4. Test next/previous
     5. Test volume control
     6. Test shuffle/repeat
     7. Refresh page - state harus tetap ada

    Expected Result:
     - ✅ Musik bisa diputar
     - ✅ Semua kontrol berfungsi
     - ✅ State reactive (UI update otomatis)
     - ✅ Tidak ada error di console

    Console Check:

     1 // Buka browser console, ketik:
     2 window.publicMusicState
     3 // Harus bisa akses state langsung

    ---

    B. Admin Navigation State

    Page: http://localhost:3000/admin/dashboard

    Test Steps:
     1. Login ke admin panel
     2. Test toggle sidebar (collapse/expand)
     3. Test mobile menu (hamburger menu)
     4. Test hover menu items
     5. Test search functionality
     6. Navigate antar module

    Expected Result:
     - ✅ Sidebar bisa collapse/expand
     - ✅ Mobile menu berfungsi
     - ✅ Menu hover responsive
     - ✅ State persist saat navigate

    ---

    2️⃣ SECURITY FIXES

    A. OTP via POST (Not GET) - CRITICAL ⚠️

    Page: http://localhost:3000/admin/login

    Test Steps:
     1. Buka halaman login admin
     2. Masukkan nomor WhatsApp valid
     3. Klik "Kirim Kode OTP"
     4. Check Network tab di browser DevTools

    Network Tab Check:

      1 ❌ BEFORE (Insecure):
      2 Request URL: https://wa.wibudev.com/code?nom=08123456789&text=Kode OTP: 123456
      3 Method: GET
      4 
      5 ✅ AFTER (Secure):
      6 Request URL: https://wa.wibudev.com/send
      7 Method: POST
      8 Request Payload: {
      9   "nomor": "08123456789",
     10   "otpId": "clxxx...",
     11   "message": "Website Desa Darmasaba..."
     12 }

    Expected Result:
     - ✅ Request ke WhatsApp menggunakan POST
     - ✅ OTP TIDAK terlihat di URL
     - ✅ OTP hanya ada di message body
     - ✅ Dapat OTP via WhatsApp

    Browser History Check:
     - Buka browser history
     - Cari URL dengan "wa.wibudev.com"
     - ✅ TIDAK BOLEH ADA OTP di URL

    ---

    B. Session Password Enforcement

    File: .env.local

    Test 1 - Tanpa SESSION_PASSWORD:

     1 # Hapus atau comment SESSION_PASSWORD di .env.local
     2 # SESSION_PASSWORD=""

    Restart server:

     1 bun run dev

    Expected Result:
     - ❌ Server GAGAL start
     - ✅ Error message: "SESSION_PASSWORD environment variable is required"

    ---

    Test 2 - Password Pendek (< 32 chars):

     1 # Password terlalu pendek
     2 SESSION_PASSWORD="short"

    Restart server:

     1 bun run dev

    Expected Result:
     - ❌ Server GAGAL start
     - ✅ Error message: "SESSION_PASSWORD must be at least 32 characters long"

    ---

    Test 3 - Password Valid (≥ 32 chars):

     1 # Generate password kuat (min 32 chars)
     2 SESSION_PASSWORD="this-is-a-very-secure-password-with-more-than-32-characters"

    Restart server:

     1 bun run dev

    Expected Result:
     - ✅ Server BERHASIL start
     - ✅ Tidak ada error
     - ✅ Bisa login ke admin panel

    ---

    C. Input Validation (Zod)

    Page: http://localhost:3000/admin/desa/berita/list-berita/create

    Test 1 - Judul Pendek (< 5 chars):

     1 Judul: "abc"  ❌
    Expected:
     - ✅ Error: "Judul minimal 5 karakter"

    ---

    Test 2 - Judul Terlalu Panjang (> 255 chars):

     1 Judul: "abc..." (300 chars) ❌
    Expected:
     - ✅ Error: "Judul maksimal 255 karakter"

    ---

    Test 3 - Deskripsi Pendek (< 10 chars):

     1 Judul: "Judul Valid" ✅
     2 Deskripsi: "abc" ❌
    Expected:
     - ✅ Error: "Deskripsi minimal 10 karakter"

    ---

    Test 4 - Konten Pendek (< 50 chars):

     1 Judul: "Judul Valid" ✅
     2 Deskripsi: "Deskripsi yang cukup panjang" ✅
     3 Konten: "abc" ❌
    Expected:
     - ✅ Error: "Konten minimal 50 karakter"

    ---

    Test 5 - YouTube URL Invalid:

     1 Link Video: "https://youtube.com" ❌
    Expected:
     - ✅ Error: "Format URL YouTube tidak valid"

    ---

    Test 6 - XSS Attempt:

     1 Konten: "<script>alert('XSS')</script>Content yang valid..." ❌
    Expected:
     - ✅ Script tag dihapus
     - ✅ Content tersimpan tanpa <script>
     - ✅ Data tersimpan dengan aman

    Verify di Database:

     1 SELECT content FROM berita ORDER BY "createdAt" DESC LIMIT 1;
     2 -- Harus tanpa <script> tag

    ---

    Test 7 - Data Valid (Semua Field Benar):

     1 Judul: "Berita Testing" ✅ (5-255 chars)
     2 Deskripsi: "Deskripsi lengkap berita" ✅ (10-500 chars)
     3 Konten: "Konten berita yang lengkap dan valid..." ✅ (>50 chars)
     4 Kategori: [Pilih kategori] ✅
     5 Featured Image: [Upload image] ✅
     6 Link Video: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" ✅

    Expected:
     - ✅ Berhasil simpan
     - ✅ Redirect ke list berita
     - ✅ Data tampil dengan benar

    ---

    3️⃣ ADDITIONAL PAGES TO TEST

    Music Player Integration


    ┌────────────┬─────────────────────────────┬───────────────────────────────┐
    │ Page       │ URL                         │ Test                          │
    ├────────────┼─────────────────────────────┼───────────────────────────────┤
    │ Musik Desa │ /darmasaba/musik/musik-desa │ Full player functionality     │
    │ Home       │ /darmasaba                  │ Fixed player bar (if enabled) │
    └────────────┴─────────────────────────────┴───────────────────────────────┘


    ---

    Admin Pages (State Management)


    ┌───────────────┬───────────────────────────────────────┬───────────────────────────┐
    │ Page          │ URL                                   │ Test                      │
    ├───────────────┼───────────────────────────────────────┼───────────────────────────┤
    │ Login         │ /admin/login                          │ Session state             │
    │ Dashboard     │ /admin/dashboard                      │ Navigation state          │
    │ Berita List   │ /admin/desa/berita/list-berita        │ Form state                │
    │ Create Berita │ /admin/desa/berita/list-berita/create │ Validation + sanitization │
    └───────────────┴───────────────────────────────────────┴───────────────────────────┘

    ---

    4️⃣ BROWSER CONSOLE TESTS

    Test State Management Directly

    Buka browser console dan test:

      1 // Test 1: Access public music state
      2 import { publicMusicState } from '@/state/public/publicMusicState';
      3 console.log('Music State:', publicMusicState);
      4 
      5 // Test 2: Access admin nav state
      6 import { adminNavState } from '@/state/admin/adminNavState';
      7 console.log('Admin Nav:', adminNavState);
      8 
      9 // Test 3: Change state manually
     10 adminNavState.mobileOpen = true;
     11 console.log('Mobile Open:', adminNavState.mobileOpen);
     12 
     13 // Test 4: Music state methods
     14 publicMusicState.togglePlayer();
     15 console.log('Player Open:', publicMusicState.isPlayerOpen);

    ---

    5️⃣ NETWORK TAB CHECKS

    OTP Login Flow

     1. Buka DevTools → Network tab
     2. Login page: /admin/login
     3. Submit nomor
     4. Cari request ke wa.wibudev.com

    Check:

      1 ✅ CORRECT:
      2 - Method: POST
      3 - URL: https://wa.wibudev.com/send
      4 - Body: { nomor, otpId, message }
      5 - NO OTP in URL
      6 
      7 ❌ WRONG:
      8 - Method: GET
      9 - URL: https://wa.wibudev.com/code?nom=...&text=...OTP...
     10 - OTP visible in URL

    ---

    6️⃣ DATABASE CHECKS

    Verify Sanitization

      1 -- Check berita content setelah input XSS attempt
      2 SELECT 
      3   id, 
      4   judul, 
      5   content, 
      6   "linkVideo",
      7   "createdAt"
      8 FROM "Berita"
      9 ORDER BY "createdAt" DESC
     10 LIMIT 5;
     11 
     12 -- Content TIDAK BOLEH mengandung:
     13 -- <script>, javascript:, onerror=, onclick=, dll

    ---

    ✅ TESTING CHECKLIST

      1 STATE MANAGEMENT:
      2 [ ] Music player works (play/pause/next/prev)
      3 [ ] Volume control works
      4 [ ] Shuffle/repeat works
      5 [ ] State persists after refresh
      6 [ ] Admin navigation works
      7 [ ] Sidebar toggle works
      8 [ ] Mobile menu works
      9 
     10 SECURITY - OTP:
     11 [ ] Login request uses POST (not GET)
     12 [ ] OTP NOT visible in Network tab URL
     13 [ ] OTP NOT in browser history
     14 [ ] WhatsApp receives OTP correctly
     15 [ ] Login flow completes successfully
     16 
     17 SECURITY - SESSION:
     18 [ ] Server fails without SESSION_PASSWORD
     19 [ ] Server fails with short password
     20 [ ] Server starts with valid password
     21 [ ] Can login to admin panel
     22 [ ] Session persists across pages
     23 
     24 SECURITY - VALIDATION:
     25 [ ] Short judul rejected
     26 [ ] Long judul rejected
     27 [ ] Short deskripsi rejected
     28 [ ] Short content rejected
     29 [ ] Invalid YouTube URL rejected
     30 [ ] XSS attempt sanitized
     31 [ ] Valid data accepted
     32 
     33 CLEANUP:
     34 [ ] No console errors
     35 [ ] No TypeScript errors
     36 [ ] All pages load correctly

    ---

    🐛 TROUBLESHOOTING

    Issue: "SESSION_PASSWORD environment variable is required"

    Fix:

     1 # Tambahkan ke .env.local
     2 SESSION_PASSWORD="your-secure-password-at-least-32-characters-long"

    ---

    Issue: WhatsApp OTP tidak terkirim

    Check:
     1. Network tab - apakah POST request berhasil?
     2. Check logs - apakah ada error dari WhatsApp API?
     3. Check nomor WhatsApp format (harus valid)

    ---

    Issue: Validasi error tidak muncul

    Check:
     1. Browser console - apakah ada Zod error?
     2. Network tab - check request body
     3. Check schema di src/lib/validations/index.ts

    ---

    Issue: Music player tidak berfungsi

    Check:
     1. Browser console - ada error?
     2. Check publicMusicState di console
     3. Reload page - state ter-initialize?

    ---

    Selamat testing! Jika ada issue, check console logs dan network tab untuk debugging. 🎉


