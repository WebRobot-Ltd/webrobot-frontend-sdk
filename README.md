# WebRobot Agentic System Frontend SDK

TypeScript SDK per integrazione con il sistema agentico WebRobot basato su CrewAI.

## 🚀 Caratteristiche

- **API Client completo** con supporto REST e WebSocket
- **Componenti React** per chat interface e metrics dashboard
- **TypeScript completo** con tipi definiti per tutto il sistema
- **Human-in-the-loop** support per interruzioni agenti
- **Monitoring integrato** con Prometheus metrics
- **Gestione errori robusta** con retry automatico
- **WebSocket real-time** per eventi live

## 📦 Installazione

```bash
npm install @webrobot/frontend-sdk
# oppure
yarn add @webrobot/frontend-sdk
```

## 🔧 Configurazione

### Basic Setup

```typescript
import { createDefaultApiClient, ChatInterface } from '@webrobot/frontend-sdk';

// Crea client API
const apiClient = createDefaultApiClient('http://localhost:5000');

// Usa componente chat
function App() {
  return (
    <ChatInterface
      apiClient={apiClient}
      enableHumanLoop={true}
      onMessageSent={(message) => console.log('Message sent:', message)}
      onMessageReceived={(message) => console.log('Message received:', message)}
    />
  );
}
```

### Configurazione Avanzata

```typescript
import { createApiClient, MetricsDashboard } from '@webrobot/frontend-sdk';

const apiClient = createApiClient({
  baseUrl: 'https://api.webrobot.com',
  wsUrl: 'wss://api.webrobot.com',
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
  apiKey: 'your-api-key',
  headers: {
    'X-Custom-Header': 'value'
  }
});

function Dashboard() {
  return (
    <MetricsDashboard
      apiClient={apiClient}
      refreshInterval={30000}
      showSystemMetrics={true}
      showAgentMetrics={true}
      showRAGMetrics={true}
      showRedisMetrics={true}
    />
  );
}
```

## 💬 Chat Interface

### Componente Base

```typescript
import { ChatInterface } from '@webrobot/frontend-sdk';

function ChatPage() {
  const handleSessionChange = (session) => {
    console.log('Session changed:', session);
  };

  const handleMessageSent = (message) => {
    console.log('User sent:', message.content);
  };

  const handleMessageReceived = (message) => {
    console.log('Agent replied:', message.content);
  };

  return (
    <ChatInterface
      sessionId="existing-session-id" // opzionale
      userId="user-123"
      onSessionChange={handleSessionChange}
      onMessageSent={handleMessageSent}
      onMessageReceived={handleMessageReceived}
      enableHumanLoop={true}
      placeholder="Type your message here..."
      className="custom-chat-styles"
    />
  );
}
```

### Human-in-the-Loop

Il componente supporta automaticamente le pause per input umano:

```typescript
// Quando un agente richiede input umano, il componente mostra automaticamente
// un'interfaccia per inserire la risposta e riprendere l'esecuzione
```

## 📊 Metrics Dashboard

### Dashboard Completo

```typescript
import { MetricsDashboard } from '@webrobot/frontend-sdk';

function SystemDashboard() {
  return (
    <MetricsDashboard
      refreshInterval={30000} // 30 secondi
      showSystemMetrics={true}
      showAgentMetrics={true}
      showRAGMetrics={true}
      showRedisMetrics={true}
      className="custom-dashboard"
    />
  );
}
```

### Metriche Personalizzate

```typescript
import { MetricCard, Chart } from '@webrobot/frontend-sdk';

function CustomMetrics() {
  return (
    <div>
      <MetricCard
        title="Active Users"
        value={150}
        unit="users"
        trend="up"
        trendValue={12}
        color="green"
      />
      
      <Chart
        data={[
          { label: 'Success', value: 85, color: '#10b981' },
          { label: 'Error', value: 15, color: '#ef4444' }
        ]}
        type="pie"
        title="Request Status"
      />
    </div>
  );
}
```

## 🔌 API Client

### Uso Diretto

