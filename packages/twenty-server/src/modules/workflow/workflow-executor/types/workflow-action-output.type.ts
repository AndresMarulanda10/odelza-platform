export type WorkflowActionOutput = {
  result?: object;
  error?: string;
  errorCode?: string;
  pendingEvent?: boolean;
  shouldEndWorkflowRun?: boolean;
  shouldRemainRunning?: boolean;
  shouldSkipStepExecution?: boolean;
  shouldFailSafely?: boolean;
};
