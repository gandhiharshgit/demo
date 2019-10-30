import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { Observable, of, ReplaySubject } from 'rxjs';
import { AuthService, UserToken } from '../../auth/index';
import { CartActions } from '../../cart/store/actions/index';
import * as fromReducers from '../../cart/store/reducers/index';
import { Cart } from '../../model/cart.model';
import { OrderEntry } from '../../model/order.model';
import { PROCESS_FEATURE } from '../../process/store/process-state';
import * as fromProcessReducers from '../../process/store/reducers';
import { OCC_USER_ID_ANONYMOUS } from '../../occ/utils/occ-constants';
import { StateWithCart } from '../store/cart-state';
import { CartDataService } from './cart-data.service';
import { CartService } from './cart.service';

class CartDataServiceStub {
  userId;
  cart;
  cartId;
  isGuestCart;
}

const userToken$ = new ReplaySubject<UserToken>();

class AuthServiceStub {
  getUserToken(): Observable<UserToken> {
    return userToken$.asObservable();
  }
}

describe('CartService', () => {
  let service: CartService;
  let cartData: CartDataServiceStub;
  let store: Store<StateWithCart>;

  const productCode = '1234';
  const userId = 'testUserId';
  const mockUserToken: UserToken = {
    userId,
    access_token: 'access_token',
    token_type: 'token_type',
    refresh_token: 'refresh_token',
    expires_in: 1,
    scope: ['scope'],
  };
  const cart = { code: 'testCartId', guid: 'testGuid', user: 'assigned' };
  const mockCartEntry: OrderEntry = {
    entryNumber: 0,
    product: { code: productCode },
    quantity: 1,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({}),
        StoreModule.forFeature('cart', fromReducers.getReducers()),
        StoreModule.forFeature(
          PROCESS_FEATURE,
          fromProcessReducers.getReducers()
        ),
      ],
      providers: [
        CartService,
        { provide: CartDataService, useClass: CartDataServiceStub },
        { provide: AuthService, useClass: AuthServiceStub },
      ],
    });

    service = TestBed.get(CartService as Type<CartService>);
    cartData = TestBed.get(CartDataService as Type<CartDataService>);
    store = TestBed.get(Store as Type<Store<StateWithCart>>);
  });

  it('should CartService be injected', () => {
    expect(service).toBeTruthy();
  });

  const loadOrMergeMethod = 'loadOrMerge';
  describe(loadOrMergeMethod, () => {
    describe('when the cart is not created', () => {
      it('should load the cart', () => {
        spyOn(store, 'dispatch').and.stub();
        cartData.cart = {};

        service[loadOrMergeMethod]();
        expect(store.dispatch).toHaveBeenCalledWith(
          new CartActions.LoadCart({
            userId: cartData.userId,
            cartId: 'current',
          })
        );
      });
    });
    describe('when the cart is created', () => {
      it('should merge the cart', () => {
        spyOn(store, 'dispatch').and.stub();
        cartData.cart = cart;

        service[loadOrMergeMethod]();
        expect(store.dispatch).toHaveBeenCalledWith(
          new CartActions.MergeCart({
            userId: cartData.userId,
            cartId: cartData.cart.guid,
          })
        );
      });
    });
    const guestCartMergeMethod = 'guestCartMerge';
    describe('when user is guest', () => {
      beforeEach(() => {
        spyOn(service, 'isGuestCart').and.returnValue(true);
        spyOn(store, 'dispatch').and.stub();

        cartData.cart = cart;
      });
      it('should delete guest cart', () => {
        service[loadOrMergeMethod]();
        expect(store.dispatch).toHaveBeenCalledWith(
          new CartActions.DeleteCart({
            userId: OCC_USER_ID_ANONYMOUS,
            cartId: cartData.cart.guid,
          })
        );
      });

      it('should create a new cart', () => {
        spyOn<any>(service, 'isCreated').and.returnValue(false);

        service[guestCartMergeMethod]();
        expect(store.dispatch).toHaveBeenCalledWith(
          new CartActions.CreateCart({ userId: cartData.userId })
        );
      });

      it('should copy content of guest cart to user cart', () => {
        spyOn<any>(service, 'isCreated').and.returnValue(true);
        spyOn(service, 'addEntries').and.stub();
        spyOn(service, 'getEntries').and.returnValues(
          of([mockCartEntry]),
          of([])
        );

        service[guestCartMergeMethod]();
        expect(service.addEntries).toHaveBeenCalledWith([mockCartEntry]);
      });
    });
  });

  describe('load', () => {
    it('should dispatch load with cartId when exists', () => {
      spyOn(store, 'dispatch').and.stub();
      cartData.cartId = cart.code;

      service['load']();
      expect(store.dispatch).toHaveBeenCalledWith(
        new CartActions.LoadCart({
          userId: cartData.userId,
          cartId: cartData.cartId,
        })
      );
    });
    it('should dispatch load with "current" for logged user without cartId', () => {
      spyOn(store, 'dispatch').and.stub();
      cartData.cartId = null;

      service['load']();
      expect(store.dispatch).toHaveBeenCalledWith(
        new CartActions.LoadCart({
          userId: cartData.userId,
          cartId: 'current',
        })
      );
    });
    it('should dispatch with cartId for anonymous user', () => {
      spyOn(store, 'dispatch').and.stub();
      cartData.cartId = cart.code;
      cartData.userId = OCC_USER_ID_ANONYMOUS;

      service['load']();
      expect(store.dispatch).toHaveBeenCalledWith(
        new CartActions.LoadCart({
          userId: cartData.userId,
          cartId: cartData.cartId,
        })
      );
    });
  });

  describe('addEntry', () => {
    it('should be able to add entry if cart exists', () => {
      store.dispatch(new CartActions.CreateCartSuccess(cart));
      spyOn(store, 'dispatch').and.callThrough();

      cartData.userId = userId;
      cartData.cart = cart;
      cartData.cartId = cart.code;

      service.addEntry(productCode, 2);

      expect(store.dispatch).toHaveBeenCalledWith(
        new CartActions.CartAddEntry({
          userId: userId,
          cartId: cart.code,
          productCode: productCode,
          quantity: 2,
        })
      );
    });

    it('should be able to add entry if cart does not exist', () => {
      store.dispatch(new CartActions.LoadCartSuccess({}));
      const spy = spyOn(store, 'dispatch').and.callThrough();

      cartData.userId = userId;
      cartData.cart = {};
      service.addEntry(productCode, 2);

      cartData.cartId = cart.code;
      store.dispatch(new CartActions.LoadCartSuccess(cart));

      expect(spy.calls.first().args).toEqual([
        new CartActions.CreateCart({
          userId: userId,
        }),
      ]);

      expect(spy.calls.mostRecent().args).toEqual([
        new CartActions.CartAddEntry({
          userId: userId,
          cartId: cart.code,
          productCode: productCode,
          quantity: 2,
        }),
      ]);
    });
  });

  describe('update CartEntry', () => {
    it('should be able to updateCartEntry with quantity > 0', () => {
      spyOn(store, 'dispatch').and.stub();

      cartData.userId = userId;
      cartData.cart = cart;
      cartData.cartId = cart.code;
      service.updateEntry('1', 1);

      expect(store.dispatch).toHaveBeenCalledWith(
        new CartActions.CartUpdateEntry({
          userId: userId,
          cartId: cart.code,
          entry: '1',
          qty: 1,
        })
      );
    });

    it('should be able to updateCartEntry with quantity = 0', () => {
      spyOn(store, 'dispatch').and.stub();
      cartData.userId = userId;
      cartData.cart = cart;
      cartData.cartId = cart.code;
      service.updateEntry('1', 0);

      expect(store.dispatch).toHaveBeenCalledWith(
        new CartActions.CartRemoveEntry({
          userId: userId,
          cartId: cart.code,
          entry: '1',
        })
      );
    });
  });

  describe('remove CartEntry', () => {
    it('should be able to removeCartEntry', () => {
      spyOn(store, 'dispatch').and.stub();
      cartData.userId = userId;
      cartData.cart = cart;
      cartData.cartId = cart.code;

      service.removeEntry(mockCartEntry);

      expect(store.dispatch).toHaveBeenCalledWith(
        new CartActions.CartRemoveEntry({
          userId: userId,
          cartId: cart.code,
          entry: mockCartEntry.entryNumber,
        })
      );
    });
  });

  describe('getLoaded', () => {
    it('should return a loaded state', () => {
      store.dispatch(new CartActions.CreateCartSuccess(cart));
      let result: boolean;
      service
        .getLoaded()
        .subscribe(value => (result = value))
        .unsubscribe();
      expect(result).toEqual(true);
    });
  });

  describe('getEntry', () => {
    it('should return an entry', () => {
      const testCart: Cart = <Cart>{
        entries: [
          { product: { code: 'code1' } },
          { product: { code: 'code2' } },
        ],
      };
      store.dispatch(new CartActions.LoadCartSuccess(testCart));

      let result: OrderEntry;
      service
        .getEntry('code1')
        .subscribe(value => (result = value))
        .unsubscribe();
      expect(result).toEqual(testCart.entries[0]);
    });
  });

  describe('getEntries', () => {
    it('should return entries', () => {
      const testCart: Cart = <Cart>{
        entries: [
          { product: { code: 'code1' } },
          { product: { code: 'code2' } },
        ],
      };
      store.dispatch(new CartActions.LoadCartSuccess(testCart));

      let result: OrderEntry[];
      service
        .getEntries()
        .subscribe(value => (result = value))
        .unsubscribe();
      expect(result).toEqual(testCart.entries);
    });
  });

  describe('getCartMergeComplete', () => {
    it('should return true when the merge is complete', () => {
      store.dispatch(
        new CartActions.MergeCartSuccess({ cartId: 'cartId', userId: 'userId' })
      );
      let result: boolean;
      service
        .getCartMergeComplete()
        .subscribe(mergeComplete => (result = mergeComplete))
        .unsubscribe();
      expect(result).toEqual(true);
    });
  });

  describe('addEmail', () => {
    it('should be able to add email to cart', () => {
      spyOn(store, 'dispatch').and.stub();
      cartData.userId = userId;
      cartData.cart = cart;
      cartData.cartId = cart.code;

      service.addEmail('test@test.com');

      expect(store.dispatch).toHaveBeenCalledWith(
        new CartActions.AddEmailToCart({
          userId: userId,
          cartId: cart.code,
          email: 'test@test.com',
        })
      );
    });
  });

  describe('getAssignedUser', () => {
    it('should be able to return cart assigned user', () => {
      store.dispatch(new CartActions.CreateCartSuccess(cart));
      let result: any;
      service
        .getAssignedUser()
        .subscribe(value => (result = value))
        .unsubscribe();
      expect(result).toEqual('assigned');
    });
  });

  describe('isGuestCart', () => {
    it('should be able to return whether cart belongs to guest', () => {
      cartData.isGuestCart = true;
      expect(service.isGuestCart()).toBeTruthy();

      cartData.isGuestCart = false;
      expect(service.isGuestCart()).toBeFalsy();
    });
  });

  describe('addEntries', () => {
    beforeEach(() => {
      spyOn(store, 'dispatch').and.stub();
    });

    it('should add entries to the cart if cart HAS content', () => {
      service.addEntries([mockCartEntry]);

      expect(store.dispatch).toHaveBeenCalledWith(
        new CartActions.CartAddEntry({
          userId: cartData.userId,
          cartId: cartData.cartId,
          productCode: mockCartEntry.product.code,
          quantity: mockCartEntry.quantity,
        })
      );
    });
    it('should add entries to the cart if cart is empty', () => {
      service.addEntries([mockCartEntry]);

      expect(store.dispatch).toHaveBeenCalledWith(
        new CartActions.CartAddEntry({
          userId: cartData.userId,
          cartId: cartData.cartId,
          productCode: mockCartEntry.product.code,
          quantity: mockCartEntry.quantity,
        })
      );
    });
  });

  describe('isCreated', () => {
    it('should return false when guid is not present', () => {
      const result = service['isCreated']({});
      expect(result).toEqual(false);
    });
    it('should return true when guid is set', () => {
      const result = service['isCreated']({ guid: 'testGuid' });
      expect(result).toEqual(true);
    });
  });

  describe('isIncomplete', () => {
    it('should return true for empty object', () => {
      const result = service['isIncomplete']({});
      expect(result).toEqual(true);
    });
    it('should return false for cart with guid and code only', () => {
      const result = service['isIncomplete']({
        guid: 'testGuid',
        code: 'testCode',
      });
      expect(result).toEqual(true);
    });
    it('should return false for loaded cart', () => {
      const result = service['isIncomplete']({
        guid: 'testGuid',
        code: 'testCode',
        totalItems: 3,
        user: { name: 'name', uid: 'userId' },
      });
      expect(result).toEqual(false);
    });
  });

  describe('isJustLoggedIn', () => {
    it('should return true on change from not logged in to logged', () => {
      service['previousUserId'] = '';
      const result = service['isJustLoggedIn']('testUserId');
      expect(result).toEqual(true);
    });

    it('should return false on app initialization', () => {
      const result = service['isJustLoggedIn']('testUserId');
      expect(result).toEqual(false);
    });

    it('should return false when previous userId equals passed userId', () => {
      service['previousUserId'] = 'testUserId';
      const result = service['isJustLoggedIn']('testUserId');
      expect(result).toEqual(false);
    });

    it('should return false for missing userId or logout', () => {
      const result = service['isJustLoggedIn'](null);
      expect(result).toEqual(false);
    });
  });

  describe('getActive (_activeCart$)', () => {
    it('should not return or invoke other methods when cart is loading', done => {
      let result: Cart;

      service['loadOrMerge'] = jasmine.createSpy().and.callFake(() => {});
      service['load'] = jasmine.createSpy().and.callFake(() => {});

      service.getActive().subscribe(val => (result = val));

      store.dispatch(new CartActions.LoadCart({ userId, cartId: cart.guid }));

      setTimeout(() => {
        expect(result).toBeUndefined();
        expect(service['loadOrMerge']).not.toHaveBeenCalled();
        expect(service['load']).not.toHaveBeenCalled();
        done();
      });
    });

    it('should loadOrMerge cart for user that just logged in', done => {
      service['loadOrMerge'] = jasmine.createSpy().and.callFake(() => {});

      let result: Cart;
      service.getActive().subscribe(val => (result = val));

      // simulate setting empty previousUserId after app init
      service['previousUserId'] = '';

      userToken$.next(mockUserToken);
      setTimeout(() => {
        expect(service['loadOrMerge']).toHaveBeenCalled();
        expect(service['previousUserId']).toEqual(mockUserToken.userId);
        expect(result).toEqual({});
        done();
      });
    });

    it('should load cart when not fully loaded', done => {
      service['load'] = jasmine.createSpy().and.callFake(() => {});

      let result: Cart;
      service.getActive().subscribe(val => (result = val));
      store.dispatch(new CartActions.LoadCartSuccess(cart));

      setTimeout(() => {
        expect(service['load']).toHaveBeenCalled();
        expect(result).toEqual(undefined); // shouldn't return incomplete cart
        done();
      });
    });

    it('should load cart for logged user without cart', done => {
      service['load'] = jasmine.createSpy().and.callFake(() => {});

      service.getActive().subscribe();
      store.dispatch(new CartActions.ClearCart());
      userToken$.next(mockUserToken);
      setTimeout(() => {
        expect(service['load']).toHaveBeenCalled();
        done();
      });
    });

    it('should not load cart when loaded', done => {
      service['load'] = jasmine.createSpy().and.callFake(() => {});

      let result: Cart;
      service.getActive().subscribe(val => (result = val));
      const fullCart = {
        code: 'code',
        guid: 'guid',
        totalItems: 2,
        user: { name: 'name', user: 'userId' },
      };
      store.dispatch(new CartActions.LoadCartSuccess(fullCart));

      setTimeout(() => {
        expect(service['load']).not.toHaveBeenCalled();
        expect(result).toEqual(fullCart);
        done();
      });
    });
  });
});
