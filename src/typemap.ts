export const typeMap = {
  ZodString: (_) => "STRING",
  ZodNumber: (def, props?) => (def.isInt ? "INTEGER" : "NUMERIC"),
  ZodObject: (_) => "RECORD",
  ZodDate: (_) => "TIMESTAMP",
  ZodBoolean: () => "BOOLEAN",
};
