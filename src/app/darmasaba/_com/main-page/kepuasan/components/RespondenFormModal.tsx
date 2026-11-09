import indeksKepuasanState from "@/app/admin/(dashboard)/_state/landing-page/indeks-kepuasan";
import colors from "@/con/colors";
import { Button, Modal, Select, Stack, TextInput } from "@mantine/core";
import { useEffect, useState } from "react";
import { useProxy } from "valtio/utils";
import { missingFormFields, submitResponden, toSelectOptions, type RequiredFormField } from "../kepuasan.logic";
import { KEPUASAN_TEXT } from "../kepuasan.text";

const T = KEPUASAN_TEXT.form;

type Props = { opened: boolean; onClose: () => void };

/**
 * Form "Ajukan Responden". Kontrak: mengisi `indeksKepuasanState.responden.create.form`
 * { name, tanggal, jenisKelaminId, ratingId, kelompokUmurId } lalu memanggil `create.create()`.
 * `tanggal` tidak diisi pengunjung: diisi otomatis tanggal hari ini (jam lokal, "YYYY-MM-DD") saat submit.
 * Form direset + modal ditutup hanya bila `create()` mengembalikan true; bila gagal isian dipertahankan.
 */
export function RespondenFormModal({ opened, onClose }: Props) {
  const state = useProxy(indeksKepuasanState.responden);
  // Snapshot 3 cabang opsi agar Select re-render saat findMany.load() async selesai.
  const snapJK = useProxy(indeksKepuasanState.jenisKelaminResponden);
  const snapRating = useProxy(indeksKepuasanState.pilihanRatingResponden);
  const snapUmur = useProxy(indeksKepuasanState.kelompokUmurResponden);
  const form = state.create.form;
  // Pesan per field baru tampil setelah percobaan submit pertama, lalu mengikuti isian secara langsung.
  const [showErrors, setShowErrors] = useState(false);
  const missing = new Set(showErrors ? missingFormFields(form) : []);
  const fieldError = (key: RequiredFormField) => (missing.has(key) ? T.required[key] : undefined);

  useEffect(() => {
    // load() menangani error sendiri (data → [] + console.error), jadi tidak perlu catch di sini.
    void indeksKepuasanState.jenisKelaminResponden.findMany.load();
    void indeksKepuasanState.pilihanRatingResponden.findMany.load();
    void indeksKepuasanState.kelompokUmurResponden.findMany.load();
  }, []);

  const resetForm = () => {
    state.create.form = { ...state.create.form, name: "", tanggal: "", jenisKelaminId: "", ratingId: "", kelompokUmurId: "" };
  };

  const handleClose = () => {
    setShowErrors(false);
    onClose();
  };

  const handleSubmit = async () => {
    setShowErrors(true);
    // create() memvalidasi (zod) + menampilkan toast sendiri; false = validasi/API gagal.
    await submitResponden({
      now: new Date(),
      setTanggal: (tanggal) => {
        state.create.form.tanggal = tanggal;
      },
      create: () => state.create.create(),
      onSuccess: () => {
        resetForm();
        handleClose();
      },
    });
  };

  return (
    <Modal opened={opened} onClose={handleClose} title={T.title} centered>
      <Stack>
        <TextInput
          label={T.name}
          type="text"
          placeholder={T.namePlaceholder}
          withAsterisk
          error={fieldError("name")}
          value={form.name}
          onChange={(e) => {
            state.create.form.name = e.currentTarget.value;
          }}
        />
        <Select
          label={T.jenisKelamin}
          placeholder={snapJK.findMany.loading ? T.optionsLoading : T.jenisKelaminPlaceholder}
          value={form.jenisKelaminId || ""}
          onChange={(val) => {
            state.create.form.jenisKelaminId = val ?? "";
          }}
          data={toSelectOptions(snapJK.findMany.data, T.unnamedOption)}
          disabled={snapJK.findMany.loading}
          withAsterisk
          error={fieldError("jenisKelaminId")}
        />
        <Select
          label={T.rating}
          placeholder={snapRating.findMany.loading ? T.optionsLoading : T.ratingPlaceholder}
          value={form.ratingId || ""}
          onChange={(val) => {
            state.create.form.ratingId = val ?? "";
          }}
          data={toSelectOptions(snapRating.findMany.data, T.unnamedOption)}
          disabled={snapRating.findMany.loading}
          withAsterisk
          error={fieldError("ratingId")}
        />
        <Select
          label={T.kelompokUmur}
          placeholder={snapUmur.findMany.loading ? T.optionsLoading : T.kelompokUmurPlaceholder}
          value={form.kelompokUmurId || ""}
          onChange={(val) => {
            state.create.form.kelompokUmurId = val ?? "";
          }}
          data={toSelectOptions(snapUmur.findMany.data, T.unnamedOption)}
          disabled={snapUmur.findMany.loading}
          withAsterisk
          error={fieldError("kelompokUmurId")}
        />
        <Button mt="xs" radius="xl" color={colors["blue-button"]} onClick={handleSubmit} loading={state.create.loading}>
          {T.submit}
        </Button>
      </Stack>
    </Modal>
  );
}
