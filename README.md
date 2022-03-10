# Convert Zod Schemas to BigQuery Schemas

very nice project

```
import { zod2bq } from "zod2bq"
import { z } from "zod"

const zodSchema = z.object({
      beers: z.array(z.object({ name: z.string() })),
    });
const bigquerySchema = zod2bq(zodSchema);
```