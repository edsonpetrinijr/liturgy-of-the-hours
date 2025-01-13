import cors from "@fastify/cors";
import Fastify from "fastify";

import { liturgyController } from "./controllers/LiturgyController";

const app = Fastify();

app.register(cors, {
  origin: "http://localhost:3000",
});

app.register(liturgyController);

app.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.log(err);
    process.exit(1);
  }
  console.log(`Server running at ${address}`);
});
