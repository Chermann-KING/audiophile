import { Component, OnInit, inject, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from '../../../../core/services/category.service';
import { NgClass, TitleCasePipe } from '@angular/common';
import { ButtonComponent } from '../../../../design-system/components/button/button.component';
import { ProductCardComponent } from '../product-card/product-card.component';
import { CategoryListComponent } from '../category-list/category-list.component';
import { AboutComponent } from '../../../../shared/components/about/about.component';

@Component({
    selector: 'app-category-detail',
    templateUrl: './category-detail.component.html',
    styleUrl: './category-detail.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
    ButtonComponent,
    ProductCardComponent,
    NgClass,
    CategoryListComponent,
    AboutComponent,
    TitleCasePipe
],
})
export class CategoryDetailComponent implements OnInit {
  private _destroyRef = inject(DestroyRef);
  private _router = inject(Router);
  private _route = inject(ActivatedRoute);
  private _categoryService = inject(CategoryService);

  category: string = '';
  products: any[] = [];
  loading: boolean = true;

  ngOnInit(): void {
    this._route.params.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((params) => {
      this.category = params['category'];
      this.loadProducts();
    });
  }

  loadProducts(): void {
    this.loading = true;
    this._categoryService.getProductsByCategory(this.category).subscribe({
      next: (products) => {
        console.log('Produits récupérés:', products);

        // ?Trie les produits par nouveaux d'abord, puis par ordre alphabétique
        this.products = products.sort((a, b) => {
          // D'abord par statut "new"
          if (a.new && !b.new) return -1;
          if (!a.new && b.new) return 1;

          // ?Ensuite par nom (ordre alphabétique) en cas d'égalité
          return a.name.localeCompare(b.name);
        });

        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des produits:', error);
        this.loading = false;
      },
    });
  }

  backToHome() {
    this._router.navigate(['/']);
  }
}
