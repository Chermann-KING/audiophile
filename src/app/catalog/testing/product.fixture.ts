import type { Product } from '../domain/product';

const image = { mobile: 'm.jpg', tablet: 't.jpg', desktop: 'd.jpg' };

export const aProduct = (overrides: Partial<Product> = {}): Product => ({
  id: '1',
  slug: 'xx99-mark-two',
  name: 'XX99 Mark II',
  image,
  category: 'headphones',
  categoryImage: image,
  new: false,
  price: 100,
  description: 'description',
  features: 'features',
  includes: [],
  gallery: { first: image, second: image, third: image },
  others: [],
  ...overrides,
});
