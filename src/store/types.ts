export type Priority = 'low' | 'medium' | 'high';

export interface AppItem {
  id: string;
  title: string;
  category: string;
  description: string;
  priority: Priority;
  completed: boolean;
  createdAt: string;
}

export interface MetricSummary {
  totalItems: number;
  completedItems: number;
  pendingItems: number;
  completionRate: number;
}

export interface CustomerModel {
  id: string | number;
  name: string;
  phone?: string;
  address?: string;
  economicCode?: string;
  avatar?: string | null;
  code?: string;
}

export interface InvoiceModel {
  id: string | number;
  customerId: string | number;
  customerName?: string;
  number: string;
  type: string;
  date: string;
  amount: number;
  note?: string;
  items?: any;
  createdAt: string;
}

export interface PaymentModel {
  id: string | number;
  customerId: string | number;
  date: string;
  amount: number;
  method?: string;
  bankName?: string;
  checkDate?: string;
  checkNumber?: string;
  note?: string;
  attachment?: string | null;
  createdAt?: string;
  rawDate?: string;
}

export interface AppState {
  items: AppItem[];
  searchQuery: string;
  selectedFilter: 'all' | 'pending' | 'completed';
  isDarkMode: boolean;
  activeItem: AppItem | null;

  // Accounting Module State
  customers: CustomerModel[];
  invoices: InvoiceModel[];
  payments: PaymentModel[];

  // Actions
  addItem: (item: { title: string; category: string; description: string; priority: Priority }) => AppItem;
  toggleItemCompleted: (id: string) => void;
  deleteItem: (id: string) => void;
  setActiveItem: (item: AppItem | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedFilter: (filter: 'all' | 'pending' | 'completed') => void;
  toggleTheme: () => void;
  resetToDefault: () => void;

  // Accounting Actions
  saveCustomer: (customer: Partial<CustomerModel>) => Promise<boolean>;
  deleteCustomer: (id: string | number) => Promise<boolean>;
  saveInvoice: (invoice: Partial<InvoiceModel>) => Promise<InvoiceModel>;
  deleteInvoice: (id: string | number) => Promise<boolean>;
  savePayment: (payment: Partial<PaymentModel>) => Promise<PaymentModel>;
  deletePayment: (id: string | number) => Promise<boolean>;

  // Getters / Computed
  getMetrics: () => MetricSummary;
  getFilteredItems: () => AppItem[];
}
