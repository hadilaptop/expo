import React, { useState, useEffect } from 'react';
import { StyleSheet, StatusBar, View, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import * as Font from 'expo-font'; 
import * as NavigationBar from 'expo-navigation-bar'; // ایمپورت پکیج نوار ناوبری

import HomeScreen from './src/screens/HomeScreen';
import AccountScreen from './src/screens/AccountScreen';
import CustomersScreen from './src/screens/CustomersScreen';
import InvoicesScreen from './src/screens/InvoiceScreen';
import SettingsScreen from './src/screens/SettingsScreen';

import BottomNav from './src/components/BottomNav';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [fontsLoaded, setFontsLoaded] = useState(false); 

 useEffect(() => {
    // ۱. تابع لود کردن فونت‌ها
    async function loadAppFonts() {
      await Font.loadAsync({
        'Vazirmatn': require('./assets/fonts/Vazirmatn-FD-Bold.ttf'), 
      });
      setFontsLoaded(true);
    }
    
    // ۲. تابع تغییر رنگ نوار (جداگانه و محافظت‌شده)
    async function setupNavBar() {
      if (Platform.OS === 'android') {
        try {
          await NavigationBar.setBackgroundColorAsync('#0d2b43'); 
          await NavigationBar.setButtonStyleAsync('light'); 
        } catch (error) {
          console.log("Navigation Bar Error:", error);
          // این خطا در کنسول چاپ می‌شود اما برنامه شما کرش نمی‌کند
        }
      }
    }

    loadAppFonts();
    setupNavBar();
  }, []);
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
      case 'settings':
        return <SettingsScreen onNavigate={setCurrentScreen} />;
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
        <BottomNav 
          activeTab={currentScreen} 
          onNavigate={setCurrentScreen} 
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
  }
});