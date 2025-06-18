import { Hono } from "jsr:@hono/hono";
import { cors } from "jsr:@hono/hono/cors";
import { HTTPException } from "jsr:@hono/hono/http-exception";
import { stream } from "jsr:@hono/hono/streaming";
import {
  getWorkflowByIdHandler,
  getWorkflowRunsHandler,
  createWorkflowRunHandler,
  startWorkflowRunHandler,
} from "@mastra/server/handlers/workflows";
import { mastra } from "./src/mastra/index.ts";
import { WorkflowRunState } from "@mastra/core/workflows";
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
  console.log({ runId, inputData });
  try {
    const result = await startWorkflowRunHandler({
      mastra,
      workflowId: id,
      inputData,
      runId,
    });

    await new Promise((resolve) => setTimeout(resolve, 5000));
    return c.json(result);
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

app.get("workflows/:id/watch", (c) => {
  try {
    console.log("watch workflow");
    const logger = mastra.getLogger();
    const id = c.req.param("id");
    const runId = c.req.query("runId");

    if (!runId) {
      throw new HTTPException(400, {
        message: "runId required to watch workflow",
      });
    }

    const seenSnapshots = new Set<number>();
    return stream(
      c,
      async (stream) => {
        try {
          const storage = mastra.getStorage();
          if (!storage) {
            throw new HTTPException(500, {
              message: "Storage not found",
            });
          }

          let i = 0;
          let snapshot: WorkflowRunState | null = null;
          // Polling datatabse for status, need to implement some kind of pubsub to make it work in Deno,
          // Works for now, just not perfect
          while (
            snapshot === null ||
            (snapshot.status !== "success" && snapshot.status !== "failed")
          ) {
            console.log("load snapshot", { id, runId, i });

            snapshot = await storage!.loadWorkflowSnapshot({
              workflowName: id,
              runId,
            });

            if (!snapshot) {
              throw new HTTPException(500, {
                message: "Snapshot not found",
              });
            }

            const chunk = {
              type: "watch",
              payload: {
                // not supported now...
                // currentStep: {
                //   id: "test-step",
                //   status: "running",
                //   payload: {
                //     city: "Ibadan",
                //   },
                //   startedAt: 1750253045265,
                // },
                result: snapshot.result,
                error: snapshot.error,
                workflowState: {
                  status: snapshot.status,
                  steps: snapshot.context,
                  result: snapshot.result,
                  error: snapshot.error,
                },
              },
              eventTimestamp: snapshot.timestamp,
              runId,
            };

            // console.log("chunk", chunk);
            if (!seenSnapshots.has(chunk.eventTimestamp)) {
              await stream.write(JSON.stringify(chunk) + "\x1E");
              seenSnapshots.add(chunk.eventTimestamp);
            }
            await new Promise((resolve) => setTimeout(resolve, 300));
          }
          console.log("done");
        } catch (err) {
          console.log("error????");
          mastra
            .getLogger()
            .error(
              "Error in watch stream: " +
                ((err as Error)?.message ?? "Unknown error")
            );
        }
      },
      async (err) => {
        console.log("wtf???");
        logger.error("Error in watch stream: " + err?.message);
      }
    );
  } catch (error) {
    console.log("error", error);
    return c.json(
      {
        error: "Failed to watch workflow",
      },
      500
    );
  }
});

Deno.serve(app.fetch);
