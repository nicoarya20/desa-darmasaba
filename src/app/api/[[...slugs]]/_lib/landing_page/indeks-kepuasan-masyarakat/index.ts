import Elysia from "elysia";
import gender from "./gender";
import monthlyStat from "./monthly-stat";
import survey from "./survey";
import response from "./response";
import age from "./age";


const IndeksKepuasanMasyarakat = new Elysia({
  prefix: "/indekskepuasanmasyarakat",
  tags: ["Landing Page/Profile/Indeks Kepuasan Masyarakat"],
})
.use(gender)
.use(monthlyStat)
.use(survey)
.use(response)
.use(age)


export default IndeksKepuasanMasyarakat