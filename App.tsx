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
import CustomerLedger from './src/screens/CustomerLedger';
import CustomerStatement from './src/screens/CustomerStatement';

import BottomNav from './src/components/BottomNav';

import {
  Customer,
  getCustomers,
  saveCustomer,
  deleteCustomer,
} from './src/storage/customerStorage';

import { getInvoices, deleteInvoice, StoredInvoice } from './src/storage/invoiceStorage';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [settingsReturnScreen, setSettingsReturnScreen] = useState('dashboard');

  const [fontsLoaded, setFontsLoaded] = useState(false);

  // لیست مشتری‌های واقعی برنامه
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<StoredInvoice[]>([]);

  // مشتری‌ای که قرار است ویرایش شود
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [customerFormReturnScreen, setCustomerFormReturnScreen] = useState('dashboard');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<StoredInvoice | null>(null);
  const [invoiceMode, setInvoiceMode] = useState<"preview" | "form" | null>(null);

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
          NavigationBar.setStyle('dark');
        } catch (error) {
          console.log('Navigation Bar Error:', error);
        }
      }
    }

    async function loadCustomers() {
      try {
        const savedCustomers = await getCustomers();
        const savedInvoices = await getInvoices();

        setCustomers(savedCustomers);
        setInvoices(savedInvoices);
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

  const handleSaveInvoice = (invoice: StoredInvoice) => {
    setInvoices((currentInvoices) => {
      const index = currentInvoices.findIndex(
        (item) => String(item.id) === String(invoice.id),
      );
      if (index === -1) return [...currentInvoices, invoice];
      const updatedInvoices = [...currentInvoices];
      updatedInvoices[index] = invoice;
      return updatedInvoices;
    });
  };

  const handleDeleteInvoice = async (invoiceId: string | number) => {
    const success = await deleteInvoice(invoiceId);
    if (success) {
      setInvoices((currentInvoices) =>
        currentInvoices.filter((item) => String(item.id) !== String(invoiceId)),
      );
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
    setCustomerFormReturnScreen('customers');
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
    setSelectedCustomer(customer);
    setCurrentScreen('customerLedger');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return (
          <HomeScreen
            onNavigate={(screen: string) => {
              if (screen === 'newAccount') {
                setCustomerFormReturnScreen('dashboard');
              }
              if (screen === 'invoice') {
                setSelectedCustomer(null);
                setSelectedInvoice(null);
                setInvoiceMode(null);
              }
              setCurrentScreen(screen);
            }}
            customerCount={customers.length}
            isInitialized={customersLoaded}
          />
        );

      case 'newAccount':
        return (
          <AccountScreen
            onNavigate={(screen: string) => {
              if (screen !== 'newAccount') {
                setCustomerToEdit(null);
              }
              setCurrentScreen(screen);
            }}
            onSave={handleSaveCustomer}
            customerToEdit={customerToEdit}
            returnScreen={customerFormReturnScreen}
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

      case 'customerLedger':
        return (
          selectedCustomer ? (
            <CustomerLedger
              customer={selectedCustomer}
              invoices={invoices}
              onDeleteInvoice={handleDeleteInvoice}
              onNavigate={setCurrentScreen}
              onOpenInvoice={(customer, invoice, mode) => {
                setSelectedCustomer(customer);
                setSelectedInvoice(invoice ?? null);
                setInvoiceMode(mode ?? null);
                setCurrentScreen('invoice');
              }}
            />
          ) : null
        );

      case 'customerStatement':
        return selectedCustomer ? (
          <CustomerStatement
            customer={selectedCustomer}
            onBack={() => setCurrentScreen('customerLedger')}
            onNavigate={setCurrentScreen}
          />
        ) : null;

      case 'invoice':
        return (
          <InvoicesScreen
            onNavigate={setCurrentScreen}
            initialCustomer={selectedCustomer}
            customers={customers}
            onInvoiceSaved={handleSaveInvoice}
            invoiceToEdit={selectedInvoice}
            initialMode={invoiceMode}
          />
        );

      case 'settings':
        return <SettingsScreen onNavigate={setCurrentScreen} returnScreen={settingsReturnScreen} />;

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
            if (screen === 'settings') {
              setSettingsReturnScreen(currentScreen);
            }
            // وقتی از مشتری‌ها به ثبت حساب جدید می‌رویم،
            // فرم باید خالی باشد.
            if (screen === 'newAccount') {
              setCustomerToEdit(null);
              setCustomerFormReturnScreen('dashboard');
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