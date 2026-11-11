/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import grafikkepuasan from "@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/grafikKepuasan";
import colors from "@/con/colors";
import { Box, Center, Paper, Skeleton, Stack, Text, Title } from "@mantine/core";
import { useMediaQuery, useShallowEffect } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { Bar, BarChart, Legend, Tooltip, XAxis, YAxis } from "recharts";
import { useProxy } from "valtio/utils";



function GrafikPenyakit() {
  type PDKMGRAFIK = {
    id: string;
    nama: string;
    tanggal: string | Date; // Allow both string and Date types
    jenisKelamin: string;
    alamat: string;
    penyakit: string;
    createdAt?: Date;     // Add optional fields that might come from the API
    updatedAt?: Date;
    deletedAt?: Date | null;
  }
  const statePenyakit = useProxy(grafikkepuasan)
  const [chartData, setChartData] = useState<PDKMGRAFIK[]>([])
  const [mounted, setMounted] = useState(false)
  const isTablet = useMediaQuery('(max-width: 1024px)')
  const isMobile = useMediaQuery('(max-width: 768px)')

  const {
    data,
    page,
    loading,
    load,
  } = statePenyakit.findMany

  useShallowEffect(() => {
    setMounted(true)
    load(page, 10)
  }, [page])

  useEffect(() => {
    setMounted(true)
    if (data) {
      setChartData(data.map((item) => ({
        id: item.id,
        nama: item.nama,
        tanggal: item.tanggal instanceof Date ? item.tanggal.toISOString() : item.tanggal,
        jenisKelamin: item.jenisKelamin,
        alamat: item.alamat,
        penyakit: item.penyakit,
      })))
    }
  }, [data])

  const processDiseaseData = (data: PDKMGRAFIK[]) => {
    const diseaseCount: Record<string, number> = {};

    data.forEach(item => {
      const penyakit = item.penyakit.trim();
      if (penyakit) {
        diseaseCount[penyakit] = (diseaseCount[penyakit] || 0) + 1;
      }
    });

    return Object.entries(diseaseCount).map(([name, count]) => ({
      name,
      count
    }));
  };

  // Add this state to store the processed chart data
  const [diseaseChartData, setDiseaseChartData] = useState<{ name: string, count: number }[]>([]);

  // Update the chart data when data changes
  useEffect(() => {
    if (data && data.length > 0) {
      setDiseaseChartData(processDiseaseData(data));
    }
  }, [data]);

  if (loading || !data) {
    return (
      <Stack>
        <Skeleton h={500} />
      </Stack>
    )
  }


  return (
    <Box>
      {!mounted && !chartData ? (
        <Box style={{ width: '100%', minWidth: 300, height: 400, minHeight: 300 }}>
          <Paper bg={colors['white-1']} p={'md'}>
            <Center>
              <Title pb={10} order={2}>Penderita Penyakit</Title>
              <Text c='dimmed'>Belum ada data untuk ditampilkan dalam grafik</Text>
            </Center>
          </Paper>
        </Box>
      ) : (
        <Box style={{ width: '100%', minWidth: 300, height: 420, minHeight: 300 }}>
          <Paper bg={colors["white-trans-1"]} p={'md'}>
            <Title pb={10} order={2}>Penderita Penyakit</Title>
            {mounted && diseaseChartData.length > 0 && (
              <Center>
                <BarChart width={isMobile ? 450 : isTablet ? 500 : 550} height={350} data={diseaseChartData} >
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill={colors['blue-button']} name="Jumlah Penderita" />
                </BarChart>
              </Center>
            )}
          </Paper>
        </Box>
      )}
    </Box>
  );
}

export default GrafikPenyakit;
