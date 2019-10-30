import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { select, Store, StoreModule } from '@ngrx/store';
import { AnonymousConsentsActions } from '../actions/index';
import {
  ANONYMOUS_CONSENTS_STORE_FEATURE,
  StateWithAnonymousConsents,
} from '../anonymous-consents-state';
import * as fromReducers from '../reducers/index';
import { AnonymousConsentsSelectors } from '../selectors/index';

describe('anonymous consent ui selectors', () => {
  let store: Store<StateWithAnonymousConsents>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({}),
        StoreModule.forFeature(
          ANONYMOUS_CONSENTS_STORE_FEATURE,
          fromReducers.getReducers()
        ),
      ],
    });

    store = TestBed.get(Store as Type<Store<StateWithAnonymousConsents>>);
    spyOn(store, 'dispatch').and.callThrough();
  });

  describe('getAnonymousConsentTemplatesUpdate', () => {
    it('should return the update state slice', () => {
      const updated = true;
      store.dispatch(
        new AnonymousConsentsActions.ToggleAnonymousConsentTemplatesUpdated(
          updated
        )
      );

      let result = false;
      store
        .pipe(
          select(AnonymousConsentsSelectors.getAnonymousConsentTemplatesUpdate)
        )
        .subscribe(value => (result = value))
        .unsubscribe();

      expect(result).toEqual(updated);
    });
  });
  describe('getAnonymousConsentsBannerVisibility', () => {
    it('should return the banner slice of the state', () => {
      const visible = false;
      store.dispatch(
        new AnonymousConsentsActions.ToggleAnonymousConsentsBannerVisibility(
          visible
        )
      );

      let result = true;
      store
        .pipe(
          select(
            AnonymousConsentsSelectors.getAnonymousConsentsBannerVisibility
          )
        )
        .subscribe(value => (result = value))
        .unsubscribe();

      expect(result).toEqual(visible);
    });
  });
});
