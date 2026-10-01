import { create } from 'zustand';
import { AppItem, AppState, CustomerModel, InvoiceModel, PaymentModel, Priority } from './types';

const INITIAL_ITEMS: AppItem[] = [
  {
    id: 'item-1',
    title: 'Migrate React Router to React Navigation',
    category: 'Architecture',
    description: 'Set up Bottom Tabs and Stack Navigators with type-safe route parameters.',
    priority: 'high',
    completed: true,
    createdAt: '2026-09-24T10:00:00Z',
  },
  {
    id: 'item-2',
    title: 'Replace HTML Divs with React Native Views',
    category: 'Components',
    description: 'Refactor web DOM tags to Native primitives and enforce flexbox column defaults.',
    priority: 'high',
    completed: true,
    createdAt: '2026-09-25T11:30:00Z',
  },
  {
    id: 'item-3',
    title: 'Configure Global Zustand Store',
    category: 'State Management',
    description: 'Bind lightweight state management with selectors and async dispatchers.',
    priority: 'medium',
    completed: false,
    createdAt: '2026-09-26T08:15:00Z',
  },
];

const INITIAL_CUSTOMERS: CustomerModel[] = [
  {
    id: 1,
    name: 'بازرگانی داده‌پرداز آریا',
    phone: '09121111111',
    address: 'تهران، میدان ونک، برج نگار، واحد ۴۰۲',
    economicCode: '411234567890',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    code: '1001',
  },
  {
    id: 2,
    name: 'صنایع فولاد و گسترش نوین',
    phone: '09122222222',
    address: 'اصفهان، شهرک صنعتی رازی، فاز ۲',
    economicCode: '411987654321',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    code: '1002',
  },
  {
    id: 3,
    name: 'فروشگاه الکترونیک مهرگان',
    phone: '09123333333',
    address: 'شیراز، خیابان زند، مجتمع آفتاب',
    economicCode: '411555666777',
    avatar: null,
    code: '1003',
  },
];

const INITIAL_INVOICES: InvoiceModel[] = [
  {
    id: 101,
    customerId: 1,
    customerName: 'بازرگانی داده‌پرداز آریا',
    number: 'INV-1001-001',
    type: 'فاکتور فروش',
    date: '۱۴۰۳/۰۶/۱۰',
    amount: 145000000,
    note: 'اقلام فاکتور تا زمان تسویه حساب کامل نزد خریدار به صورت امانت می باشد',
    items: JSON.stringify([
      { desc: 'سامانه نرم‌افزاری تحت وب نسخه سازمانی', quantity: 1, unitPrice: 95000000 },
      { desc: 'خدمات استقرار و آموزش کارکنان', quantity: 2, unitPrice: 25000000 },
    ]),
    createdAt: '2026-08-31T10:00:00Z',
  },
  {
    id: 102,
    customerId: 1,
    customerName: 'بازرگانی داده‌پرداز آریا',
    number: 'P-1001-002',
    type: 'پیش فاکتور',
    date: '۱۴۰۳/۰۶/۱۵',
    amount: 68000000,
    note: 'به دلیل نوسانات بازار این پیش فاکتور تا زمان دریافت اسناد مالی معتبر است.',
    items: JSON.stringify([
      { desc: 'تمدید لایسنس سرور ابری یکساله', quantity: 1, unitPrice: 68000000 },
    ]),
    createdAt: '2026-09-05T12:00:00Z',
  },
  {
    id: 103,
    customerId: 2,
    customerName: 'صنایع فولاد و گسترش نوین',
    number: 'INV-1002-001',
    type: 'فاکتور فروش',
    date: '۱۴۰۳/۰۶/۱۸',
    amount: 220000000,
    note: 'تسویه ۳۰ روزه با تایید امور مالی',
    items: JSON.stringify([
      { desc: 'قطعات و تجهیزات صنعتی اتوماسیون', quantity: 4, unitPrice: 55000000 },
    ]),
    createdAt: '2026-09-08T09:00:00Z',
  },
];

const INITIAL_PAYMENTS: PaymentModel[] = [
  {
    id: 201,
    customerId: 1,
    date: '۱۴۰۳/۰۶/۱۲',
    amount: 80000000,
    method: 'کارت به کارت',
    bankName: 'بانک ملت',
    note: 'پیش پرداخت فاکتور فروش شماره ۰۰۱',
    createdAt: '2026-09-02T14:30:00Z',
  },
  {
    id: 202,
    customerId: 1,
    date: '۱۴۰۳/۰۶/۲۵',
    amount: 65000000,
    method: 'چک',
    bankName: 'بانک ملی',
    checkDate: '۱۴۰۳/۰۷/۱۵',
    checkNumber: '۱۲۳۴۵۶۷۸۹',
    note: 'چک صیادی تسویه فاکتور ۰۰۱',
    attachment: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=300&auto=format&fit=crop&q=80',
    createdAt: '2026-09-15T11:00:00Z',
  },
  {
    id: 203,
    customerId: 2,
    date: '۱۴۰۳/۰۶/۲۰',
    amount: 100000000,
    method: 'واریز به حساب',
    bankName: 'بانک صادرات',
    note: 'واریز حواله پیش پرداخت',
    createdAt: '2026-09-10T16:00:00Z',
  },
];

