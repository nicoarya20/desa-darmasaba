'use client'
import { LayananHeader } from "./_com/LayananHeader";
import s from "./_com/layanan.module.css";
import PelayananPendudukNonPermanent from "./_com/pelayananPendudukNonPermanent";
import PelayananPerizinanBerusaha from "./_com/pelayananPerizinanBerusaha";
import PelayananSuratKeterangan from "./_com/pelayananSuratKeterangan";
import PelayananTelunjukSaktiDesa from "./_com/pelayananTelunjukSaktiDesa";

/** Halaman daftar Layanan Desa: surat keterangan, perizinan berusaha (OSS), Telunjuk Sakti, penduduk non-permanen. */
export default function Page() {
    return (
        <div className={s.page}>
            <LayananHeader />
            <PelayananSuratKeterangan />
            <PelayananPerizinanBerusaha />
            <PelayananTelunjukSaktiDesa />
            <PelayananPendudukNonPermanent />
        </div>
    )
}
