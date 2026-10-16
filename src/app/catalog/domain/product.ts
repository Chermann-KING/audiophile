import { err, ok, type Result } from '../../shared/kernel/result';

export interface Image {
  readonly mobile: string;
  readonly tablet: string;
  readonly desktop: string;
}

export interface IncludedItem {
  readonly quantity: number;
  readonly item: string;
}

export interface Gallery {
  readonly first: Image;
  readonly second: Image;
  readonly third: Image;
}

export interface RelatedProduct {
  readonly slug: string;
  readonly name: string;
  readonly image: Image;
}

export interface Product {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly shortName?: string;
  readonly image: Image;
  readonly category: string;
  readonly categoryImage: Image;
  readonly new: boolean;
  readonly price: number;
  readonly description: string;
  readonly features: string;
  readonly includes: readonly IncludedItem[];
  readonly gallery: Gallery;
  readonly others: readonly RelatedProduct[];
}

export type ProductError = 'INVALID_PRICE' | 'EMPTY_SLUG' | 'EMPTY_NAME' | 'EMPTY_CATEGORY';

const isBlank = (value: string): boolean => value.trim().length === 0;

export function createProduct(product: Product): Result<Product, ProductError> {
  if (!(product.price >= 0)) return err('INVALID_PRICE');
  if (isBlank(product.slug)) return err('EMPTY_SLUG');
  if (isBlank(product.name)) return err('EMPTY_NAME');
  if (isBlank(product.category)) return err('EMPTY_CATEGORY');
  return ok(product);
}

// Nouveaux produits d'abord, puis ordre alphabétique des noms.
export function sortForDisplay(products: readonly Product[]): Product[] {
  return [...products].sort((a, b) => {
    if (a.new !== b.new) return a.new ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}
