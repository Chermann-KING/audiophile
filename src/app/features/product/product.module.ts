import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ProductRoutingModule } from './product-routing.module';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { SharedModule } from '../../shared/shared.module';
import { DesignSystemModule } from '../../design-system/design-system.module';
import { CategoriesModule } from '../categories/categories.module';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        ProductRoutingModule,
        SharedModule,
        DesignSystemModule,
        CategoriesModule,
        ProductDetailComponent,
    ],
})
export class ProductModule {}
