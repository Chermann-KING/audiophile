import {
  Component,
  OnInit,
  OnDestroy,
  Renderer2,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProductService } from '../../../../core/services/product.service';

@Component({
  selector: 'app-hero',
  standalone: false,
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss'],
})
export class HeroComponent implements OnInit, OnDestroy, AfterViewInit {
  newProducts: any[] = [];
  currentProductIndex = 0;
  activeProduct: any;
  isLoading = true;
  private _productsSubscription: Subscription | null = null;
  private _slideChangeTimer: any;
  private _animationTimer: any;

  constructor(
    private _productService: ProductService,
    private _router: Router,
    private _renderer: Renderer2,
    private _el: ElementRef
  ) {}

  ngOnInit(): void {
    this._loadFeaturedProducts();
    // Mettre en place un changement automatique de slide toutes les 8 secondes
    this._setupAutoSlideChange();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const heroElement = this._el.nativeElement.querySelector('.hero');
      if (heroElement) {
        // Force un reflow avant d'ajouter la classe
        void heroElement.offsetWidth;
        this._renderer.addClass(heroElement, 'slide-first-load');

        // Après la fin des animations, ajouter une classe pour maintenir les éléments visibles
        setTimeout(() => {
          this._renderer.removeClass(heroElement, 'slide-first-load');
          this._renderer.addClass(heroElement, 'animation-complete');
        }, 2000); // Délai correspondant à la durée totale des animations
      }
    }, 300); // Délai pour éviter le flash
  }

  private _loadFeaturedProducts(): void {
    this.isLoading = true;
    this._productsSubscription = this._productService
      .getNewProducts()
      .subscribe({
        next: (products) => {
          this.newProducts = products;
          if (this.newProducts.length > 0) {
            this.currentProductIndex = 0;
            this.activeProduct = this.newProducts[0];

            // Précharge les images pour éviter les flashs
            this._preloadProductImages();
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error(
            'Erreur lors du chargement des produits mis en avant',
            err
          );
          this.isLoading = false;
        },
      });
  }

  // Préchargement des images des produits pour éviter les flashs
  private _preloadProductImages(): void {
    if (!this.newProducts || this.newProducts.length === 0) return;

    // Crée des objets Image pour précharger les images
    this.newProducts.forEach((product) => {
      const desktopImg = new Image();
      const tabletImg = new Image();
      const mobileImg = new Image();

      desktopImg.src = `/assets/images/home/desktop/hero-${product.slug}.png`;
      tabletImg.src = `/assets/images/home/tablet/hero-${product.slug}.png`;
      mobileImg.src = `/assets/images/home/mobile/hero-${product.slug}.png`;
    });
  }

  private _setupAutoSlideChange(): void {
    // Change de slide toutes les 8 secondes
    this._slideChangeTimer = setInterval(() => {
      this.nextSlide();
    }, 8000);
  }

  onSeeProduct(): void {
    if (this.activeProduct) {
      this._router.navigate([
        '/products',
        this.activeProduct.category,
        this.activeProduct.slug,
      ]);
    }
  }

  goToSlide(index: number): void {
    if (
      index !== this.currentProductIndex &&
      index >= 0 &&
      index < this.newProducts.length
    ) {
      // Réinitialise le timer automatique
      this._resetAutoSlideTimer();

      // Ajoute une classe pour l'animation de sortie
      const heroElement = this._el.nativeElement.querySelector('.hero');
      if (heroElement) {
        // Applique l'animation de transition
        this._applySlideChangeAnimation(heroElement);

        // Change de produit après un court délai pour permettre à l'animation de sortie de se terminer
        setTimeout(() => {
          this.currentProductIndex = index;
          this.activeProduct = this.newProducts[index];
        }, 400); // Ajusté pour correspondre à la durée de l'animation de sortie
      } else {
        // Fallback si l'élément n'est pas trouvé
        this.currentProductIndex = index;
        this.activeProduct = this.newProducts[index];
      }
    }
  }

  previousSlide(): void {
    // Calcule l'index précédent (avec gestion circulaire)
    const newIndex =
      (this.currentProductIndex - 1 + this.newProducts.length) %
      this.newProducts.length;
    this.goToSlide(newIndex);
  }

  nextSlide(): void {
    // Calcule l'index suivant (avec gestion circulaire)
    const newIndex = (this.currentProductIndex + 1) % this.newProducts.length;
    this.goToSlide(newIndex);
  }

  private _resetAutoSlideTimer(): void {
    // Réinitialise le timer pour que l'utilisateur ait le temps de voir le slide qu'il a sélectionné
    clearInterval(this._slideChangeTimer);
    this._setupAutoSlideChange();
  }

  private _applySlideChangeAnimation(element: HTMLElement): void {
    // Supprime toutes les classes d'animation
    this._renderer.removeClass(element, 'slide-entering');
    this._renderer.removeClass(element, 'slide-exiting');
    this._renderer.removeClass(element, 'slide-first-load');
    this._renderer.removeClass(element, 'animation-complete');

    // Force reflow pour garantir que les animations sont réinitialisées
    void element.offsetWidth;

    // Applique l'animation de sortie
    this._renderer.addClass(element, 'slide-exiting');

    // Attendre que l'animation de sortie soit terminée
    clearTimeout(this._animationTimer);
    this._animationTimer = setTimeout(() => {
      // Supprime la classe de sortie
      this._renderer.removeClass(element, 'slide-exiting');

      // Force un nouveau reflow
      void element.offsetWidth;

      // Applique l'animation d'entrée après le délai
      setTimeout(() => {
        this._renderer.addClass(element, 'slide-entering');

        // Nettoye la classe d'entrée après la fin de toutes les animations
        // et ajoute une classe pour maintenir les éléments visibles
        setTimeout(() => {
          this._renderer.removeClass(element, 'slide-entering');
          this._renderer.addClass(element, 'animation-complete');
        }, 2000);
      }, 50);
    }, 400);
  }

  ngOnDestroy(): void {
    if (this._productsSubscription) {
      this._productsSubscription.unsubscribe();
    }

    // Nettoye les timers
    clearInterval(this._slideChangeTimer);
    clearTimeout(this._animationTimer);
  }
}
