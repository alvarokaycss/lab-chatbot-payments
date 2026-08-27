import "@dotenvx/dotenvx/config";
import type { Product } from "../types.js";

const DEFAULT_CURRENCY = process.env.DEFAULT_CURRENCY || "BRL";

export const initialProducts: Product[] = [
  {
    id: "prod_001",
    nome: "PlayStation 5 Slim 1TB",
    preco: 3799.00,
    moeda: DEFAULT_CURRENCY,
    estoque: 8,
    categoria: "consoles"
  },
  {
    id: "prod_002",
    nome: "Cadeira Gamer Ergonômica",
    preco: 1250.00,
    moeda: DEFAULT_CURRENCY,
    estoque: 15,
    categoria: "moveis"
  },
  {
    id: "prod_003",
    nome: "Fone Bluetooth com Cancelamento de Ruído",
    preco: 249.90,
    moeda: DEFAULT_CURRENCY,
    estoque: 20,
    categoria: "audio"
  },
  {
    id: "prod_004",
    nome: "Teclado Mecânico RGB Switch Blue",
    preco: 389.00,
    moeda: DEFAULT_CURRENCY,
    estoque: 14,
    categoria: "perifericos"
  },
  {
    id: "prod_005",
    nome: "Mouse Sem Fio 16000 DPI",
    preco: 129.90,
    moeda: DEFAULT_CURRENCY,
    estoque: 25,
    categoria: "perifericos"
  },
  {
    id: "prod_006",
    nome: "Monitor Ultrawide 29 Polegadas IPS",
    preco: 1899.00,
    moeda: DEFAULT_CURRENCY,
    estoque: 6,
    categoria: "monitores"
  },
  {
    id: "prod_007",
    nome: "Cabo HDMI 2.1 8K 2 Metros",
    preco: 49.90,
    moeda: DEFAULT_CURRENCY,
    estoque: 50,
    categoria: "cabos"
  }
];

// Estado mutável do catálogo em memória
const catalogStore = new Map<string, Product>(
  initialProducts.map((prod) => [prod.id, { ...prod }])
);

export function listProducts(categoria?: string): Product[] {
  const products = Array.from(catalogStore.values());
  if (!categoria) {
    return products;
  }
  const cleanCategory = categoria.trim().toLowerCase();
  return products.filter(
    (p) => p.categoria && p.categoria.toLowerCase() === cleanCategory
  );
}

export function findProductById(id: string): Product | undefined {
  return catalogStore.get(id);
}

export function decrementStock(id: string, quantity: number): boolean {
  const product = catalogStore.get(id);
  if (!product || product.estoque < quantity) {
    return false;
  }
  product.estoque -= quantity;
  return true;
}

export function resetCatalogStore(): void {
  catalogStore.clear();
  initialProducts.forEach((prod) => catalogStore.set(prod.id, { ...prod }));
}
