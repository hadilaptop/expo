import React from 'react';
import { TextInput, TextInputProps, StyleSheet, Platform } from 'react-native';

export default function CustomTextInput(props: TextInputProps) {
  return (
    <TextInput
      // رنگ کرسر (خط چشمک‌زن) و رنگ متن انتخاب‌شده را سفید می‌کند تا روی پس‌زمینه آبی دیده شود
      selectionColor="rgba(255, 255, 255, 0.7)" 
      cursorColor="#ffffff" 
      
      {...props}
      
      style={[
        styles.defaultFont,
        props.style,
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
});