export const useAppStore = create<AppState>((set, get) => ({
  items: INITIAL_ITEMS,
  searchQuery: '',
  selectedFilter: 'all',
  isDarkMode: false,
  activeItem: null,

  // Accounting State
  customers: INITIAL_CUSTOMERS,
  invoices: INITIAL_INVOICES,
  payments: INITIAL_PAYMENTS,

  addItem: ({ title, category, description, priority }) => {
    const newItem: AppItem = {
      id: `item-${Date.now()}`,
      title,
      category: category || 'General',
      description,
      priority,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      items: [newItem, ...state.items],
    }));

    return newItem;
  },

  toggleItemCompleted: (id) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      ),
      activeItem:
        state.activeItem?.id === id
          ? { ...state.activeItem, completed: !state.activeItem.completed }
          : state.activeItem,
    }));
  },

  deleteItem: (id) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
      activeItem: state.activeItem?.id === id ? null : state.activeItem,
    }));
  },

  setActiveItem: (item) => {
    set({ activeItem: item });
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  setSelectedFilter: (filter) => {
    set({ selectedFilter: filter });
  },

  toggleTheme: () => {
    set((state) => ({ isDarkMode: !state.isDarkMode }));
  },

  resetToDefault: () => {
    set({
      items: INITIAL_ITEMS,
      searchQuery: '',
      selectedFilter: 'all',
      activeItem: null,
      customers: INITIAL_CUSTOMERS,
      invoices: INITIAL_INVOICES,
      payments: INITIAL_PAYMENTS,
    });
  },

  // Accounting Actions
  saveCustomer: async (customerData) => {
    const state = get();
    if (customerData.id) {
      set({
        customers: state.customers.map((c) =>
          String(c.id) === String(customerData.id)
            ? ({ ...c, ...customerData } as CustomerModel)
            : c
        ),
      });
    } else {
      const newCust: CustomerModel = {
        id: Date.now(),
        name: customerData.name || 'مشتری جدید',
        phone: customerData.phone,
        address: customerData.address,
        economicCode: customerData.economicCode,
        avatar: customerData.avatar,
        code: String(1000 + state.customers.length + 1),
      };
      set({
        customers: [newCust, ...state.customers],
      });
    }
    return true;
  },

  deleteCustomer: async (id) => {
    set((state) => ({
      customers: state.customers.filter((c) => String(c.id) !== String(id)),
      invoices: state.invoices.filter((inv) => String(inv.customerId) !== String(id)),
      payments: state.payments.filter((p) => String(p.customerId) !== String(id)),
    }));
    return true;
  },

  saveInvoice: async (invoiceData) => {
    const state = get();
    if (invoiceData.id) {
      const updated = state.invoices.map((inv) =>
        String(inv.id) === String(invoiceData.id)
          ? ({ ...inv, ...invoiceData } as InvoiceModel)
          : inv
      );
      set({ invoices: updated });
      return invoiceData as InvoiceModel;
    } else {
      const newInv: InvoiceModel = {
        id: Date.now(),
        customerId: invoiceData.customerId || 1,
        customerName: invoiceData.customerName,
        number: invoiceData.number || `INV-${Date.now()}`,
        type: invoiceData.type || 'فاکتور فروش',
        date: invoiceData.date || '۱۴۰۳/۰۶/۰۱',
        amount: invoiceData.amount || 0,
        note: invoiceData.note,
        items: invoiceData.items,
        createdAt: new Date().toISOString(),
      };
      set({
        invoices: [newInv, ...state.invoices],
      });
      return newInv;
    }
  },

  deleteInvoice: async (id) => {
    set((state) => ({
      invoices: state.invoices.filter((inv) => String(inv.id) !== String(id)),
    }));
    return true;
  },

  savePayment: async (paymentData) => {
    const state = get();
    if (paymentData.id) {
      const updated = state.payments.map((p) =>
        String(p.id) === String(paymentData.id)
          ? ({ ...p, ...paymentData } as PaymentModel)
          : p
      );
      set({ payments: updated });
      return paymentData as PaymentModel;
    } else {
      const newP: PaymentModel = {
        id: Date.now(),
        customerId: paymentData.customerId || 1,
        date: paymentData.date || '۱۴۰۳/۰۶/۰۱',
        amount: paymentData.amount || 0,
        method: paymentMethodName(paymentData.method),
        bankName: paymentData.bankName,
        checkDate: paymentData.checkDate,
        checkNumber: paymentData.checkNumber,
        note: paymentData.note,
        attachment: paymentData.attachment,
        createdAt: new Date().toISOString(),
      };
      set({
        payments: [newP, ...state.payments],
      });
      return newP;
    }
  },

  deletePayment: async (id) => {
    set((state) => ({
      payments: state.payments.filter((p) => String(p.id) !== String(id)),
    }));
    return true;
  },

  getMetrics: () => {
    const items = get().items;
    const totalItems = items.length;
    const completedItems = items.filter((i) => i.completed).length;
    const pendingItems = totalItems - completedItems;
    const completionRate = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    return {
      totalItems,
      completedItems,
      pendingItems,
      completionRate,
    };
  },

  getFilteredItems: () => {
    const { items, searchQuery, selectedFilter } = get();
    return items.filter((item) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        selectedFilter === 'all' ||
        (selectedFilter === 'completed' && item.completed) ||
        (selectedFilter === 'pending' && !item.completed);

      return matchesSearch && matchesFilter;
    });
  },
}));

function paymentMethodName(m?: string) {
  return m || 'نقدی';
}
