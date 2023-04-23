declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT?: string;
      OPENAI_API_KEY?: string;
      PINECONE_API_KEY?: string;
      PINECONE_ENVIRONMENT?: string;
      PINECONE_INDEX_NAME?: string;
    }
  }
}
