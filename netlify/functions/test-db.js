import { getDb, initDatabase } from './db.js';

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    // Check if DATABASE_URL is set
    const hasDbUrl = !!process.env.DATABASE_URL;
    const dbUrlLength = process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0;
    const dbUrlPreview = process.env.DATABASE_URL 
      ? `${process.env.DATABASE_URL.substring(0, 20)}...` 
      : 'NOT SET';

    // Try to get database connection
    let dbConnection = 'Not attempted';
    let dbError = null;
    try {
      const db = getDb();
      dbConnection = 'Success';
    } catch (err) {
      dbConnection = 'Failed';
      dbError = err.message;
    }

    // Try to initialize database
    let initResult = 'Not attempted';
    let initError = null;
    try {
      await initDatabase();
      initResult = 'Success';
    } catch (err) {
      initResult = 'Failed';
      initError = err.message;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        environment: {
          hasDatabaseUrl: hasDbUrl,
          databaseUrlLength: dbUrlLength,
          databaseUrlPreview: dbUrlPreview,
        },
        connection: {
          status: dbConnection,
          error: dbError,
        },
        initialization: {
          status: initResult,
          error: initError,
        },
      }, null, 2),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error.message,
        stack: error.stack,
      }, null, 2),
    };
  }
};

