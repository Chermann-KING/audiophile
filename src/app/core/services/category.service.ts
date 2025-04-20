import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Category {
  name: string; // Identifiant de la catégorie (pour le routage)
  label: string; // Nom formaté pour l'affichage
  image: string; // Chemin vers l'image représentative
}

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private _apiUrl = 'http://localhost:3000';

  constructor(private _http: HttpClient) {}

  // Obtenir toutes les catégories uniques et formatées
  getCategories(): Observable<Category[]> {
    return this._http.get<any[]>(`${this._apiUrl}/products`).pipe(
      map((products) => {
        // Extraire les catégories uniques
        const categoryNames = [
          ...new Set(products.map((product) => product.category)),
        ];

        // Formater les catégories pour l'affichage
        return categoryNames.map((name) => {
          // construit l'objet Category
          return {
            name: name,
            label: name.toUpperCase(),
            image: `/assets/images/shared/desktop/image-category-thumbnail-${name}.png`,
          };
        });
      })
    );
  }

  // Obtenir tous les produits d'une catégorie spécifique
  getProductsByCategory(category: string): Observable<any[]> {
    return this._http
      .get<any[]>(`${this._apiUrl}/products`)
      .pipe(
        map((products) =>
          products.filter((product) => product.category === category)
        )
      );
  }
}
