// @ts-nocheck
import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGO_URI;
if (!uri) {
    console.error('MONGO_URI is not defined in .env');
    process.exit(1);
}

// Regex for a 24-character hex string (standard ObjectId)
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

async function run() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db();
        const users = db.collection('User');

        console.log('Scanning users for invalid IDs...');
        const allUsers = await users.find({}).toArray();

        let deletedCount = 0;

        for (const user of allUsers) {
            const id = user._id.toString();
            // If ID is not a 24-char hex string, it's not a valid MongoDB ObjectId (likely a UUID)
            if (!objectIdRegex.test(id)) {
                console.log(`Found user with invalid ID (not an ObjectId): ${id} (Email: ${user.email})`);
                await users.deleteOne({ _id: user._id });
                deletedCount++;
            }
        }

        console.log(`Cleanup complete. Deleted ${deletedCount} users with invalid IDs.`);

    } catch (err) {
        console.error('Error executing cleanup:', err);
    } finally {
        await client.close();
    }
}

run();
