'use client';

import colors from '@/con/colors';
import { Box, Center, Image, Pagination, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import { useCallback, useEffect, useState } from 'react';
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
  
    // Handle search and pagination changes
  const loadData = useCallback((pageNum: number, searchTerm: string) => {
    setLoading(true);
    // Using the load function from the component's scope
    const loadFn = async () => {
      try {
        const response = await ApiFetch.api.fileStorage.findMany.get({
          query: {
            category: 'image',
            page: pageNum.toString(),
            limit: '10',
            ...(searchTerm && { search: searchTerm })
          }
        });

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

    loadFn();
  }, []);

  // Initial load and URL change handler
  useEffect(() => {
    const handleRouteChange = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const urlSearch = urlParams.get('search') || '';
      const urlPage = parseInt(urlParams.get('page') || '1');
      
      setSearch(urlSearch);
      setPage(urlPage);
      loadData(urlPage, urlSearch);
    };

    // Handle search updates from the search bar
    const handleSearchUpdate = (e: Event) => {
      const { search } = (e as CustomEvent).detail;
      
      setSearch(search);
      setPage(1); // Reset to first page on new search
      loadData(1, search);
    };

    // Initial load
    handleRouteChange();

    // Set up event listeners
    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('searchUpdate', handleSearchUpdate as EventListener);
    
    // Cleanup
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('searchUpdate', handleSearchUpdate as EventListener);
    };
  }, [loadData]);

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
                loading="lazy"
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