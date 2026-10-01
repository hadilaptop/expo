import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Safe cross-platform storage adapter for Web preview & React Native
const memoryStorage = new Map<string, string>();
const safeStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(name);
      }
      return memoryStorage.get(name) ?? null;
    } catch {
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(name, value);
        return;
      }
      memoryStorage.set(name, value);
    } catch {}
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(name);
        return;
      }
      memoryStorage.delete(name);
    } catch {}
  },
};

export interface Customer {
  id: string | number;
  name: string;
  phone?: string;
  address?: string;
  economicCode?: string;
  avatar?: string;
}

export interface InvoiceItem {
  desc: string;
  quantity: number | string;
  unitPrice: number | string;
}

export interface Invoice {
  id: string | number;
  customerId: string | number;
  customerName?: string;
  number: string;
  type: 'فاکتور' | 'پیش فاکتور' | 'فاکتور فروش';
  date: string;
  amount: number;
  note?: string;
  items: InvoiceItem[] | string;
  createdAt?: string;
}

export interface Payment {
  id: string | number;
  customerId: string | number;
  date: string;
  amount: number;
  method: 'نقدی' | 'کارت به کارت' | 'واریز به حساب' | 'چک' | 'سایر' | 'تسویه حساب';
  bankName?: string;
  checkDate?: string;
  checkNumber?: string;
  note?: string;
  attachment?: string;
  createdAt?: string;
}

export interface AppSettings {
  theme: 'blue' | 'gold' | 'red' | 'green' | 'teal';
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEconomicCode: string;
  companyLogo: string;
}

export interface NativeAppState {
  isInitialized: boolean;
  customers: Customer[];
  payments: Payment[];
  invoices: Invoice[];
  settings: AppSettings;

  // Actions
  initializeData: () => Promise<void>;
  saveCustomer: (customerData: Partial<Customer>) => Promise<boolean>;
  deleteCustomer: (id: string | number) => Promise<void>;
  savePayment: (paymentData: Partial<Payment>) => Promise<void>;
  deletePayment: (id: string | number) => Promise<void>;
  saveInvoice: (invoiceData: Partial<Invoice>) => Promise<Invoice>;
  deleteInvoice: (id: string | number) => Promise<void>;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'blue',
  companyName: 'نام شرکت / فروشگاه شما',
  companyAddress: 'تهران، خیابان آزادی، پلاک ۱',
  companyPhone: '۰۲۱-۶۶۵۵۴۴۳۳',
  companyEconomicCode: '۴۱۱۵۶۷۸۹',
  companyLogo: '',
};

