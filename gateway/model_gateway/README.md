# Model Gateway Module

## Overview

The Model Gateway module provides a unified interface for model scheduling, cost control, and load balancing. It allows you to register multiple AI models, define routing rules, track costs, and balance loads across models.

## Features

- **Model Registration**: Register multiple AI models with configuration
- **Routing Rules**: Define custom routing rules based on request attributes
- **Cost Tracking**: Track model usage costs and set rate limits
- **Load Balancing**: Support multiple load balancing strategies
- **Health Monitoring**: Monitor model health status

## Directory Structure

```
gateway/model_gateway/
├── index.js            # Main module entry point
├── model_router.js     # Model routing logic
├── cost_tracker.js     # Cost tracking and rate limiting
├── load_balancer.js    # Load balancing logic
├── README.md           # This documentation
├── .env.example        # Environment variables example
├── .gitignore          # Git ignore file
└── test.js             # Test script
```

## Installation

1. Install dependencies:

```bash
npm install dotenv
```

2. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

## Usage

### Basic Usage

```javascript
const ModelGateway = require('./index');

// Create a new ModelGateway instance
const gateway = new ModelGateway();

// Register models
gateway.registerModel('gpt-4', {
  name: 'GPT-4',
  costPerSecond: 0.0001,
  execute: async (request) => {
    return `GPT-4 response: ${request.prompt}`;
  }
});

gateway.registerModel('gpt-3.5', {
  name: 'GPT-3.5',
  costPerSecond: 0.00005,
  execute: async (request) => {
    return `GPT-3.5 response: ${request.prompt}`;
  }
});

// Add routing rules
gateway.addRoutingRule((request) => request.priority === 'high', 'gpt-4');
gateway.addRoutingRule((request) => request.priority === 'low', 'gpt-3.5');

// Set rate limits
gateway.setRateLimit('gpt-4', 10, 60000); // 10 calls per minute
gateway.setRateLimit('gpt-3.5', 20, 60000); // 20 calls per minute

// Set load balancing strategy
gateway.setLoadBalancingStrategy('roundRobin');

// Process requests
async function processRequests() {
  const highPriorityRequest = { prompt: 'Tell me about AI', priority: 'high' };
  const lowPriorityRequest = { prompt: 'What is the weather today?', priority: 'low' };

  const highResponse = await gateway.processRequest(highPriorityRequest);
  const lowResponse = await gateway.processRequest(lowPriorityRequest);

  console.log('High priority response:', highResponse);
  console.log('Low priority response:', lowResponse);

  // Get stats
  const stats = gateway.getModelStats();
  console.log('Model stats:', stats);
}

processRequests();
```

### Configuration

The Model Gateway can be configured using environment variables:

- `MODEL_GATEWAY_TIMEOUT`: Request timeout in milliseconds (default: 30000)
- `MODEL_GATEWAY_MAX_RETRIES`: Maximum number of retries (default: 3)

## API Reference

### ModelGateway Class

#### `registerModel(modelId, modelConfig)`
- `modelId`: Unique identifier for the model
- `modelConfig`: Model configuration object with:
  - `name`: Model name
  - `costPerSecond`: Cost per second of model usage
  - `execute`: Async function to execute the model

#### `addRoutingRule(condition, modelId)`
- `condition`: Function that takes a request and returns a boolean
- `modelId`: Model ID to route to if condition is true

#### `processRequest(request)`
- `request`: Request object to process
- Returns: Promise with model response

#### `setRateLimit(modelId, limit, windowMs)`
- `modelId`: Model ID to set rate limit for
- `limit`: Maximum number of requests
- `windowMs`: Time window in milliseconds

#### `setLoadBalancingStrategy(strategy)`
- `strategy`: Load balancing strategy ('roundRobin', 'leastLoad', 'leastRecentlyUsed')

#### `getModelStats()`
- Returns: Object with model stats including costs, load, and total cost

## Load Balancing Strategies

1. **roundRobin**: Distributes requests evenly across models
2. **leastLoad**: Selects the model with the lowest load
3. **leastRecentlyUsed**: Selects the model that was least recently used

## Error Handling

The Model Gateway will throw errors in the following cases:
- No models registered
- Rate limit exceeded
- No healthy models available
- Model execution failed

## Testing

Run the test script:

```bash
node test.js
```

## Best Practices

1. **Model Registration**: Register models with clear IDs and accurate cost information
2. **Routing Rules**: Define specific routing rules based on request attributes
3. **Rate Limits**: Set appropriate rate limits to prevent abuse
4. **Load Balancing**: Choose the right load balancing strategy for your use case
5. **Error Handling**: Implement proper error handling for model execution
6. **Monitoring**: Regularly check model stats to optimize performance

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request