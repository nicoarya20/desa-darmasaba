# Perbandingan Model OpenAI untuk Jenna

Diperbarui: 2026-11-16

Panduan memilih model untuk slot **OpenAI-compatible** (`chat_openai`) dan slot **Suara** di `/dev/jenna`. Harga dalam USD, tier Standard, dan dapat berubah sewaktu-waktu. Cek ulang di halaman resmi (lihat Sumber) sebelum memutuskan.

## Syarat dari sisi Jenna

- Jenna memanggil **Chat Completions** (`POST {baseUrl}/chat/completions`) dan **selalu mengirim tools**. Model yang hanya mendukung tools lewat Responses API tidak bisa dipakai.
- Satu pertanyaan warga bisa memakai beberapa putaran model ⇄ tool (maks. 6, `LOOP_LIMITS.maxIterations` di `src/lib/jenna/chat/executor-loop.ts`).
- Batas output default 1.024 token (`DEFAULT_MAX_TOKENS` di `src/lib/jenna/provider/common.ts`) bila Max tokens kosong.
- Mode **Otomatis** (`autoReasoningEffort` di `src/lib/jenna/reasoning.ts`):
  - `gpt-6*` ke atas dan `gpt-5.<digit>*` → kirim `reasoning_effort: "none"`.
  - `gpt-5` / `gpt-5-*` dan seri `o<digit>` → kirim `"low"`.
  - Lainnya → tidak dikirim (pakai `max_tokens` + temperature).
  - Bila reasoning effort dikirim, Jenna memakai `max_completion_tokens` dan **tidak** mengirim temperature.

## Model chat (slot OpenAI-compatible)

Harga per 1 juta token. Harga GPT-6 / GPT-5.6 di bawah berlaku untuk konteks ≤ 272K token (Jenna selalu jauh di bawahnya).

| Model | Input | Cached input | Output | Context / max output | Tools di Chat Completions | `reasoning_effort` yang diterima | Status |
|---|---|---|---|---|---|---|---|
| `gpt-6-luna` | $0.10 | $0.01 | $0.50 | 1.050.000 / 128.000 | Ya, **hanya** dengan `none` | none, low, medium (default), high, xhigh, max | Aktif |
| `gpt-5.6-luna` | $0.20 | $0.02 | $1.20 | 1.050.000 / 128.000 | Ya | none, low, medium (default), high, xhigh, max | Aktif |
| `gpt-5.4-nano` | $0.20 | $0.02 | $1.25 | 400.000 / 128.000 | Ya | none (default), low, medium, high, xhigh | Deprecated, dimatikan **1 Apr 2027** → `gpt-6-luna` |
| `gpt-5.4-mini` | $0.75 | $0.075 | $4.50 | 400.000 / 128.000 | Ya | none (default), low, medium, high, xhigh | Aktif |
| `gpt-4o-mini` | $0.15 | $0.075 | $0.60 | 128.000 / 16.384 | Ya | — (bukan model reasoning) | Deprecated, dimatikan **14 Jan 2027** → `gpt-6-luna` |
| `gpt-4.1-mini` | $0.40 | $0.10 | $1.60 | belum dipastikan | Ya | — | Deprecated, dimatikan **14 Jan 2027** → `gpt-6-luna` |
| `gpt-5-nano` | $0.05 | $0.005 | $0.40 | 400.000 / 128.000 | Ya | belum dipastikan | Deprecated, dimatikan **11 Des 2026** → `gpt-6-luna` |
| `gpt-5-mini` | $0.25 | $0.025 | $2.00 | belum dipastikan | Ya | belum dipastikan | Deprecated, dimatikan **11 Des 2026** → `gpt-6.1-terra` |

**Tidak cocok untuk Jenna** (tools di Chat Completions tidak didukung, wajib Responses API):

| Model | Input | Output | Catatan |
|---|---|---|---|
| `gpt-6.1-terra` | $1.00 | $5.00 | Tools butuh Responses API |
| `gpt-6.1-sol` | $2.00 | $10.00 | Tools butuh Responses API; tidak menerima `none` |
| `gpt-6-astra` | $10.00 | $50.00 | Tools butuh Responses API; `none` → HTTP 400 |

