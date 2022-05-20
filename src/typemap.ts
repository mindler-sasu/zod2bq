import { MegaZod } from "./types";

export const typeMap = {
  ZodString: (_: MegaZod): "STRING" => "STRING",
  ZodNumber: (def: MegaZod): "INTEGER" | "NUMERIC" =>
    "isInt" in def && def.isInt ? "INTEGER" : "NUMERIC",
  ZodObject: (_: MegaZod): "RECORD" => "RECORD",
  ZodDate: (_: MegaZod): "TIMESTAMP" => "TIMESTAMP",
  ZodBoolean: (): "BOOLEAN" => "BOOLEAN",
};
