const pool = require('./src/config/db');

async function dump() {
  try {
    const [tables] = await pool.query('SHOW TABLES');
    for (let row of tables) {
      const tableName = Object.values(row)[0];
      console.log(`\nTable: ${tableName}`);
      const [columns] = await pool.query(`DESCRIBE ${tableName}`);
      columns.forEach(col => {
        console.log(`- ${col.Field} (${col.Type}) ${col.Key ? '['+col.Key+']' : ''}`);
      });
    }
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}

dump();
