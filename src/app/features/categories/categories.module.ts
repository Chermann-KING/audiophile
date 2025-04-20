import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { CategoriesRoutingModule } from './categories-routing.module';
import { CategoryListComponent } from './components/category-list/category-list.component';
import { CategoryDetailComponent } from './components/category-detail/category-detail.component';
import { ProductCardComponent } from './components/product-card/product-card.component';
import { SharedModule } from '../../shared/shared.module';
import { DesignSystemModule } from '../../design-system/design-system.module';

@NgModule({
  declarations: [
    CategoryListComponent,
    CategoryDetailComponent,
    ProductCardComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    CategoriesRoutingModule,
    SharedModule,
    DesignSystemModule,
  ],
  exports: [CategoryListComponent],
})
export class CategoriesModule {}
