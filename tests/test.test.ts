import { inferBQ } from "../src/zod2bq";
import { z } from "zod";

describe("test bq", () => {
  it("should work with basic object string", async () => {
    const zodSchema = z.object({ bar: z.string(), beer: z.string() });
    const bq = inferBQ(zodSchema);
    expect(bq).toEqual([
      { name: "bar", type: "STRING", mode: "REQUIRED" },
      { name: "beer", type: "STRING", mode: "REQUIRED" },
    ]);
  });

  it("should work with partial object string", async () => {
    const zodSchema = z.object({ bar: z.string(), beer: z.string() }).partial();
    const bq = inferBQ(zodSchema);
    expect(bq).toEqual([
      { name: "bar", type: "STRING", mode: "NULLABLE" },
      { name: "beer", type: "STRING", mode: "NULLABLE" },
    ]);
  });

  it("should work with number", async () => {
    const zodSchema = z.object({ beers: z.number() });
    const bq = inferBQ(zodSchema);
    expect(bq).toEqual([
      {
        name: "beers",
        type: "NUMERIC",
        mode: "REQUIRED",
        precision: "38",
        scale: "9",
      },
    ]);
  });
  it("should work with integer", async () => {
    const zodSchema = z.object({ beers: z.number().int() });
    const bq = inferBQ(zodSchema);
    expect(bq).toEqual([
      {
        name: "beers",
        type: "INTEGER",
        mode: "REQUIRED",
      },
    ]);
  });

  it("should work integer nullable", async () => {
    const zodSchema = z.object({ beers: z.number().int().nullable() });
    const bq = inferBQ(zodSchema);
    expect(bq).toEqual([
      {
        name: "beers",
        type: "INTEGER",
        mode: "NULLABLE",
      },
    ]);
  });

  it("should work with record", async () => {
    const zodSchema = z.object({
      bar: z.object({
        beers: z.number().int(),
      }),
    });
    const bq = inferBQ(zodSchema);
    expect(bq).toEqual([
      {
        name: "bar",
        type: "RECORD",
        fields: [{ name: "beers", type: "INTEGER", mode: "REQUIRED" }],
        mode: "REQUIRED",
      },
    ]);
  });
  it("should work with nested record", async () => {
    const zodSchema = z.object({
      bar: z.object({
        barName: z.string(),
        beers: z.object({
          beerName: z.string(),
        }),
      }),
    });
    const bq = inferBQ(zodSchema);
    expect(bq).toEqual([
      {
        name: "bar",
        type: "RECORD",
        fields: [
          { name: "barName", type: "STRING", mode: "REQUIRED" },
          {
            name: "beers",
            type: "RECORD",
            mode: "REQUIRED",
            fields: [
              {
                name: "beerName",
                type: "STRING",
                mode: "REQUIRED",
              },
            ],
          },
        ],
        mode: "REQUIRED",
      },
    ]);
  });
  it("should work with real life demo", () => {
    const zodSchema = z.object({
      metadata: z
        .object({
          appVersion: z.string(),
        })
        .partial(),
      market: z.string(),
      questionnaire: z.array(
        z.object({
          question: z.string().min(1),
          questionId: z.string().nullable(),
          value: z.number().int(),
        })
      ),
      service: z.string().min(1),
    });
    const bq = inferBQ(zodSchema);
    expect(bq).toEqual([
      {
        name: "metadata",
        type: "RECORD",
        fields: [{ name: "appVersion", type: "STRING", mode: "NULLABLE" }],
        mode: "REQUIRED",
      },
      { name: "market", type: "STRING", mode: "REQUIRED" },
      {
        name: "questionnaire",
        type: "RECORD",
        mode: "REPEATED",
        fields: [
          { name: "question", type: "STRING", mode: "REQUIRED" },
          { name: "questionId", type: "STRING", mode: "NULLABLE" },
          { name: "value", type: "INTEGER", mode: "REQUIRED" },
        ],
      },
      { name: "service", type: "STRING", mode: "REQUIRED" },
    ]);
  });

  it("Should work with array with objects", () => {
    const zodSchema = z.object({
      beers: z.array(z.object({ name: z.string() })),
    });
    const bq = inferBQ(zodSchema);
    expect(bq).toEqual([
      {
        name: "beers",
        type: "RECORD",
        mode: "REPEATED",
        fields: [
          {
            name: "name",
            type: "STRING",
            mode: "REQUIRED",
          },
        ],
      },
    ]);
  });
  it("Should work with array with strings", () => {
    const zodSchema = z.object({
      beers: z.array(z.string()),
    });
    const bq = inferBQ(zodSchema);
    expect(bq).toEqual([
      {
        name: "beers",
        type: "STRING",
        mode: "REPEATED",
      },
    ]);
  });
  it("Should work with array of objects with strings", () => {
    const zodSchema = z.object({
      beers: z.array(z.object({ name: z.string() })),
    });
    const bq = inferBQ(zodSchema);
    expect(bq).toEqual([
      {
        name: "beers",
        type: "RECORD",
        fields: [{ name: "name", type: "STRING", mode: "REQUIRED" }],
        mode: "REPEATED",
      },
    ]);
  });
});
