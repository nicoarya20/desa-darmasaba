import Elysia from "elysia";
import searchFindMany from "./findMany";

const Search = new Elysia({
  prefix: "/search",
  tags: ["Search"],
})
  .get("/findMany", searchFindMany);

export default Search;
