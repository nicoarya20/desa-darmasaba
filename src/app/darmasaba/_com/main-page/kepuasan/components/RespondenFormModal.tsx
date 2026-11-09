import indeksKepuasanState from "@/app/admin/(dashboard)/_state/landing-page/indeks-kepuasan";
import colors from "@/con/colors";
import { Button, Modal, Select, Stack, TextInput } from "@mantine/core";
import { useEffect } from "react";
import { useProxy } from "valtio/utils";
import { toSelectOptions } from "../kepuasan.logic";
import { KEPUASAN_TEXT } from "../kepuasan.text";

const T = KEPUASAN_TEXT.form;

type Props = { opened: boolean; onClose: () => void };

/**
 * Form "Ajukan Responden". Kontrak: mengisi `indeksKepuasanState.responden.create.form`
 * { name, tanggal, jenisKelaminId, ratingId, kelompokUmurId } lalu memanggil `create.create()`.
 */
export function RespondenFormModal({ opened, onClose }: Props) {
  const state = useProxy(indeksKepuasanState.responden);
  // Snapshot 3 cabang opsi agar Select re-render saat findMany.load() async selesai.
  const snapJK = useProxy(indeksKepuasanState.jenisKelaminResponden);
  const snapRating = useProxy(indeksKepuasanState.pilihanRatingResponden);
  const snapUmur = useProxy(indeksKepuasanState.kelompokUmurResponden);
  const form = state.create.form;

  useEffect(() => {
    // load() menangani error sendiri (data → [] + console.error), jadi tidak perlu catch di sini.
    void indeksKepuasanState.jenisKelaminResponden.findMany.load();
    void indeksKepuasanState.pilihanRatingResponden.findMany.load();
    void indeksKepuasanState.kelompokUmurResponden.findMany.load();
  }, []);

  const resetForm = () => {
    state.create.form = { ...state.create.form, name: "", tanggal: "", jenisKelaminId: "", ratingId: "", kelompokUmurId: "" };
  };

  const handleSubmit = async () => {
    // create() memvalidasi + menangani error sendiri (toast) dan tidak mengembalikan status,
    // sehingga form direset & modal ditutup juga saat validasi gagal. Perilaku lama ini sengaja
    // dipertahankan: perbaikannya butuh create() mengembalikan status (state store, di luar scope).
    await state.create.create();
    resetForm();
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title={T.title} centered>
      <Stack>
        <TextInput
          label={T.name}
          type="text"
          placeholder={T.namePlaceholder}
          value={form.name}
          onChange={(e) => {
            state.create.form.name = e.currentTarget.value;
          }}
        />
        <TextInput
          label={T.tanggal}
          type="date"
          placeholder={T.tanggalPlaceholder}
          value={form.tanggal}
          onChange={(e) => {
            state.create.form.tanggal = e.currentTarget.value;
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
        />
        <Button mt="xs" radius="xl" color={colors["blue-button"]} onClick={handleSubmit}>
          {T.submit}
        </Button>
      </Stack>
    </Modal>
  );
}
