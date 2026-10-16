import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { API_BASE_URL } from '../../core/api-base-url';
import { aProduct } from '../testing/product.fixture';
import { HttpProductRepository } from './http-product-repository';

const setup = () => {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: API_BASE_URL, useValue: 'http://api.test' },
      HttpProductRepository,
    ],
  });
  return { repository: TestBed.inject(HttpProductRepository), http: TestBed.inject(HttpTestingController) };
};

describe('HttpProductRepository', () => {
  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('liste les produits validés', async () => {
    const { repository, http } = setup();
    const pending = repository.listAll();

    http.expectOne('http://api.test/products').flush([aProduct({ id: '1' }), aProduct({ id: '2' })]);

    const result = await pending;
    expect(result.ok && result.value.map((product) => product.id)).toEqual(['1', '2']);
  });

  it('signale des données invalides', async () => {
    const { repository, http } = setup();
    const pending = repository.listAll();

    http.expectOne('http://api.test/products').flush([{ id: 1 }]);

    const result = await pending;
    expect(!result.ok && result.error.kind).toBe('INVALID_DATA');
  });

  it('traduit une erreur serveur', async () => {
    const { repository, http } = setup();
    const pending = repository.listAll();

    http.expectOne('http://api.test/products').flush('boom', { status: 500, statusText: 'Server Error' });

    expect(await pending).toEqual({ ok: false, error: { kind: 'SERVER', status: 500 } });
  });

  it('traduit une erreur réseau', async () => {
    const { repository, http } = setup();
    const pending = repository.listAll();

    http.expectOne('http://api.test/products').error(new ProgressEvent('error'));

    expect(await pending).toEqual({ ok: false, error: { kind: 'NETWORK' } });
  });
});
