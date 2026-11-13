'use client';
import { useParams } from "next/navigation";
import { PosyanduDetail } from "../_com/detail/PosyanduDetail";

/** Detail satu posyandu. */
export default function Page() {
  const params = useParams<{ id: string }>();
  return <PosyanduDetail id={params.id} />;
}
