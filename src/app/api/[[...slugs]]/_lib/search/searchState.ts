/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { proxy, subscribe } from 'valtio';
import { debounce } from 'lodash';
import ApiFetch from '@/lib/api-fetch';

interface SearchResult {
  type?: string; // optional biar gak error
  id: string | number;
  title?: string;
  [key: string]: any;
}

const searchState = proxy({
  query: '',
  page: 1,
  limit: 10,
  type: '', // kosong = global search
  results: [] as SearchResult[],
  nextPage: null as number | null,
  loading: false,

  async fetch() {
    if (!searchState.query) return;
    searchState.loading = true;

    try {
      const res = await ApiFetch.api.search.findMany.get({
        query: {
          query: searchState.query,
          page: searchState.page,
          limit: searchState.limit,
          type: searchState.type,
        },
      });

      const data = (res.data?.data || []).map((item: any) => ({
        type: item.type ?? 'unknown', // pastikan selalu ada type
        ...item,
      }));

      if (searchState.page === 1) {
        searchState.results = data;
      } else {
        searchState.results.push(...data);
      }

      searchState.nextPage = res.data?.nextPage || null;
    } catch (e) {
      console.error('Search fetch error:', e);
    } finally {
      searchState.loading = false;
    }
  },

  async next() {
    if (!searchState.nextPage || searchState.loading) return;
    searchState.page = searchState.nextPage;
    await searchState.fetch();
  },
});

// 🔁 Auto debounce search trigger
const debouncedFetch = debounce(() => {
  if (!searchState.query) return;
  searchState.page = 1;
  searchState.fetch();
}, 500);

subscribe(searchState, () => {
  debouncedFetch();
});

export default searchState;
