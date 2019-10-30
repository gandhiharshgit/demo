import { LoaderState } from '../../state/utils/loader/loader-state';
import { AsmUi, CustomerSearchPage } from '../models/asm.models';

export const ASM_FEATURE = 'asm';
export const CUSTOMER_SEARCH_DATA = '[asm] Customer search data';
export interface StateWithAsm {
  [ASM_FEATURE]: AsmState;
}

export interface AsmState {
  customerSearchResult: LoaderState<CustomerSearchPage>;
  asmUi: AsmUi;
}
