export default defineEventHandler(async () => {
  const db = useDatabase();

  const { rows } = await db.sql`
    SELECT * FROM claims 
    ORDER BY RANDOM() 
    LIMIT 10
  `;

  return {
    claims: rows.map(claim => {
      // Remove PII
      delete claim["Patient First Name"];
      delete claim["Patient Last Name"];
      return claim;
    })
  };
});
