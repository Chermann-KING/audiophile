import type { Cart, CartLine } from '../domain/cart';
import { cartDtoSchema, type LegacyLineDto, type LineDto } from './cart.dto';

const isLegacy = (line: LineDto | LegacyLineDto): line is LegacyLineDto => 'product' in line;

const toLine = (line: LineDto | LegacyLineDto): CartLine =>
  isLegacy(line)
    ? {
        productId: line.product.id,
        name: line.product.name,
        shortName: line.product.shortName,
        unitPrice: line.product.price,
        imageUrl: line.product.image.desktop,
        quantity: line.quantity,
      }
    : line;

// Un contenu absent, illisible ou invalide donne un panier vide : l'état local ne doit jamais bloquer l'interface.
export function jsonToCart(raw: string | null): Cart {
  if (raw === null) return { lines: [] };

  try {
    const parsed = cartDtoSchema.safeParse(JSON.parse(raw));
    return parsed.success ? { lines: parsed.data.map(toLine) } : { lines: [] };
  } catch {
    return { lines: [] };
  }
}

export const cartToJson = (cart: Cart): string => JSON.stringify(cart.lines);
