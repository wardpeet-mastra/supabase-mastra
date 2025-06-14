import { useEffect, useState, StrictMode, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { MastraClient, type GetWorkflowResponse, type GetWorkflowRunsResponse } from '@mastra/client-js';
import { MastraClientProvider, WorkflowGraph, WorkflowRunProvider, WorkflowTrigger } from '@mastra/playground-ui';


const clientOptions = {
  baseUrl: 'http://127.0.0.1:54321/functions/v1/',
  headers: {
    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
  },
}
const client = new MastraClient(clientOptions);

function App() {
  const workflowId = 'dummy';
  const [runId, setRunId] = useState<string | null>(null);
  const [workflow, setWorkflow] = useState<GetWorkflowResponse | null>(null);
  const [runs, setRuns] = useState<GetWorkflowRunsResponse | null>(null);

  useEffect(() => {
    let isCancelled = false;
    const workflow = client.getWorkflow(workflowId)
    workflow.details().then((info) => {
      if (!isCancelled) {
        setWorkflow(info);
      }
    })

    workflow.runs().then((runs) => {
      if (!isCancelled) {
        setRuns(runs);
      }
    })

    return () => {
      isCancelled = true;
    }
  }, []);

  const currentRun = useMemo(() => runs?.data?.find((run) => run.id === runId), [runs, runId]);

  return (
    <MastraClientProvider {...clientOptions}>
      <WorkflowRunProvider snapshot={currentRun ? currentRun.snapshot : undefined}>
        <div className='flex flex-row gap-4' style={{ backgroundColor: 'black' }}>
          <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
            <WorkflowGraph
              isLoading={!workflow}
              workflowId={workflowId}
              workflow={workflow}
              onShowTrace={() => { }}
            />
          </div>
          <div style={{ width: 300 }}>
            <WorkflowTrigger isLoading={!workflow}
              workflowId={workflowId}
              workflow={workflow}
              setRunId={(runId: string) => {
                setRunId(runId);
              }}
            />
          </div>
        </div>
      </WorkflowRunProvider>
    </MastraClientProvider >

  )
}


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
