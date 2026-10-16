import { aProduct } from '../testing/product.fixture';
import { createProduct, sortForDisplay } from './product';

describe('createProduct', () => {
  it('accepte un produit valide', () => {
    const product = aProduct();
    expect(createProduct(product)).toEqual({ ok: true, value: product });
  });

  it.each([
    ['price', { price: -1 }, 'INVALID_PRICE'],
    ['slug', { slug: '  ' }, 'EMPTY_SLUG'],
    ['name', { name: '' }, 'EMPTY_NAME'],
    ['category', { category: ' ' }, 'EMPTY_CATEGORY'],
  ] as const)('refuse un produit avec %s invalide', (_field, overrides, error) => {
    expect(createProduct(aProduct(overrides))).toEqual({ ok: false, error });
  });
});

describe('sortForDisplay', () => {
  it('place les nouveaux produits en premier puis trie par nom', () => {
    const sorted = sortForDisplay([
      aProduct({ id: '1', name: 'Zeta' }),
      aProduct({ id: '2', name: 'Beta', new: true }),
      aProduct({ id: '3', name: 'Alpha' }),
      aProduct({ id: '4', name: 'Gamma', new: true }),
    ]);

    expect(sorted.map((product) => product.name)).toEqual(['Beta', 'Gamma', 'Alpha', 'Zeta']);
  });

  it('ne modifie pas la liste d’origine', () => {
    const products = [aProduct({ name: 'B' }), aProduct({ name: 'A' })];
    sortForDisplay(products);
    expect(products.map((product) => product.name)).toEqual(['B', 'A']);
  });
});
