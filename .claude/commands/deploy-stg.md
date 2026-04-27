# deploy-stg

Deploy ke staging environment secara penuh: version bump, cek migrasi, commit, push, trigger GitHub workflow (publish + re-pull), dan verifikasi versi.

**Repo GitHub:** `bipproductbali/desa-darmasaba`  
**Branch stg:** `stg`  
**STG URL:** `https://desa-darmasaba-stg.wibudev.com`

---

## Alur Eksekusi

### Langkah 0 — Cek /api/version
Sebelum apapun, pastikan endpoint `/api/version` sudah ada:
```bash
grep -n '"/version"' src/app/api/\[\[...slugs\]\]/route.ts
```
Jika belum ada, tambahkan langsung ke main API group (referensi dari package.json via `fs.readFile`).

---

### Langkah 1 — Version Bump

Baca versi saat ini dari `package.json`, bump patch version (+1), lalu tulis ulang:
```bash
# Baca versi saat ini
node -e "const p=require('./package.json'); const [maj,min,pat]=p.version.split('.').map(Number); console.log(maj+'.'+min+'.'+(pat+1))"
```
Update `package.json` dengan versi baru. Simpan versi baru sebagai `$NEW_VERSION`.

---

### Langkah 2 — Cek Prisma Migration

```bash
bunx prisma migrate status
```

- Jika output mengandung kata `pending` atau `drift` → buat migrasi baru:
  ```bash
  bunx prisma migrate dev --name bump-stg-<new_version>
  ```
- Jika sudah up-to-date → lanjut ke langkah berikutnya.

---

### Langkah 3 — Build Check

```bash
bun run build
```

Jika build gagal, **stop** dan perbaiki error dulu sebelum melanjutkan deploy.

---

### Langkah 4 — Commit

Stage semua perubahan dan commit:
```bash
git add package.json
git add prisma/migrations/ # jika ada migrasi baru
git commit -m "chore: bump version to $NEW_VERSION for stg deploy"
```

---

### Langkah 5 — Push ke origin/stg

```bash
git push origin HEAD:stg
```

Tunggu push selesai sebelum trigger workflow.

---

### Langkah 6 — Trigger publish.yml

**Input 1:** `stack_env` = `stg`  
**Input 2:** `tag` = versi dari package.json (contoh: `0.1.25`)

```bash
gh workflow run publish.yml \
  --repo bipprojectbali/desa-darmasaba \
  --ref stg \
  -f stack_env=stg \
  -f tag=$NEW_VERSION
```

Tunggu 5 detik lalu dapatkan run ID:
```bash
sleep 5
RUN_ID=$(gh run list \
  --workflow=publish.yml \
  --repo bipprojectbali/desa-darmasaba \
  --limit 1 \
  --json databaseId \
  -q '.[0].databaseId')
```

Monitor sampai selesai:
```bash
gh run watch $RUN_ID --repo bipprojectbali/desa-darmasaba
```

Jika publish **gagal** → **stop**, jangan lanjut ke re-pull.

---

### Langkah 7 — Trigger re-pull.yml

Setelah publish berhasil, trigger re-pull:

**Input 1:** `stack_env` = `stg`  
**Input 2:** `stack_name` = `desa-darmasaba` → stack yang di-deploy: `desa-darmasaba-stg`

```bash
gh workflow run re-pull.yml \
  --repo bipprojectbali/desa-darmasaba \
  --ref main \
  -f stack_name=desa-darmasaba \
  -f stack_env=stg
```

Tunggu 5 detik lalu monitor:
```bash
sleep 5
REPULL_ID=$(gh run list \
  --workflow=re-pull.yml \
  --repo bipprojectbali/desa-darmasaba \
  --limit 1 \
  --json databaseId \
  -q '.[0].databaseId')
gh run watch $REPULL_ID --repo bipprojectbali/desa-darmasaba
```

---

### Langkah 8 — Verifikasi Versi

Bandingkan versi di stg dengan versi lokal:

```bash
# Versi lokal
LOCAL_VER=$(node -e "console.log(require('./package.json').version)")

# Versi di STG (tunggu container siap ~30 detik)
sleep 30
STG_VER=$(curl -s https://desa-darmasaba-stg.wibudev.com/api/version | node -e "process.stdin.resume();let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d).version))")

echo "Local  : $LOCAL_VER"
echo "STG    : $STG_VER"
```

- Jika `LOCAL_VER == STG_VER` → **Deploy berhasil!**
- Jika berbeda → cek logs container di Portainer atau jalankan `gh run view $REPULL_ID --repo bipprojectbali/desa-darmasaba --log`

---

## Ringkasan Workflow Inputs

| Workflow | Input | Value |
|----------|-------|-------|
| `publish.yml` | `stack_env` | `stg` |
| `publish.yml` | `tag` | versi dari `package.json` (e.g. `0.1.25`) |
| `re-pull.yml` | `stack_name` | `desa-darmasaba` |
| `re-pull.yml` | `stack_env` | `stg` |

## Catatan

- Jangan jalankan `re-pull.yml` jika `publish.yml` belum selesai/berhasil.
- Verifikasi versi dilakukan via `/api/version` (bukan `/api/utils/version`).
- Jika `gh` belum login: `gh auth login`.
- Untuk cek status workflow manual: `gh run list --repo bipprojectbali/desa-darmasaba`.
