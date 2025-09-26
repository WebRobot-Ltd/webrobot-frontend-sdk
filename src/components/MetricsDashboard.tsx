/**
 * Metrics Dashboard Component per WebRobot Agentic System
 * ======================================================
 * 
 * Componente React per visualizzazione metriche Prometheus
 */

import React, { useState, useEffect, useCallback } from 'react';
import { WebRobotApiClient, createDefaultApiClient } from '../api-client';
import {
  SystemMetrics,
  AgentMetrics,
  RAGMetrics,
  RedisMetrics
} from '../types';

// =============================================================================
// PROPS E INTERFACES
// =============================================================================

export interface MetricsDashboardProps {
  apiClient?: WebRobotApiClient;
  refreshInterval?: number;
  className?: string;
  showSystemMetrics?: boolean;
  showAgentMetrics?: boolean;
  showRAGMetrics?: boolean;
  showRedisMetrics?: boolean;
}

export interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  color?: 'green' | 'yellow' | 'red' | 'blue';
  className?: string;
}

export interface ChartProps {
  data: Array<{ label: string; value: number; color?: string }>;
  type: 'bar' | 'line' | 'pie' | 'donut';
  title: string;
  className?: string;
}

// =============================================================================
// COMPONENTE METRIC CARD
// =============================================================================

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit = '',
  trend,
  trendValue,
  color = 'blue',
  className = ''
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '➡️';
      default: return '';
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      case 'stable': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className={`metric-card ${color} ${className}`}>
      <div className="metric-header">
        <h4 className="metric-title">{title}</h4>
        {trend && (
          <span className={`metric-trend ${getTrendColor()}`}>
            {getTrendIcon()} {trendValue ? `${trendValue}%` : ''}
          </span>
        )}
      </div>
      <div className="metric-value">
        {typeof value === 'number' ? value.toLocaleString() : value}
        {unit && <span className="metric-unit">{unit}</span>}
      </div>
    </div>
  );
};

// =============================================================================
// COMPONENTE CHART
// =============================================================================

