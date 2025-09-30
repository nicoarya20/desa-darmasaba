/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import colors from "@/con/colors";
import {
  Box,
  Button,
  Card,
  Group,
  Modal,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { IconArrowBack } from "@tabler/icons-react";
import { useParams, useRouter } from "next/navigation";
import { useProxy } from "valtio/utils";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import polsekTerdekat from "@/app/admin/(dashboard)/_state/keamanan/polsek-terdekat";

function EditPolsekTerdekat() {
  const polsekState = useProxy(polsekTerdekat);
  const params = useParams();
  const router = useRouter();

  const [layananOptions, setLayananOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalUpdateOpen, setModalUpdateOpen] = useState(false);
  const [namaLayananBaru, setNamaLayananBaru] = useState("");
  const [selectedLayananId, setSelectedLayananId] = useState<string | null>(
    null
  );
  const [namaLayananUpdate, setNamaLayananUpdate] = useState("");
  const [formData, setFormData] = useState({
    nama: "",
    jarakKeDesa: "",
    alamat: "",
    nomorTelepon: "",
    jamOperasional: "",
    embedMapUrl: "",
    namaTempatMaps: "",
    alamatMaps: "",
    linkPetunjukArah: "",
    layananPolsekId: "",
  });

    // load data untuk form edit
    useEffect(() => {
      const loadPolsekTerdekat = async () => {
        const id = params?.id as string;
        if (!id) return;
  
        try {
          const data = await polsekState.edit.load(id);
          if (data) {
            setFormData({
              nama: data.nama || "",
              jarakKeDesa: data.jarakKeDesa || "",
              alamat: data.alamat || "",
              nomorTelepon: data.nomorTelepon || "",
              jamOperasional: data.jamOperasional || "",
              embedMapUrl: data.embedMapUrl || "",
              namaTempatMaps: data.namaTempatMaps || "",
              alamatMaps: data.alamatMaps || "",
              linkPetunjukArah: data.linkPetunjukArah || "",
              layananPolsekId: data.layananPolsekId || "",
            });
          }
        } catch (error) {
          console.error("Error loading polsek terdekat:", error);
          toast.error("Gagal memuat data polsek terdekat");
        }
      };
  
      loadPolsekTerdekat();
    }, [params?.id]);

  const fetchLayanan = async () => {
    try {
      const res = await fetch("/api/keamanan/layanan-polsek/find-many");
      const data = await res.json();

      if (data.success) {
        const options = data.data.map((item: any) => ({
          value: item.id,
          label: item.nama,
        }));
        setLayananOptions(options);
      }
    } catch {
      toast.error("Gagal memuat layanan polsek");
    }
  };

  const handleTambahLayanan = async () => {
    if (!namaLayananBaru.trim())
      return toast.warn("Nama layanan tidak boleh kosong");

    try {
      const res = await fetch("/api/keamanan/layanan-polsek/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama: namaLayananBaru }),
      });
      const data = await res.json();

      if (data.success) {
        const newLayanan = {
          value: data.data.id,
          label: data.data.nama,
        };
        setLayananOptions((prev) => [...prev, newLayanan]);
        await fetchLayanan();
        polsekState.create.form.layananPolsekId = data.data.id;
        toast.success("Layanan baru ditambahkan!");
        setModalOpen(false);
        setNamaLayananBaru("");
      } else {
        toast.error(data.message || "Gagal menambah layanan");
      }
    } catch {
      toast.error("Error menambah layanan");
    }
  };

  const handleUpdateLayanan = async (id: string, namaBaru: string) => {
    if (!namaBaru.trim())
      return toast.warn("Nama layanan tidak boleh kosong");

    try {
      const res = await fetch(`/api/keamanan/layanan-polsek/update/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama: namaBaru }),
      });
      const data = await res.json();

      if (data.success) {
        await fetchLayanan();
        toast.success("Layanan berhasil diupdate!");
        setModalUpdateOpen(false);
        setNamaLayananUpdate("");
      } else {
        toast.error(data.message || "Gagal mengupdate layanan");
      }
    } catch {
      toast.error("Error mengupdate layanan");
    }
  };

  const handleDeleteLayanan = async (id: string) => {
    const confirmDelete = confirm("Yakin ingin menghapus layanan ini?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/keamanan/layanan-polsek/del/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        await fetchLayanan();
        setLayananOptions((prev) =>
          prev.filter((layanan) => layanan.value !== id)
        );
        toast.success("Layanan berhasil dihapus!");
      } else {
        toast.error(data.message || "Gagal menghapus layanan");
      }
    } catch {
      toast.error("Error menghapus layanan");
    }
  };

  useEffect(() => {
    fetchLayanan();
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      polsekState.edit.form = { ...formData }; // update global state hanya di sini
      await polsekState.edit.update();
      toast.success("Polsek terdekat berhasil diperbarui!");
      router.push("/admin/keamanan/polsek-terdekat");
    } catch (error) {
      console.error("Error updating polsek terdekat:", error);
      toast.error("Gagal memperbarui data polsek terdekat");
    }
  };

  return (
    <Box px={{ base: "sm", md: "lg" }} py="md">
      {/* Modal Tambah */}
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Tambah Layanan Polsek"
        centered
      >
        <Stack>
          <TextInput
            label="Nama Layanan"
            placeholder="Masukkan nama layanan"
            defaultValue={namaLayananBaru}
            onChange={(e) => setNamaLayananBaru(e.currentTarget.value)}
          />
          <Button onClick={handleTambahLayanan}>Simpan</Button>
        </Stack>
      </Modal>

      {/* Modal Update */}
      <Modal
        opened={modalUpdateOpen}
        onClose={() => setModalUpdateOpen(false)}
        title="Update Layanan Polsek"
        centered
      >
        <Stack>
          <TextInput
            label="Nama Layanan"
            placeholder="Masukkan nama layanan"
            defaultValue={namaLayananUpdate}
            onChange={(e) => setNamaLayananUpdate(e.currentTarget.value)}
          />
          <Button
            onClick={() => {
              if (!selectedLayananId)
                return toast.warn("ID layanan tidak ditemukan");
              handleUpdateLayanan(selectedLayananId, namaLayananUpdate);
            }}
          >
            Simpan
          </Button>
        </Stack>
      </Modal>

      {/* Header */}
      <Group mb="md">
        <Tooltip label="Kembali ke halaman sebelumnya" withArrow>
          <Button
            variant="subtle"
            onClick={() => router.back()}
            p="xs"
            radius="md"
          >
            <IconArrowBack color={colors["blue-button"]} size={24} />
          </Button>
        </Tooltip>
        <Title order={4} ml="sm" c="dark">
          Edit Polsek Terdekat
        </Title>
      </Group>

      {/* Form utama */}
      <Paper
        w={{ base: "100%", md: "50%" }}
        bg={colors["white-1"]}
        p="lg"
        radius="md"
        shadow="sm"
        style={{ border: "1px solid #e0e0e0" }}
      >
        <Stack gap="md">
          {/* Input fields */}
          <TextInput
            value={formData.nama}
            onChange={(e) => handleChange("nama", e.currentTarget.value)}
            label="Nama Polsek Terdekat"
            placeholder="Masukkan nama Polsek Terdekat"
            required
          />
          <TextInput
            value={formData.jarakKeDesa}
            onChange={(e) => handleChange("jarakKeDesa", e.currentTarget.value)}
            label="Jarak Polsek Terdekat"
          />
          <TextInput
            value={formData.alamat}
            onChange={(e) => handleChange("alamat", e.currentTarget.value)}
            label="Alamat Polsek Terdekat"
          />
          <TextInput
            value={formData.nomorTelepon}
            onChange={(e) => handleChange("nomorTelepon", e.currentTarget.value)}
            label="Nomor Telepon"
          />
          <TextInput
            value={formData.jamOperasional}
            onChange={(e) => handleChange("jamOperasional", e.currentTarget.value)}
            label="Jam Operasional"
          />
          <TextInput
            value={formData.embedMapUrl}
            onChange={(e) => handleChange("embedMapUrl", e.currentTarget.value)}
            label="Embed Map URL"
          />
          <TextInput
            value={formData.namaTempatMaps}
            onChange={(e) => handleChange("namaTempatMaps", e.currentTarget.value)}
            label="Nama Tempat Maps"
          />
          <TextInput
            value={formData.alamatMaps}
            onChange={(e) => handleChange("alamatMaps", e.currentTarget.value)}
            label="Alamat Maps"
          />
          <TextInput
            value={formData.linkPetunjukArah}
            onChange={(e) => handleChange("linkPetunjukArah", e.currentTarget.value)}
            label="Link Petunjuk Arah"
          />

          <Select
            label="Layanan Polsek"
            placeholder="Pilih layanan polsek"
            data={layananOptions}
            value={formData.layananPolsekId}
            onChange={(val) => handleChange("layananPolsekId", val || "")}
          />
          <Button
            variant="light"
            size="xs"
            onClick={() => setModalOpen(true)}
          >
            + Tambah Layanan Baru
          </Button>

          {/* List layanan */}
          <Text fw="bold" fz="sm">
            Daftar Layanan Polsek
          </Text>
          {layananOptions.map((item) => (
            <Card
              key={item.value}
              style={{ border: "1px solid #ccc" }}
              bg={colors["white-1"]}
              p="md"
              radius="md"
              shadow="sm"
            >
              <Group justify="space-between">
                <Text>{item.label}</Text>
                <Group>
                  <Button
                    variant="light"
                    size="xs"
                    onClick={() => {
                      setSelectedLayananId(item.value);
                      setNamaLayananUpdate(item.label);
                      setModalUpdateOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    color="red"
                    size="xs"
                    onClick={() => handleDeleteLayanan(item.value)}
                  >
                    Hapus
                  </Button>
                </Group>
              </Group>
            </Card>
          ))}

          {/* Submit */}
          <Group justify="right">
            <Button
              onClick={handleSubmit}
              radius="md"
              size="md"
              style={{
                background: `linear-gradient(135deg, ${colors["blue-button"]}, #4facfe)`,
                color: "#fff",
                boxShadow: "0 4px 15px rgba(79, 172, 254, 0.4)",
              }}
            >
              Simpan
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditPolsekTerdekat;
