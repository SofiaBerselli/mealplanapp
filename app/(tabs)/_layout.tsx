import React from 'react';
import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';
import { useFonts } from 'expo-font';
import { 
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold
} from '@expo-google-fonts/dm-sans';
import {
  PlayfairDisplay_500Medium,
  PlayfairDisplay_700Bold
} from '@expo-google-fonts/playfair-display';
import { SplashScreen } from 'expo-router';
import { Twitch as Kitchen, Calendar, ShoppingCart, Settings } from 'lucide-react-native';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [fontsLoaded, fontError] = useFonts({
    'DMSans-Regular': DMSans_400Regular,
    'DMSans-Medium': DMSans_500Medium,
    'DMSans-Bold': DMSans_700Bold,
    'Playfair-Medium': PlayfairDisplay_500Medium,
    'Playfair-Bold': PlayfairDisplay_700Bold,
  });

  React.useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          height: 60,
          paddingBottom: 10,
          paddingTop: 8,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: {
          fontFamily: 'DMSans-Medium',
          fontSize: 12,
          marginTop: 2,
        },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="recipes/index"
        options={{
          title: 'Recipes',
          tabBarIcon: ({ color, size }) => <Kitchen size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="mealplan/index"
        options={{
          title: 'Meal Plan',
          tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="groceries/index"
        options={{
          title: 'Groceries',
          tabBarIcon: ({ color, size }) => <ShoppingCart size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings/index"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}