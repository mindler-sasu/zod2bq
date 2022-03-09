export const typeMap = {
  ZodString: (_) => "STRING",
  ZodNumber: (def, props) => {
    console.log(def, props);
    return def.isInt ? "INTEGER" : "NUMERIC";
  },
  ZodObject: (_) => "RECORD",
};
