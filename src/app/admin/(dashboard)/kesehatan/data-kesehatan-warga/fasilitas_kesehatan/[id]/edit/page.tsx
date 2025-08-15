/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import fasilitasKesehatanState from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/fasilitasKesehatan';
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

interface FasilitasKesehatanFormBase {
  name: string;
  informasiUmum: {
    fasilitas: string;
    alamat: string;
    jamOperasional: string;
  };
  layananUnggulan: {
    content: string;
  };
  dokterdanTenagaMedis: {
    name: string;
    specialist: string;
    jadwal: string;
  };
  fasilitasPendukung: {
    content: string;
  };
  prosedurPendaftaran: {
    content: string;
  };
  tarifDanLayanan: {
    layanan: string;
    tarif: string;
  };
}

function EditFasilitasKesehatan() {
  const stateFasilitasKesehatan = useProxy(fasilitasKesehatanState.fasilitasKesehatan);
  const router = useRouter();
  const params = useParams();

  const [formData, setFormData] = useState<FasilitasKesehatanFormBase>({
    name: stateFasilitasKesehatan.edit.form.name || '',
    informasiUmum: {
      fasilitas: stateFasilitasKesehatan.edit.form.informasiUmum?.fasilitas || '',
      alamat: stateFasilitasKesehatan.edit.form.informasiUmum?.alamat || '',
      jamOperasional: stateFasilitasKesehatan.edit.form.informasiUmum?.jamOperasional || '',
    },
    layananUnggulan: {
      content: stateFasilitasKesehatan.edit.form.layananUnggulan?.content || '',
    },
    dokterdanTenagaMedis: {
      name: stateFasilitasKesehatan.edit.form.dokterdanTenagaMedis?.name || '',
      specialist: stateFasilitasKesehatan.edit.form.dokterdanTenagaMedis?.specialist || '',
      jadwal: stateFasilitasKesehatan.edit.form.dokterdanTenagaMedis?.jadwal || '',
    },
    fasilitasPendukung: {
      content: stateFasilitasKesehatan.edit.form.fasilitasPendukung?.content || '',
    },
    prosedurPendaftaran: {
      content: stateFasilitasKesehatan.edit.form.prosedurPendaftaran?.content || '',
    },
    tarifDanLayanan: {
      layanan: stateFasilitasKesehatan.edit.form.tarifDanLayanan?.layanan || '',
      tarif: stateFasilitasKesehatan.edit.form.tarifDanLayanan?.tarif || '',
    },
  });

  useEffect(() => {
    const loadFasilitasKesehatan = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        await stateFasilitasKesehatan.edit.load(id);
        const { form } = stateFasilitasKesehatan.edit;
        if (form) {
          setFormData({
            name: form.name,
            informasiUmum: {
              fasilitas: form.informasiUmum?.fasilitas || '',
              alamat: form.informasiUmum?.alamat || '',
              jamOperasional: form.informasiUmum?.jamOperasional || '',
            },
            layananUnggulan: {
              content: form.layananUnggulan?.content || '',
            },
            dokterdanTenagaMedis: {
              name: form.dokterdanTenagaMedis?.name || '',
              specialist: form.dokterdanTenagaMedis?.specialist || '',
              jadwal: form.dokterdanTenagaMedis?.jadwal || '',
            },
            fasilitasPendukung: {
              content: form.fasilitasPendukung?.content || '',
            },
            prosedurPendaftaran: {
              content: form.prosedurPendaftaran?.content || '',
            },
            tarifDanLayanan: {
              layanan: form.tarifDanLayanan?.layanan || '',
              tarif: form.tarifDanLayanan?.tarif || '',
            },
          });
        }
      } catch (error) {
        console.error("Error loading fasilitas kesehatan:", error);
        toast.error("Gagal memuat data fasilitas kesehatan");
      }
    };
    loadFasilitasKesehatan();
  }, [params?.id]);

  const handleSubmit = async () => {
    try {
      stateFasilitasKesehatan.edit.form = {
        ...stateFasilitasKesehatan.edit.form,
        name: formData.name,
        informasiUmum: {
          fasilitas: formData.informasiUmum.fasilitas,
          alamat: formData.informasiUmum.alamat,
          jamOperasional: formData.informasiUmum.jamOperasional,
        },
        layananUnggulan: {
          content: formData.layananUnggulan.content,
        },
        dokterdanTenagaMedis: {
          name: formData.dokterdanTenagaMedis.name,
          specialist: formData.dokterdanTenagaMedis.specialist,
          jadwal: formData.dokterdanTenagaMedis.jadwal,
        },
        fasilitasPendukung: {
          content: formData.fasilitasPendukung.content,
        },
        prosedurPendaftaran: {
          content: formData.prosedurPendaftaran.content,
        },
        tarifDanLayanan: {
          layanan: formData.tarifDanLayanan.layanan,
          tarif: formData.tarifDanLayanan.tarif,
        },
      };
      const success = await stateFasilitasKesehatan.edit.submit();
      if (success) {
        toast.success("Fasilitas kesehatan berhasil diperbarui!");
        router.push("/admin/kesehatan/data-kesehatan-warga/fasilitas_kesehatan");
      }
    } catch (error) {
      console.error("Error updating fasilitas kesehatan:", error);
      toast.error(error instanceof Error ? error.message : "Gagal memperbarui data fasilitas kesehatan");
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
            <Title order={3}>Edit Fasilitas Kesehatan</Title>
            <TextInput
              label={<Text fz="sm" fw="bold">Nama Fasilitas Kesehatan</Text>}
              placeholder="masukkan nama fasilitas kesehatan"
              value={formData.name}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  name: e.target.value
                }));
              }}
            />
            <Box>
              <Text fz="md" fw="bold">Informasi Umum</Text>
              <TextInput
                label={<Text fz="sm" fw="bold">Fasilitas</Text>}
                placeholder="masukkan fasilitas"
                value={formData.informasiUmum.fasilitas}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    informasiUmum: {
                      ...prev.informasiUmum,
                      fasilitas: e.target.value
                    }
                  }));
                }}
              />
              <TextInput
                label={<Text fz="sm" fw="bold">Alamat</Text>}
                placeholder="masukkan alamat"
                value={formData.informasiUmum.alamat}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    informasiUmum: {
                      ...prev.informasiUmum,
                      alamat: e.target.value
                    }
                  }));
                }}
              />
              <TextInput
                label={<Text fz="sm" fw="bold">Jam Operasional</Text>}
                placeholder="masukkan jam operasional"
                value={formData.informasiUmum.jamOperasional}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    informasiUmum: {
                      ...prev.informasiUmum,
                      jamOperasional: e.target.value
                    }
                  }));
                }}
              />
            </Box>
            <Box>
              <Text fz="md" fw="bold">Layanan Unggulan</Text>
              <EditEditor
                value={formData.layananUnggulan.content}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    layananUnggulan: {
                      ...prev.layananUnggulan,
                      content: e
                    }
                  }));
                }}
              />
            </Box>
            <Box>
              <Text fz="md" fw="bold">Dokter dan Tenaga Medis</Text>
              <TextInput
                label={<Text fz="sm" fw="bold">Nama Dokter</Text>}
                placeholder="masukkan nama dokter"
                value={formData.dokterdanTenagaMedis.name}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    dokterdanTenagaMedis: {
                      ...prev.dokterdanTenagaMedis,
                      name: e.target.value
                    }
                  }));
                }}
              />
              <TextInput
                label={<Text fz="sm" fw="bold">Specialist</Text>}
                placeholder="masukkan specialist"
                value={formData.dokterdanTenagaMedis.specialist}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    dokterdanTenagaMedis: {
                      ...prev.dokterdanTenagaMedis,
                      specialist: e.target.value
                    }
                  }));
                }}
              />
              <TextInput
                label={<Text fz="sm" fw="bold">Jadwal</Text>}
                placeholder="masukkan jadwal"
                value={formData.dokterdanTenagaMedis.jadwal}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    dokterdanTenagaMedis: {
                      ...prev.dokterdanTenagaMedis,
                      jadwal: e.target.value
                    }
                  }));
                }}
              />
            </Box>
            <Box>
              <Text fz="md" fw="bold">Fasilitas Pendukung</Text>
              <EditEditor
                value={formData.fasilitasPendukung.content}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    fasilitasPendukung: {
                      ...prev.fasilitasPendukung,
                      content: e
                    }
                  }));
                }}
              />
            </Box>
            <Box>
              <Text fz="md" fw="bold">Prosedur Pendaftaran</Text>
              <EditEditor
                value={formData.prosedurPendaftaran.content}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    prosedurPendaftaran: {
                      ...prev.prosedurPendaftaran,
                      content: e
                    }
                  }));
                }}
              />
            </Box>
            <Box>
              <Text fz="md" fw="bold">Tarif dan Layanan</Text>
              <TextInput
                label={<Text fz="sm" fw="bold">Tarif</Text>}
                placeholder="masukkan tarif"
                value={formData.tarifDanLayanan.tarif}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    tarifDanLayanan: {
                      ...prev.tarifDanLayanan,
                      tarif: e.target.value
                    }
                  }));
                }}
              />
              <TextInput
                label={<Text fz="sm" fw="bold">Layanan</Text>}
                placeholder="masukkan layanan"
                value={formData.tarifDanLayanan.layanan}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    tarifDanLayanan: {
                      ...prev.tarifDanLayanan,
                      layanan: e.target.value
                    }
                  }));
                }}
              />
            </Box>

              <Button
                onClick={handleSubmit}
                bg={colors['blue-button']}
                loading={stateFasilitasKesehatan.edit.loading}
              >
                Simpan
              </Button>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}

export default EditFasilitasKesehatan;