**Temperature.** Menurut panduan GPT-6, temperature/top_p hanya boleh dikirim saat reasoning effort `none`. Untuk `gpt-5.6-luna`, `gpt-5.4-nano`, `gpt-5.4-mini`, `gpt-5-nano`, dan `gpt-5-mini` belum dipastikan. Ini tidak masalah karena Jenna memang tidak mengirim temperature bila reasoning effort dikirim. `gpt-4o-mini` dan `gpt-4.1-mini` menerima temperature.

## Setelan di Jenna

| Model | Hasil Otomatis | Perlu override manual? |
|---|---|---|
| `gpt-6-luna` | `none` | Tidak. `none` memang wajib agar tools jalan. |
| `gpt-5.6-luna` | `none` | Tidak |
| `gpt-5.4-nano` | `none` | Tidak |
| `gpt-5.4-mini` | `none` | Tidak |
| `gpt-4o-mini` | tidak dikirim (`max_tokens` + temperature) | Tidak |
| `gpt-4.1-mini` | tidak dikirim | Tidak |
| `gpt-5-nano` / `gpt-5-mini` | `low` | Mungkin. Nilai yang diterima belum dipastikan; bila tes gagal, coba manual. Model ini mati 11 Des 2026, jadi lebih baik tidak dipakai. |
| `gpt-6.1-terra` / `gpt-6.1-sol` / `gpt-6-astra` | `none` | Tidak bisa dipakai (lihat tabel di atas). Untuk `gpt-6.1-sol` dan `gpt-6-astra`, hasil Otomatis `none` juga akan ditolak. |

Setelah ganti model, klik **Simpan & tes**. Tes koneksi memakai setelan yang sama dengan chat, jadi salah parameter langsung ketahuan.

## Estimasi biaya per 1.000 pertanyaan

Asumsi per pertanyaan, dua putaran (satu tool call + jawaban):

- **Putaran 1:** sekitar 3.000 token input, yaitu system prompt (`src/lib/jenna/prompt.ts` sekitar 6 KB, kira-kira 1.500 token), definisi tools, dan riwayat singkat. Output sekitar 100 token (panggilan tool).
- **Putaran 2:** sekitar 4.500 token input (putaran 1 ditambah hasil tool sekitar 1.500 token). Output sekitar 300 token (jawaban).
- **Total per pertanyaan:** sekitar 7.500 token input dan 400 token output, tanpa diskon cache dan tanpa token reasoning.

Totalnya: **7,5 juta token input + 0,4 juta token output per 1.000 pertanyaan.**

| Model | Biaya / 1.000 pertanyaan | Catatan |
|---|---|---|
| `gpt-5-nano` | ≈ $0,54 | + token reasoning (`low`); mati 11 Des 2026 |
| `gpt-6-luna` | ≈ $0,95 | `none`, tanpa token reasoning |
| `gpt-4o-mini` | ≈ $1,37 | mati 14 Jan 2027 |
| `gpt-5.6-luna` | ≈ $1,98 | |
| `gpt-5.4-nano` | ≈ $2,00 | mati 1 Apr 2027 |
| `gpt-5-mini` | ≈ $2,68 | + token reasoning; mati 11 Des 2026 |
| `gpt-4.1-mini` | ≈ $3,64 | mati 14 Jan 2027 |
| `gpt-5.4-mini` | ≈ $7,43 | |

Angka nyata bisa lebih rendah karena prompt caching: awalan system prompt yang sama ditagih dengan harga cached. Angka juga bisa lebih tinggi bila satu pertanyaan memakai lebih dari satu tool. Untuk angka sebenarnya, lihat `/dev/jenna/penggunaan` (total token 24 jam / 7 hari) dan kalikan dengan harga di atas.

## Model suara (slot Suara)

Relay suara Jenna memanggil gateway **GPT-Live** (`POST {baseUrl}/live/sessions`, lihat `src/lib/jenna/voice/voice.relay.ts`), bukan Realtime API (`/v1/realtime`). Karena itu model yang cocok adalah `gpt-live-1`.

