import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product } from '../../models/product';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private _http: HttpClient) {}

  // Récupère un produit par son slug
  getProductBySlug(slug: string): Observable<Product> {
    return this._http.get<Product[]>(`${this.apiUrl}`).pipe(
      map((products) => {
        const product = products.find((p) => p.slug === slug);
        if (!product) {
          throw new Error(
            `Le produit avec le slogan "${slug}" n'a pas été trouvé`
          );
        }
        return product;
      })
    );
  }

  // Récupère les produits par leurs slugs (pour les produits suggérés)
  getProductsBySlugs(slugs: string[]): Observable<Product[]> {
    return this._http.get<Product[]>(`${this.apiUrl}`).pipe(
      map((products) => {
        return products.filter((product) => slugs.includes(product.slug));
      })
    );
  }

  // Récupère les nouveaux produits
  getNewProducts(): Observable<Product[]> {
    return this._http
      .get<Product[]>(`${this.apiUrl}`)
      .pipe(map((products) => products.filter((product) => product.new)));
  }

  getProducts(): Observable<any[]> {
    return this._http.get<any[]>(this.apiUrl);
  }

  getProductById(id: number): Observable<any> {
    return this._http.get<any>(`${this.apiUrl}/${id}`);
  }
}
