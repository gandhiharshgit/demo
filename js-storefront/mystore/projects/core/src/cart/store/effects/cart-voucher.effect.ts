import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { GlobalMessageService } from '../../../global-message/facade/global-message.service';
import { GlobalMessageType } from '../../../global-message/models/global-message.model';
import { makeErrorSerializable } from '../../../util/serialization-utils';
import { CartVoucherConnector } from '../../connectors/voucher/cart-voucher.connector';
import { CartActions } from '../actions/index';

@Injectable()
export class CartVoucherEffects {
  constructor(
    private actions$: Actions,
    private cartVoucherConnector: CartVoucherConnector,
    private messageService: GlobalMessageService
  ) {}

  @Effect()
  addCartVoucher$: Observable<
    CartActions.CartVoucherAction
  > = this.actions$.pipe(
    ofType(CartActions.CART_ADD_VOUCHER),
    map((action: CartActions.CartAddVoucher) => action.payload),
    mergeMap(payload => {
      return this.cartVoucherConnector
        .add(payload.userId, payload.cartId, payload.voucherId)
        .pipe(
          map(() => {
            this.showGlobalMessage(
              'voucher.applyVoucherSuccess',
              payload.voucherId
            );
            return new CartActions.CartAddVoucherSuccess({
              userId: payload.userId,
              cartId: payload.cartId,
            });
          }),
          catchError(error =>
            of(new CartActions.CartAddVoucherFail(makeErrorSerializable(error)))
          )
        );
    })
  );

  @Effect()
  removeCartVoucher$: Observable<
    CartActions.CartVoucherAction
  > = this.actions$.pipe(
    ofType(CartActions.CART_REMOVE_VOUCHER),
    map((action: CartActions.CartRemoveVoucher) => action.payload),
    mergeMap(payload => {
      return this.cartVoucherConnector
        .remove(payload.userId, payload.cartId, payload.voucherId)
        .pipe(
          map(() => {
            this.showGlobalMessage(
              'voucher.removeVoucherSuccess',
              payload.voucherId
            );
            return new CartActions.CartRemoveVoucherSuccess({
              userId: payload.userId,
              cartId: payload.cartId,
            });
          }),
          catchError(error =>
            of(
              new CartActions.CartRemoveVoucherFail(
                makeErrorSerializable(error)
              )
            )
          )
        );
    })
  );

  private showGlobalMessage(text: string, param: string) {
    this.messageService.add(
      { key: text, params: { voucherCode: param } },
      GlobalMessageType.MSG_TYPE_CONFIRMATION
    );
  }
}