```typescript
import { createDefaultApiClient } from '@webrobot/frontend-sdk';

const client = createDefaultApiClient('http://localhost:5000');

// Sessioni
const session = await client.createSession('user-123');
const conversation = await client.getConversation(session.session_id);

// Messaggi
const message = await client.sendMessage(session.session_id, 'Hello!');

// Agentic Execution
const execution = await client.startAgenticExecution({
  prompt: 'Create an ETL pipeline for sales data',
  humanLoop: true,
  session_id: session.session_id
});

// Resume execution
const resume = await client.resumeAgenticExecution({
  execution_id: execution.execution_id,
  human_input: 'Use PostgreSQL as target database'
});

// RAG Queries
const ragResults = await client.queryRAG({
  query: 'What is data warehousing?',
  provider: 'llamaindex_cloud',
  top_k: 5
});

// ETL Pipelines
const pipelines = await client.getETLPipelines();
const newPipeline = await client.createETLPipeline({
  name: 'Sales ETL',
  description: 'Process sales data',
  complexity: 'medium'
});

// Web Scraping
const scrapingJobs = await client.getScrapingJobs();
const newJob = await client.createScrapingJob({
  name: 'Product Scraping',
  provider: 'apify',
  configuration: {
    urls: ['https://example.com/products'],
    selectors: { title: '.product-title' }
  }
});

// Visualizzazioni
const visualizations = await client.getVisualizations();
const newViz = await client.createVisualization({
  name: 'Sales Chart',
  type: 'chart',
  configuration: {
    chart_type: 'bar',
    title: 'Monthly Sales',
    x_axis: 'month',
    y_axis: 'revenue'
  }
});

// Metriche
const systemMetrics = await client.getSystemMetrics();
const agentMetrics = await client.getAgentMetrics();
const ragMetrics = await client.getRAGMetrics();
const redisMetrics = await client.getRedisMetrics();
```

### WebSocket Events

```typescript
// Connessione WebSocket
await client.connectWebSocket();

// Eventi agenti
client.onAgentExecution((event) => {
  console.log('Agent execution:', event.type, event.data);
});

// Eventi human loop
client.onHumanLoop((event) => {
  if (event.type === 'human_loop_pause') {
    console.log('Human input required:', event.data.reason);
  } else if (event.type === 'human_loop_resume') {
    console.log('Execution resumed with input:', event.data.human_input);
  }
});

// Eventi RAG
client.onRAGQuery((event) => {
  console.log('RAG query:', event.type, event.data);
});

// Eventi generici
client.on('custom_event', (event) => {
  console.log('Custom event:', event);
});

// Disconnessione
client.disconnectWebSocket();
```

## 🎨 Styling

### CSS Classes

Il SDK fornisce classi CSS per tutti i componenti:

```css
/* Chat Interface */
.chat-interface { }
.chat-header { }
.chat-messages { }
.chat-message { }
.chat-message.user { }
.chat-message.assistant { }
.chat-message.system { }
.chat-input-form { }
.chat-input { }
.send-button { }

/* Human Loop */
.human-loop-pause { }
.human-input-section { }
.human-input-textarea { }
.resume-button { }
.continue-button { }

/* Metrics Dashboard */
.metrics-dashboard { }
.metrics-section { }
.metrics-grid { }
.metric-card { }
.metric-card.green { }
.metric-card.yellow { }
.metric-card.red { }
.metric-card.blue { }

/* Charts */
.chart { }
.bar-chart { }
.pie-chart { }
.pie-legend { }
```

### Custom Styling

```typescript
<ChatInterface
  className="my-custom-chat"
  // ... altre props
/>

<MetricsDashboard
  className="my-custom-dashboard"
  // ... altre props
/>
```

## 🔧 Configurazione Avanzata

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_WEBROBOT_API_URL=http://localhost:5000
NEXT_PUBLIC_WEBROBOT_WS_URL=ws://localhost:5000
NEXT_PUBLIC_WEBROBOT_API_KEY=your-api-key
```

### Next.js Integration

```typescript
// pages/_app.tsx
import { WebRobotProvider } from '@webrobot/frontend-sdk';

