import { getDb, initDatabase } from './db.js';

export const handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };

  // Handle preflight
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

    const { httpMethod, path, body, queryStringParameters } = event;
    // Path will be like /api/jobs or /api/jobs/123
    const pathParts = path.split('/').filter(p => p);
    const resourceIndex = pathParts.indexOf('jobs');
    const jobId = resourceIndex !== -1 && pathParts[resourceIndex + 1] 
      ? parseInt(pathParts[resourceIndex + 1]) 
      : null;

    // GET /api/jobs - Get all jobs
    if (httpMethod === 'GET' && !jobId) {
      const { client, date } = queryStringParameters || {};
      
      let jobs;
      if (client && date) {
        const targetDate = new Date(date).toISOString().split('T')[0];
        jobs = await db`
          SELECT * FROM jobs
          WHERE client = ${client}
          AND DATE(delivery_date) = ${targetDate}
          ORDER BY delivery_date ASC
        `;
      } else if (client) {
        jobs = await db`
          SELECT * FROM jobs
          WHERE client = ${client}
          ORDER BY delivery_date ASC
        `;
      } else if (date) {
        const targetDate = new Date(date).toISOString().split('T')[0];
        jobs = await db`
          SELECT * FROM jobs
          WHERE DATE(delivery_date) = ${targetDate}
          ORDER BY delivery_date ASC
        `;
      } else {
        jobs = await db`
          SELECT * FROM jobs
          ORDER BY delivery_date ASC
        `;
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(jobs),
      };
    }

    // GET /api/jobs/:id - Get single job
    if (httpMethod === 'GET' && jobId) {
      const [job] = await db`
        SELECT * FROM jobs WHERE id = ${jobId}
      `;

      if (!job) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Job not found' }),
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(job),
      };
    }

    // POST /api/jobs - Create new job
    if (httpMethod === 'POST' && !jobId) {
      const data = JSON.parse(body || '{}');
      
      // Handle jobType - convert to array if it's a string, default to ['SM'] if empty
      let jobTypes = [];
      if (Array.isArray(data.jobType)) {
        jobTypes = data.jobType.length > 0 ? data.jobType : ['SM'];
      } else if (data.jobType) {
        jobTypes = [data.jobType];
      } else {
        jobTypes = ['SM'];
      }
      
      // Handle delivery date - default to today if not provided
      let deliveryDate;
      if (data.deliveryDate) {
        deliveryDate = new Date(data.deliveryDate).toISOString();
      } else {
        deliveryDate = new Date().toISOString();
      }
      
      const [job] = await db`
        INSERT INTO jobs (
          client, assigned_to, category, job_name, job_type, delivery_date,
          status, completion_status, led_deliverables, description
        )
        VALUES (
          ${data.client},
          ${data.assignedTo},
          ${data.category || 'current job'},
          ${data.jobName || 'Untitled Job'},
          ${jobTypes},
          ${deliveryDate},
          ${data.status || 'pending'},
          ${data.completionStatus || null},
          ${data.ledDeliverables || []},
          ${data.description || null}
        )
        RETURNING *
      `;

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(job),
      };
    }

    // PUT /api/jobs/:id - Update job
    if (httpMethod === 'PUT' && jobId) {
      const data = JSON.parse(body || '{}');

      // Handle jobType - convert to array if it's a string, default to ['SM'] if empty
      let jobTypes = [];
      if (Array.isArray(data.jobType)) {
        jobTypes = data.jobType.length > 0 ? data.jobType : ['SM'];
      } else if (data.jobType) {
        jobTypes = [data.jobType];
      } else {
        jobTypes = ['SM'];
      }
      
      // Handle delivery date - default to today if not provided
      let deliveryDate;
      if (data.deliveryDate) {
        deliveryDate = new Date(data.deliveryDate).toISOString();
      } else {
        deliveryDate = new Date().toISOString();
      }

      const [job] = await db`
        UPDATE jobs
        SET
          client = ${data.client},
          assigned_to = ${data.assignedTo},
          category = ${data.category || 'current job'},
          job_name = ${data.jobName || 'Untitled Job'},
          job_type = ${jobTypes},
          delivery_date = ${deliveryDate},
          status = ${data.status || 'pending'},
          completion_status = ${data.completionStatus || null},
          led_deliverables = ${data.ledDeliverables || []},
          description = ${data.description || null},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${jobId}
        RETURNING *
      `;

      if (!job) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Job not found' }),
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(job),
      };
    }

    // DELETE /api/jobs/:id - Delete job
    if (httpMethod === 'DELETE' && jobId) {

      const result = await db`
        DELETE FROM jobs WHERE id = ${jobId} RETURNING id
      `;

      if (result.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Job not found' }),
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Job deleted successfully' }),
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

