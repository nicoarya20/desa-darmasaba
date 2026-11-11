"use client";
import BackButton from "@/app/(public)/(pages)/pemerintahan/layanan/_com/BackButto";
import colors from "@/con/colors";
import { Pagination, TextInput } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconSearch } from "@tabler/icons-react";
import { useState } from "react";
import { PrestasiGrid } from "./PrestasiGrid";
import { countPages } from "./prestasi.logic";
import { PRESTASI_BRAND_VARS, PRESTASI_PAGE_SIZE } from "./prestasi.meta";
import grid from "./prestasi.module.css";
import s from "./prestasi.page.module.css";
import { PRESTASI_TEXT } from "./prestasi.text";
import { usePrestasiData } from "./use-prestasi-data";

const SEARCH_DEBOUNCE_MS = 400;

/** Halaman gabungan Prestasi dan Penghargaan Desa: cari + grid tile + paginasi. */
export function PrestasiListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query] = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS);
  const { items, total, loading, failed } = usePrestasiData({ page, pageSize: PRESTASI_PAGE_SIZE, search: query });
  const pages = countPages(total, PRESTASI_PAGE_SIZE);

  const onPage = (next: number) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  let message: string | null = null;
  if (failed) message = PRESTASI_TEXT.error;
  else if (!loading && items.length === 0) message = query ? PRESTASI_TEXT.notFound(query) : PRESTASI_TEXT.empty;

  return (
    <section className={`${grid.section} ${s.page}`} style={PRESTASI_BRAND_VARS} aria-labelledby="prestasi-page-title">
      <div className={s.head}>
        <BackButton />
        <div className={s.intro}>
          <div>
            <h1 id="prestasi-page-title" className={s.title}>
              {PRESTASI_TEXT.title}
            </h1>
            <p className={s.lead}>{PRESTASI_TEXT.subtitle}</p>
          </div>
          <TextInput
            className={s.search}
            radius="xl"
            size="md"
            aria-label={PRESTASI_TEXT.searchLabel}
            placeholder={PRESTASI_TEXT.searchPlaceholder}
            leftSection={<IconSearch size={18} />}
            value={search}
            onChange={(e) => {
              setSearch(e.currentTarget.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {message ? (
        <p className={s.message} role={failed ? "alert" : "status"}>
          {message}
        </p>
      ) : (
        <PrestasiGrid cards={items} loading={loading} placeholderCount={PRESTASI_PAGE_SIZE} />
      )}

      {pages > 1 ? (
        <div className={s.pagination}>
          <Pagination value={page} onChange={onPage} total={pages} color={colors["blue-button"]} radius="xl" />
        </div>
      ) : null}
    </section>
  );
}
