import { Storage } from '@google-cloud/storage';

export const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: {
      client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
      // Replace literal escaped newlines with actual newline characters if present
      private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

export const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET_NAME!);
