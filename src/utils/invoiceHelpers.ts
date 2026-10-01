/**
 * Helper utilities for Persian invoices, numbers, dates and customers
 */

export function toPersianDigits(num: number | string | undefined | null): string {
  if (num === undefined || num === null) return '';
  const str = String(num);
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.replace(/[0-9]/g, (w) => persianNumbers[+w]);
}

export function toEnglishDigits(str: string | undefined | null): string {
  if (!str) return '';
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  let res = String(str);
  for (let i = 0; i < 10; i++) {
    res = res.replace(new RegExp(persianNumbers[i], 'g'), String(i));
  }
  return res;
}

export function formatNumber(num: number | string | undefined | null): string {
  if (num === undefined || num === null || num === '') return '۰';
  const parsed = typeof num === 'number' ? num : Number(String(num).replace(/,/g, ''));
  if (isNaN(parsed)) return '۰';
  const formatted = parsed.toLocaleString('en-US');
  return toPersianDigits(formatted);
}

export function parseNumber(val: number | string | undefined | null): number {
  if (val === undefined || val === null || val === '') return 0;
  if (typeof val === 'number') return val;
  const english = toEnglishDigits(String(val)).replace(/,/g, '').trim();
  const num = Number(english);
  return isNaN(num) ? 0 : num;
}

export function getCurrentPersianDate(): string {
  const today = new Date();
  const year = new Intl.DateTimeFormat('fa-IR-u-nu-latn', { year: 'numeric' }).format(today);
  const month = new Intl.DateTimeFormat('fa-IR-u-nu-latn', { month: '2-digit' }).format(today);
  const day = new Intl.DateTimeFormat('fa-IR-u-nu-latn', { day: '2-digit' }).format(today);
  return toPersianDigits(`${year}/${month}/${day}`);
}

export function getCustomerCode(
  customer: any,
  existingCustomers: any[] = []
): string {
  if (customer && customer.code) return String(customer.code);
  if (customer && customer.id) return String(customer.id);
  const index = existingCustomers.findIndex(
    (c) => c && customer && String(c.id) === String(customer.id)
  );
  if (index >= 0) return String(1000 + index + 1);
  return '1001';
}

export function getAutoInvoiceNumber(
  custCode: string | number,
  type: string,
  invoices: any[] = [],
  customerId?: any
): string {
  const count = invoices.length + 1;
  const prefix = type === 'پیش فاکتور' ? 'P' : 'INV';
  return `${prefix}-${custCode || '1001'}-${String(count).padStart(3, '0')}`;
}

export function numberToPersianWords(amount: number): string {
  if (!amount || amount === 0) return 'صفر ریال';
  return `${formatNumber(amount)} ریال تمام`;
}
