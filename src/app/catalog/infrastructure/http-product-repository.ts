import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URL } from '../../core/api-base-url';
import { err, ok, type Result } from '../../shared/kernel/result';
import type { CatalogError } from '../domain/catalog-error';
import type { Product } from '../domain/product';
import { ProductRepository } from '../domain/product-repository';
import { dtoToProduct } from './product.mapper';

@Injectable()
export class HttpProductRepository extends ProductRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  async listAll(): Promise<Result<readonly Product[], CatalogError>> {
    try {
      const raw = await firstValueFrom(this.http.get<unknown>(`${this.baseUrl}/products`));
      return this.mapAll(raw);
    } catch (error) {
      return err(toCatalogError(error));
    }
  }

  private mapAll(raw: unknown): Result<readonly Product[], CatalogError> {
    if (!Array.isArray(raw)) return err({ kind: 'INVALID_DATA', detail: 'liste de produits attendue' });

    const products: Product[] = [];
    for (const item of raw) {
      const mapped = dtoToProduct(item);
      if (!mapped.ok) return mapped;
      products.push(mapped.value);
    }
    return ok(products);
  }
}

function toCatalogError(error: unknown): CatalogError {
  if (error instanceof HttpErrorResponse && error.status !== 0) {
    return { kind: 'SERVER', status: error.status };
  }
  return { kind: 'NETWORK' };
}
