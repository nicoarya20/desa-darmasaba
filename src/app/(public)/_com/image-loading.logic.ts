/**
 * Atribut pemuatan `<img>`: gambar di atas lipatan (kandidat LCP) diunduh langsung dengan prioritas tinggi,
 * sisanya ditunda (lazy). `loading="lazy"` pada gambar yang sudah terlihat memperlambat LCP karena browser
 * menunggu tata letak selesai sebelum memutuskan mengunduhnya.
 */
export function imageLoadingAttrs(aboveFold: boolean) {
  return aboveFold ? ({ loading: "eager", fetchPriority: "high" } as const) : ({ loading: "lazy" } as const);
}
