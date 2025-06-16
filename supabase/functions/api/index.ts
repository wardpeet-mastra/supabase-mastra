import { Hono } from "jsr:@hono/hono";
import { cors } from "jsr:@hono/hono/cors";
import {
  getWorkflowByIdHandler,
  getWorkflowRunsHandler,
  createWorkflowRunHandler,
  startWorkflowRunHandler,
  watchWorkflowHandler,
} from "@mastra/server/handlers/workflows";
import { mastra } from "./src/mastra/index.ts";
// You can set the basePath with Hono
const functionName = "api";
const app = new Hono().basePath(`/${functionName}`);
// /tasks/id
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);
app.get("workflows/:id", async (c) => {
  const id = c.req.param("id");
  return c.json(
    await getWorkflowByIdHandler({
      mastra,
      workflowId: id,
    })
  );
});
app.get("workflows/:id/runs", async (c) => {
  const id = c.req.param("id");
  return c.json(
    await getWorkflowRunsHandler({
      mastra,
      workflowId: id,
    })
  );
});
app.post("workflows/:id/create-run", async (c) => {
  const id = c.req.param("id");
  const prevRunId = c.req.query("runId");
  try {
    return c.json(
      await createWorkflowRunHandler({
        mastra,
        workflowId: id,
        runId: prevRunId,
      })
    );
  } catch (error) {
    console.log(error);
    return c.json(
      {
        error: "Failed to create run",
      },
      500
    );
  }
});
app.post("workflows/:id/start", async (c) => {
  const id = c.req.param("id");
  const { inputData } = await c.req.json();
  const runId = c.req.query("runId");
  try {
    return c.json(
      await startWorkflowRunHandler({
        mastra,
        workflowId: id,
        inputData,
        runId,
      })
    );
  } catch (error) {
    console.log(error);
    return c.json(
      {
        error: "Failed to start run",
      },
      500
    );
  }
});
app.get("workflows/:id/watch", async (c) => {
  const id = c.req.param("id");
  const runId = c.req.query("runId");
  try {
    return c.json(
      await watchWorkflowHandler({
        mastra,
        workflowId: id,
        runId,
      })
    );
  } catch (error) {
    return c.json(
      {
        error: "Failed to watch workflow",
      },
      500
    );
  }
});
Deno.serve(app.fetch);
