import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { AuthService } from '../../auth/facade/auth.service';
import { ConsentTemplate } from '../../model/consent.model';
import { StateWithProcess } from '../../process/store/process-state';
import {
  getProcessErrorFactory,
  getProcessLoadingFactory,
  getProcessSuccessFactory,
} from '../../process/store/selectors/process.selectors';
import { UserActions } from '../store/actions/index';
import { UsersSelectors } from '../store/selectors/index';
import {
  GIVE_CONSENT_PROCESS_ID,
  StateWithUser,
  WITHDRAW_CONSENT_PROCESS_ID,
} from '../store/user-state';

@Injectable({
  providedIn: 'root',
})
export class UserConsentService {
  constructor(
    store: Store<StateWithUser | StateWithProcess<void>>,
    // tslint:disable-next-line:unified-signatures
    authService: AuthService
  );

  /**
   * @deprecated since version 1.3
   *  Use constructor(store: Store<StateWithUser | StateWithProcess<void>>,
   *  authService: AuthService) instead
   */
  constructor(store: Store<StateWithUser | StateWithProcess<void>>);
  constructor(
    protected store: Store<StateWithUser | StateWithProcess<void>>,
    protected authService?: AuthService
  ) {}

  /**
   * Retrieves all consents.
   */
  loadConsents(): void {
    this.authService
      .getOccUserId()
      .pipe(take(1))
      .subscribe(occUserId =>
        this.store.dispatch(new UserActions.LoadUserConsents(occUserId))
      )
      .unsubscribe();
  }

  /**
   * Returns all consents
   */
  getConsents(): Observable<ConsentTemplate[]> {
    return this.store.pipe(select(UsersSelectors.getConsentsValue));
  }

  /**
   * Returns the consents loading flag
   */
  getConsentsResultLoading(): Observable<boolean> {
    return this.store.pipe(select(UsersSelectors.getConsentsLoading));
  }

  /**
   * Returns the consents success flag
   */
  getConsentsResultSuccess(): Observable<boolean> {
    return this.store.pipe(select(UsersSelectors.getConsentsSuccess));
  }

  /**
   * Returns the consents error flag
   */
  getConsentsResultError(): Observable<boolean> {
    return this.store.pipe(select(UsersSelectors.getConsentsError));
  }

  /**
   * Resets the processing state for consent retrieval
   */
  resetConsentsProcessState(): void {
    this.store.dispatch(new UserActions.ResetLoadUserConsents());
  }

  /**
   * Give consent for specified consent template ID and version.
   * @param consentTemplateId a template ID for which to give a consent
   * @param consentTemplateVersion a template version for which to give a consent
   */
  giveConsent(consentTemplateId: string, consentTemplateVersion: number): void {
    this.authService
      .getOccUserId()
      .pipe(take(1))
      .subscribe(occUserId =>
        this.store.dispatch(
          new UserActions.GiveUserConsent({
            userId: occUserId,
            consentTemplateId,
            consentTemplateVersion,
          })
        )
      )
      .unsubscribe();
  }

  /**
   * Returns the give consent process loading flag
   */
  getGiveConsentResultLoading(): Observable<boolean> {
    return this.store.pipe(
      select(getProcessLoadingFactory(GIVE_CONSENT_PROCESS_ID))
    );
  }

  /**
   * Returns the give consent process success flag
   */
  getGiveConsentResultSuccess(): Observable<boolean> {
    return this.store.pipe(
      select(getProcessSuccessFactory(GIVE_CONSENT_PROCESS_ID))
    );
  }

  /**
   * Returns the give consent process error flag
   */
  getGiveConsentResultError(): Observable<boolean> {
    return this.store.pipe(
      select(getProcessErrorFactory(GIVE_CONSENT_PROCESS_ID))
    );
  }

  /**
   * Resents the give consent process flags
   */
  resetGiveConsentProcessState(): void {
    return this.store.dispatch(new UserActions.ResetGiveUserConsentProcess());
  }

  /**
   * Withdraw consent for the given `consentCode`
   * @param consentCode for which to withdraw the consent
   */
  withdrawConsent(consentCode: string): void {
    this.authService
      .getOccUserId()
      .pipe(take(1))
      .subscribe(occUserId =>
        this.store.dispatch(
          new UserActions.WithdrawUserConsent({
            userId: occUserId,
            consentCode,
          })
        )
      )
      .unsubscribe();
  }

  /**
   * Returns the withdraw consent process loading flag
   */
  getWithdrawConsentResultLoading(): Observable<boolean> {
    return this.store.pipe(
      select(getProcessLoadingFactory(WITHDRAW_CONSENT_PROCESS_ID))
    );
  }

  /**
   * Returns the withdraw consent process success flag
   */
  getWithdrawConsentResultSuccess(): Observable<boolean> {
    return this.store.pipe(
      select(getProcessSuccessFactory(WITHDRAW_CONSENT_PROCESS_ID))
    );
  }

  /**
   * Returns the withdraw consent process error flag
   */
  getWithdrawConsentResultError(): Observable<boolean> {
    return this.store.pipe(
      select(getProcessErrorFactory(WITHDRAW_CONSENT_PROCESS_ID))
    );
  }

  /**
   * Resets the process flags for withdraw consent
   */
  resetWithdrawConsentProcessState(): void {
    return this.store.dispatch(
      new UserActions.ResetWithdrawUserConsentProcess()
    );
  }

  /**
   * Filters the provided `templateList`' templates by hiding the template IDs specified in `hideTemplateIds`.
   * If the `hideTemplateIds` is empty, the provided `templateList` is returned.
   *
   * @param templateList a list of consent templates to filter
   * @param hideTemplateIds template IDs to hide
   */
  filterConsentTemplates(
    templateList: ConsentTemplate[],
    hideTemplateIds: string[] = []
  ): ConsentTemplate[] {
    if (hideTemplateIds.length === 0) {
      return templateList;
    }

    const updatedTemplateList: ConsentTemplate[] = [];
    for (const template of templateList) {
      const show = !hideTemplateIds.includes(template.id);
      if (show) {
        updatedTemplateList.push(template);
      }
    }

    return updatedTemplateList;
  }
}
