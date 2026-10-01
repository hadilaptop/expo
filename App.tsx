import React, { useState, useEffect } from 'react';
import { StyleSheet, StatusBar, View, ActivityIndicator } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import * as Font from 'expo-font'; // ایمپورت کتابخانه فونت

import HomeScreen from './src/screens/HomeScreen';
import AccountScreen from './src/screens/AccountScreen';
import CustomersScreen from './src/screens/CustomersScreen';
import InvoicesScreen from './src/screens/InvoiceScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [fontsLoaded, setFontsLoaded] = useState(false); // استیت برای وضعیت لود فونت

  // لود کردن فونت در زمان اجرای اولیه برنامه
  useEffect(() => {
    async function loadAppFonts() {
      await Font.loadAsync({
        // این نام (Vazirmatn) دقیقاً همان نامی است که در fontFamily فایل‌های استایل دادید
        // مسیر فایل فونت را بر اساس پوشه‌ای که ساختید تنظیم کنید
        'Vazirmatn': require('./assets/fonts/Vazirmatn-Black.ttf'), 
      });
      setFontsLoaded(true);
    }

    loadAppFonts();
  }, []);

  // تا زمانی که فونت لود نشده است، این لودینگ نمایش داده می‌شود تا از کرش کردن برنامه جلوگیری شود
  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <HomeScreen onNavigate={setCurrentScreen} />;
      case 'newAccount':
        return <AccountScreen onNavigate={setCurrentScreen} />;
      case 'customers': 
        return <CustomersScreen onNavigate={setCurrentScreen} />;
      case 'invoice': 
        return <InvoicesScreen onNavigate={setCurrentScreen} />;
      default:
        return <HomeScreen onNavigate={setCurrentScreen} />;
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <StatusBar 
          barStyle="light-content" 
          backgroundColor="transparent" 
          translucent={true} 
        />
        {renderScreen()}
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
    backgroundColor: '#0d2b43', // یک پس‌زمینه تیره و هماهنگ با هدر برای زمان لودینگ
  }
});