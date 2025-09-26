/**
 * WebRobot Agentic System API Client
 * ==================================
 * 
 * Client TypeScript per integrazione con backend CrewAI
 * Supporta REST API, WebSocket e gestione errori completa
 */

import {
  ApiResponse,
  Session,
  Message,
  Conversation,
  AgenticStartRequest,
  AgenticStartResponse,
  AgenticResumeRequest,
  AgenticResumeResponse,
  Agent,
  Crew,
  RAGProvider,
  RAGQuery,
  RAGQueryResponse,
  ETLPipeline,
  ScrapingJob,
  Visualization,
  SystemMetrics,
  AgentMetrics,
  RAGMetrics,
  RedisMetrics,
  SystemConfiguration,
  ApiError,
  WebSocketEvent,
  AgentExecutionEvent,
  HumanLoopEvent,
  RAGQueryEvent
} from './types';

// =============================================================================
// CONFIGURAZIONE CLIENT
// =============================================================================

export interface ApiClientConfig {
  baseUrl: string;
  wsUrl?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  apiKey?: string;
  headers?: Record<string, string>;
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

// =============================================================================
// CLIENT PRINCIPALE
// =============================================================================

export class WebRobotApiClient {
  private config: Required<ApiClientConfig>;
  private wsConnection?: WebSocket;
  private eventListeners: Map<string, Set<(event: WebSocketEvent) => void>> = new Map();

  constructor(config: ApiClientConfig) {
    this.config = {
      baseUrl: config.baseUrl,
      wsUrl: config.wsUrl || config.baseUrl.replace('http', 'ws'),
      timeout: config.timeout || 30000,
      retries: config.retries || 3,
      retryDelay: config.retryDelay || 1000,
      apiKey: config.apiKey || '',
      headers: {
        'Content-Type': 'application/json',
        ...config.headers
      }
    };
  }

