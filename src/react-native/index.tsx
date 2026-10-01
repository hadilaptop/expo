/**
 * React Native Web Emulation Primitives
 * Allows actual React Native code (View, Text, TouchableOpacity, StyleSheet.create, FlatList, etc.)
 * to execute natively in the browser simulator without using HTML/CSS tags directly in screen code.
 */

import React, { forwardRef, useState } from 'react';

export type ViewStyle = Record<string, any>;
export type TextStyle = Record<string, any>;
export type ImageStyle = Record<string, any>;

// Platform API
export const Platform = {
  OS: 'ios' as 'ios' | 'android' | 'web',
  select: <T,>(obj: { ios?: T; android?: T; default?: T }): T => {
    return (obj.ios ?? obj.default) as T;
  },
  isPad: false,
  isTV: false,
};

// StyleSheet API
export const StyleSheet = {
  create: <T extends Record<string, any>>(styles: T): T => styles,
  flatten: (style: any) => {
    if (!style) return {};
    if (Array.isArray(style)) {
      return style.reduce((acc, curr) => ({ ...acc, ...(curr || {}) }), {});
    }
    return style;
  },
  hairlineWidth: 1,
};

// Convert RN styles to Web CSS styles
const normalizeStyle = (style: any): React.CSSProperties => {
  if (!style) return {};
  const flat = StyleSheet.flatten(style);
  const webStyle: any = { ...flat };

  // Convert RN specific style units / behavior
  if (typeof webStyle.shadowRadius === 'number') {
    const color = webStyle.shadowColor || 'rgba(0,0,0,0.1)';
    const offset = webStyle.shadowOffset || { width: 0, height: 2 };
    const opacity = webStyle.shadowOpacity ?? 0.1;
    webStyle.boxShadow = `${offset.width}px ${offset.height}px ${webStyle.shadowRadius * 2}px rgba(0,0,0,${opacity})`;
    delete webStyle.shadowColor;
    delete webStyle.shadowOffset;
    delete webStyle.shadowOpacity;
    delete webStyle.shadowRadius;
    delete webStyle.elevation;
  }

  // RN flex default is column
  if (webStyle.display === undefined && (webStyle.flex !== undefined || webStyle.flexDirection !== undefined)) {
    webStyle.display = 'flex';
  }

  return webStyle;
};

// View Component
export interface ViewProps {
  style?: any;
  children?: React.ReactNode;
  onLayout?: (event: any) => void;
  pointerEvents?: 'box-none' | 'none' | 'box-only' | 'auto';
  testID?: string;
  onClick?: (e: any) => void;
}

