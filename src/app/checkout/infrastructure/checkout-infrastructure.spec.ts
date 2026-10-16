import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { API_BASE_URL } from '../../core/api-base-url';
import { createOrderRequest } from '../domain/order-request';
import { aCheckoutInput } from '../testing/checkout.fixture';
import { HttpOrderRepository } from './http-order-repository';
import { dtoToOrder } from './order.mapper';

const REQUEST = (() => {
  const result = createOrderRequest(aCheckoutInput());
  if (!result.ok) throw new Error('fixture invalide');
  return result.value;
})();

describe('dtoToOrder', () => {
  it('lit une commande renvoyée seule (json-server)', () => {
    const result = dtoToOrder({ ...REQUEST, id: 'abc' });
    expect(result.ok && result.value.id).toBe('abc');
  });

  it('lit la commande enveloppée de l’API Vercel', () => {
    const result = dtoToOrder({ success: true, message: 'ok', order: { ...REQUEST, id: 'xyz' } });
    expect(result.ok && result.value.id).toBe('xyz');
  });

  it('tolère les coordonnées e-Money vides d’une commande en espèces', () => {
    const result = dtoToOrder({ ...REQUEST, id: 'a', emoneyNumber: '', emoneyPin: '' });
    expect(result.ok).toBe(true);
  });

  it('refuse une commande dont un champ obligatoire manque', () => {
    const incomplete: Record<string, unknown> = { ...REQUEST };
    delete incomplete['total'];
    expect(dtoToOrder(incomplete).ok).toBe(false);
  });

  it('refuse un moyen de paiement inconnu', () => {
    const result = dtoToOrder({ ...REQUEST, paymentMethod: 'cheque' });
    expect(!result.ok && result.error.kind).toBe('INVALID_DATA');
  });
});

describe('HttpOrderRepository', () => {
  const setup = () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'http://api.test' },
        HttpOrderRepository,
      ],
    });
    return { repository: TestBed.inject(HttpOrderRepository), http: TestBed.inject(HttpTestingController) };
  };

  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('envoie la commande et renvoie la commande enregistrée', async () => {
    const { repository, http } = setup();
    const pending = repository.place(REQUEST);

    const request = http.expectOne('http://api.test/orders');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(REQUEST);
    request.flush({ success: true, message: 'ok', order: { ...REQUEST, id: 'new' } });

    const result = await pending;
    expect(result.ok && result.value.id).toBe('new');
  });

  it('liste les commandes d’un utilisateur selon le statut', async () => {
    const { repository, http } = setup();
    const pending = repository.listByUser('1', 'pending');

    http.expectOne('http://api.test/orders?userId=1&status=pending').flush([{ ...REQUEST, id: 'a' }]);

    const result = await pending;
    expect(result.ok && result.value).toHaveLength(1);
  });

  it('signale une liste invalide', async () => {
    const { repository, http } = setup();
    const pending = repository.listByUser('1', 'completed');

    http.expectOne('http://api.test/orders?userId=1&status=completed').flush({ not: 'une liste' });

    const result = await pending;
    expect(!result.ok && result.error.kind).toBe('INVALID_DATA');
  });

  it('traduit une erreur serveur (400 du serveur Vercel)', async () => {
    const { repository, http } = setup();
    const pending = repository.place(REQUEST);

    http.expectOne('http://api.test/orders').flush({ success: false, message: 'x' }, { status: 400, statusText: 'Bad Request' });

    expect(await pending).toEqual({ ok: false, error: { kind: 'SERVER', status: 400 } });
  });

  it('traduit une erreur réseau', async () => {
    const { repository, http } = setup();
    const pending = repository.place(REQUEST);

    http.expectOne('http://api.test/orders').error(new ProgressEvent('error'));

    expect(await pending).toEqual({ ok: false, error: { kind: 'NETWORK' } });
  });
});
