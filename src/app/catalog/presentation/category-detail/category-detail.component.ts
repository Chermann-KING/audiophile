import { Component, OnInit, inject, DestroyRef, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { NgClass, TitleCasePipe } from '@angular/common';

import { ButtonComponent } from '../../../design-system/components/button/button.component';
import { AboutComponent } from '../../../shared/components/about/about.component';
import { ListProductsByCategory } from '../../application/list-products-by-category.use-case';
import type { Product } from '../../domain/product';
import { CategoryListComponent } from '../category-list/category-list.component';
import { ProductCardComponent } from '../product-card/product-card.component';

@Component({
  selector: 'app-category-detail',
  templateUrl: './category-detail.component.html',
  styleUrl: './category-detail.component.scss',
  imports: [ButtonComponent, ProductCardComponent, NgClass, CategoryListComponent, AboutComponent, TitleCasePipe],
})
export class CategoryDetailComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly listProductsByCategory = inject(ListProductsByCategory);

  readonly category = signal('');
  readonly products = signal<readonly Product[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.category.set(params['category']);
      void this.loadProducts();
    });
  }

  backToHome(): void {
    this.router.navigate(['/']);
  }

  private async loadProducts(): Promise<void> {
    const requested = this.category();
    this.loading.set(true);

    const result = await this.listProductsByCategory.execute(requested);

    // Une navigation plus récente a pris le relais : on ignore cette réponse.
    if (requested !== this.category()) return;
    if (result.ok) {
      this.products.set(result.value);
    } else {
      console.error('Erreur lors de la récupération des produits:', result.error);
    }
    this.loading.set(false);
  }
}