export const Chart: React.FC<ChartProps> = ({
  data,
  type,
  title,
  className = ''
}) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  const renderBarChart = () => (
    <div className="bar-chart">
      {data.map((item, index) => (
        <div key={index} className="bar-item">
          <div className="bar-label">{item.label}</div>
          <div className="bar-container">
            <div
              className="bar-fill"
              style={{
                width: `${(item.value / maxValue) * 100}%`,
                backgroundColor: item.color || '#3b82f6'
              }}
            />
            <span className="bar-value">{item.value}</span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderPieChart = () => {
    let cumulativePercentage = 0;
    
    return (
      <div className="pie-chart">
        <svg viewBox="0 0 100 100" className="pie-svg">
          {data.map((item, index) => {
            const percentage = (item.value / data.reduce((sum, d) => sum + d.value, 0)) * 100;
            const startAngle = (cumulativePercentage / 100) * 360;
            const endAngle = ((cumulativePercentage + percentage) / 100) * 360;
            
            const startAngleRad = (startAngle - 90) * (Math.PI / 180);
            const endAngleRad = (endAngle - 90) * (Math.PI / 180);
            
            const x1 = 50 + 40 * Math.cos(startAngleRad);
            const y1 = 50 + 40 * Math.sin(startAngleRad);
            const x2 = 50 + 40 * Math.cos(endAngleRad);
            const y2 = 50 + 40 * Math.sin(endAngleRad);
            
            const largeArcFlag = percentage > 50 ? 1 : 0;
            
            const pathData = [
              `M 50 50 L ${x1} ${y1}`,
              `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              'Z'
            ].join(' ');
            
            cumulativePercentage += percentage;
            
            return (
              <path
                key={index}
                d={pathData}
                fill={item.color || `hsl(${index * 60}, 70%, 50%)`}
                stroke="white"
                strokeWidth="0.5"
              />
            );
          })}
        </svg>
        <div className="pie-legend">
          {data.map((item, index) => (
            <div key={index} className="legend-item">
              <div
                className="legend-color"
                style={{ backgroundColor: item.color || `hsl(${index * 60}, 70%, 50%)` }}
              />
              <span className="legend-label">{item.label}</span>
              <span className="legend-value">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderChart = () => {
    switch (type) {
      case 'bar': return renderBarChart();
      case 'pie': return renderPieChart();
      case 'donut': return renderPieChart(); // Simplified for now
      default: return renderBarChart();
    }
  };

  return (
    <div className={`chart ${className}`}>
      <h4 className="chart-title">{title}</h4>
      {renderChart()}
    </div>
  );
};

// =============================================================================
// COMPONENTE PRINCIPALE DASHBOARD
// =============================================================================

export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({
  apiClient,
  refreshInterval = 30000, // 30 secondi
  className = '',
  showSystemMetrics = true,
  showAgentMetrics = true,
  showRAGMetrics = true,
  showRedisMetrics = true
}) => {
  // =================================================================
  // STATE
  // =================================================================
  
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [agentMetrics, setAgentMetrics] = useState<AgentMetrics[]>([]);
  const [ragMetrics, setRAGMetrics] = useState<RAGMetrics[]>([]);
  const [redisMetrics, setRedisMetrics] = useState<RedisMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const client = apiClient || createDefaultApiClient();

  // =================================================================
  // EFFECTS
  // =================================================================
  
  useEffect(() => {
    loadMetrics();
    
    const interval = setInterval(loadMetrics, refreshInterval);
    
    return () => clearInterval(interval);
  }, [refreshInterval]);

  // =================================================================
  // DATA LOADING
  // =================================================================
  
  const loadMetrics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const promises = [];
      
      if (showSystemMetrics) {
        promises.push(client.getSystemMetrics().then(setSystemMetrics));
      }
      
      if (showAgentMetrics) {
        promises.push(client.getAgentMetrics().then(setAgentMetrics));
      }
      
      if (showRAGMetrics) {
        promises.push(client.getRAGMetrics().then(setRAGMetrics));
      }
      
      if (showRedisMetrics) {
        promises.push(client.getRedisMetrics().then(setRedisMetrics));
      }
      
      await Promise.all(promises);
      setLastUpdated(new Date());
      
    } catch (err) {
      console.error('Error loading metrics:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [client, showSystemMetrics, showAgentMetrics, showRAGMetrics, showRedisMetrics]);

  // =================================================================
  // UTILITY FUNCTIONS
  // =================================================================
  
  const formatBytes = (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getSuccessRateColor = (rate: number): 'green' | 'yellow' | 'red' => {
    if (rate >= 90) return 'green';
    if (rate >= 70) return 'yellow';
    return 'red';
  };

  // =================================================================
  // RENDER
  // =================================================================
  
  if (isLoading && !systemMetrics) {
    return (
      <div className={`metrics-dashboard loading ${className}`}>
        <div className="loading-spinner">⏳ Loading metrics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`metrics-dashboard error ${className}`}>
        <div className="error-message">
          ❌ Error loading metrics: {error}
          <button onClick={loadMetrics} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`metrics-dashboard ${className}`}>
      <div className="dashboard-header">
        <h2>System Metrics</h2>
        {lastUpdated && (
          <span className="last-updated">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
        )}
        <button onClick={loadMetrics} className="refresh-button">
          🔄 Refresh
        </button>
      </div>

      {/* System Metrics */}
      {showSystemMetrics && systemMetrics && (
        <div className="metrics-section">
          <h3>System Overview</h3>
          <div className="metrics-grid">
            <MetricCard
              title="Uptime"
              value={formatDuration(systemMetrics.uptime_seconds)}
              color="blue"
            />
            <MetricCard
              title="Memory Usage"
              value={formatBytes(systemMetrics.memory_usage_bytes)}
              color="yellow"
            />
            <MetricCard
              title="Active Sessions"
              value={systemMetrics.active_sessions}
              color="green"
            />
            <MetricCard
              title="Total Requests"
              value={systemMetrics.total_requests}
              color="blue"
            />
            <MetricCard
              title="Error Rate"
              value={`${systemMetrics.error_rate.toFixed(2)}%`}
              color={systemMetrics.error_rate > 5 ? 'red' : 'green'}
            />
            <MetricCard
              title="Avg Response Time"
              value={`${systemMetrics.average_response_time.toFixed(2)}ms`}
              color="blue"
            />
          </div>
        </div>
      )}

      {/* Agent Metrics */}
      {showAgentMetrics && agentMetrics.length > 0 && (
        <div className="metrics-section">
          <h3>Agent Performance</h3>
          <div className="metrics-grid">
            {agentMetrics.map((agent) => (
              <MetricCard
                key={`${agent.crew_name}-${agent.agent_name}`}
                title={`${agent.agent_name} (${agent.crew_name})`}
                value={`${agent.success_rate.toFixed(1)}%`}
                unit="success rate"
                color={getSuccessRateColor(agent.success_rate)}
              />
            ))}
          </div>
          
          <Chart
            data={agentMetrics.map(agent => ({
              label: agent.agent_name,
              value: agent.executions_total,
              color: getSuccessRateColor(agent.success_rate) === 'green' ? '#10b981' : 
                     getSuccessRateColor(agent.success_rate) === 'yellow' ? '#f59e0b' : '#ef4444'
            }))}
            type="bar"
            title="Agent Executions"
          />
        </div>
      )}

      {/* RAG Metrics */}
      {showRAGMetrics && ragMetrics.length > 0 && (
        <div className="metrics-section">
          <h3>RAG Performance</h3>
          <div className="metrics-grid">
            {ragMetrics.map((rag) => (
              <MetricCard
                key={rag.provider}
                title={`${rag.provider} RAG`}
                value={rag.queries_total}
                unit="queries"
                color="blue"
              />
            ))}
          </div>
          
          <Chart
            data={ragMetrics.map(rag => ({
              label: rag.provider,
              value: rag.documents_indexed,
              color: '#3b82f6'
            }))}
            type="pie"
            title="Documents Indexed by Provider"
          />
        </div>
      )}

      {/* Redis Metrics */}
      {showRedisMetrics && redisMetrics && (
        <div className="metrics-section">
          <h3>Redis Performance</h3>
          <div className="metrics-grid">
            <MetricCard
              title="Connections"
              value={redisMetrics.connections_total}
              color="green"
            />
            <MetricCard
              title="Operations"
              value={redisMetrics.operations_total}
              color="blue"
            />
            <MetricCard
              title="Memory Usage"
              value={formatBytes(redisMetrics.memory_usage_bytes)}
              color="yellow"
            />
            <MetricCard
              title="Keys Count"
              value={redisMetrics.keys_count}
              color="blue"
            />
            <MetricCard
              title="TTL"
              value={formatDuration(redisMetrics.ttl_seconds)}
              color="green"
            />
          </div>
        </div>
      )}
    </div>
  );
};

// =============================================================================
// EXPORT
// =============================================================================

export default MetricsDashboard;
