import Elysia from "elysia";
import dashboardSummary from "./summary";

const DashboardKependudukan = new Elysia({
    prefix: "/dashboard",
    tags: ["Kependudukan/Dashboard"],
})
.get("/summary", dashboardSummary)

export default DashboardKependudukan;
