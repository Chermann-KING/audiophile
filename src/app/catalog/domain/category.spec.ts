import { aProduct } from '../testing/product.fixture';
import { deriveCategories } from './category';

describe('deriveCategories', () => {
  it('dérive les catégories uniques, dans l’ordre d’apparition', () => {
    const categories = deriveCategories([
      aProduct({ category: 'headphones' }),
      aProduct({ category: 'speakers' }),
      aProduct({ category: 'headphones' }),
    ]);

    expect(categories).toEqual([
      { name: 'headphones', label: 'HEADPHONES' },
      { name: 'speakers', label: 'SPEAKERS' },
    ]);
  });

  it('renvoie une liste vide sans produit', () => {
    expect(deriveCategories([])).toEqual([]);
  });
});
