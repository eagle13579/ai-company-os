const logger = require('../agent_gateway/logger');
const { VectorStoreError, RAGError, ValidationError } = require('./errors');

class RAGEngine {
  constructor(config = {}) {
    this.config = {
      topK: 5,
      similarityThreshold: 0.7,
      ...config
    };
    this.vectorStores = new Map();
    logger.info('RAG Engine initialized with config:', this.config);
  }

  registerVectorStore(storeId, vectorStore) {
    if (!storeId || typeof storeId !== 'string') {
      throw new ValidationError('Invalid vector store ID');
    }
    if (!vectorStore || typeof vectorStore.search !== 'function') {
      throw new ValidationError('Invalid vector store: must have a search method');
    }
    this.vectorStores.set(storeId, vectorStore);
    logger.info(`Vector store ${storeId} registered`);
  }

  async retrieve(storeId, query, options = {}) {
    try {
      if (!storeId) {
        throw new ValidationError('Vector store ID is required');
      }
      if (!query) {
        throw new ValidationError('Query is required');
      }

      const vectorStore = this.vectorStores.get(storeId);
      if (!vectorStore) {
        throw new VectorStoreError(`Vector store ${storeId} not found`, 'VECTOR_STORE_NOT_FOUND');
      }

      const { topK = this.config.topK, similarityThreshold = this.config.similarityThreshold } = options;
      const results = await vectorStore.search(query, { topK, similarityThreshold });
      
      logger.debug(`Retrieved ${results.length} results from ${storeId} for query: ${query}`);
      return results;
    } catch (error) {
      logger.error(`RAG retrieval error: ${error.message}`, {
        code: error.code,
        status: error.status
      });
      return [];
    }
  }

  async generate(prompt, context, model) {
    try {
      if (!prompt) {
        throw new ValidationError('Prompt is required');
      }
      if (!model || typeof model.generate !== 'function') {
        throw new ValidationError('Invalid model: must have a generate method');
      }

      const augmentedPrompt = this.augmentPrompt(prompt, context);
      const result = await model.generate(augmentedPrompt);
      
      logger.debug('RAG generation completed');
      return result;
    } catch (error) {
      logger.error(`RAG generation error: ${error.message}`, {
        code: error.code,
        status: error.status
      });
      throw new RAGError(`Generation failed: ${error.message}`, 'GENERATION_FAILED');
    }
  }

  async ragPipeline(storeId, query, model, options = {}) {
    try {
      if (!storeId) {
        throw new ValidationError('Vector store ID is required');
      }
      if (!query) {
        throw new ValidationError('Query is required');
      }
      if (!model) {
        throw new ValidationError('Model is required');
      }

      const context = await this.retrieve(storeId, query, options);
      const result = await this.generate(query, context, model);
      
      logger.info('RAG pipeline completed successfully');
      return {
        success: true,
        query,
        context,
        result
      };
    } catch (error) {
      logger.error(`RAG pipeline error: ${error.message}`, {
        code: error.code,
        status: error.status
      });
      return {
        success: false,
        error: error.message,
        code: error.code || 'RAG_PIPELINE_ERROR',
        status: error.status || 500
      };
    }
  }

  augmentPrompt(prompt, context) {
    const contextStr = context.map(item => item.content).join('\n\n');
    return `Context:\n${contextStr}\n\nQuestion: ${prompt}\n\nAnswer based on the context:`;
  }

  getAvailableVectorStores() {
    return Array.from(this.vectorStores.keys());
  }

  getVectorStore(storeId) {
    return this.vectorStores.get(storeId);
  }
}

module.exports = RAGEngine;