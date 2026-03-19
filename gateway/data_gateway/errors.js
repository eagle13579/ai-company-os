class DataGatewayError extends Error {
  constructor(message, code, status) {
    super(message);
    this.name = 'DataGatewayError';
    this.code = code;
    this.status = status || 500;
  }
}

class DataSourceError extends DataGatewayError {
  constructor(message, code = 'DATA_SOURCE_ERROR', status = 500) {
    super(message, code, status);
    this.name = 'DataSourceError';
  }
}

class VectorStoreError extends DataGatewayError {
  constructor(message, code = 'VECTOR_STORE_ERROR', status = 500) {
    super(message, code, status);
    this.name = 'VectorStoreError';
  }
}

class CacheError extends DataGatewayError {
  constructor(message, code = 'CACHE_ERROR', status = 500) {
    super(message, code, status);
    this.name = 'CacheError';
  }
}

class ValidationError extends DataGatewayError {
  constructor(message, code = 'VALIDATION_ERROR', status = 400) {
    super(message, code, status);
    this.name = 'ValidationError';
  }
}

class RAGError extends DataGatewayError {
  constructor(message, code = 'RAG_ERROR', status = 500) {
    super(message, code, status);
    this.name = 'RAGError';
  }
}

module.exports = {
  DataGatewayError,
  DataSourceError,
  VectorStoreError,
  CacheError,
  ValidationError,
  RAGError
};