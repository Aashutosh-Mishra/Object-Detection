
import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/yoloApp'

if (!uri) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const options = {}

let client
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {

  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
    console.log("MongoDB Client: New connection promise created (Dev).");
  } else {
    // console.log("MongoDB Client: Using cached connection promise (Dev).");
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {

  client = new MongoClient(uri, options)
  clientPromise = client.connect()
   console.log("MongoDB Client: New connection promise created (Prod).");
}

export default clientPromise