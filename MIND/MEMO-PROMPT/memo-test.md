Ini penjelasannya:

  ---
  Masalah: dynamic = 'force-dynamic' di Root Layout

  Apa artinya?

  export const dynamic = 'force-dynamic' adalah Next.js route segment config yang memberitahu Next.js: "render ulang halaman ini dari awal di setiap request."

  Ketika diletakkan di root layout (src/app/layout.tsx), efeknya menular ke SEMUA halaman di seluruh aplikasi — karena semua halaman mewarisi root layout.

  Dampak konkret
  
  ┌─────────────────────────────────────┬────────────────────────────────────────────────────────────────────────┐
  │               Kondisi               │                            Apa yang terjadi                            │
  ├─────────────────────────────────────┼────────────────────────────────────────────────────────────────────────┤
  │ Tanpa force-dynamic                 │ Next.js bisa SSG (render saat build) atau ISR (cache + regenerate)     │
  ├─────────────────────────────────────┼────────────────────────────────────────────────────────────────────────┤
  │ Dengan force-dynamic di root layout │ Semua halaman render ulang di setiap request, persis seperti SSR murni │
  └─────────────────────────────────────┴────────────────────────────────────────────────────────────────────────┘

  Untuk halaman statis seperti profil desa, berita, atau landing page — halaman yang datanya jarang berubah — ini membuang performance karena server harus render ulang terus meski kontennya sama.

  Kenapa bisa ada di sini?
  
  Komentar di baris 17 menjelaskan: "menghindari error prerendering". Ini adalah solusi cepat — seseorang menemukan error saat build (biasanya karena ada cookies(), headers(), atau useSession() di suatu
  halaman) dan menambahkan force-dynamic di root layout agar semua halaman skip prerendering dan error hilang.

  Masalahnya: ini seperti mematikan lampu seluruh rumah karena satu bohlam bermasalah.

  Solusi yang benar
  
  Cari halaman mana yang benar-benar butuh force-dynamic (biasanya halaman yang membaca cookies/session secara langsung), lalu:

  1. Pindahkan export const dynamic = 'force-dynamic' ke file halaman spesifik tersebut (misal src/app/admin/layout.tsx atau halaman tertentu).
  2. Hapus dari root layout.

  Halaman publik statis seperti profil desa bisa di-cache dan di-prerender dengan normal, sehingga response lebih cepat dan beban server berkurang.