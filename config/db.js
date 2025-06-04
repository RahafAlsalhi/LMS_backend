
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: true }
      : false,
     max: 20, //max number of people in the pool
  // idleTimeoutMillis: 3000, //close idle clients after 30s
  // connectionTimeoutMillis: 2000, //return errors after 2s if connected established.
});

pool.connect().then(() => {
  console.log("secure connection");
});

pool.on("error", (err) => {
  console.error("unexpected error in idle client", err);
  process.exit(-1);
});



export const query = (text, params) => pool.query(text, params);

export default pool;
