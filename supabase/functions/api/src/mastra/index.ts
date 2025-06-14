import { Mastra } from "@mastra/core/mastra";
import { dummyWorkflow } from "./workflows/test.ts";

export const mastra = new Mastra({
  workflows: {
    dummy: dummyWorkflow,
  },
});
