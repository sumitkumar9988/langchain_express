import * as dotenv from "dotenv";
dotenv.config();
import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { makeChain } from "./utils/makechain";
import { getPinecone } from "./utils/pinecone-client";

import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from "./config/pinecone";

const app = express();
app.use(bodyParser.json());

interface ChatRequestBody {
  question: string;
  history: any[];
}

app.post("/", async (req: Request, res: Response) => {
  const { question, history } = req.body as ChatRequestBody;

  console.log("chat:question:", question);

  if (!question) {
    return res.status(400).json({ message: "No question in the request" });
  }

  const sanitizedQuestion = question.trim().replace(/\n/g, " ");

  try {
    const pinecone = await getPinecone();
    const index = pinecone.Index(PINECONE_INDEX_NAME);

    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({}),
      {
        pineconeIndex: index,
        textKey: "text",
        namespace: PINECONE_NAME_SPACE
      }
    );

    const chain = makeChain(vectorStore);

    const response = await chain.call({
      question: sanitizedQuestion,
      chat_history: history || []
    });

    res.status(200).json(response);
  } catch (error: any) {
    console.log("chat:error", error);
    res.status(500).json({ error: error.message || "Something went wrong" });
  }
});

app.use((req: Request, res: Response) => {
  res.status(405).json({ error: "Method not allowed" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
