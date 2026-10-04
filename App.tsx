import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  StatusBar,
  View,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import * as Font from 'expo-font';
import * as NavigationBar from 'expo-navigation-bar';

import HomeScreen from './src/screens/HomeScreen';
import AccountScreen from './src/screens/AccountScreen';
import CustomersScreen from './src/screens/CustomersScreen';
import InvoicesScreen from './src/screens/InvoiceScreen';
import SettingsScreen from './src/screens/SettingsScreen';

import BottomNav from './src/components/BottomNav';

import {
  Customer,
  getCustomers,
  saveCustomer,
  deleteCustomer,
} from './src/storage/customerStorage';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('dashboard');

  const [fontsLoaded, setFontsLoaded] = useState(false);

  // لیست مشتری‌های واقعی برنامه
  const [customers, setCustomers] = useState<Customer[]>([]);

  // مشتری‌ای که قرار است ویرایش شود
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);

  // مشخص می‌کند اطلاعات مشتری‌ها از حافظه خوانده شده یا نه
  const [customersLoaded, setCustomersLoaded] = useState(false);

  useEffect(() => {
    async function loadAppFonts() {
      await Font.loadAsync({
        Vazirmatn: require('./assets/fonts/Vazirmatn-FD-Bold.ttf'),
      });

      setFontsLoaded(true);
    }

    async function setupNavBar() {
      if (Platform.OS === 'android') {
        try {
          await NavigationBar.setBackgroundColorAsync('#0d2b43');
          await NavigationBar.setButtonStyleAsync('light');
        } catch (error) {
          console.log('Navigation Bar Error:', error);
        }
      }
    }

    async function loadCustomers() {
      try {
        const savedCustomers = await getCustomers();

        setCustomers(savedCustomers);
      } catch (error) {
        console.error('خطا در بارگذاری مشتری‌ها:', error);
      } finally {
        setCustomersLoaded(true);
      }
    }

    loadAppFonts();
    setupNavBar();
    loadCustomers();
  }, []);

  /**
   * ذخیره مشتری جدید یا ویرایش مشتری موجود
   */
  const handleSaveCustomer = async (customer: Customer) => {
    try {
      const success = await saveCustomer(customer);

      if (!success) {
        return false;
      }

      // بعد از ذخیره، لیست داخل App هم به‌روز می‌شود
      setCustomers((currentCustomers) => {
        const index = currentCustomers.findIndex(
          (item) => String(item.id) === String(customer.id)
        );

        if (index === -1) {
          return [...currentCustomers, customer];
        }

        const updatedCustomers = [...currentCustomers];
        updatedCustomers[index] = customer;

        return updatedCustomers;
      });

      // بعد از ذخیره، مشتری انتخاب‌شده برای ویرایش را پاک می‌کنیم
      setCustomerToEdit(null);

      return true;
    } catch (error) {
      console.error('خطا در ذخیره مشتری:', error);
      return false;
    }
  };

  /**
   * حذف مشتری
   */
  const handleDeleteCustomer = async (
    customerId: string | number
  ) => {
    try {
      const success = await deleteCustomer(customerId);

      if (!success) {
        return;
      }

      setCustomers((currentCustomers) =>
        currentCustomers.filter(
          (customer) =>
            String(customer.id) !== String(customerId)
        )
      );
    } catch (error) {
      console.error('خطا در حذف مشتری:', error);
    }
  };

  /**
   * ورود به صفحه ویرایش مشتری
   */
  const handleEditCustomer = (customer: Customer) => {
    setCustomerToEdit(customer);
    setCurrentScreen('newAccount');
  };

  /**
   * انتخاب مشتری برای دفتر حساب
   *
   * فعلاً فقط مشتری را نگه می‌داریم.
   * بعداً که صفحه دفتر حساب را کامل کردیم
   * همین تابع به آن صفحه متصل می‌شود.
   */
  const handleSelectCustomerLedger = (customer: Customer) => {
    console.log('Selected customer:', customer);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <HomeScreen onNavigate={setCurrentScreen} />;

      case 'newAccount':
        return (
          <AccountScreen
            onNavigate={setCurrentScreen}
            onSave={handleSaveCustomer}
            customerToEdit={customerToEdit}
            existingCustomers={customers}
          />
        );

      case 'customers':
        return (
          <CustomersScreen
            onNavigate={setCurrentScreen}
            customers={customers}
            onDeleteCustomer={handleDeleteCustomer}
            onEditCustomer={handleEditCustomer}
            onSelectCustomerLedger={handleSelectCustomerLedger}
          />
        );

      case 'invoice':
        return <InvoicesScreen onNavigate={setCurrentScreen} />;

      case 'settings':
        return <SettingsScreen onNavigate={setCurrentScreen} />;

      default:
        return <HomeScreen onNavigate={setCurrentScreen} />;
    }
  };

  if (!fontsLoaded || !customersLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={styles.container}
        edges={['left', 'right']}
      >
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent={true}
        />

        {renderScreen()}

        <BottomNav
          activeTab={currentScreen}
          onNavigate={(screen) => {
            // وقتی از مشتری‌ها به ثبت حساب جدید می‌رویم،
            // فرم باید خالی باشد.
            if (screen === 'newAccount') {
              setCustomerToEdit(null);
            }

            setCurrentScreen(screen);
          }}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eaf6fc',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0d2b43',
  },
});