  // =================================================================
  // METODI UTILITY
  // =================================================================

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...this.config.headers,
        ...options.headers
      }
    };

    if (this.config.apiKey) {
      requestOptions.headers = {
        ...requestOptions.headers,
        'Authorization': `Bearer ${this.config.apiKey}`
      };
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.config.retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        const response = await fetch(url, {
          ...requestOptions,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new ApiClientError(
            errorData.message || `HTTP ${response.status}: ${response.statusText}`,
            response.status,
            errorData.code,
            errorData
          );
        }

        const data = await response.json();
        return data;

      } catch (error) {
        lastError = error as Error;
        
        if (attempt < this.config.retries) {
          await new Promise(resolve => 
            setTimeout(resolve, this.config.retryDelay * Math.pow(2, attempt))
          );
          continue;
        }
      }
    }

    throw lastError || new ApiClientError('Request failed after all retries');
  }

  // =================================================================
  // SESSIONI E CONVERSAZIONI
  // =================================================================

  async createSession(userId?: string): Promise<Session> {
    const response = await this.request<ApiResponse<Session>>('/session', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId })
    });
    return response.data!;
  }

  async getSession(sessionId: string): Promise<Session> {
    const response = await this.request<ApiResponse<Session>>(`/session/${sessionId}`);
    return response.data!;
  }

  async getConversation(sessionId: string): Promise<Conversation> {
    const response = await this.request<ApiResponse<Conversation>>(`/conversation/${sessionId}`);
    return response.data!;
  }

  async clearSession(sessionId: string): Promise<void> {
    await this.request(`/session/${sessionId}`, { method: 'DELETE' });
  }

  async exportSession(sessionId: string): Promise<any> {
    const response = await this.request<ApiResponse<any>>(`/export-session/${sessionId}`);
    return response.data!;
  }

  // =================================================================
  // AGENTIC SYSTEM
  // =================================================================

  async startAgenticExecution(request: AgenticStartRequest): Promise<AgenticStartResponse> {
    const response = await this.request<ApiResponse<AgenticStartResponse>>('/agentic/start', {
      method: 'POST',
      body: JSON.stringify(request)
    });
    return response.data!;
  }

  async resumeAgenticExecution(request: AgenticResumeRequest): Promise<AgenticResumeResponse> {
    const response = await this.request<ApiResponse<AgenticResumeResponse>>('/agentic/resume', {
      method: 'POST',
      body: JSON.stringify(request)
    });
    return response.data!;
  }

  // =================================================================
  // MESSAGGI E CHAT
  // =================================================================

  async sendMessage(sessionId: string, content: string, metadata?: Record<string, any>): Promise<Message> {
    const response = await this.request<ApiResponse<Message>>('/message', {
      method: 'POST',
      body: JSON.stringify({
        session_id: sessionId,
        content,
        metadata
      })
    });
    return response.data!;
  }

  async getMessages(sessionId: string, limit?: number, offset?: number): Promise<Message[]> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());

    const response = await this.request<ApiResponse<Message[]>>(
      `/messages/${sessionId}?${params.toString()}`
    );
    return response.data!;
  }

  // =================================================================
  // AGENTI E CREW
  // =================================================================

  async getAgents(): Promise<Agent[]> {
    const response = await this.request<ApiResponse<Agent[]>>('/agents');
    return response.data!;
  }

  async getAgent(agentName: string): Promise<Agent> {
    const response = await this.request<ApiResponse<Agent>>(`/agents/${agentName}`);
    return response.data!;
  }

  async getCrews(): Promise<Crew[]> {
    const response = await this.request<ApiResponse<Crew[]>>('/crews');
    return response.data!;
  }

  async getCrew(crewName: string): Promise<Crew> {
    const response = await this.request<ApiResponse<Crew>>(`/crews/${crewName}`);
    return response.data!;
  }

  // =================================================================
  // RAG E KNOWLEDGE BASE
  // =================================================================

  async getRAGProviders(): Promise<RAGProvider[]> {
    const response = await this.request<ApiResponse<RAGProvider[]>>('/rag/providers');
    return response.data!;
  }

  async queryRAG(request: RAGQuery): Promise<RAGQueryResponse> {
    const response = await this.request<ApiResponse<RAGQueryResponse>>('/rag/query', {
      method: 'POST',
      body: JSON.stringify(request)
    });
    return response.data!;
  }

  async addDocument(provider: string, document: any): Promise<boolean> {
    const response = await this.request<ApiResponse<boolean>>(`/rag/documents/${provider}`, {
      method: 'POST',
      body: JSON.stringify(document)
    });
    return response.data!;
  }

  // =================================================================
  // ETL E DATA PIPELINES
  // =================================================================

  async getETLPipelines(): Promise<ETLPipeline[]> {
    const response = await this.request<ApiResponse<ETLPipeline[]>>('/etl/pipelines');
    return response.data!;
  }

  async getETLPipeline(pipelineId: string): Promise<ETLPipeline> {
    const response = await this.request<ApiResponse<ETLPipeline>>(`/etl/pipelines/${pipelineId}`);
    return response.data!;
  }

  async createETLPipeline(pipeline: Partial<ETLPipeline>): Promise<ETLPipeline> {
    const response = await this.request<ApiResponse<ETLPipeline>>('/etl/pipelines', {
      method: 'POST',
      body: JSON.stringify(pipeline)
    });
    return response.data!;
  }

  async executeETLPipeline(pipelineId: string): Promise<ETLPipeline> {
    const response = await this.request<ApiResponse<ETLPipeline>>(`/etl/pipelines/${pipelineId}/execute`, {
      method: 'POST'
    });
    return response.data!;
  }

  // =================================================================
  // WEB SCRAPING
  // =================================================================

  async getScrapingJobs(): Promise<ScrapingJob[]> {
    const response = await this.request<ApiResponse<ScrapingJob[]>>('/scraping/jobs');
    return response.data!;
  }

  async getScrapingJob(jobId: string): Promise<ScrapingJob> {
    const response = await this.request<ApiResponse<ScrapingJob>>(`/scraping/jobs/${jobId}`);
    return response.data!;
  }

  async createScrapingJob(job: Partial<ScrapingJob>): Promise<ScrapingJob> {
    const response = await this.request<ApiResponse<ScrapingJob>>('/scraping/jobs', {
      method: 'POST',
      body: JSON.stringify(job)
    });
    return response.data!;
  }

  async executeScrapingJob(jobId: string): Promise<ScrapingJob> {
    const response = await this.request<ApiResponse<ScrapingJob>>(`/scraping/jobs/${jobId}/execute`, {
      method: 'POST'
    });
    return response.data!;
  }

  // =================================================================
  // VISUALIZZAZIONI
  // =================================================================

  async getVisualizations(): Promise<Visualization[]> {
    const response = await this.request<ApiResponse<Visualization[]>>('/visualizations');
    return response.data!;
  }

  async getVisualization(vizId: string): Promise<Visualization> {
    const response = await this.request<ApiResponse<Visualization>>(`/visualizations/${vizId}`);
    return response.data!;
  }

  async createVisualization(viz: Partial<Visualization>): Promise<Visualization> {
    const response = await this.request<ApiResponse<Visualization>>('/visualizations', {
      method: 'POST',
      body: JSON.stringify(viz)
    });
    return response.data!;
  }

  // =================================================================
  // MONITORING E METRICHE
  // =================================================================

  async getSystemMetrics(): Promise<SystemMetrics> {
    const response = await this.request<ApiResponse<SystemMetrics>>('/metrics/system');
    return response.data!;
  }

  async getAgentMetrics(): Promise<AgentMetrics[]> {
    const response = await this.request<ApiResponse<AgentMetrics[]>>('/metrics/agents');
    return response.data!;
  }

  async getRAGMetrics(): Promise<RAGMetrics[]> {
    const response = await this.request<ApiResponse<RAGMetrics[]>>('/metrics/rag');
    return response.data!;
  }

  async getRedisMetrics(): Promise<RedisMetrics> {
    const response = await this.request<ApiResponse<RedisMetrics>>('/metrics/redis');
    return response.data!;
  }

  async getHealthStatus(): Promise<any> {
    const response = await this.request<ApiResponse<any>>('/health');
    return response.data!;
  }

  // =================================================================
  // CONFIGURAZIONE
  // =================================================================

  async getSystemConfiguration(): Promise<SystemConfiguration> {
    const response = await this.request<ApiResponse<SystemConfiguration>>('/config');
    return response.data!;
  }

  async updateSystemConfiguration(config: Partial<SystemConfiguration>): Promise<SystemConfiguration> {
    const response = await this.request<ApiResponse<SystemConfiguration>>('/config', {
      method: 'PUT',
      body: JSON.stringify(config)
    });
    return response.data!;
  }

  // =================================================================
  // WEBSOCKET
  // =================================================================

  connectWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.wsConnection = new WebSocket(this.config.wsUrl);

        this.wsConnection.onopen = () => {
          console.log('WebSocket connected');
          resolve();
        };

        this.wsConnection.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data) as WebSocketEvent;
            this.emitEvent(data.type, data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.wsConnection.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

        this.wsConnection.onclose = () => {
          console.log('WebSocket disconnected');
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  disconnectWebSocket(): void {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = undefined;
    }
  }

  // =================================================================
  // EVENT LISTENERS
  // =================================================================

  on(eventType: string, callback: (event: WebSocketEvent) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(callback);
  }

  off(eventType: string, callback: (event: WebSocketEvent) => void): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  private emitEvent(eventType: string, event: WebSocketEvent): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.forEach(callback => callback(event));
    }
  }

  // =================================================================
  // METODI SPECIALIZZATI PER EVENTI
  // =================================================================

  onAgentExecution(callback: (event: AgentExecutionEvent) => void): void {
    this.on('agent_execution_started', callback);
    this.on('agent_execution_completed', callback);
    this.on('agent_execution_failed', callback);
  }

  onHumanLoop(callback: (event: HumanLoopEvent) => void): void {
    this.on('human_loop_pause', callback);
    this.on('human_loop_resume', callback);
  }

  onRAGQuery(callback: (event: RAGQueryEvent) => void): void {
    this.on('rag_query_started', callback);
    this.on('rag_query_completed', callback);
    this.on('rag_query_failed', callback);
  }
}

// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================

export function createApiClient(config: ApiClientConfig): WebRobotApiClient {
  return new WebRobotApiClient(config);
}

export function createDefaultApiClient(baseUrl: string = 'http://localhost:5000'): WebRobotApiClient {
  return new WebRobotApiClient({
    baseUrl,
    wsUrl: baseUrl.replace('http', 'ws'),
    timeout: 30000,
    retries: 3,
    retryDelay: 1000
  });
}

// =============================================================================
// HOOKS PER REACT (se usato con React)
// =============================================================================

export interface UseApiClientOptions {
  baseUrl?: string;
  autoConnect?: boolean;
  retryOnError?: boolean;
}

export function useApiClient(options: UseApiClientOptions = {}) {
  const client = createDefaultApiClient(options.baseUrl);
  
  // Se usato con React, implementare useEffect per autoConnect
  // e useState per gestire stato connessione
  
  return {
    client,
    isConnected: false, // Implementare con useState
    connect: () => client.connectWebSocket(),
    disconnect: () => client.disconnectWebSocket()
  };
}
