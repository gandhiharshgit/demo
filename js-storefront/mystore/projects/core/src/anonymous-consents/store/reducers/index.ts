import { InjectionToken, Provider } from '@angular/core';
import { ActionReducerMap, combineReducers } from '@ngrx/store';
import { ConsentTemplate } from '../../../model/consent.model';
import { loaderReducer } from '../../../state/utils/loader/loader.reducer';
import {
  AnonymousConsentsState,
  ANONYMOUS_CONSENTS,
} from '../anonymous-consents-state';
import * as fromAnonymousConsentsBanner from './anonymous-consents-banner.reducer';
import * as fromAnonymousConsentsUpdate from './anonymous-consents-update.reducer';
import * as fromAnonymousConsents from './anonymous-consents.reducer';

export function getReducers(): ActionReducerMap<AnonymousConsentsState> {
  return {
    templates: loaderReducer<ConsentTemplate[]>(ANONYMOUS_CONSENTS),
    consents: fromAnonymousConsents.reducer,
    ui: combineReducers({
      bannerVisible: fromAnonymousConsentsBanner.reducer,
      updated: fromAnonymousConsentsUpdate.reducer,
    }),
  };
}

export const reducerToken: InjectionToken<
  ActionReducerMap<AnonymousConsentsState>
> = new InjectionToken<ActionReducerMap<AnonymousConsentsState>>(
  'AnonymousConsentsReducers'
);

export const reducerProvider: Provider = {
  provide: reducerToken,
  useFactory: getReducers,
};
