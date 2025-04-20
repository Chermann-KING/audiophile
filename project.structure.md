```
angular-audio-ecommerce-app/
│
├── public/                      # Contenu statique
│   ├── assets/
│   │   ├── fonts/
│   │   │   └── manrope/         # Police Manrope
│   │   ├── images/
│   │   │   ├── products/
│   │   │   ├── categories/
│   │   │   └── gallery/
│   │   └── icons/
│
├── src/
│   ├── app/
│   │   ├── core/                # Services, guards, interceptors
│   │   │   ├── services/
│   │   │   │   └── api.service.ts
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   └── core.module.ts
│   │   ├── shared/              # Composants et directives partagés
│   │   │   ├── components/      # Composants réutilisables
│   │   │   ├── directives/
│   │   │   ├── pipes/
│   │   │   └── shared.module.ts
│   │   ├── features/            # Modules fonctionnels
│   │   │   ├── home/
│   │   │   ├── product/
│   │   │   ├── cart/
│   │   │   └── ...
│   │   ├── design-system/       # Composants du design system
│   │   │   ├── buttons/
│   │   │   │   ├── button.component.ts
│   │   │   │   ├── button.component.html
│   │   │   │   └── button.component.scss
│   │   │   ├── form-elements/
│   │   │   │   ├── text-field.component.ts
│   │   │   │   ├── text-field.component.html
│   │   │   │   ├── radio-button.component.ts
│   │   │   │   ├── radio-button.component.html
│   │   │   │   ├── number-input.component.ts
│   │   │   │   └── number-input.component.html
│   │   │   └── design-system.module.ts
│   │   ├── app-routing.module.ts
│   │   ├── app.component.ts
│   │   ├── app.component.html
│   │   ├── app.component.scss
│   │   └── app.module.ts
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   ├── styles/                  # Styles globaux
│   │   ├── _variables.scss
│   │   ├── _typography.scss
│   │   ├── _buttons.scss
│   │   ├── _forms.scss
│   │   ├── _mixins.scss
│   │   └── styles.scss
│   ├── main.ts
│   └── index.html
│
├── server/                      # Configuration json-server
│   ├── db.json
│   └── routes.json
│
├── angular.json
├── package.json
├── tsconfig.json
└── README.md
```
