import { MongoClient, Db } from "mongodb";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  const client = new MongoClient(uri);
  await client.connect();

  const db = client.db();

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

export async function ensureIndexes(db: Db) {
  const usersCollection = db.collection("users");
  const magicLinksCollection = db.collection("magic_links");

  await usersCollection.createIndex({ email: 1 }, { unique: true });
  await magicLinksCollection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await magicLinksCollection.createIndex({ email: 1 });
  await magicLinksCollection.createIndex({ token: 1 });
}