function MyApp({ Component, pageProps }) {
  return (
    <WebRobotProvider
      baseUrl={process.env.NEXT_PUBLIC_WEBROBOT_API_URL}
      apiKey={process.env.NEXT_PUBLIC_WEBROBOT_API_KEY}
    >
      <Component {...pageProps} />
    </WebRobotProvider>
  );
}
```

### React Hooks

```typescript
import { useApiClient } from '@webrobot/frontend-sdk';

function MyComponent() {
  const { client, isConnected, connect, disconnect } = useApiClient({
    baseUrl: 'http://localhost:5000',
    autoConnect: true
  });

  useEffect(() => {
    if (isConnected) {
      // WebSocket connesso
    }
  }, [isConnected]);

  return (
    <div>
      <button onClick={connect}>Connect</button>
      <button onClick={disconnect}>Disconnect</button>
    </div>
  );
}
```

## 🧪 Testing

```typescript
import { render, screen } from '@testing-library/react';
import { ChatInterface } from '@webrobot/frontend-sdk';

test('renders chat interface', () => {
  render(<ChatInterface />);
  expect(screen.getByPlaceholderText(/type your message/i)).toBeInTheDocument();
});
```

## 📚 API Reference

### Types

- `ApiResponse<T>` - Risposta API generica
- `Session` - Sessione utente
- `Message` - Messaggio chat
- `AgenticStartRequest/Response` - Richiesta/risposta agentic
- `Agent` - Agente CrewAI
- `Crew` - Crew di agenti
- `RAGProvider` - Provider RAG
- `ETLPipeline` - Pipeline ETL
- `ScrapingJob` - Job web scraping
- `Visualization` - Visualizzazione dati
- `SystemMetrics` - Metriche sistema

### Components

- `ChatInterface` - Interfaccia chat principale
- `ChatMessage` - Componente messaggio singolo
- `MetricsDashboard` - Dashboard metriche
- `MetricCard` - Card metrica singola
- `Chart` - Grafico dati

### API Client

- `WebRobotApiClient` - Client principale
- `createApiClient()` - Factory per client personalizzato
- `createDefaultApiClient()` - Factory per client default
- `useApiClient()` - Hook React

## 🐛 Troubleshooting

### Errori Comuni

1. **WebSocket Connection Failed**
   ```typescript
   // Verifica URL WebSocket
   const client = createApiClient({
     baseUrl: 'http://localhost:5000',
     wsUrl: 'ws://localhost:5000' // Deve essere ws:// non http://
   });
   ```

2. **CORS Errors**
   ```typescript
   // Aggiungi headers CORS
   const client = createApiClient({
     baseUrl: 'http://localhost:5000',
     headers: {
       'Access-Control-Allow-Origin': '*'
     }
   });
   ```

3. **TypeScript Errors**
   ```typescript
   // Assicurati di importare i tipi
   import type { Session, Message } from '@webrobot/frontend-sdk';
   ```

## 📄 Licenza

MIT License - vedi [LICENSE](LICENSE) per dettagli.

## 🤝 Contributing

1. Fork il repository
2. Crea un branch per la feature (`git checkout -b feature/amazing-feature`)
3. Commit le modifiche (`git commit -m 'Add amazing feature'`)
4. Push al branch (`git push origin feature/amazing-feature`)
5. Apri una Pull Request

## 📞 Support

- 📧 Email: support@webrobot.com
- 💬 Discord: [WebRobot Community](https://discord.gg/webrobot)
- 📖 Docs: [docs.webrobot.com](https://docs.webrobot.com)
- 🐛 Issues: [GitHub Issues](https://github.com/WebRobot-Ltd/webrobot-frontend-sdk/issues)

## 🚀 Installation from GitHub Packages

```bash
# Configure npm for GitHub Packages
echo "@webrobot:registry=https://npm.pkg.github.com" >> .npmrc
echo "//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN" >> .npmrc

# Install package
npm install @webrobot/frontend-sdk@latest
```

## 📦 Development

```bash
# Clone repository
git clone https://github.com/WebRobot-Ltd/webrobot-frontend-sdk.git
cd webrobot-frontend-sdk

# Install dependencies
npm ci

# Build package
npm run build

# Run tests
npm run test

# Run linting
npm run lint
```
