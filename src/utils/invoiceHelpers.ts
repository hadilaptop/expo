import { formatNumber, parseNumber, toPersianDigits, convertNumberToPersianWords } from './numberUtils';
import { Customer } from '../storage/customerStorage';

export { formatNumber, parseNumber, toPersianDigits, parseNumber as parseNumberValue };

export const numberToPersianWords = convertNumberToPersianWords;

export const getCurrentPersianDate = (): string => {
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
};

export const getCustomerCode = (
  customer: Customer,
  customers: Customer[] = []
): number => {
  if (typeof customer.customerCode === 'number') {
    return customer.customerCode;
  }

  const index = customers.findIndex(
    (item) => String(item.id) === String(customer.id)
  );

  return index >= 0 ? index + 1001 : 1001;
};
