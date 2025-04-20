import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  CategoryService,
  Category,
} from '../../../../core/services/category.service';

@Component({
  selector: 'app-category-list',
  standalone: false,
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss'],
})
export class CategoryListComponent implements OnInit {
  categories: Category[] = [];

  constructor(
    private _categoryService: CategoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this._categoryService.getCategories().subscribe({
      next: (categories) => {
        console.log('Catégories récupérées:', categories);
        this.categories = categories;
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des catégories:', error);
      },
    });
  }

  goToCategory(categoryName: string): void {
    this.router.navigate(['/categories', categoryName]);
  }
}
