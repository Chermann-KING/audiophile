export interface Image {
  mobile: string;
  tablet: string;
  desktop: string;
}

export interface IncludedItem {
  quantity: number;
  item: string;
}

export interface Gallery {
  first: Image;
  second: Image;
  third: Image;
}

export interface RelatedProduct {
  slug: string;
  name: string;
  image: Image;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  shortName?: string;
  image: Image;
  category: string;
  categoryImage: Image;
  new: boolean;
  price: number;
  description: string;
  features: string;
  includes: IncludedItem[];
  gallery: Gallery;
  others: RelatedProduct[];
}
