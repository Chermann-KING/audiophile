import type { Product } from './product';

export interface Category {
  readonly name: string; // identifiant, utilisé pour le routage
  readonly label: string; // nom formaté pour l'affichage
}

export function deriveCategories(products: readonly Product[]): Category[] {
  const names = [...new Set(products.map((product) => product.category))];
  return names.map((name) => ({ name, label: name.toUpperCase() }));
}