export const View = forwardRef<HTMLDivElement, ViewProps>(
  ({ style, children, pointerEvents, testID, onLayout, ...props }, ref) => {
    const normalized = normalizeStyle(style);
    return (
      <div
        ref={ref}
        data-testid={testID}
        style={{
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          position: 'relative',
          borderWidth: 0,
          borderStyle: 'solid',
          minWidth: 0,
          minHeight: 0,
          margin: 0,
          padding: 0,
          pointerEvents: pointerEvents as any,
          ...normalized,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
View.displayName = 'View';

// Text Component
export interface TextProps {
  style?: any;
  children?: React.ReactNode;
  numberOfLines?: number;
  onPress?: () => void;
  testID?: string;
  adjustsFontSizeToFit?: boolean;
  allowFontScaling?: boolean;
  selectable?: boolean;
}

export const Text = forwardRef<HTMLSpanElement, TextProps>(
  (
    {
      style,
      children,
      numberOfLines,
      onPress,
      testID,
      adjustsFontSizeToFit,
      allowFontScaling,
      selectable,
      ...props
    },
    ref
  ) => {
    const normalized = normalizeStyle(style);
    const lineClampStyle: React.CSSProperties = numberOfLines
      ? {
          display: '-webkit-box',
          WebkitLineClamp: numberOfLines,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }
      : {};

    return (
      <span
        ref={ref}
        data-testid={testID}
        onClick={onPress}
        style={{
          boxSizing: 'border-box',
          margin: 0,
          padding: 0,
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSize: 14,
          color: '#0F172A',
          cursor: onPress ? 'pointer' : 'inherit',
          userSelect: selectable === false ? 'none' : 'auto',
          ...lineClampStyle,
          ...normalized,
        }}
        {...props}
      >
        {children}
      </span>
    );
  }
);
Text.displayName = 'Text';

// TouchableOpacity Component
export interface TouchableOpacityProps {
  style?: any;
  children?: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  activeOpacity?: number;
  hitSlop?: { top?: number; bottom?: number; left?: number; right?: number };
  testID?: string;
}

export const TouchableOpacity = forwardRef<HTMLDivElement, TouchableOpacityProps>(
  (
    {
      style,
      children,
      onPress,
      onLongPress,
      disabled,
      activeOpacity = 0.7,
      hitSlop,
      testID,
      ...props
    },
    ref
  ) => {
    const [isPressed, setIsPressed] = useState(false);
    const normalized = normalizeStyle(style);

    const handlePress = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!disabled && onPress) {
        onPress();
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        e.stopPropagation();
        onPress?.();
      }
    };

    return (
      <div
        ref={ref}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        data-testid={testID}
        onClick={handlePress}
        onKeyDown={handleKeyDown}
        onMouseDown={() => !disabled && setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        onTouchStart={() => !disabled && setIsPressed(true)}
        onTouchEnd={() => setIsPressed(false)}
        style={{
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          backgroundColor: 'transparent',
          borderWidth: 0,
          borderStyle: 'none',
          padding: 0,
          margin: 0,
          textAlign: 'left',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : isPressed ? activeOpacity : 1,
          transition: 'opacity 0.15s ease, transform 0.1s ease',
          outline: 'none',
          userSelect: 'none',
          WebkitTapHighlightColor: 'transparent',
          ...normalized,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TouchableOpacity.displayName = 'TouchableOpacity';

// TextInput Component
export interface TextInputProps {
  style?: any;
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  placeholderTextColor?: string;
  multiline?: boolean;
  numberOfLines?: number;
  secureTextEntry?: boolean;
  keyboardType?: string;
  autoCapitalize?: string;
  autoCorrect?: boolean;
  returnKeyType?: string;
  blurOnSubmit?: boolean;
  clearButtonMode?: string;
  enablesReturnKeyAutomatically?: boolean;
  keyboardAppearance?: string;
  selectionColor?: string;
  underlineColorAndroid?: string;
  editable?: boolean;
  testID?: string;
  onSubmitEditing?: (e?: any) => void;
  onFocus?: (e?: any) => void;
  onBlur?: (e?: any) => void;
  onKeyPress?: (e?: any) => void;
  onKeyDown?: (e?: any) => void;
}

export const TextInput = forwardRef<HTMLInputElement | HTMLTextAreaElement, TextInputProps>(
  (
    {
      style,
      value,
      onChangeText,
      placeholder,
      placeholderTextColor,
      multiline,
      numberOfLines = 3,
      secureTextEntry,
      keyboardType,
      autoCapitalize,
      autoCorrect,
      returnKeyType,
      blurOnSubmit,
      clearButtonMode,
      enablesReturnKeyAutomatically,
      keyboardAppearance,
      selectionColor,
      underlineColorAndroid,
      editable = true,
      testID,
      onSubmitEditing,
      onFocus,
      onBlur,
      onKeyPress,
      onKeyDown,
    },
    ref
  ) => {
    const normalized = normalizeStyle(style);

    // Map keyboardType to standard HTML5 inputMode / type
    let inputMode: 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url' | undefined = undefined;
    let inputType = 'text';

    if (secureTextEntry) {
      inputType = 'password';
    } else if (keyboardType === 'numeric' || keyboardType === 'number-pad') {
      inputMode = 'numeric';
    } else if (keyboardType === 'decimal-pad') {
      inputMode = 'decimal';
    } else if (keyboardType === 'email-address') {
      inputType = 'email';
      inputMode = 'email';
    } else if (keyboardType === 'phone-pad') {
      inputType = 'tel';
      inputMode = 'tel';
    } else if (keyboardType === 'url') {
      inputType = 'url';
      inputMode = 'url';
    }

    const commonStyles: React.CSSProperties = {
      boxSizing: 'border-box',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: 14,
      color: '#0F172A',
      outline: 'none',
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: '#E2E8F0',
      borderRadius: 8,
      padding: '10px 14px',
      backgroundColor: editable ? '#FFFFFF' : '#F1F5F9',
      width: '100%',
      ...normalized,
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (e.key === 'Enter') {
        if (!multiline) {
          onSubmitEditing?.({ nativeEvent: { text: value || '' } });
        }
      }
      onKeyPress?.(e);
      onKeyDown?.(e);
    };

    if (multiline) {
      return (
        <textarea
          ref={ref as any}
          data-testid={testID}
          value={value ?? ''}
          rows={numberOfLines}
          readOnly={!editable}
          onChange={(e) => onChangeText?.(e.target.value)}
          placeholder={placeholder}
          onFocus={onFocus}
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
          style={{
            resize: 'vertical',
            minHeight: numberOfLines * 24,
            ...commonStyles,
          }}
        />
      );
    }

    return (
      <input
        ref={ref as any}
        data-testid={testID}
        type={inputType}
        inputMode={inputMode}
        value={value ?? ''}
        readOnly={!editable}
        onChange={(e) => onChangeText?.(e.target.value)}
        placeholder={placeholder}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={handleKeyDown}
        style={commonStyles}
      />
    );
  }
);
TextInput.displayName = 'TextInput';

// ScrollView Component
export interface ScrollViewProps {
  style?: any;
  contentContainerStyle?: any;
  children?: React.ReactNode;
  keyboardShouldPersistTaps?: string;
  showsVerticalScrollIndicator?: boolean;
  showsHorizontalScrollIndicator?: boolean;
  bounces?: boolean;
  horizontal?: boolean;
  refreshControl?: React.ReactNode;
}

export const ScrollView: React.FC<ScrollViewProps> = ({
  style,
  contentContainerStyle,
  children,
  refreshControl,
}) => {
  const containerStyle = normalizeStyle(style);
  const contentStyle = normalizeStyle(contentContainerStyle);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        flex: 1,
        ...containerStyle,
      }}
    >
      {refreshControl}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          minHeight: '100%',
          ...contentStyle,
        }}
      >
        {children}
      </div>
    </div>
  );
};

// FlatList Component
export interface FlatListProps<T> {
  data: T[] | null | undefined;
  renderItem: (info: { item: T; index: number }) => React.ReactElement | null;
  keyExtractor?: (item: T, index: number) => string;
  ItemSeparatorComponent?: React.ComponentType<any> | null;
  ListEmptyComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null;
  contentContainerStyle?: any;
  style?: any;
  refreshControl?: React.ReactElement;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function FlatList<T>({
  data,
  renderItem,
  keyExtractor,
  ItemSeparatorComponent,
  ListEmptyComponent,
  ListHeaderComponent,
  ListFooterComponent,
  contentContainerStyle,
  style,
  refreshControl,
}: FlatListProps<T>) {
  const items = data || [];
  const containerStyle = normalizeStyle(style);
  const contentStyle = normalizeStyle(contentContainerStyle);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        flex: 1,
        ...containerStyle,
      }}
    >
      {refreshControl}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          ...contentStyle,
        }}
      >
        {React.isValidElement(ListHeaderComponent)
          ? ListHeaderComponent
          : ListHeaderComponent && <ListHeaderComponent />}

        {items.length === 0 ? (
          React.isValidElement(ListEmptyComponent) ? (
            ListEmptyComponent
          ) : ListEmptyComponent ? (
            <ListEmptyComponent />
          ) : null
        ) : (
          items.map((item, index) => {
            const key = keyExtractor ? keyExtractor(item, index) : (item as any)?.id || index;
            return (
              <React.Fragment key={key}>
                {renderItem({ item, index })}
                {index < items.length - 1 && ItemSeparatorComponent && <ItemSeparatorComponent />}
              </React.Fragment>
            );
          })
        )}

        {React.isValidElement(ListFooterComponent)
          ? ListFooterComponent
          : ListFooterComponent && <ListFooterComponent />}
      </div>
    </div>
  );
}

