
export interface Metric {
  id: number;
  name: string;
  value: number;
  timestamp: string;
  model_id: number;
}

export type Model = {
  id: number;
  name: string;
  version: string;
  filename: string;
  upload_time: string;
  // task_type: 'classification' | 'regression' | null;
  task_type: 'classification' | 'regression' | undefined;
  latest_metrics: { [key: string]: number } | null;
  metrics: Metric[];
};

