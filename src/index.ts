import { Elysia } from "elysia";
import { twitter } from "./routes/twitter";
import cors from "@elysiajs/cors";

const app = new Elysia()
  .use(cors())
  .get("/", () => {
    return {
      contentType: "",
      Response: "Noor.to Avatars",
    };
  })
  .get("/twitter/:username", twitter)
  .listen(3000);

console.log(
  `Server is running on  http://${app.server?.hostname}:${app.server?.port}`
);
