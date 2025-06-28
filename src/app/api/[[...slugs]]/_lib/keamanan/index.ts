import Elysia from "elysia";
import KeamananLingkungan from "./keamanan-lingkungan";
import PolsekTerdekat from "./polsek-terdekat";

const Keamanan = new Elysia({ prefix: "/api/keamanan", tags: ["Keamanan"] })
.use(KeamananLingkungan)
.use(PolsekTerdekat)
export default Keamanan;
