import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Customer {
  id: string | number;
  name: string;
  address?: string;
  phone?: string;
  economicCode?: string;
  avatar?: string;
}

const CUSTOMERS_STORAGE_KEY = "@hadi_factor_customers";

/**
 * دریافت تمام مشتری‌های ذخیره‌شده
 */
export async function getCustomers(): Promise<Customer[]> {
  try {
    const storedData = await AsyncStorage.getItem(CUSTOMERS_STORAGE_KEY);

    if (!storedData) {
      return [];
    }

    const customers = JSON.parse(storedData);

    if (!Array.isArray(customers)) {
      return [];
    }

    return customers;
  } catch (error) {
    console.error("خطا در دریافت مشتری‌ها:", error);
    return [];
  }
}

/**
 * ذخیره کامل لیست مشتری‌ها
 */
export async function saveCustomers(
  customers: Customer[]
): Promise<boolean> {
  try {
    await AsyncStorage.setItem(
      CUSTOMERS_STORAGE_KEY,
      JSON.stringify(customers)
    );

    return true;
  } catch (error) {
    console.error("خطا در ذخیره مشتری‌ها:", error);
    return false;
  }
}

/**
 * افزودن مشتری جدید
 */
export async function addCustomer(
  customer: Customer
): Promise<boolean> {
  try {
    const customers = await getCustomers();

    customers.push(customer);

    return await saveCustomers(customers);
  } catch (error) {
    console.error("خطا در افزودن مشتری:", error);
    return false;
  }
}

/**
 * ویرایش مشتری موجود
 */
export async function updateCustomer(
  customer: Customer
): Promise<boolean> {
  try {
    const customers = await getCustomers();

    const index = customers.findIndex(
      (item) => String(item.id) === String(customer.id)
    );

    if (index === -1) {
      return false;
    }

    customers[index] = customer;

    return await saveCustomers(customers);
  } catch (error) {
    console.error("خطا در ویرایش مشتری:", error);
    return false;
  }
}

/**
 * حذف مشتری
 */
export async function deleteCustomer(
  customerId: string | number
): Promise<boolean> {
  try {
    const customers = await getCustomers();

    const filteredCustomers = customers.filter(
      (item) => String(item.id) !== String(customerId)
    );

    return await saveCustomers(filteredCustomers);
  } catch (error) {
    console.error("خطا در حذف مشتری:", error);
    return false;
  }
}

/**
 * افزودن یا ویرایش مشتری
 */
export async function saveCustomer(
  customer: Customer
): Promise<boolean> {
  try {
    const customers = await getCustomers();

    const index = customers.findIndex(
      (item) => String(item.id) === String(customer.id)
    );

    if (index === -1) {
      customers.push(customer);
    } else {
      customers[index] = customer;
    }

    return await saveCustomers(customers);
  } catch (error) {
    console.error("خطا در ذخیره مشتری:", error);
    return false;
  }
}

/**
 * حذف تمام مشتری‌ها
 * فعلاً برای استفاده داخلی/تست
 */
export async function clearCustomers(): Promise<boolean> {
  try {
    await AsyncStorage.removeItem(CUSTOMERS_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error("خطا در پاک کردن مشتری‌ها:", error);
    return false;
  }
}
