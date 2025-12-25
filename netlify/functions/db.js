import { neon } from '@neondatabase/serverless';

let sql;

export const getDb = () => {
  if (!sql) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      console.error('DATABASE_URL is missing');
      throw new Error('DATABASE_URL environment variable is not set. Please configure it in Netlify environment variables.');
    }
    try {
      sql = neon(connectionString);
    } catch (error) {
      console.error('Error creating Neon connection:', error);
      throw new Error(`Failed to connect to database: ${error.message}`);
    }
  }
  return sql;
};

export const initDatabase = async () => {
  try {
    const db = getDb();
    
    // Create tables if they don't exist
    await db`
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await db`
      CREATE TABLE IF NOT EXISTS employees (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await db`
      CREATE TABLE IF NOT EXISTS jobs (
        id SERIAL PRIMARY KEY,
        client VARCHAR(255) NOT NULL,
        assigned_to VARCHAR(255) NOT NULL,
        category VARCHAR(50) NOT NULL,
        job_name VARCHAR(255),
        job_type TEXT[],
        delivery_date TIMESTAMP NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        completion_status VARCHAR(50),
        led_deliverables TEXT[],
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Add job_name column if it doesn't exist (for existing databases)
    try {
      await db`
        DO $$ 
        BEGIN 
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'jobs' AND column_name = 'job_name'
          ) THEN
            ALTER TABLE jobs ADD COLUMN job_name VARCHAR(255);
          END IF;
        END $$;
      `;
    } catch (alterError) {
      // Column might already exist, ignore error
      console.log('Column job_name might already exist:', alterError.message);
    }

  // Insert default clients if they don't exist
  const defaultClients = ['stc', 'CBK', 'BK', 'PH', 'solutions', 'Subway'];
  for (const clientName of defaultClients) {
    await db`
      INSERT INTO clients (name)
      VALUES (${clientName})
      ON CONFLICT (name) DO NOTHING
    `;
  }

    // Insert default employees if they don't exist
    const defaultEmployees = ['Mijoy', 'Sajid'];
    for (const empName of defaultEmployees) {
      await db`
        INSERT INTO employees (name)
        VALUES (${empName})
        ON CONFLICT (name) DO NOTHING
      `;
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

