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
    await initDatabase();
    const db = getDb();

    // GET /api/employees - Get all employees
    if (event.httpMethod === 'GET') {
      const employees = await db`
        SELECT name FROM employees ORDER BY name ASC
      `;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(employees.map(e => e.name)),
      };
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

