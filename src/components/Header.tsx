import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface HeaderProps {
  title: string;                     // عنوان صفحه
  subtitle?: string;                 // ✨ زیرعنوان (اختیاری) - جدید
  onBack?: () => void;               // تابعی که با کلیک روی دکمه برگشت اجرا می‌شود
  iconName?: any;                    // نام آیکون (اختیاری - پیش‌فرض: arrow-forward)
}

export default function Header({ title, subtitle, onBack, iconName = 'arrow-forward' }: HeaderProps) {
  return (
    <LinearGradient
      colors={['#0d2b43', '#0f4c75']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.header}
    >
      <View style={styles.headerInfo}>
        <Text style={styles.headerTitle}>{title}</Text>
        {/* ✨ نمایش زیرعنوان در صورت وجود */}
        {subtitle && (
           <Text style={styles.headerSubtitle}>{subtitle}</Text>
        )}
      </View>

      {onBack && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onBack}
          style={styles.backBtn}
        >
          <Ionicons name={iconName} size={22} color="#ffffff" />
        </TouchableOpacity>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  // ... استایل‌های قبلی ...
  header: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 50,
    paddingBottom: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    zIndex: 10,
  },
  headerInfo: {
    flex: 1,
    alignItems: "flex-end",
  },
  headerTitle: {
    fontFamily: "Vazirmatn",
    fontSize: 16,
    color: "#ffffff",
    textAlign: "right",
  },
  // ✨ استایل جدید برای زیرعنوان
  headerSubtitle: {
    fontFamily: "Vazirmatn",
    fontSize: 13,
    color: "#ffffff",
    opacity: 0.9,
    marginTop: 4,
    textAlign: "right",
  },
  backBtn: {
    width: 42,
    height: 42,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
});