/**
 * TypeScript Types per WebRobot Agentic System
 * ============================================
 * 
 * Definizioni complete per integrazione frontend Next.js
 */

// =============================================================================
// TIPI BASE
// =============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// =============================================================================
// SESSIONI E CONVERSAZIONI
// =============================================================================

export interface Session {
  session_id: string;
  user_id?: string;
  created_at: string;
  updated_at: string;
  status: 'active' | 'paused' | 'completed' | 'failed';
  metadata?: Record<string, any>;
}

export interface Message {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    agent_name?: string;
    crew_name?: string;
    tool_used?: string;
    execution_time?: number;
    human_loop_pause?: boolean;
  };
}

export interface Conversation {
  session: Session;
  messages: Message[];
  total_messages: number;
}

// =============================================================================
// AGENTIC SYSTEM
// =============================================================================

export interface AgenticStartRequest {
  prompt: string;
  humanLoop?: boolean;
  session_id?: string;
  user_id?: string;
  context?: Record<string, any>;
}

export interface AgenticStartResponse {
  execution_id: string;
  session_id: string;
  status: 'started' | 'paused' | 'completed' | 'failed';
  message: string;
  next_action?: string;
  human_input_required?: boolean;
  budget_status?: {
    remaining_credits?: number;
    estimated_cost?: number;
    currency?: string;
  };
  agents_involved?: string[];
  estimated_duration?: number;
}

export interface AgenticResumeRequest {
  execution_id: string;
  human_input?: string;
  continue_automatically?: boolean;
}

export interface AgenticResumeResponse {
  execution_id: string;
  session_id: string;
  status: 'resumed' | 'completed' | 'failed' | 'paused';
  message: string;
  next_action?: string;
  human_input_required?: boolean;
  budget_status?: {
    remaining_credits?: number;
    estimated_cost?: number;
    currency?: string;
  };
  agents_involved?: string[];
  progress_percentage?: number;
}

// =============================================================================
// AGENTI E CREW
// =============================================================================

export interface Agent {
  name: string;
  role: string;
  description: string;
  status: 'active' | 'inactive' | 'error';
  last_execution?: string;
  execution_count: number;
  success_rate: number;
  average_duration: number;
}

export interface Crew {
  name: string;
  description: string;
  agents: Agent[];
  status: 'active' | 'inactive' | 'error';
  last_execution?: string;
  execution_count: number;
  success_rate: number;
}

// =============================================================================
// RAG E KNOWLEDGE BASE
// =============================================================================

export interface RAGProvider {
  name: string;
  type: 'llamaindex_cloud' | 'haystack' | 'weaviate' | 'chroma' | 'milvus';
  status: 'active' | 'inactive' | 'error';
  documents_count: number;
  last_updated: string;
  fallback_enabled: boolean;
}

export interface Document {
  id: string;
  content: string;
  metadata: Record<string, any>;
  provider: string;
  indexed_at: string;
  vector_id?: string;
}

export interface RAGQuery {
  query: string;
  provider?: string;
  top_k?: number;
  filters?: Record<string, any>;
}

export interface RAGQueryResponse {
  results: Document[];
  provider_used: string;
  fallback_used: boolean;
  execution_time: number;
  total_documents: number;
}

// =============================================================================
// ETL E DATA PIPELINES
// =============================================================================

export interface ETLPipeline {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'completed' | 'failed' | 'paused';
  created_at: string;
  updated_at: string;
  created_by: string;
  complexity: 'simple' | 'medium' | 'complex';
  estimated_duration: number;
  actual_duration?: number;
  steps: ETLStep[];
  input_sources: DataSource[];
  output_targets: DataTarget[];
}

export interface ETLStep {
  id: string;
  name: string;
  type: 'extract' | 'transform' | 'load' | 'validate' | 'clean';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  order: number;
  configuration: Record<string, any>;
  input_schema?: Record<string, any>;
  output_schema?: Record<string, any>;
  execution_time?: number;
  error_message?: string;
}

export interface DataSource {
  id: string;
  name: string;
  type: 'database' | 'api' | 'file' | 'stream' | 'web_scraping';
  connection_string?: string;
  configuration: Record<string, any>;
  schema?: Record<string, any>;
  last_updated: string;
}

export interface DataTarget {
  id: string;
  name: string;
  type: 'database' | 'api' | 'file' | 'data_warehouse' | 'lake';
  connection_string?: string;
  configuration: Record<string, any>;
  schema?: Record<string, any>;
  last_updated: string;
}

// =============================================================================
// WEB SCRAPING
// =============================================================================

export interface ScrapingJob {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  created_at: string;
  started_at?: string;
  completed_at?: string;
  provider: 'apify' | 'zyte' | 'custom';
  configuration: ScrapingConfiguration;
  results?: ScrapingResults;
  error_message?: string;
}

export interface ScrapingConfiguration {
  urls: string[];
  selectors?: Record<string, string>;
  pagination?: {
    enabled: boolean;
    next_page_selector?: string;
    max_pages?: number;
  };
  data_extraction?: {
    fields: Array<{
      name: string;
      selector: string;
      type: 'text' | 'attribute' | 'html';
      attribute?: string;
    }>;
  };
  rate_limiting?: {
    requests_per_minute: number;
    delay_between_requests: number;
  };
  proxy?: {
    enabled: boolean;
    rotation: boolean;
  };
}

