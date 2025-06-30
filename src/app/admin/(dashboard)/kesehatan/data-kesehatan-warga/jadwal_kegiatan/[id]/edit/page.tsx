/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import jadwalKegiatanState from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/jadwalKegiatan';
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

interface JadwalKegiatanFormBase {
  content: string;
  informasiJadwalKegiatan: {
    name: string;
    tanggal: string;
    waktu: string;
    lokasi: string;
  };
  deskripsiJadwalKegiatan: {
    deskripsi: string;
  };
  layananJadwalKegiatan: {
    content: string;
  };
  syaratKetentuanJadwalKegiatan: {
    content: string;
  };
  dokumenJadwalKegiatan: {
    content: string;
  };
  pendaftaranJadwalKegiatan: {
    name: string;
    tanggal: string;
    namaOrangtua: string;
    nomor: string;
    alamat: string;
    catatan: string;
  };
}

function EditJadwalKegiatan() {
  const stateJadwalKegiatan = useProxy(jadwalKegiatanState);
  const router = useRouter();
  const params = useParams();

  const [formData, setFormData] = useState<JadwalKegiatanFormBase>({
    content: stateJadwalKegiatan.edit.form.content || '',
    informasiJadwalKegiatan: {
      name: stateJadwalKegiatan.edit.form.informasiJadwalKegiatan?.name || '',
      tanggal: stateJadwalKegiatan.edit.form.informasiJadwalKegiatan?.tanggal || '',
      waktu: stateJadwalKegiatan.edit.form.informasiJadwalKegiatan?.waktu || '',
      lokasi: stateJadwalKegiatan.edit.form.informasiJadwalKegiatan?.lokasi || '',
    },
    deskripsiJadwalKegiatan: {
      deskripsi: stateJadwalKegiatan.edit.form.deskripsiJadwalKegiatan?.deskripsi || '',
    },
    layananJadwalKegiatan: {
      content: stateJadwalKegiatan.edit.form.layananJadwalKegiatan?.content || '',
    },
    syaratKetentuanJadwalKegiatan: {
      content: stateJadwalKegiatan.edit.form.syaratKetentuanJadwalKegiatan?.content || '',
    },
    dokumenJadwalKegiatan: {
      content: stateJadwalKegiatan.edit.form.dokumenJadwalKegiatan?.content || '',
    },
    pendaftaranJadwalKegiatan: {
      name: stateJadwalKegiatan.edit.form.pendaftaranJadwalKegiatan?.name || '',
      tanggal: stateJadwalKegiatan.edit.form.pendaftaranJadwalKegiatan?.tanggal || '',
      namaOrangtua: stateJadwalKegiatan.edit.form.pendaftaranJadwalKegiatan?.namaOrangtua || '',
      nomor: stateJadwalKegiatan.edit.form.pendaftaranJadwalKegiatan?.nomor || '',
      alamat: stateJadwalKegiatan.edit.form.pendaftaranJadwalKegiatan?.alamat || '',
      catatan: stateJadwalKegiatan.edit.form.pendaftaranJadwalKegiatan?.catatan || '',
    },
  });

  useEffect(() => {
    const loadJadwalKegiatan = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        await stateJadwalKegiatan.edit.load(id);
        const { form } = stateJadwalKegiatan.edit;
        if (form) {
          setFormData({
            content: form.content,
            informasiJadwalKegiatan: {
              name: form.informasiJadwalKegiatan?.name || '',
              tanggal: form.informasiJadwalKegiatan?.tanggal || '',
              waktu: form.informasiJadwalKegiatan?.waktu || '',
              lokasi: form.informasiJadwalKegiatan?.lokasi || '',
            },
            deskripsiJadwalKegiatan: {
              deskripsi: form.deskripsiJadwalKegiatan?.deskripsi || '',
            },
            layananJadwalKegiatan: {
              content: form.layananJadwalKegiatan?.content || '',
            },
            syaratKetentuanJadwalKegiatan: {
              content: form.syaratKetentuanJadwalKegiatan?.content || '',
            },
            dokumenJadwalKegiatan: {
              content: form.dokumenJadwalKegiatan?.content || '',
            },
            pendaftaranJadwalKegiatan: {
              name: form.pendaftaranJadwalKegiatan?.name || '',
              tanggal: form.pendaftaranJadwalKegiatan?.tanggal || '',
              namaOrangtua: form.pendaftaranJadwalKegiatan?.namaOrangtua || '',
              nomor: form.pendaftaranJadwalKegiatan?.nomor || '',
              alamat: form.pendaftaranJadwalKegiatan?.alamat || '',
              catatan: form.pendaftaranJadwalKegiatan?.catatan || '',
            },
          });
        }
      } catch (error) {
        console.error("Error loading jadwal kegiatan:", error);
        toast.error("Gagal memuat data jadwal kegiatan");
      }
    };
    loadJadwalKegiatan();
  }, [params?.id]);

  const handleSubmit = async () => {
    try {
      stateJadwalKegiatan.edit.form = {
        ...stateJadwalKegiatan.edit.form,
        content: formData.content,
        informasiJadwalKegiatan: {
          name: formData.informasiJadwalKegiatan.name,
          tanggal: formData.informasiJadwalKegiatan.tanggal,
          waktu: formData.informasiJadwalKegiatan.waktu,
          lokasi: formData.informasiJadwalKegiatan.lokasi,
        },
        deskripsiJadwalKegiatan: {
          deskripsi: formData.deskripsiJadwalKegiatan.deskripsi,
        },
        layananJadwalKegiatan: {
          content: formData.layananJadwalKegiatan.content,
        },
        syaratKetentuanJadwalKegiatan: {
          content: formData.syaratKetentuanJadwalKegiatan.content,
        },
        dokumenJadwalKegiatan: {
          content: formData.dokumenJadwalKegiatan.content,
        },
        pendaftaranJadwalKegiatan: {
          name: formData.pendaftaranJadwalKegiatan.name,
          tanggal: formData.pendaftaranJadwalKegiatan.tanggal,
          namaOrangtua: formData.pendaftaranJadwalKegiatan.namaOrangtua,
          nomor: formData.pendaftaranJadwalKegiatan.nomor,
          alamat: formData.pendaftaranJadwalKegiatan.alamat,
          catatan: formData.pendaftaranJadwalKegiatan.catatan,
        },
      };
      const success = await stateJadwalKegiatan.edit.submit();
      if (success) {
        toast.success("Jadwal kegiatan berhasil diperbarui!");
        router.push("/admin/kesehatan/data-kesehatan-warga/jadwal_kegiatan");
      }
    } catch (error) {
      console.error("Error updating jadwal kegiatan:", error);
      toast.error(error instanceof Error ? error.message : "Gagal memperbarui data jadwal kegiatan");
    }
  };
  return (
    <Box>
      <Box mb={10}>
        <Button onClick={() => router.back()} variant="subtle" color="blue">
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>
      <Stack gap="xs">
        <Paper bg={colors['white-1']} p="md" w={{ base: '100%', md: '50%' }}>
        <Stack gap="xs">
          <Title order={3}>Edit Jadwal Kegiatan</Title>
          <TextInput
            label={<Text fz="sm" fw="bold">Nama Jadwal Kegiatan</Text>}
            placeholder="masukkan nama jadwal kegiatan"
            value={formData.content}
            onChange={(e) => {
              setFormData(prev => ({
                ...prev,
                content: e.target.value
              }));
            }}
          />
         <Box>
         <Text fz="sm" fw="bold">Deskripsi Jadwal Kegiatan</Text>
          <EditEditor
            value={formData.deskripsiJadwalKegiatan.deskripsi}
            onChange={(e) => {
              setFormData(prev => ({
                ...prev,
                deskripsiJadwalKegiatan: {
                  ...prev.deskripsiJadwalKegiatan,
                  deskripsi: e
                }
              }));
            }}
          />
         </Box>
          <Box>
            <Text fz="md" fw="bold">Informasi Jadwal Kegiatan</Text>
            <TextInput
              label={<Text fz="sm" fw="bold">Nama</Text>}
              placeholder="masukkan nama"
              value={formData.informasiJadwalKegiatan.name}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  informasiJadwalKegiatan: {
                    ...prev.informasiJadwalKegiatan,
                    name: e.target.value
                  }
                }));
              }}
            />
            <TextInput
              label={<Text fz="sm" fw="bold">Tanggal</Text>}
              placeholder="masukkan tanggal"
              value={formData.informasiJadwalKegiatan.tanggal}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  informasiJadwalKegiatan: {
                    ...prev.informasiJadwalKegiatan,
                    tanggal: e.target.value
                  }
                }));
              }}
            />
            <TextInput
              label={<Text fz="sm" fw="bold">Waktu</Text>}
              placeholder="masukkan waktu"
              value={formData.informasiJadwalKegiatan.waktu}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  informasiJadwalKegiatan: {
                    ...prev.informasiJadwalKegiatan,
                    waktu: e.target.value
                  }
                }));
              }}
            />
            <TextInput
              label={<Text fz="sm" fw="bold">Lokasi</Text>}
              placeholder="masukkan lokasi"
              value={formData.informasiJadwalKegiatan.lokasi}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  informasiJadwalKegiatan: {
                    ...prev.informasiJadwalKegiatan,
                    lokasi: e.target.value
                  }
                }));
              }}
            />
          </Box>
          <Box>
            <Text fz="md" fw="bold">Layanan Jadwal Kegiatan</Text>
            <EditEditor
              value={formData.layananJadwalKegiatan.content}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  layananJadwalKegiatan: {
                    ...prev.layananJadwalKegiatan,
                    content: e
                  }
                }));
              }}
            />
          </Box>
          <Box>
            <Text fz="md" fw="bold">Syarat dan Ketentuan Jadwal Kegiatan</Text>
            <EditEditor
              value={formData.syaratKetentuanJadwalKegiatan.content}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  syaratKetentuanJadwalKegiatan: {
                    ...prev.syaratKetentuanJadwalKegiatan,
                    content: e
                  }
                }));
              }}
            />
          </Box>
          <Box>
            <Text fz="md" fw="bold">Dokumen Jadwal Kegiatan</Text>
            <EditEditor
              value={formData.dokumenJadwalKegiatan.content}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  dokumenJadwalKegiatan: {
                    ...prev.dokumenJadwalKegiatan,
                    content: e
                  }
                }));
              }}
            />
          </Box>
          <Box>
            <Text fz="md" fw="bold">Pendaftaran Jadwal Kegiatan</Text>
            <TextInput
              label={<Text fz="sm" fw="bold">Nama</Text>}
              placeholder="masukkan nama"
              value={formData.pendaftaranJadwalKegiatan.name}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  pendaftaranJadwalKegiatan: {
                    ...prev.pendaftaranJadwalKegiatan,
                    name: e.target.value
                  }
                }));
              }}
            />
            <TextInput
              label={<Text fz="sm" fw="bold">Tanggal</Text>}
              placeholder="masukkan tanggal"
              value={formData.pendaftaranJadwalKegiatan.tanggal}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  pendaftaranJadwalKegiatan: {
                    ...prev.pendaftaranJadwalKegiatan,
                    tanggal: e.target.value
                  }
                }));
              }}
            />
            <TextInput
              label={<Text fz="sm" fw="bold">Nama Orangtua</Text>}
              placeholder="masukkan nama orangtua"
              value={formData.pendaftaranJadwalKegiatan.namaOrangtua}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  pendaftaranJadwalKegiatan: {
                    ...prev.pendaftaranJadwalKegiatan,
                    namaOrangtua: e.target.value
                  }
                }));
              }}
            />
            <TextInput
              label={<Text fz="sm" fw="bold">Nomor</Text>}
              placeholder="masukkan nomor"
              value={formData.pendaftaranJadwalKegiatan.nomor}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  pendaftaranJadwalKegiatan: {
                    ...prev.pendaftaranJadwalKegiatan,
                    nomor: e.target.value
                  }
                }));
              }}
            />
            <TextInput
              label={<Text fz="sm" fw="bold">Alamat</Text>}
              placeholder="masukkan alamat"
              value={formData.pendaftaranJadwalKegiatan.alamat}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  pendaftaranJadwalKegiatan: {
                    ...prev.pendaftaranJadwalKegiatan,
                    alamat: e.target.value
                  }
                }));
              }}
            />
            <TextInput
              label={<Text fz="sm" fw="bold">Catatan</Text>}
              placeholder="masukkan catatan"
              value={formData.pendaftaranJadwalKegiatan.catatan}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  pendaftaranJadwalKegiatan: {
                    ...prev.pendaftaranJadwalKegiatan,
                    catatan: e.target.value
                  }
                }));
              }}
            />
          </Box>

          <Button onClick={handleSubmit} bg={colors['blue-button']}>
            Simpan
          </Button>
        </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}

export default EditJadwalKegiatan;
