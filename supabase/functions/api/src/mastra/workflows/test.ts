import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
const cityCoordinatesStep = createStep({
  id: "test-step",
  description: "Gets the city name",
  inputSchema: z.object({
    city: z.string(),
  }),
  outputSchema: z.object({
    city_name: z.string(),
  }),
  execute: async ({ inputData }) => {
    return {
      city_name: inputData.city,
    };
  },
});
const step2 = createStep({
  id: "test-step2",
  description: "Gets the city name",
  inputSchema: z.object({
    city_name: z.string(),
  }),
  outputSchema: z.object({
    city_name: z.string(),
  }),
  execute: async ({ inputData }) => {
    await new Promise((resolve) => setTimeout(resolve, 3000));

    return {
      city_name: inputData.city_name,
    };
  },
});
export const dummyWorkflow = createWorkflow({
  id: "dummy",
  description: "A dummy workflow to test visualisation",
  steps: [cityCoordinatesStep, step2],
  inputSchema: z.object({
    city: z.string(),
  }),
  outputSchema: z.object({
    city_name: z.string(),
  }),
})
  .then(cityCoordinatesStep)
  .then(step2)
  .commit();