export interface ScrapingResults {
  total_pages_scraped: number;
  total_records: number;
  data: Record<string, any>[];
  files_downloaded?: string[];
  errors: Array<{
    url: string;
    error: string;
    timestamp: string;
  }>;
}

// =============================================================================
// VISUALIZZAZIONI E DASHBOARD
// =============================================================================

export interface Visualization {
  id: string;
  name: string;
  type: 'chart' | 'table' | 'dashboard' | 'report';
  status: 'draft' | 'generating' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  created_by: string;
  configuration: VisualizationConfiguration;
  data_source?: string;
  superset_dashboard_id?: string;
  preview_url?: string;
}

export interface VisualizationConfiguration {
  chart_type: 'line' | 'bar' | 'pie' | 'scatter' | 'heatmap' | 'table';
  title: string;
  description?: string;
  x_axis?: string;
  y_axis?: string;
  color_by?: string;
  filters?: Record<string, any>;
  aggregation?: {
    function: 'sum' | 'avg' | 'count' | 'min' | 'max';
    field: string;
  };
  time_range?: {
    start: string;
    end: string;
    granularity: 'hour' | 'day' | 'week' | 'month' | 'year';
  };
}

// =============================================================================
// MONITORING E OSSERVABILITÀ
// =============================================================================

export interface SystemMetrics {
  uptime_seconds: number;
  memory_usage_bytes: number;
  cpu_usage_percent: number;
  active_sessions: number;
  total_requests: number;
  error_rate: number;
  average_response_time: number;
}

export interface AgentMetrics {
  agent_name: string;
  crew_name: string;
  executions_total: number;
  errors_total: number;
  average_duration: number;
  success_rate: number;
  last_execution: string;
}

export interface RAGMetrics {
  provider: string;
  queries_total: number;
  documents_indexed: number;
  average_query_time: number;
  fallback_count: number;
  error_rate: number;
}

export interface RedisMetrics {
  connections_total: number;
  operations_total: number;
  memory_usage_bytes: number;
  keys_count: number;
  ttl_seconds: number;
}

// =============================================================================
// CONFIGURAZIONE E SETTINGS
// =============================================================================

export interface SystemConfiguration {
  rag: {
    default_provider: string;
    fallback_enabled: boolean;
    max_documents: number;
    query_timeout: number;
  };
  agents: {
    max_concurrent_executions: number;
    execution_timeout: number;
    human_loop_enabled: boolean;
  };
  redis: {
    host: string;
    port: number;
    db: number;
    ttl_seconds: number;
  };
  monitoring: {
    metrics_enabled: boolean;
    prometheus_endpoint: string;
    health_check_interval: number;
  };
}

// =============================================================================
// ERRORI E ECCEZIONI
// =============================================================================

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  request_id?: string;
}

export interface ValidationError extends ApiError {
  code: 'VALIDATION_ERROR';
  field_errors: Array<{
    field: string;
    message: string;
    value?: any;
  }>;
}

export interface AgentError extends ApiError {
  code: 'AGENT_ERROR';
  agent_name: string;
  crew_name: string;
  execution_id?: string;
}

export interface RAGError extends ApiError {
  code: 'RAG_ERROR';
  provider: string;
  query?: string;
  fallback_used?: boolean;
}

// =============================================================================
// WEBSOCKET EVENTS
// =============================================================================

export interface WebSocketEvent {
  type: string;
  timestamp: string;
  data: any;
}

export interface AgentExecutionEvent extends WebSocketEvent {
  type: 'agent_execution_started' | 'agent_execution_completed' | 'agent_execution_failed';
  data: {
    agent_name: string;
    crew_name: string;
    execution_id: string;
    duration?: number;
    error?: string;
  };
}

export interface HumanLoopEvent extends WebSocketEvent {
  type: 'human_loop_pause' | 'human_loop_resume';
  data: {
    execution_id: string;
    session_id: string;
    agent_name: string;
    reason?: string;
    human_input?: string;
  };
}

export interface RAGQueryEvent extends WebSocketEvent {
  type: 'rag_query_started' | 'rag_query_completed' | 'rag_query_failed';
  data: {
    query: string;
    provider: string;
    execution_time?: number;
    results_count?: number;
    fallback_used?: boolean;
  };
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type AgentName = 'data_engineer' | 'web_scraper' | 'scraping_orchestrator' | 'data_visualization';
export type CrewName = 'etl_crew' | 'scraping_crew' | 'bi_reporting_crew';
export type RAGProviderType = 'llamaindex_cloud' | 'haystack' | 'weaviate' | 'chroma' | 'milvus';
export type ETLStepType = 'extract' | 'transform' | 'load' | 'validate' | 'clean';
export type VisualizationType = 'chart' | 'table' | 'dashboard' | 'report';
export type ChartType = 'line' | 'bar' | 'pie' | 'scatter' | 'heatmap' | 'table';
export type SessionStatus = 'active' | 'paused' | 'completed' | 'failed';
export type AgentStatus = 'active' | 'inactive' | 'error';
export type ETLPipelineStatus = 'draft' | 'running' | 'completed' | 'failed' | 'paused';
export type ScrapingJobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'paused';