| Model | Endpoint | Harga | Catatan |
|---|---|---|---|
| `gpt-live-1` | `v1/live/sessions` | **$0,05 / menit**, ditagih per detik | Full-duplex. Tool dan reasoning didelegasikan ke backend (ditagih terpisah dengan harga model backend). 1.000 menit ≈ $50 + biaya backend. |
| `gpt-realtime-2.1` | `v1/realtime` (tidak kompatibel dengan relay Jenna) | Audio in $32 / out $64 per 1 jt token | ≈ $0,10 / menit audio (600 token/menit masuk, 1.200 token/menit keluar), belum termasuk riwayat yang ditagih ulang tiap giliran |
| `gpt-realtime-2.1-mini` | `v1/realtime` (tidak kompatibel) | Audio in $10 / out $20 per 1 jt token | ≈ $0,03 / menit audio, dengan catatan yang sama |
| `gpt-realtime`, `gpt-realtime-mini` | `v1/realtime` | — | Deprecated, dimatikan 20 Jan 2027 → `gpt-realtime-2.1` / `-2.1-mini` |

Perkiraan per menit untuk model realtime dihitung dari laju token audio resmi (1 token per 100 ms masukan, 1 token per 50 ms keluaran) dengan asumsi bicara penuh satu menit di tiap arah. Ini batas atas kasar, bukan harga resmi.

## Rekomendasi

| Peran | Model | Alasan |
|---|---|---|
| **Default Jenna** | `gpt-6-luna` | Termurah di antara model yang masih aktif dan mendukung tools di Chat Completions. Pengganti resmi `gpt-4o-mini`. Otomatis sudah mengirim `none`. |
| **Alternatif lebih pintar** | `gpt-5.4-mini` | Model "mini" terkuat yang masih mendukung tools di Chat Completions, sekitar 8× biaya `gpt-6-luna`. Model GPT-6.1 yang lebih kuat butuh Responses API. |
| **Cadangan setara** | `gpt-5.6-luna` | Bila `gpt-6-luna` bermasalah. Sekitar 2× biaya. |
| **Hindari** | `gpt-5-nano`, `gpt-5-mini` (mati 11 Des 2026), `gpt-4o-mini`, `gpt-4.1-mini` (mati 14 Jan 2027), `gpt-5.4-nano` (mati 1 Apr 2027), serta `gpt-6.1-*` dan `gpt-6-astra` (tools tidak jalan di Chat Completions) | |
| **Suara** | `gpt-live-1` | Satu-satunya model untuk endpoint `live/sessions` yang dipakai relay Jenna |

## Belum dipastikan

- Nilai `reasoning_effort` yang diterima `gpt-5-nano` dan `gpt-5-mini`, termasuk apakah mereka menerima `low`.
- Context window `gpt-4.1-mini` dan `gpt-5-mini` (halamannya tidak dibuka).
- Dukungan temperature pada model GPT-5.x.
- Daftar nama suara (voice) untuk `gpt-live-1`.
- Estimasi token per pertanyaan di atas masih asumsi, belum diukur dari data penggunaan nyata.

## Sumber

Semua diakses 2026-11-16:

- Harga: https://developers.openai.com/api/docs/pricing (dialihkan dari https://platform.openai.com/docs/pricing)
- Deprecations: https://developers.openai.com/api/docs/deprecations
- Halaman model:
  - https://developers.openai.com/api/docs/models/gpt-6-luna
  - https://developers.openai.com/api/docs/models/gpt-5.6-luna
  - https://developers.openai.com/api/docs/models/gpt-5.4-nano
  - https://developers.openai.com/api/docs/models/gpt-5.4-mini
  - https://developers.openai.com/api/docs/models/gpt-4o-mini
  - https://developers.openai.com/api/docs/models/gpt-5-nano
  - https://developers.openai.com/api/docs/models/gpt-6.1-terra
  - https://developers.openai.com/api/docs/models/gpt-realtime-2.1
  - https://developers.openai.com/api/docs/models/gpt-realtime-2.1-mini
  - https://developers.openai.com/api/docs/models/gpt-live-1
- Panduan GPT-6 (temperature, tools di Chat Completions): https://developers.openai.com/api/docs/guides/latest-model
- Panduan reasoning: https://developers.openai.com/api/docs/guides/reasoning
- Biaya realtime (laju token audio, tagihan GPT-Live): https://developers.openai.com/api/docs/guides/realtime-costs
