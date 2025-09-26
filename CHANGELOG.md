# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release of WebRobot Frontend SDK
- TypeScript types for complete API integration
- React components for chat interface and metrics dashboard
- WebSocket support for real-time events
- Human-in-the-loop functionality
- Prometheus metrics integration
- Comprehensive error handling and retry logic

### Features
- **API Client**: Complete REST and WebSocket client
- **Chat Interface**: React component with human-in-the-loop support
- **Metrics Dashboard**: Real-time system monitoring
- **TypeScript**: Full type safety and IntelliSense support
- **Error Handling**: Robust error handling with automatic retry
- **WebSocket Events**: Real-time agent execution and human loop events

## [1.0.0] - 2025-01-03

### Added
- Initial release
- Core API client with REST and WebSocket support
- React components for chat and metrics
- TypeScript definitions for all API endpoints
- GitHub Packages publishing configuration
- Jenkins deployment pipeline
- Comprehensive documentation

### API Endpoints Supported
- Session management
- Agentic execution (start/resume)
- Message handling
- RAG queries
- ETL pipeline management
- Web scraping jobs
- Visualization creation
- System metrics

### React Components
- `ChatInterface`: Main chat component with human-in-the-loop
- `ChatMessage`: Individual message component
- `MetricsDashboard`: System metrics visualization
- `MetricCard`: Individual metric display
- `Chart`: Data visualization component

### WebSocket Events
- Agent execution events
- Human loop pause/resume events
- RAG query events
- Custom event handling

## [0.1.0] - 2025-01-02

### Added
- Initial development version
- Basic TypeScript structure
- Core API client implementation
- React component scaffolding
