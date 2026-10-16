import { Component } from '@angular/core';
import { HeroComponent } from '../hero/hero.component';
import { CategoryListComponent } from '../category-list/category-list.component';
import { AboutComponent } from '../../../shared/components/about/about.component';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss',
    imports: [HeroComponent, CategoryListComponent, AboutComponent]
})
export class HomeComponent {

}
