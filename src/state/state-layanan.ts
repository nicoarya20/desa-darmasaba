/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { proxy } from "valtio";
import useSwr from "swr";

type Layanan = {
    layanan: string | null
    useLoad: any
}

const stateLayanan = proxy<Layanan>({
    layanan: null,
    useLoad: () => {
        
    }
})

export default stateLayanan