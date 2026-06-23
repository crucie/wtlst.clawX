import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  // We throw a soft warning or check in the API, but during builds
  // this environment variable might not be present. We will handle it gracefully.
}

const uri = process.env.MONGODB_URI || "";
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR.
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
    _mongoUri?: string;
  };

  // If the URI has changed (e.g. user updated .env), invalidate the cached connection
  if (globalWithMongo._mongoUri && globalWithMongo._mongoUri !== uri) {
    console.log("MongoDB URI changed, invalidating cached connection...");
    globalWithMongo._mongoClientPromise = undefined;
    globalWithMongo._mongoUri = undefined;
  }

  if (!globalWithMongo._mongoClientPromise) {
    if (uri) {
      client = new MongoClient(uri, options);
      globalWithMongo._mongoClientPromise = client.connect();
      globalWithMongo._mongoUri = uri;
    } else {
      // In development if URI is not provided yet, resolve to null to prevent unhandled rejection warnings
      globalWithMongo._mongoClientPromise = Promise.resolve(null as any);
    }
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  if (uri) {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  } else {
    clientPromise = Promise.resolve(null as any);
  }
}

export default clientPromise;

