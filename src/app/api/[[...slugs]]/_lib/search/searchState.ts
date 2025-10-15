/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { proxy } from 'valtio';
import { debounce } from 'lodash';
import ApiFetch from '@/lib/api-fetch';

interface SearchResult {
  type?: string;
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
    if (!searchState.query) {
      searchState.results = [];
      return;
    }

    searchState.loading = true;

    const res = await ApiFetch.api.search.findMany.get({
      query: {
        query: searchState.query,
        page: searchState.page,
        limit: searchState.limit,
        type: searchState.type,
      },
    });

    if (searchState.page === 1) {
      searchState.results = res.data?.data || [];
    } else {
      searchState.results.push(...(res.data?.data || []));
    }

    searchState.nextPage = res.data?.nextPage || null;
    searchState.loading = false;
  },

  async next() {
    if (!searchState.nextPage || searchState.loading) return;
    searchState.page = searchState.nextPage;
    await searchState.fetch();
  },
});

// 🕒 debounce-nya tetap kita export biar bisa dipanggil manual
export const debouncedFetch = debounce(() => {
  searchState.page = 1;
  searchState.fetch();
}, 500);

export default searchState;


// 'use client';
// import { proxy, subscribe } from 'valtio';
// import { debounce } from 'lodash';
// import ApiFetch from '@/lib/api-fetch';

// interface SearchResult {
//   type?: string;
//   id: string | number;
//   title?: string;
//   [key: string]: any;
// }

// const searchState = proxy({
//   query: '',
//   page: 1,
//   limit: 10,
//   type: '', // kosong = global search
//   results: [] as SearchResult[],
//   nextPage: null as number | null,
//   loading: false,

//   // --- fetch utama ---
//   async fetch() {
//     if (!searchState.query.trim()) {
//       // 🧹 kalau query kosong, kosongin data dan stop
//       searchState.results = [];
//       searchState.nextPage = null;
//       searchState.loading = false;
//       return;
//     }

//     searchState.loading = true;

//     try {
//       const res = await ApiFetch.api.search.findMany.get({
//         query: {
//           query: searchState.query,
//           page: searchState.page,
//           limit: searchState.limit,
//           type: searchState.type,
//         },
//       });

//       const newData = res.data?.data || [];

//       // Kalau ini page pertama, replace data
//       if (searchState.page === 1) {
//         searchState.results = newData;
//       } else {
//         // Kalau page berikutnya, append data
//         searchState.results = [...searchState.results, ...newData];
//       }

//       searchState.nextPage = res.data?.nextPage || null;
//     } catch (err) {
//       console.error('Search fetch error:', err);
//     } finally {
//       searchState.loading = false;
//     }
//   },

//   // --- load next page (infinite scroll) ---
//   async next() {
//     if (!searchState.nextPage || searchState.loading) return;
//     searchState.page = searchState.nextPage;
//     await searchState.fetch();
//   },
// });

// // --- debounce agar gak fetch tiap ketik ---
// const debouncedFetch = debounce(() => {
//   // reset pagination setiap query berubah
//   searchState.page = 1;
//   searchState.fetch();
// }, 500);

// // --- auto trigger setiap query berubah ---
// subscribe(searchState, () => {
//   // kalau query berubah, jalankan debounce fetch
//   debouncedFetch();
// });

// export default searchState;
