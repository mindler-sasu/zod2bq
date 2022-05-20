import fs from "fs";
import * as path from "path";
import { SomeZodObject, ZodArray, ZodNumber, ZodString } from "zod";
import { typeMap } from "./typemap";
import { BigQueryTableField, MegaZod, ParseProps } from "./types";

const leafValue = (
  zObj: MegaZod,
  typeName: "ZodString" | "ZodBoolean" | "ZodDate" | "ZodObject" | "ZodNumber",
  key?: string,
  props?: ParseProps
): BigQueryTableField => ({
  name: key,
  type: typeMap[typeName](zObj),
  mode:
    props?.parentNullable || zObj.isNullable() || zObj.isOptional()
      ? "NULLABLE"
      : "REQUIRED",
});

const _parse = (
  zObj: MegaZod,
  key?: string,
  props?: ParseProps
): BigQueryTableField[] | BigQueryTableField => {
  const { typeName } = zObj._def;
  switch (typeName) {
    case "ZodString": {
      return leafValue(zObj, typeName, key, props);
    }
    case "ZodBoolean": {
      return leafValue(zObj, typeName, key, props);
    }
    case "ZodNumber": {
      const BQBaseNumber = leafValue(zObj, typeName, key, props);
      if (BQBaseNumber.type === "NUMERIC")
        return {
          ...BQBaseNumber,
          precision: "38",
          scale: "9",
        };

      return BQBaseNumber;
    }
    case "ZodDate": {
      return leafValue(zObj, typeName, key, props);
    }
    case "ZodNullable":
    case "ZodOptional": {
      return _parse(zObj._def.innerType, key, {
        parentNullable: true,
        parent: zObj,
      });
    }
    case "ZodArray": {
      const innerZod = zObj._def.type;
      if (innerZod._def.typeName === "ZodObject" && "shape" in innerZod) {
        if (!key) {
          return Object.entries(innerZod.shape).map(([key, zObj]) =>
            _parse(zObj, key)
          ) as unknown as BigQueryTableField[];
        }
        return {
          name: key,
          type: typeMap[innerZod._def.typeName](zObj as ZodArray<ZodString>),
          mode: "REPEATED",
          fields: Object.entries(innerZod.shape).map(([key, zObj]) =>
            _parse(zObj, key)
          ) as unknown as BigQueryTableField[],
        };
      }
      return {
        name: key,
        type: typeMap[innerZod._def.typeName](zObj as ZodNumber),
        mode: "REPEATED",
      };
    }
    case "ZodObject": {
      if (!("shape" in zObj)) throw new Error("bork");
      if (!key) {
        return Object.entries(zObj.shape).map(([key, zObj]) =>
          _parse(zObj, key)
        ) as unknown as BigQueryTableField[];
      }
      return {
        name: key,
        type: "RECORD",
        mode: "REQUIRED",
        fields: Object.entries(zObj.shape).map(([key, zObj]) =>
          _parse(zObj, key)
        ) as unknown as BigQueryTableField[],
      };
    }
    case "ZodEffects": {
      return _parse(zObj._def.schema, key, props);
    }
    default: {
      throw Error(`${typeName} PARSING NOT SUPPORTED`);
    }
  }
};

export const inferBQ = (zObj: SomeZodObject, toFile?: string) => {
  const parsed = _parse(zObj);
  if (toFile) {
    fs.writeFileSync(
      path.join(__dirname, toFile),
      JSON.stringify(parsed, null, 2),
      "utf-8"
    );
  }
  return parsed;
};
