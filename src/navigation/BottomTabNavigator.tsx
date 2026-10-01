/**
 * @file BottomTabNavigator.tsx
 * @description React Navigation Bottom Tab Navigator for Iranian Invoice App
 */

import React from 'react';
import { BottomTabParamList } from './types';
import { DashboardScreen } from '../screens/DashboardScreen';
import { CustomersScreen } from '../screens/CustomersScreen';
import { InvoiceScreen } from '../screens/InvoiceScreen';
import { PaymentScreen } from '../screens/PaymentScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

export const createBottomTabNavigator = <T extends Record<string, any>>() => {
  return {
    Navigator: ({ children }: any) => <>{children}</>,
    Screen: ({ component: Component }: any) => <Component />,
  };
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

export const BottomTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Customers" component={CustomersScreen} />
      <Tab.Screen name="Invoice" component={InvoiceScreen} />
      <Tab.Screen name="Payment" component={PaymentScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};
