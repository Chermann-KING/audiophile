import { Component, ChangeDetectionStrategy } from '@angular/core';
import { HeroComponent } from '../../components/hero/hero.component';
import { CategoryListComponent } from '../../../categories/components/category-list/category-list.component';
import { AboutComponent } from '../../../../shared/components/about/about.component';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [HeroComponent, CategoryListComponent, AboutComponent]
})
export class HomeComponent {

}
