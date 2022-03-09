import { inferBQ } from "./src/zod2bq";
import { z } from "zod";

const stringSchema = z.object({ bar: z.string(), beer: z.string() });
const bq = inferBQ(stringSchema);
console.log(bq);
// [
//   { name: 'bar', type: 'STRING', mode: 'NULLABLE' },
//   { name: 'beer', type: 'STRING', mode: 'NULLABLE' }
// ]

const stringSchema2 = z.object({ bar: z.string(), beer: z.string() }).partial();
const bq2 = inferBQ(stringSchema2);
console.log(bq2);
// [
//   { name: 'bar', type: 'STRING', mode: 'NULLABLE' },
//   { name: 'beer', type: 'STRING', mode: 'NULLABLE' }
// ]