export const useNativeAppStore = create<NativeAppState>()(
  persist(
    (set, get) => ({
      isInitialized: false,
      customers: [
        {
          id: '1001',
          name: 'شرکت تجارت الکترونیک نوین',
          phone: '09121112233',
          address: 'تهران، بلوار کشاورز، پلاک ۴۲',
          economicCode: '411223344',
          avatar: '',
        },
        {
          id: '1002',
          name: 'فروشگاه پخش مواد غذایی آریا',
          phone: '09123334455',
          address: 'مشهد، خیابان راهنمایی، پلاک ۱۸',
          economicCode: '411889900',
          avatar: '',
        },
        {
          id: '1003',
          name: 'بازرگانی کیان صنعت',
          phone: '09129998877',
          address: 'اصفهان، میدان امام، سرای قیصریه',
          economicCode: '411776655',
          avatar: '',
        },
      ],
      payments: [
        {
          id: 'p-1',
          customerId: '1001',
          date: '۱۴۰۳/۰۶/۱۵',
          amount: 25000000,
          method: 'کارت به کارت',
          note: 'تسویه پیش‌پرداخت خرید سفارش اولیه',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'p-2',
          customerId: '1002',
          date: '۱۴۰۳/۰۶/۱۸',
          amount: 18500000,
          method: 'چک',
          bankName: 'بانک ملت',
          checkNumber: '۸۸۴۵۹۲۱۴',
          checkDate: '۱۴۰۳/۰۷/۱۰',
          note: 'چک صیادی بابت فاکتور شماره ۱۰۰۲/۱۰۱',
          createdAt: new Date().toISOString(),
        },
      ],
      invoices: [
        {
          id: 'inv-1',
          customerId: '1001',
          customerName: 'شرکت تجارت الکترونیک نوین',
          number: '1001/101',
          type: 'فاکتور فروش',
          date: '۱۴۰۳/۰۶/۱۲',
          amount: 32000000,
          note: 'اقلام فاکتور تا زمان تسویه حساب کامل نزد خریدار به صورت امانت می باشد',
          items: [
            { desc: 'لپ‌تاپ مهندسی Core i7', quantity: 1, unitPrice: 32000000 },
          ],
          createdAt: new Date().toISOString(),
        },
        {
          id: 'inv-2',
          customerId: '1002',
          customerName: 'فروشگاه پخش مواد غذایی آریا',
          number: '1002/101',
          type: 'فاکتور فروش',
          date: '۱۴۰۳/۰۶/۱۶',
          amount: 18500000,
          note: 'ارسال از انبار مرکزی به مقصد فروشگاه',
          items: [
            { desc: 'روغن نباتی ۵ لیتری', quantity: 20, unitPrice: 450000 },
            { desc: 'برنج هاشمی درجه یک (۱۰ کیلویی)', quantity: 10, unitPrice: 950000 },
          ],
          createdAt: new Date().toISOString(),
        },
      ],
      settings: DEFAULT_SETTINGS,

      initializeData: async () => {
        set({ isInitialized: true });
      },

      saveCustomer: async (customerData) => {
        const trimmedName = customerData.name?.trim();
        if (!trimmedName) return false;

        const currentCustomers = get().customers;
        const isDuplicate = currentCustomers.some(
          (c) =>
            String(c.id) !== String(customerData.id) &&
            c.name &&
            c.name.trim().toLowerCase() === trimmedName.toLowerCase()
        );

        if (isDuplicate) return false;

        if (customerData.id) {
          set((state) => ({
            customers: state.customers.map((c) =>
              String(c.id) === String(customerData.id)
                ? { ...c, ...customerData }
                : c
            ),
          }));
        } else {
          const newId = String(Date.now());
          const newCust: Customer = {
            id: newId,
            name: trimmedName,
            phone: customerData.phone || '',
            address: customerData.address || '',
            economicCode: customerData.economicCode || '',
            avatar: customerData.avatar || '',
          };
          set((state) => ({
            customers: [newCust, ...state.customers],
          }));
        }
        return true;
      },

      deleteCustomer: async (id) => {
        set((state) => ({
          customers: state.customers.filter((c) => String(c.id) !== String(id)),
          payments: state.payments.filter((p) => String(p.customerId) !== String(id)),
          invoices: state.invoices.filter((i) => String(i.customerId) !== String(id)),
        }));
      },

      savePayment: async (paymentData) => {
        if (paymentData.id) {
          set((state) => ({
            payments: state.payments.map((p) =>
              String(p.id) === String(paymentData.id)
                ? { ...p, ...paymentData }
                : p
            ),
          }));
        } else {
          const newPayment: Payment = {
            id: `p-${Date.now()}`,
            customerId: paymentData.customerId!,
            date: paymentData.date || '',
            amount: Number(paymentData.amount) || 0,
            method: paymentData.method || 'نقدی',
            bankName: paymentData.bankName || '',
            checkDate: paymentData.checkDate || '',
            checkNumber: paymentData.checkNumber || '',
            note: paymentData.note || '',
            attachment: paymentData.attachment || '',
            createdAt: new Date().toISOString(),
          };
          set((state) => ({
            payments: [newPayment, ...state.payments],
          }));
        }
      },

      deletePayment: async (id) => {
        set((state) => ({
          payments: state.payments.filter((p) => String(p.id) !== String(id)),
        }));
      },

      saveInvoice: async (invoiceData) => {
        let itemsArr: InvoiceItem[] = [];
        if (typeof invoiceData.items === 'string') {
          try {
            itemsArr = JSON.parse(invoiceData.items);
          } catch {
            itemsArr = [];
          }
        } else if (Array.isArray(invoiceData.items)) {
          itemsArr = invoiceData.items;
        }

        if (invoiceData.id) {
          const updated: Invoice = {
            id: invoiceData.id,
            customerId: invoiceData.customerId!,
            customerName: invoiceData.customerName || '',
            number: invoiceData.number || '',
            type: invoiceData.type || 'فاکتور فروش',
            date: invoiceData.date || '',
            amount: Number(invoiceData.amount) || 0,
            note: invoiceData.note || '',
            items: itemsArr,
            createdAt: invoiceData.createdAt || new Date().toISOString(),
          };
          set((state) => ({
            invoices: state.invoices.map((inv) =>
              String(inv.id) === String(invoiceData.id) ? updated : inv
            ),
          }));
          return updated;
        } else {
          const newInvoice: Invoice = {
            id: `inv-${Date.now()}`,
            customerId: invoiceData.customerId!,
            customerName: invoiceData.customerName || '',
            number: invoiceData.number || '',
            type: invoiceData.type || 'فاکتور فروش',
            date: invoiceData.date || '',
            amount: Number(invoiceData.amount) || 0,
            note: invoiceData.note || '',
            items: itemsArr,
            createdAt: new Date().toISOString(),
          };
          set((state) => ({
            invoices: [newInvoice, ...state.invoices],
          }));
          return newInvoice;
        }
      },

      deleteInvoice: async (id) => {
        set((state) => ({
          invoices: state.invoices.filter((inv) => String(inv.id) !== String(id)),
        }));
      },

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },
    }),
    {
      name: 'persian_invoice_native_store',
      storage: createJSONStorage(() => safeStorage),
    }
  )
);
