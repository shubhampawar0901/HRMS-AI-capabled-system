const { Pinecone } = require('@pinecone-database/pinecone');
const { GoogleGenerativeAI } = require('@google/generative-ai');

class RAGService {
  constructor() {
    this.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
    
    this.indexName = process.env.PINECONE_INDEX_NAME;
    this.index = null;
    
    // Initialize Google AI for embeddings
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.embeddingModel = this.genAI.getGenerativeModel({ 
      model: 'text-embedding-004' 
    });
    
    this.initializeIndex();
  }

  async initializeIndex() {
    try {
      this.index = this.pinecone.index(this.indexName);
      console.log(`✅ Connected to Pinecone index: ${this.indexName}`);
    } catch (error) {
      console.error('❌ Failed to connect to Pinecone:', error);
      throw new Error('Pinecone initialization failed');
    }
  }

  // ==========================================
  // EMBEDDING OPERATIONS
  // ==========================================

  async generateEmbedding(text) {
    try {
      const result = await this.embeddingModel.embedContent(text);
      return result.embedding.values;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw new Error('Failed to generate embedding');
    }
  }

  async generateEmbeddings(texts) {
    try {
      const embeddings = [];
      for (const text of texts) {
        const embedding = await this.generateEmbedding(text);
        embeddings.push(embedding);
      }
      return embeddings;
    } catch (error) {
      console.error('Error generating embeddings:', error);
      throw new Error('Failed to generate embeddings');
    }
  }

  // ==========================================
  // DOCUMENT OPERATIONS
  // ==========================================

  async upsertDocumentChunks(documentId, chunks, metadata = {}) {
    try {
      if (!this.index) {
        await this.initializeIndex();
      }

      const vectors = [];
      const vectorIds = [];

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const embedding = await this.generateEmbedding(chunk.text);
        const vectorId = `doc_${documentId}_chunk_${i}`;
        
        vectors.push({
          id: vectorId,
          values: embedding,
          metadata: {
            text: chunk.text,
            documentId: documentId,
            chunkIndex: i,
            documentType: metadata.documentType || 'unknown',
            accessLevel: metadata.accessLevel || 'employee',
            filename: metadata.filename || 'unknown',
            ...chunk.metadata
          }
        });
        
        vectorIds.push(vectorId);
      }

      // Upsert vectors to Pinecone
      await this.index.upsert(vectors);
      
      console.log(`✅ Upserted ${vectors.length} chunks for document ${documentId}`);
      return vectorIds;
    } catch (error) {
      console.error('Error upserting document chunks:', error);
      throw new Error('Failed to upsert document chunks');
    }
  }

  async deleteDocumentChunks(vectorIds) {
    try {
      if (!this.index) {
        await this.initializeIndex();
      }

      await this.index.deleteMany(vectorIds);
      console.log(`✅ Deleted ${vectorIds.length} vectors from Pinecone`);
      return true;
    } catch (error) {
      console.error('Error deleting document chunks:', error);
      throw new Error('Failed to delete document chunks');
    }
  }

  // ==========================================
  // SEARCH OPERATIONS
  // ==========================================

  async searchSimilarChunks(query, options = {}) {
    try {
      if (!this.index) {
        await this.initializeIndex();
      }

      // Generate embedding for the query
      const queryEmbedding = await this.generateEmbedding(query);
      
      // Search parameters
      const searchParams = {
        vector: queryEmbedding,
        topK: options.topK || 5,
        includeMetadata: true,
        includeValues: false
      };

      // Add filters if provided
      if (options.filter) {
        searchParams.filter = options.filter;
      }

      // Perform the search
      const searchResults = await this.index.query(searchParams);
      
      // Format results
      const formattedResults = searchResults.matches.map(match => ({
        id: match.id,
        score: match.score,
        text: match.metadata.text,
        documentId: match.metadata.documentId,
        documentType: match.metadata.documentType,
        filename: match.metadata.filename,
        chunkIndex: match.metadata.chunkIndex,
        metadata: match.metadata
      }));

      console.log(`🔍 Found ${formattedResults.length} similar chunks for query: "${query.substring(0, 50)}..."`);
      return formattedResults;
    } catch (error) {
      console.error('Error searching similar chunks:', error);
      throw new Error('Failed to search similar chunks');
    }
  }

  async searchByDocumentType(query, documentType, options = {}) {
    const filter = {
      documentType: { $eq: documentType }
    };
    
    return await this.searchSimilarChunks(query, {
      ...options,
      filter: filter
    });
  }

  async searchWithAccessControl(query, userRole, options = {}) {
    let accessLevels = ['public'];
    
    if (userRole === 'employee') {
      accessLevels.push('employee');
    } else if (userRole === 'manager') {
      accessLevels.push('employee', 'manager');
    } else if (userRole === 'admin') {
      accessLevels.push('employee', 'manager', 'admin');
    }

    const filter = {
      accessLevel: { $in: accessLevels }
    };
    
    return await this.searchSimilarChunks(query, {
      ...options,
      filter: filter
    });
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  async getIndexStats() {
    try {
      if (!this.index) {
        await this.initializeIndex();
      }

      const stats = await this.index.describeIndexStats();
      return {
        totalVectors: stats.totalVectorCount,
        dimension: stats.dimension,
        indexFullness: stats.indexFullness,
        namespaces: stats.namespaces
      };
    } catch (error) {
      console.error('Error getting index stats:', error);
      return null;
    }
  }

  async healthCheck() {
    try {
      if (!this.index) {
        await this.initializeIndex();
      }

      const stats = await this.getIndexStats();
      return {
        status: 'healthy',
        connected: true,
        indexName: this.indexName,
        stats: stats
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        connected: false,
        error: error.message
      };
    }
  }

  // ==========================================
  // BATCH OPERATIONS
  // ==========================================

  async batchUpsert(vectors, batchSize = 100) {
    try {
      if (!this.index) {
        await this.initializeIndex();
      }

      const batches = [];
      for (let i = 0; i < vectors.length; i += batchSize) {
        batches.push(vectors.slice(i, i + batchSize));
      }

      for (const batch of batches) {
        await this.index.upsert(batch);
        console.log(`✅ Upserted batch of ${batch.length} vectors`);
      }

      return true;
    } catch (error) {
      console.error('Error in batch upsert:', error);
      throw new Error('Failed to batch upsert vectors');
    }
  }
}

module.exports = RAGService;
