import { Injector } from '@angular/core';

import { ProductRepository } from '../domain/product-repository';
import type { CatalogError } from '../domain/catalog-error';
import type { Product } from '../domain/product';
import { InMemoryProductRepository } from '../testing/in-memory-product-repository';
import { aProduct } from '../testing/product.fixture';
import { GetProductBySlug } from './get-product-by-slug.use-case';
import { ListCategories } from './list-categories.use-case';
import { ListNewProducts } from './list-new-products.use-case';
import { ListProductsByCategory } from './list-products-by-category.use-case';

const PRODUCTS: Product[] = [
  aProduct({ id: '1', slug: 'zx9', name: 'ZX9', category: 'speakers', new: true }),
  aProduct({ id: '2', slug: 'xx59', name: 'XX59', category: 'headphones' }),
  aProduct({ id: '3', slug: 'xx99', name: 'XX99', category: 'headphones', new: true }),
];
const NETWORK: CatalogError = { kind: 'NETWORK' };

const setup = (failure?: CatalogError) => {
  const repository = new InMemoryProductRepository(PRODUCTS, failure);
  return Injector.create({
    providers: [
      { provide: ProductRepository, useValue: repository },
      ListCategories,
      ListProductsByCategory,
      GetProductBySlug,
      ListNewProducts,
    ],
  });
};

describe('ListCategories', () => {
  it('renvoie les catégories dérivées des produits', async () => {
    const result = await setup().get(ListCategories).execute();
    expect(result).toEqual({
      ok: true,
      value: [
        { name: 'speakers', label: 'SPEAKERS' },
        { name: 'headphones', label: 'HEADPHONES' },
      ],
    });
  });

  it('propage l’erreur du dépôt', async () => {
    expect(await setup(NETWORK).get(ListCategories).execute()).toEqual({ ok: false, error: NETWORK });
  });
});

describe('ListProductsByCategory', () => {
  it('filtre par catégorie et trie nouveaux d’abord', async () => {
    const result = await setup().get(ListProductsByCategory).execute('headphones');
    expect(result.ok && result.value.map((product) => product.slug)).toEqual(['xx99', 'xx59']);
  });

  it('renvoie une liste vide pour une catégorie inconnue', async () => {
    expect(await setup().get(ListProductsByCategory).execute('inconnue')).toEqual({ ok: true, value: [] });
  });

  it('propage l’erreur du dépôt', async () => {
    expect(await setup(NETWORK).get(ListProductsByCategory).execute('headphones')).toEqual({
      ok: false,
      error: NETWORK,
    });
  });
});

describe('GetProductBySlug', () => {
  it('trouve un produit par son slug', async () => {
    const result = await setup().get(GetProductBySlug).execute('zx9');
    expect(result.ok && result.value.id).toBe('1');
  });

  it('signale un produit introuvable', async () => {
    expect(await setup().get(GetProductBySlug).execute('absent')).toEqual({
      ok: false,
      error: { kind: 'NOT_FOUND', slug: 'absent' },
    });
  });

  it('propage l’erreur du dépôt', async () => {
    expect(await setup(NETWORK).get(GetProductBySlug).execute('zx9')).toEqual({ ok: false, error: NETWORK });
  });
});

describe('ListNewProducts', () => {
  it('ne renvoie que les nouveaux produits', async () => {
    const result = await setup().get(ListNewProducts).execute();
    expect(result.ok && result.value.map((product) => product.slug)).toEqual(['zx9', 'xx99']);
  });
});
