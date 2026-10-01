import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from '@/src/react-native';
import { PersianDashboardRN } from './PersianDashboardRN';
import { Account } from './AccountScreenRN';
import { CustomerLedger } from './CustomerLedgerRN';
import { Customers } from './CustomersRN';
import { Invoice } from './InvoiceRN';
import { Payment } from './PaymentRN';
import { useAppStore } from '@/src/store/useAppStore';

interface DashboardScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
  };
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const [currentView, setCurrentView] = useState<
    'dashboard' | 'account' | 'ledger' | 'customers' | 'invoice' | 'payment'
  >('dashboard');

  const customers = useAppStore((state) => state.customers);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(customers[0] || null);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [customerCount, setCustomerCount] = useState<number>(customers.length || 1540);
  const [isInitialized, setIsInitialized] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [showToast, setShowToast] = useState(false);

  const displayToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2800);
  };

  const handleNavigate = (target: string) => {
    if (target === 'invoice') {
      setCurrentView('invoice');
    } else if (target === 'customers') {
      setCurrentView('customers');
    } else if (target === 'new-account') {
      setCurrentView('account');
    } else if (target === 'customer-ledger') {
      setCurrentView('ledger');
    } else if (target === 'dashboard') {
      setCurrentView('dashboard');
    } else {
      displayToast(`ناوبری به: ${target}`);
    }
  };

  // نمای ثبت / ویرایش حساب
  if (currentView === 'account') {
    return (
      <View style={styles.container}>
        <Account
          onNavigate={handleNavigate}
          onSave={async (customerData) => {
            setCustomerCount((c) => c + 1);
            displayToast(`حساب «${customerData.name}» با موفقیت ثبت شد.`);
            setCurrentView('customers');
            return true;
          }}
          existingCustomers={customers}
        />
        {showToast && (
          <View style={styles.toastContainer}>
            <Text style={styles.toastText}>🔔 {toastMessage}</Text>
          </View>
        )}
      </View>
    );
  }

  // نمای گردش حساب مشتری (CustomerLedger)
  if (currentView === 'ledger') {
    return (
      <View style={styles.container}>
        <CustomerLedger
          customer={selectedCustomer || customers[0]}
          onNavigate={handleNavigate}
          onOpenInvoice={(cust) => {
            setSelectedCustomer(cust);
            setCurrentView('invoice');
          }}
          onOpenPaymentPage={(cust, payment) => {
            setSelectedCustomer(cust);
            setSelectedPayment(payment);
            setCurrentView('payment');
          }}
          onOpenStatement={(cust) => {
            displayToast(`صورت‌حساب کامل برای ${cust?.name}`);
          }}
        />
        {showToast && (
          <View style={styles.toastContainer}>
            <Text style={styles.toastText}>🔔 {toastMessage}</Text>
          </View>
        )}
      </View>
    );
  }

  // نمای مدیریت مشتریان (Customers)
  if (currentView === 'customers') {
    return (
      <View style={styles.container}>
        <Customers
          onNavigate={handleNavigate}
          customers={customers}
          onSelectCustomerLedger={(cust) => {
            setSelectedCustomer(cust);
            setCurrentView('ledger');
          }}
          onOpenNewAccountPage={() => setCurrentView('account')}
          onDeleteCustomer={(id) => {
            useAppStore.getState().deleteCustomer(id);
            displayToast('مشتری با موفقیت حذف شد.');
          }}
          onEditCustomer={(cust) => {
            setSelectedCustomer(cust);
            setCurrentView('account');
          }}
        />
        {showToast && (
          <View style={styles.toastContainer}>
            <Text style={styles.toastText}>🔔 {toastMessage}</Text>
          </View>
        )}
      </View>
    );
  }

  // نمای صدور و پیش‌نمایش فاکتور (Invoice)
  if (currentView === 'invoice') {
    return (
      <View style={styles.container}>
        <Invoice
          onNavigate={handleNavigate}
          initialCustomer={selectedCustomer}
          customers={customers}
        />
        {showToast && (
          <View style={styles.toastContainer}>
            <Text style={styles.toastText}>🔔 {toastMessage}</Text>
          </View>
        )}
      </View>
    );
  }

  // نمای ثبت دریافتی (Payment)
  if (currentView === 'payment') {
    return (
      <View style={styles.container}>
        <Payment
          onNavigate={handleNavigate}
          initialCustomer={selectedCustomer}
          paymentToEdit={selectedPayment}
          customers={customers}
          onPaymentSaved={() => {
            displayToast('دریافتی با موفقیت ذخیره شد.');
          }}
        />
        {showToast && (
          <View style={styles.toastContainer}>
            <Text style={styles.toastText}>🔔 {toastMessage}</Text>
          </View>
        )}
      </View>
    );
  }

  // نمای پیش‌فرض: داشبورد اصلی
  return (
    <View style={styles.container}>
      <PersianDashboardRN
        customerCount={customerCount}
        isInitialized={isInitialized}
        onNavigate={handleNavigate}
        onOpenNewAccountPage={() => setCurrentView('account')}
      />

      {/* نوار جابجایی سریع بین صفحات تبدیل‌شده */}
      <View style={styles.quickNavigationRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickNavScroll}>
          <TouchableOpacity
            style={[styles.quickNavBtn, styles.quickNavBtnPrimary]}
            onPress={() => setCurrentView('ledger')}
            activeOpacity={0.8}
          >
            <Text style={styles.quickNavBtnText}>📊 گردش حساب (Ledger)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickNavBtn}
            onPress={() => setCurrentView('customers')}
            activeOpacity={0.8}
          >
            <Text style={styles.quickNavBtnText}>👥 لیست مشتریان</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickNavBtn}
            onPress={() => setCurrentView('invoice')}
            activeOpacity={0.8}
          >
            <Text style={styles.quickNavBtnText}>📄 فاکتور فروش</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickNavBtn}
            onPress={() => setCurrentView('payment')}
            activeOpacity={0.8}
          >
            <Text style={styles.quickNavBtnText}>💵 ثبت دریافتی</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickNavBtn}
            onPress={() => setCurrentView('account')}
            activeOpacity={0.8}
          >
            <Text style={styles.quickNavBtnText}>👤 حساب جدید</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* پیام نوتیفیکیشن / Toast */}
      {showToast && (
        <View style={styles.toastContainer}>
          <Text style={styles.toastText}>🔔 {toastMessage}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eaf6fc',
    position: 'relative',
  },
  quickNavigationRow: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#cbd5e1',
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  quickNavScroll: {
    paddingHorizontal: 12,
    gap: 8,
    flexDirection: 'row',
  },
  quickNavBtn: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  quickNavBtnPrimary: {
    backgroundColor: '#0f4c75',
    borderColor: '#0d2b43',
  },
  quickNavBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0d2b43',
  },
  toastContainer: {
    position: 'absolute',
    bottom: 60,
    left: 20,
    right: 20,
    backgroundColor: '#0d2b43',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  toastText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});
