/**
 * WebRobot Agentic System Frontend SDK
 * ====================================
 * 
 * Entry point principale per il SDK TypeScript
 */

// =============================================================================
// TYPES
// =============================================================================
export * from './types';

// =============================================================================
// API CLIENT
// =============================================================================
export {
  WebRobotApiClient,
  createApiClient,
  createDefaultApiClient,
  useApiClient,
  ApiClientError,
  type ApiClientConfig
} from './api-client';

// =============================================================================
// REACT COMPONENTS
// =============================================================================
export {
  ChatInterface,
  ChatMessage,
  type ChatInterfaceProps,
  type ChatMessageProps
} from './components/ChatInterface';

export {
  MetricsDashboard,
  MetricCard,
  Chart,
  type MetricsDashboardProps,
  type MetricCardProps,
  type ChartProps
} from './components/MetricsDashboard';

// =============================================================================
// UTILITIES
// =============================================================================
export const SDK_VERSION = '1.0.0';
export const SUPPORTED_API_VERSION = '1.0.0';

// =============================================================================
// DEFAULT EXPORT
// =============================================================================
export { WebRobotApiClient as default } from './api-client';
