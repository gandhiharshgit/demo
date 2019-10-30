import { PROCESS_FEATURE } from '../../../process/store/process-state';
import {
  EntityFailAction,
  EntityLoadAction,
  EntityResetAction,
  EntitySuccessAction,
} from '../../../state/utils/entity-loader/entity-loader.action';
import {
  LoaderFailAction,
  LoaderLoadAction,
  LoaderSuccessAction,
} from '../../../state/utils/loader/loader.action';
import { ADD_VOUCHER_PROCESS_ID, CART_DATA } from '../cart-state';

export const CART_ADD_VOUCHER = '[Cart-voucher] Add Cart Vouchers';
export const CART_ADD_VOUCHER_FAIL = '[Cart-voucher] Add Cart Voucher Fail';
export const CART_ADD_VOUCHER_SUCCESS =
  '[Cart-voucher] Add Cart Voucher Success';
export const CART_RESET_ADD_VOUCHER = '[Cart-voucher] Reset Add Cart Voucher';

export const CART_REMOVE_VOUCHER = '[Cart-voucher] Remove Cart Voucher';
export const CART_REMOVE_VOUCHER_FAIL =
  '[Cart-voucher] Remove Cart Voucher Fail';
export const CART_REMOVE_VOUCHER_SUCCESS =
  '[Cart-voucher] Remove Cart Voucher Success';

// Adding cart voucher actions
export class CartAddVoucher extends EntityLoadAction {
  readonly type = CART_ADD_VOUCHER;
  constructor(
    public payload: { userId: string; cartId: string; voucherId: string }
  ) {
    super(PROCESS_FEATURE, ADD_VOUCHER_PROCESS_ID);
  }
}

export class CartAddVoucherFail extends EntityFailAction {
  readonly type = CART_ADD_VOUCHER_FAIL;
  constructor(public payload: any) {
    super(PROCESS_FEATURE, ADD_VOUCHER_PROCESS_ID, payload);
  }
}

export class CartAddVoucherSuccess extends EntitySuccessAction {
  readonly type = CART_ADD_VOUCHER_SUCCESS;
  constructor(public payload: { userId: string; cartId: string }) {
    super(PROCESS_FEATURE, ADD_VOUCHER_PROCESS_ID);
  }
}

export class CartResetAddVoucher extends EntityResetAction {
  readonly type = CART_RESET_ADD_VOUCHER;
  constructor() {
    super(PROCESS_FEATURE, ADD_VOUCHER_PROCESS_ID);
  }
}

// Deleting cart voucher
export class CartRemoveVoucher extends LoaderLoadAction {
  readonly type = CART_REMOVE_VOUCHER;
  constructor(
    public payload: { userId: string; cartId: string; voucherId: string }
  ) {
    super(CART_DATA);
  }
}

export class CartRemoveVoucherFail extends LoaderFailAction {
  readonly type = CART_REMOVE_VOUCHER_FAIL;
  constructor(public payload: any) {
    super(CART_DATA, payload);
  }
}

export class CartRemoveVoucherSuccess extends LoaderSuccessAction {
  readonly type = CART_REMOVE_VOUCHER_SUCCESS;
  constructor(public payload: { userId: string; cartId: string }) {
    super(CART_DATA);
  }
}

// action types
export type CartVoucherAction =
  | CartAddVoucher
  | CartAddVoucherFail
  | CartAddVoucherSuccess
  | CartResetAddVoucher
  | CartRemoveVoucher
  | CartRemoveVoucherFail
  | CartRemoveVoucherSuccess;
