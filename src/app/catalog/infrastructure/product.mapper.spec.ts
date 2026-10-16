import { aProduct } from '../testing/product.fixture';
import { dtoToProduct } from './product.mapper';

describe('dtoToProduct', () => {
  it('convertit un DTO valide en produit', () => {
    const product = aProduct({ shortName: 'XX99' });
    expect(dtoToProduct(JSON.parse(JSON.stringify(product)))).toEqual({ ok: true, value: product });
  });

  it('ignore les champs inconnus', () => {
    const result = dtoToProduct({ ...aProduct(), extra: 'ignoré' });
    expect(result.ok && 'extra' in result.value).toBe(false);
  });

  it('refuse un DTO dont un champ obligatoire manque', () => {
    const incomplete: Record<string, unknown> = { ...aProduct() };
    delete incomplete['price'];
    const result = dtoToProduct(incomplete);
    expect(result.ok).toBe(false);
    expect(!result.ok && result.error.kind).toBe('INVALID_DATA');
  });

  it('refuse un type de champ incorrect', () => {
    const result = dtoToProduct({ ...aProduct(), price: '100' });
    expect(!result.ok && result.error.kind).toBe('INVALID_DATA');
  });

  it('refuse un produit qui viole un invariant du domaine', () => {
    const result = dtoToProduct({ ...aProduct(), price: -5 });
    expect(result).toEqual({ ok: false, error: { kind: 'INVALID_DATA', detail: 'INVALID_PRICE' } });
  });
});
