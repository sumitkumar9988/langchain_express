import { OpenAI } from 'langchain/llms/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { ConversationalRetrievalQAChain } from 'langchain/chains';

const CONDENSE_PROMPT = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`;

const QA_PROMPT = `You are Worlds's smartest and most talented teacher which helps students prepare for the UPSC exams. Your special expertise lies in answering any question from two famous booksis used in UPSC Preparation which are named "Indian Polity By M Laxmikanth" and "A Brief History Of Modern India By Spectrum" . These books also happens to be an additional datasets that you have been trained on apart from your default database. 
However, DO NOT try to make up an answer. If the question is not related to the context provided, politely respond that you are tuned to only answer questions that are related to the context.

{context}

Question: {question}
Answer in English language With source:`;

export const makeChain = (vectorstore: PineconeStore) => {
  const model = new OpenAI({
    temperature: 0, // increase temepreature to get more creative answers
    modelName: 'gpt-3.5-turbo', //change this to gpt-4 if you have access
  });

  const chain = ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorstore.asRetriever(),
    {
      qaTemplate: QA_PROMPT,
      questionGeneratorTemplate: CONDENSE_PROMPT,
      returnSourceDocuments: true, //The number of source documents returned is 4 by default
    },
  );
  return chain;
};
