import { typeMap } from "./typemap";
import { ParseProps, BigQueryTableField } from "./types";

const leafValue = (
  zObj,
  key: string,
  typeName: string,
  props?
): BigQueryTableField => ({
  name: key,
  type: typeMap[typeName](zObj),
  mode:
    props?.parentNullable || zObj.isNullable() || zObj.isOptional()
      ? "NULLABLE"
      : "REQUIRED",
});

const _parse = (
  zObj: any,
  key?: string,
  props?: ParseProps
): BigQueryTableField[] | BigQueryTableField => {
  const { typeName } = zObj._def;
  switch (typeName) {
    case "ZodString": {
      return leafValue(zObj, key, typeName, props);
    }
    case "ZodBoolean": {
      return leafValue(zObj, key, typeName, props);
    }
    case "ZodNumber": {
      const BQBaseNumber = leafValue(zObj, key, typeName, props);
      if (BQBaseNumber.type === "NUMERIC")
        return {
          ...BQBaseNumber,
          precision: "38",
          scale: "9",
        };

      return BQBaseNumber;
    }
    case "ZodDate": {
      return leafValue(zObj, key, typeName, props);
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
      if (innerZod._def.typeName === "ZodObject") {
        if (!key) {
          return Object.entries(innerZod.shape).map(([key, zObj]) =>
            _parse(zObj, key)
          ) as unknown as BigQueryTableField[];
        }
        return {
          name: key,
          type: typeMap[innerZod._def.typeName](zObj),
          mode: "REPEATED",
          fields: Object.entries(innerZod.shape).map(([key, zObj]) =>
            _parse(zObj, key)
          ) as unknown as BigQueryTableField[],
        };
      }
      return {
        name: key,
        type: typeMap[innerZod._def.typeName](zObj),
        mode: "REPEATED",
      };
    }
    case "ZodObject": {
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

export const inferBQ = (zObj) => {
  return _parse(zObj);
};
