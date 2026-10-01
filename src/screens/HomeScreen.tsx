import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as jalaali from 'jalaali-js'; // استفاده از کتابخانه تقویم جلالی شما

export default function HomeScreen({ onNavigate = (screen: string) => console.log(screen), customerCount = 5, isInitialized = true }) {
  
  // تولید تاریخ دقیق و قطعی شمسی
  const [currentDate] = useState(() => {
    const today = new Date();
    const jDate = jalaali.toJalaali(today);
    
    const persianMonths = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];
    const weekDays = ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه", "شنبه"];
    
    const weekdayName = weekDays[today.getDay()];
    const monthName = persianMonths[jDate.jm - 1];
    
    // تابع تبدیل اعداد انگلیسی به فارسی
    const toPersianDigits = (num: number | string) => 
      String(num).replace(/\d/g, (x) => ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'][parseInt(x)]);
    
    return `${weekdayName}، ${toPersianDigits(jDate.jd)} ${monthName} ${toPersianDigits(jDate.jy)}`;
  });

  const displayCustomerCount = Number(customerCount || 0).toLocaleString("fa-IR");

  return (
    <View style={styles.dashboardAppContainer}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <LinearGradient
          colors={['#0d2b43', '#0f4c75']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.dashHeader}
        >
          <View style={styles.dashHeaderTop}>
            <Text style={styles.dashDate}>{currentDate}</Text>
          </View>
          <Text style={styles.dashHeaderTitle}>سیستم مدیریت فاکتور و حسابداری</Text>
        </LinearGradient>

        <View style={styles.dashContent}>
          <View style={styles.dashGrid}>
            
            <TouchableOpacity activeOpacity={0.8} onPress={() => onNavigate("invoice")} style={styles.cardWrapper}>
              <LinearGradient
                colors={['#3282b8', '#0d2b43']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.dashCard}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardIcon}>
                    <Ionicons name="stats-chart" size={20} color="#ffffff" />
                  </View>
                  <Text style={styles.cardTitle}>فاکتور جدید</Text>
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardCount}>صدور سریع فاکتور</Text>
                  <Text style={styles.cardDesc}>صدور پیش‌فاکتور و فاکتور فروش</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.8} onPress={() => onNavigate("customers")} style={styles.cardWrapper}>
              <LinearGradient
                colors={['#0d2b43', '#0f4c75']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.dashCard}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardIcon}>
                    <Ionicons name="people" size={22} color="#ffffff" />
                  </View>
                  <Text style={styles.cardTitle}>مدیریت حساب‌ها</Text>
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardCount}>
                    {!isInitialized ? "در حال به‌روزرسانی..." : `تعداد ${displayCustomerCount} مشتری`}
                  </Text>
                  <Text style={styles.cardDesc}>مشاهده صورتحساب و پرداختی‌ها</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.8} onPress={() => onNavigate("newAccount")} style={styles.cardWrapper}>
              <LinearGradient
                colors={['#0f4c75', '#3282b8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.dashCard}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardIcon}>
                     <Ionicons name="person-add" size={20} color="#ffffff" />
                  </View>
                  <Text style={styles.cardTitle}>حساب جدید</Text>
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardCount}>ثبت مشتری جدید</Text>
                  <Text style={styles.cardDesc}>افزودن اطلاعات برای صدور فاکتور</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  dashboardAppContainer: {
    flex: 1,
    backgroundColor: '#eaf6fc',
  },
  scrollContent: {
    paddingBottom: 50,
  },
  dashHeader: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 65 : 55, // تنظیم فاصله مناسب برای بالای گوشی
    paddingBottom: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 10,
    elevation: 8, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
  },
  dashHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    direction: 'ltr',
  },
  dashDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'left',
  },
  dashHeaderTitle: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
    lineHeight: 25,
    marginTop: 15,
  },
  dashContent: {
    paddingHorizontal: 20,
  },
  dashGrid: {
    gap: 10,
  },
  cardWrapper: {
    width: '100%',
  },
  dashCard: {
    width: '90%',
    alignSelf: 'center',
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 92,
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    direction: 'ltr',
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#ffffff',
    marginHorizontal: 10,
  },
  cardIcon: {
    width: 35,
    height: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBody: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  cardCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
    textAlign: 'center',
  },
});