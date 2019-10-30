import { OccConfig } from '../../config/occ-config';

export const defaultOccCartConfig: OccConfig = {
  backend: {
    occ: {
      endpoints: {
        // tslint:disable:max-line-length
        carts:
          'users/${userId}/carts?fields=carts(DEFAULT,potentialProductPromotions,appliedProductPromotions,potentialOrderPromotions,appliedOrderPromotions,entries(totalPrice(formattedValue),product(images(FULL),stock(FULL)),basePrice(formattedValue),updateable),totalPrice(formattedValue),totalItems,totalPriceWithTax(formattedValue),totalDiscounts(value,formattedValue),subTotal(formattedValue),deliveryItemsQuantity,deliveryCost(formattedValue),totalTax(formattedValue),pickupItemsQuantity,net,appliedVouchers,productDiscounts(formattedValue),saveTime,user)',
        cart:
          'users/${userId}/carts/${cartId}?fields=DEFAULT,potentialProductPromotions,appliedProductPromotions,potentialOrderPromotions,appliedOrderPromotions,entries(totalPrice(formattedValue),product(images(FULL),stock(FULL)),basePrice(formattedValue),updateable),totalPrice(formattedValue),totalItems,totalPriceWithTax(formattedValue),totalDiscounts(value,formattedValue),subTotal(formattedValue),deliveryItemsQuantity,deliveryCost(formattedValue),totalTax(formattedValue),pickupItemsQuantity,net,appliedVouchers,productDiscounts(formattedValue),user',
        createCart:
          'users/${userId}/carts?fields=DEFAULT,potentialProductPromotions,appliedProductPromotions,potentialOrderPromotions,appliedOrderPromotions,entries(totalPrice(formattedValue),product(images(FULL),stock(FULL)),basePrice(formattedValue),updateable),totalPrice(formattedValue),totalItems,totalPriceWithTax(formattedValue),totalDiscounts(value,formattedValue),subTotal(formattedValue),deliveryItemsQuantity,deliveryCost(formattedValue),totalTax(formattedValue),pickupItemsQuantity,net,appliedVouchers,productDiscounts(formattedValue),user',
        addEntries: 'users/${userId}/carts/${cartId}/entries',
        updateEntries: 'users/${userId}/carts/${cartId}/entries/${entryNumber}',
        removeEntries: 'users/${userId}/carts/${cartId}/entries/${entryNumber}',
        addEmail: 'users/${userId}/carts/${cartId}/email',
        deleteCart: 'users/${userId}/carts/${cartId}',
        cartVoucher: 'users/${userId}/carts/${cartId}/vouchers',
        // tslint:enable
      },
    },
  },
};
