import { z } from "zod";
import type { CatalogListResult } from "../types.js";
import { listProducts } from "../db/catalog.js";

export const listCatalogSchema = z.object({
  categoria: z
    .string()
    .optional()
    .describe("Filtro opcional por categoria de produtos (ex: 'audio', 'perifericos', 'consoles')")
});

export function handleListCatalog(
  args: z.infer<typeof listCatalogSchema>
): CatalogListResult {
  const produtos = listProducts(args.categoria);
  return { produtos };
}
