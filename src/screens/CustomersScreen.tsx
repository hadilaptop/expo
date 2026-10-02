import React, { useState } from 'react';
import { TextInput, TextInputProps, StyleSheet } from 'react-native';

export default function CustomTextInput(props: TextInputProps) {
  // یک استیت برای تشخیص اینکه آیا کاربر روی این کادر کلیک کرده است یا خیر
  const [isFocused, setIsFocused] = useState(false);

  return (
    <TextInput
      selectionColor="rgba(255, 255, 255, 0.7)" 
      cursorColor="#ffffff" 
      {...props}
      
      // ترفند اصلی: اگر کادر در حالت تایپ بود، پیش‌فرض را خالی کن تا کرسر نپرد
      placeholder={isFocused ? "" : props.placeholder}
      
      onFocus={(e) => {
        setIsFocused(true);
        if (props.onFocus) props.onFocus(e);
      }}
      
      onBlur={(e) => {
        setIsFocused(false);
        if (props.onBlur) props.onBlur(e);
      }}

      style={[
        styles.defaultFont,
        { textAlign: 'right' },
        props.style
      ]}
    />
  );
}

const styles = StyleSheet.create({
  defaultFont: {
    fontFamily: 'Vazirmatn', 
  },
});