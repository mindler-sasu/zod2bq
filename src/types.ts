import { TableMetadata, TableField } from "@google-cloud/bigquery";
type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U;

export type ParseProps = {
  parentNullable: boolean;
  parent: any;
};

const fieldNames = [
  "STRING",
  "BYTES",
  "INTEGER",
  "FLOAT",
  "NUMERIC",
  "BIGNUMERIC",
  "BOOLEAN",
  "TIMESTAMP",
  "DATE",
  "TIME",
  "DATETIME",
  "GEOGRAPHY",
  "RECORD",
] as const;

export type BigQueryFieldType = typeof fieldNames[number];
export type BigQueryModeType = "NULLABLE" | "REQUIRED" | "REPEATED";

export type BigQueryTableField = Overwrite<
  TableField,
  {
    type: BigQueryFieldType;
    mode: BigQueryModeType;
  }
>;
