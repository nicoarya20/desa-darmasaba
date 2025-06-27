/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import artikelKesehatanState from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/artikelKesehatan';
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

interface ArtikelKesehatanFormBase {
  title: string;
  content: string;
  introduction: {
    content: string;
  };
  symptom: {
    title: string;
    content: string;
  };
  prevention: {
    title: string;
    content: string;
  };
  firstAid: {
    title: string;
    content: string;
  };
  mythVsFact: {
    title: string;
    mitos: string;
    fakta: string;
  };
  doctorSign: {
    content: string;
  };
}

function EditArtikelKesehatan() {
  const stateArtikelKesehatan = useProxy(artikelKesehatanState);
  const router = useRouter();
  const params = useParams();

  const [formData, setFormData] = useState<ArtikelKesehatanFormBase>({
    title: stateArtikelKesehatan.edit.form.title || '',
    content: stateArtikelKesehatan.edit.form.content || '',
    introduction: {
      content: stateArtikelKesehatan.edit.form.introduction?.content || '',
    },
    symptom: {
      title: stateArtikelKesehatan.edit.form.symptom?.title || '',
      content: stateArtikelKesehatan.edit.form.symptom?.content || '',
    },
    prevention: {
      title: stateArtikelKesehatan.edit.form.prevention?.title || '',
      content: stateArtikelKesehatan.edit.form.prevention?.content || '',
    },
    firstAid: {
      title: stateArtikelKesehatan.edit.form.firstAid?.title || '',
      content: stateArtikelKesehatan.edit.form.firstAid?.content || '',
    },
    mythVsFact: {
      title: stateArtikelKesehatan.edit.form.mythVsFact?.title || '',
      mitos: stateArtikelKesehatan.edit.form.mythVsFact?.mitos || '',
      fakta: stateArtikelKesehatan.edit.form.mythVsFact?.fakta || '',
    },
    doctorSign: {
      content: stateArtikelKesehatan.edit.form.doctorSign?.content || '',
    },
  });

  useEffect(() => {
    const loadArtikelKesehatan = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        await stateArtikelKesehatan.edit.load(id);
        const { form } = stateArtikelKesehatan.edit;
        if (form) {
          setFormData({
            title: form.title,
            content: form.content,
            introduction: {
              content: form.introduction?.content || '',
            },
            symptom: {
              title: form.symptom?.title || '',
              content: form.symptom?.content || '',
            },
            prevention: {
              title: form.prevention?.title || '',
              content: form.prevention?.content || '',
            },
            firstAid: {
              title: form.firstAid?.title || '',
              content: form.firstAid?.content || '',
            },
            mythVsFact: {
              title: form.mythVsFact?.title || '',
              mitos: form.mythVsFact?.mitos || '',
              fakta: form.mythVsFact?.fakta || '',
            },
            doctorSign: {
              content: form.doctorSign?.content || '',
            },
          });
        }
      } catch (error) {
        console.error("Error loading artikel kesehatan:", error);
        toast.error("Gagal memuat data artikel kesehatan");
      }
    };
    loadArtikelKesehatan();
  }, [params?.id]);

  const handleSubmit = async () => {
    try {
      stateArtikelKesehatan.edit.form = {
        ...stateArtikelKesehatan.edit.form,
        title: formData.title,
        content: formData.content,
        introduction: {
          content: formData.introduction.content,
        },
        symptom: {
          title: formData.symptom.title,
          content: formData.symptom.content,
        },
        prevention: {
          title: formData.prevention.title,
          content: formData.prevention.content,
        },
        firstAid: {
          title: formData.firstAid.title,
          content: formData.firstAid.content,
        },
        mythVsFact: {
          title: formData.mythVsFact.title,
          mitos: formData.mythVsFact.mitos,
          fakta: formData.mythVsFact.fakta,
        },
        doctorSign: {
          content: formData.doctorSign.content,
        },
      };
      const success = await stateArtikelKesehatan.edit.submit();
      if (success) {
        toast.success("Artikel kesehatan berhasil diperbarui!");
        router.push("/admin/kesehatan/data-kesehatan-warga/artikel_kesehatan");
      }
    } catch (error) {
      console.error("Error updating artikel kesehatan:", error);
      toast.error(error instanceof Error ? error.message : "Gagal memperbarui data artikel kesehatan");
    }
  };
  return (
    <Box>
      <Box mb={10}>
        <Button onClick={() => router.back()} variant="subtle" color="blue">
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>
      <Paper bg={colors['white-1']} p="md" w={{ base: '100%', md: '50%' }}>
        <Stack gap="xs">
          <Title order={3}>Edit Artikel Kesehatan</Title>
          <TextInput
            label={<Text fz="sm" fw="bold">Judul</Text>}
            placeholder="masukkan judul"
            value={formData.title}
            onChange={(e) => {
              setFormData(prev => ({
                ...prev,
                title: e.target.value
              }));
            }}
          />
          <TextInput
            label={<Text fz="sm" fw="bold">Deskripsi</Text>}
            placeholder="masukkan deskripsi"
            value={formData.content}
            onChange={(e) => {
              setFormData(prev => ({
                ...prev,
                content: e.target.value
              }));
            }}
          />
          <TextInput
            label={<Text fz="sm" fw="bold">Pendahuluan</Text>}
            placeholder="masukkan pendahuluan"
            value={formData.introduction.content}
            onChange={(e) => {
              setFormData(prev => ({
                ...prev,
                introduction: {
                  ...prev.introduction,
                  content: e.target.value
                }
              }));
            }}
          />
          <Box>
            <Text fz="md" fw="bold">Gejala</Text>
            <Stack gap="xs">
              <TextInput
                label={<Text fz="sm" fw="bold">Judul</Text>}
                placeholder="masukkan judul gejala penyakit"
                value={formData.symptom.title}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    symptom: {
                      ...prev.symptom,
                      title: e.target.value
                    }
                  }));
                }}
              />
              <Box>
                <Text fz="sm" fw="bold">Deskripsi Gejala</Text>
                <EditEditor
                  value={formData.symptom.content}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      symptom: {
                        ...prev.symptom,
                        content: e
                      }
                    }));
                  }}
                />
              </Box>
            </Stack>
          </Box>

          <Box>
            <Text fz="md" fw="bold">Pencegahan</Text>
            <TextInput
              label={<Text fz="sm" fw="bold">Judul</Text>}
              placeholder="masukkan judul"
              value={formData.prevention.title}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  prevention: {
                    ...prev.prevention,
                    title: e.target.value
                  }
                }));
              }}
            />
            <EditEditor
              value={formData.prevention.content}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  prevention: {
                    ...prev.prevention,
                    content: e
                  }
                }));
              }}
            />
          </Box>
          <Box>
            <Text fz="md" fw="bold">Pertolongan Pertama</Text>
            <TextInput
              label={<Text fz="sm" fw="bold">Judul</Text>}
              placeholder="masukkan judul"
              value={formData.firstAid.title}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  firstAid: {
                    ...prev.firstAid,
                    title: e.target.value
                  }
                }));
              }}
            />
            <EditEditor
              value={formData.firstAid.content}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  firstAid: {
                    ...prev.firstAid,
                    content: e
                  }
                }));
              }}
            />
          </Box>
          <Box>
            <Text fz="md" fw="bold">Mitos dan Fakta</Text>
            <TextInput
              label={<Text fz="sm" fw="bold">Judul</Text>}
              placeholder="masukkan judul"
              value={formData.mythVsFact.title}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  mythVsFact: {
                    ...prev.mythVsFact,
                    title: e.target.value
                  }
                }));
              }}
            />
            <Box>
              <Text>
                Mitos
              </Text>
              <EditEditor
                value={formData.mythVsFact.mitos}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    mythVsFact: {
                      ...prev.mythVsFact,
                      mitos: e
                    }
                  }));
                }}
              />
            </Box>
            <Box>
              <Text>
                Fakta
              </Text>
              <EditEditor
                value={formData.mythVsFact.fakta}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    mythVsFact: {
                      ...prev.mythVsFact,
                      fakta: e
                    }
                  }));
                }}
              />
            </Box>
          </Box>
          <Box>
            <Text fz="md" fw="bold">Kapan Harus Ke Dokter</Text>
            <EditEditor
              value={formData.doctorSign.content}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  doctorSign: {
                    ...prev.doctorSign,
                    content: e
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
    </Box>
  );
}

export default EditArtikelKesehatan;
