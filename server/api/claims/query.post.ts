import { PromptEnhancer } from '@@/server/utils/providers/copilot';
// const procCodes = [
//     "A7030", "A7035", "A7037", "A7038", "A7046", "E0562", "E0601", "A7034", "95705", "A4604", "A7031", "98960",
//     "95806", "95723", "A7032", "E0470", "95800", "A7033", "95819", "A9900"
// ]

function removePii(claim) {
    delete claim["Patient First Name"];
    delete claim["Patient Last Name"];
    return claim;
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);

  if (!body.invoiceNumber) {
    throw createError({
      statusCode: 400,
      message: 'Missing required field: invoiceNumber'
    })
  }

  
  const db = useDatabase();

  try {
    const promptEnhancer = new PromptEnhancer(config.groqApiKey);
    const invoiceNumber = body.invoiceNumber;

    console.log(`Fetching claim with invoice number: ${invoiceNumber}`);
    
    const { rows } = await db.sql`
      SELECT * FROM claims 
      WHERE "Invoice Number" = ${invoiceNumber}
      LIMIT 1
    `;
    
    const claims = rows.map(removePii);
    console.log(`Found ${claims.length} claim(s) with invoice number: ${invoiceNumber}`);

    // TODO: More strict zero adjustment check, including matching of ICD codes and Payor level
    const records = await Promise.all(claims.map(claim => db.sql`
      SELECT * FROM claims 
      WHERE "Payor" = ${claim["Payor"]} 
      AND "Proc Code" = ${claim["Proc Code"]} 
      AND "Adjustments" = '$0.00 '
      LIMIT 1
    `));

    // Flatten records
    const referenceClaims = records.filter(record => record.rows.length > 0).map(record => removePii(record.rows[0]));
    console.log(`Found ${referenceClaims.length} claim(s) with invoice number: ${invoiceNumber}`);

    const answer = await promptEnhancer.claimsAnalysis(claims, referenceClaims, body.question);

    return {
      answer,
      claims,
      referenceClaims
    };
  } catch (error: any) {
    console.error(error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to process question',
    });
  }
});


