import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Payment {
  id: string | number;
  customerId: string | number;
  date: string;
  amount: number;
  method?: string;
  bankName?: string;
  checkDate?: string;
  checkNumber?: string;
  note?: string;
  attachment?: string;
  createdAt?: string;
}

const STORAGE_KEY = "@hadi_factor_payments";

export async function getPayments(): Promise<Payment[]> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("خطا در دریافت دریافتی‌ها:", error);
    return [];
  }
}

export async function savePayment(payment: Payment): Promise<boolean> {
  try {
    const payments = await getPayments();
    const index = payments.findIndex((item) => String(item.id) === String(payment.id));

    if (index === -1) payments.push(payment);
    else payments[index] = payment;

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payments));
    return true;
  } catch (error) {
    console.error("خطا در ذخیره دریافتی:", error);
    return false;
  }
}

export async function deletePayment(paymentId: string | number): Promise<boolean> {
  try {
    const payments = await getPayments();
    const filtered = payments.filter((item) => String(item.id) !== String(paymentId));
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error("خطا در حذف دریافتی:", error);
    return false;
  }
}
