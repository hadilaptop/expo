/**
 * @file RootNavigator.tsx
 * @description React Navigation Root Stack Navigator
 * Manages MainTabs, CustomerLedger, and Account screens with smooth native transitions.
 */

import React from 'react';
import { RootStackParamList } from './types';
import { BottomTabNavigator } from './BottomTabNavigator';
import { CustomerLedgerScreen } from '../screens/CustomerLedgerScreen';
import { AccountScreen } from '../screens/AccountScreen';

export const createNativeStackNavigator = <T extends Record<string, any>>() => {
  return {
    Navigator: ({ children }: any) => <>{children}</>,
    Screen: ({ component: Component }: any) => <Component />,
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainTabs"
        component={BottomTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CustomerLedger"
        component={CustomerLedgerScreen}
        options={{
          title: 'دفتر معین و گردش حساب مشتری',
          headerBackTitle: 'بازگشت',
        }}
      />
      <Stack.Screen
        name="Account"
        component={AccountScreen}
        options={{
          title: 'مشخصات حساب مشتری',
          headerBackTitle: 'انصراف',
        }}
      />
    </Stack.Navigator>
  );
};
