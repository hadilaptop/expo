import React, { useState } from 'react';
import { TextInput, TextInputProps, StyleSheet } from 'react-native';

// تعریف یک اینترفیس برای اضافه کردن پراپ جدید
interface CustomTextInputProps extends TextInputProps {
  disableFocusStyle?: boolean; // پراپ جدید برای غیرفعال کردن استایل فوکوس
}

export default function CustomTextInput({ 
  style, 
  onFocus, 
  onBlur, 
  disableFocusStyle = false, // مقدار پیش‌فرض false است
  ...props 
}: CustomTextInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <TextInput
      // فقط زمانی که استایل فوکوس فعال است رنگ کرسر سفید شود، 
      // در غیر این صورت از رنگ پیش فرض سیستم یا رنگ کادر جستجو استفاده شود
      selectionColor={disableFocusStyle ? undefined : "rgba(255, 255, 255, 0.7)"} 
      cursorColor={disableFocusStyle ? "#0f4c75" : "#ffffff"} 
      
      onFocus={(e) => {
        setIsFocused(true);
        onFocus && onFocus(e);
      }}
      onBlur={(e) => {
        setIsFocused(false);
        onBlur && onBlur(e);
      }}
      
      {...props}
      
      style={[
        styles.defaultFont,
        style,
        // تنها در صورتی که فیلد فوکوس شده باشد و disableFocusStyle برابر false باشد، استایل اعمال می‌شود
        (isFocused && !disableFocusStyle) && styles.inputFocused, 
        { 
          textAlign: 'right',
        }
      ]}
    />
  );
}

const styles = StyleSheet.create({
  defaultFont: {
    fontFamily: 'Vazirmatn', 
  },
  inputFocused: {
    borderColor: "#ffffff",
    backgroundColor: "rgba(20, 58, 123, 0.35)",
  },
});