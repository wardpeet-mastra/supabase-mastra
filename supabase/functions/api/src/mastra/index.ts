import { Mastra } from "@mastra/core/mastra";
import { dummyWorkflow } from "./workflows/test.ts";
import { PostgresStore } from "@mastra/pg";
import process from "node:process";
console.log(process.env.SUPABASE_DB_URL);
const storage = new PostgresStore({
  connectionString: process.env.SUPABASE_DB_URL!,
});

export const mastra = new Mastra({
  storage,
  workflows: {
    dummy: dummyWorkflow,
  },
});
