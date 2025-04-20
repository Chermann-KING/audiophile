import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from '../../../../core/services/category.service';

@Component({
  selector: 'app-category-detail',
  standalone: false,
  templateUrl: './category-detail.component.html',
  styleUrl: './category-detail.component.scss',
})
export class CategoryDetailComponent implements OnInit {
  category: string = '';
  products: any[] = [];
  loading: boolean = true;

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this._route.params.subscribe((params) => {
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
