import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Animated, Dimensions, ScrollViewProps } from 'react-native';

const { width } = Dimensions.get('window');

// اگر از تایپ‌اسکریپت استفاده می‌کنید:
export interface AnimatedScrollWrapperRef {
  close: (callback?: () => void) => void;
}

interface AnimatedScrollProps extends ScrollViewProps {
  children: React.ReactNode;
  delay?: number; 
}

const AnimatedScrollWrapper = forwardRef<AnimatedScrollWrapperRef, AnimatedScrollProps>(
  ({ children, delay = 0, contentContainerStyle, style, ...rest }, ref) => {
    // نقطه شروع انیمیشن: بیرون از صفحه سمت راست
    const slideAnim = useRef(new Animated.Value(width)).current;

    useEffect(() => {
      // انیمیشن ورود (اسلاید به داخل) با زمان‌بندی مدنظر شما
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        delay: delay,
        useNativeDriver: true,
      }).start();
    }, [slideAnim, delay]);

    // در دسترس قرار دادن تابع خروج برای کامپوننت‌های پدر
    useImperativeHandle(ref, () => ({
      close: (callback) => {
        // انیمیشن خروج (برگشت به سمت راست)
        Animated.timing(slideAnim, {
          toValue: width,
          duration: 250,
          useNativeDriver: true,
        }).start(() => {
          if (callback) callback();
        });
      }
    }));

    return (
      <Animated.ScrollView
        style={[
          style,
          { transform: [{ translateX: slideAnim }] }
        ]}
        contentContainerStyle={contentContainerStyle}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        {...rest}
      >
        {children}
      </Animated.ScrollView>
    );
  }
);

export default AnimatedScrollWrapper;