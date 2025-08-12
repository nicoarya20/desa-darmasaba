'use client';

import colors from '@/con/colors';
import { Box, Center, Image, Pagination, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import ApiFetch from '@/lib/api-fetch';

interface FileItem {
    id: string;
    name: string;
    link: string;
    realName: string;
    createdAt: string | Date;
    category: string;
    path: string;
    mimeType: string;
  }
  
  export default function FotoContent() {
    const [files, setFiles] = useState<FileItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
  
    // ✅ Load data function
    const load = async (pageNum: number, limit: number, searchTerm: string) => {
      setLoading(true);
      try {
        const query: Record<string, string> = {
          category: 'image',
          page: pageNum.toString(),
          limit: limit.toString(),
        };
        if (searchTerm) query.search = searchTerm;

        const response = await ApiFetch.api.fileStorage.findMany.get({ query });

        if (response.status === 200 && response.data) {
          setFiles(response.data.data || []);
          setTotalPages(response.data.meta?.totalPages || 1);
        } else {
          setFiles([]);
        }
      } catch (err) {
        console.error('Load error:', err);
        setFiles([]);
      } finally {
        setLoading(false);
      }
    };
  
    // ✅ Baca dari URL — AMAN karena ssr: false
    useEffect(() => {
      const urlParams = new URLSearchParams(window.location.search);
      const urlSearch = urlParams.get('search') || '';
      setSearch(urlSearch);
      load(1, 10, urlSearch.trim());
    }, []);

  // ✅ Fetch data
  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true);
      try {
        const query: Record<string, string> = {
          category: 'image',
          page: page.toString(),
          limit: '10',
        };
        if (search) query.search = search;

        const response = await ApiFetch.api.fileStorage.findMany.get({ query });

        if (response.status === 200 && response.data) {
          setFiles(response.data.data || []);
          setTotalPages(response.data.meta?.totalPages || 1);
        } else {
          setFiles([]);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setFiles([]);
      } finally {
        setLoading(false);
      }
    };

    if (page > 0) fetchFiles(); // jangan fetch jika page belum valid
  }, [search, page]);

  // ✅ Update URL
  const updateURL = (newSearch: string, newPage: number) => {
    const url = new URL(window.location.href);
    if (newSearch) url.searchParams.set('search', newSearch);
    else url.searchParams.delete('search');
    if (newPage > 1) url.searchParams.set('page', newPage.toString());
    else url.searchParams.delete('page');
    window.history.pushState({}, '', url);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateURL(search, newPage);
  };

  if (loading && files.length === 0) {
    return <Center>Memuat data...</Center>;
  }

  if (files.length === 0) {
    return <Center>Tidak ada foto ditemukan</Center>;
  }

  return (
    <Box pt={20} px={{ base: 'md', md: 100 }}>
      <SimpleGrid cols={{ base: 1, md: 3 }}>
        {files.map((file) => (
          <Paper key={file.id} mb={50} p="md" radius={26} bg={colors['white-trans-1']} style={{ height: '100%' }}>
            <Box style={{ height: '250px', overflow: 'hidden', borderRadius: '12px' }}>
              <Image
                src={file.link}
                alt={file.realName || file.name}
                height={250}
                width="100%"
                style={{ objectFit: 'cover', height: '100%', width: '100%' }}
              />
            </Box>
            <Box>
              <Stack gap="sm" py={10}>
                <Text fw="bold" fz={{ base: 'h4', md: 'h3' }}>
                  {file.realName || file.name}
                </Text>
                <Text fz="sm" c="dimmed">
                  {new Date(file.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
              </Stack>
            </Box>
          </Paper>
        ))}
      </SimpleGrid>
      <Center mt="xl">
        <Pagination total={totalPages} value={page} onChange={handlePageChange} />
      </Center>
    </Box>
  );
}