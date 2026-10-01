/**
 * @file types.ts
 * @description React Navigation Type Definitions for Iranian Accounting & Invoice App
 */

export type NavigatorScreenParams<T> = any;

export type NativeStackScreenProps<T, K extends keyof T> = {
  navigation: any;
  route: { params?: T[K] };
};

export type BottomTabScreenProps<T, K extends keyof T> = {
  navigation: any;
  route: { params?: T[K] };
};

export type BottomTabParamList = {
  Dashboard: undefined;
  Customers: undefined;
  Invoice: { customerId?: string; invoiceId?: string; step?: 'form' | 'preview' } | undefined;
  Payment: { customerId?: string; paymentId?: string } | undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<BottomTabParamList>;
  CustomerLedger: { customerId: string };
  Account: { customerId?: string };
  InvoiceDetail: { invoiceId: string };
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

export type BottomTabScreenPropsHelper<T extends keyof BottomTabParamList> = BottomTabScreenProps<
  BottomTabParamList,
  T
>;
