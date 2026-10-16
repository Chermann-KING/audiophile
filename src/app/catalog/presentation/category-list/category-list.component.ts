import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { ButtonComponent } from '../../../design-system/components/button/button.component';
import { ListCategories } from '../../application/list-categories.use-case';
import type { Category } from '../../domain/category';

interface CategoryCard extends Category {
  readonly image: string;
}

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss'],
  imports: [ButtonComponent],
})
export class CategoryListComponent implements OnInit {
  private readonly listCategories = inject(ListCategories);
  private readonly router = inject(Router);

  readonly categories = signal<readonly CategoryCard[]>([]);

  async ngOnInit(): Promise<void> {
    const result = await this.listCategories.execute();
    if (!result.ok) {
      console.error('Erreur lors de la récupération des catégories:', result.error);
      return;
    }
    this.categories.set(result.value.map((category) => ({ ...category, image: thumbnailOf(category) })));
  }

  goToCategory(categoryName: string): void {
    this.router.navigate(['/categories', categoryName]);
  }
}

const thumbnailOf = (category: Category): string =>
  `/assets/images/shared/desktop/image-category-thumbnail-${category.name}.png`;
