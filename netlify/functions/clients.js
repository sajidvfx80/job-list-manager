import { getDb, initDatabase } from './db.js';

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    await initDatabase();
    const db = getDb();

    // GET /api/clients - Get all clients
    if (event.httpMethod === 'GET') {
      const clients = await db`
        SELECT name FROM clients ORDER BY name ASC
      `;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(clients.map(c => c.name)),
      };
    }

    // POST /api/clients - Add new client
    if (event.httpMethod === 'POST') {
      const data = JSON.parse(event.body || '{}');
      const { name } = data;

      if (!name) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Client name is required' }),
        };
      }

      try {
        const [client] = await db`
          INSERT INTO clients (name)
          VALUES (${name})
          ON CONFLICT (name) DO NOTHING
          RETURNING name
        `;

        if (!client) {
          return {
            statusCode: 409,
            headers,
            body: JSON.stringify({ error: 'Client already exists' }),
          };
        }

        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ name: client.name }),
        };
      } catch (error) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: error.message }),
        };
      }
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not found' }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