// KeyboardAvoidingView Component
export interface KeyboardAvoidingViewProps {
  style?: any;
  behavior?: 'padding' | 'height' | 'position';
  keyboardVerticalOffset?: number;
  children?: React.ReactNode;
}

export const KeyboardAvoidingView: React.FC<KeyboardAvoidingViewProps> = ({ style, children }) => {
  const normalized = normalizeStyle(style);
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        ...normalized,
      }}
    >
      {children}
    </div>
  );
};

// SafeAreaView Component
export interface SafeAreaViewProps {
  style?: any;
  children?: React.ReactNode;
}

export const SafeAreaView: React.FC<SafeAreaViewProps> = ({ style, children }) => {
  const normalized = normalizeStyle(style);
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)',
        ...normalized,
      }}
    >
      {children}
    </div>
  );
};

// ActivityIndicator Component
export interface ActivityIndicatorProps {
  size?: 'small' | 'large' | number;
  color?: string;
  style?: any;
}

export const ActivityIndicator: React.FC<ActivityIndicatorProps> = ({
  size = 'small',
  color = '#2563EB',
  style,
}) => {
  const dim = size === 'large' ? 32 : size === 'small' ? 20 : size;
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...normalizeStyle(style),
      }}
    >
      <svg
        style={{
          width: dim,
          height: dim,
          animation: 'rn-spin 0.8s linear infinite',
        }}
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="31.4"
          strokeDashoffset="10"
          style={{ opacity: 0.25 }}
        />
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="31.4"
          strokeDashoffset="22"
        />
      </svg>
      <style>{`
        @keyframes rn-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// RefreshControl Component
export interface RefreshControlProps {
  refreshing: boolean;
  onRefresh?: () => void;
  tintColor?: string;
  colors?: string[];
}

export const RefreshControl: React.FC<RefreshControlProps> = ({ refreshing }) => {
  if (!refreshing) return null;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
      }}
    >
      <ActivityIndicator size="small" />
    </div>
  );
};

// StatusBar
export const StatusBar = {
  setBarStyle: () => {},
  setBackgroundColor: () => {},
};

// Image Component
export interface ImageProps {
  source?: { uri?: string } | string | any;
  style?: any;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  alt?: string;
  testID?: string;
}

export const Image = forwardRef<HTMLImageElement, ImageProps>(
  ({ source, style, resizeMode = 'cover', alt = '', testID, ...props }, ref) => {
    const src = typeof source === 'string' ? source : source?.uri || '';
    const normalized = normalizeStyle(style);
    return (
      <img
        ref={ref}
        src={src}
        alt={alt}
        data-testid={testID}
        style={{
          boxSizing: 'border-box',
          objectFit: resizeMode as any,
          display: 'block',
          ...normalized,
        }}
        {...props}
      />
    );
  }
);
Image.displayName = 'Image';

// LinearGradient Component (Expo & React Native Linear Gradient standard)
export interface LinearGradientProps {
  colors: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  locations?: number[];
  style?: any;
  children?: React.ReactNode;
}

export const LinearGradient = forwardRef<HTMLDivElement, LinearGradientProps>(
  ({ colors = [], start = { x: 0, y: 0 }, end = { x: 1, y: 1 }, locations, style, children, ...props }, ref) => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    let angleDeg = Math.round((Math.atan2(dy, dx) * 180) / Math.PI + 90);
    if (angleDeg < 0) angleDeg += 360;

    const colorStops = colors
      .map((c, i) => {
        if (locations && locations[i] !== undefined) {
          return `${c} ${locations[i] * 100}%`;
        }
        return c;
      })
      .join(', ');

    const gradientBg = `linear-gradient(${angleDeg}deg, ${colorStops})`;
    const normalized = normalizeStyle(style);

    return (
      <div
        ref={ref}
        style={{
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          position: 'relative',
          backgroundImage: gradientBg,
          ...normalized,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
LinearGradient.displayName = 'LinearGradient';

// Modal Component
export interface ModalProps {
  visible?: boolean;
  transparent?: boolean;
  animationType?: 'none' | 'slide' | 'fade';
  onRequestClose?: () => void;
  children?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ visible = true, children }) => {
  if (!visible) return null;
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {children}
    </div>
  );
};

// Alert API
export const Alert = {
  alert: (title: string, message?: string, buttons?: { text?: string; onPress?: () => void; style?: string }[]) => {
    if (buttons && buttons.length > 1) {
      const confirmAction = buttons.find((b) => b.style === 'destructive' || b.text?.includes('حذف') || b.text?.includes('بله')) || buttons[buttons.length - 1];
      if (typeof window !== 'undefined' && window.confirm(`${title}\n${message || ''}`)) {
        confirmAction?.onPress?.();
      }
    } else {
      if (typeof window !== 'undefined') {
        window.alert(`${title}\n${message || ''}`);
      }
      buttons?.[0]?.onPress?.();
    }
  },
};

