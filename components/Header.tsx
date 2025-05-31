import React from 'react';
import { View, Text, StyleSheet, StatusBar, useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  interpolateColor,
  Extrapolate,
  interpolate,
  useAnimatedScrollHandler
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type HeaderProps = {
  title: string;
  subtitle?: string;
  rightComponent?: React.ReactNode;
  scrollY?: Animated.SharedValue<number>;
  transparentBackground?: boolean;
};

export default function Header({
  title,
  subtitle,
  rightComponent,
  scrollY,
  transparentBackground = false,
}: HeaderProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  
  // Create animated styles based on scroll position
  const headerAnimatedStyle = useAnimatedStyle(() => {
    if (!scrollY) return {};
    
    const backgroundColor = interpolateColor(
      scrollY.value,
      [0, 80],
      [transparentBackground ? 'transparent' : colors.background, colors.background]
    );

    const shadowOpacity = interpolate(
      scrollY.value,
      [0, 80],
      [0, 0.1],
      Extrapolate.CLAMP
    );

    return {
      backgroundColor,
      shadowOpacity,
      elevation: shadowOpacity * 5,
    };
  });

  const titleAnimatedStyle = useAnimatedStyle(() => {
    if (!scrollY) return {};
    
    const opacity = interpolate(
      scrollY.value,
      [0, 40, 80],
      [transparentBackground ? 0 : 1, transparentBackground ? 0.5 : 1, 1],
      Extrapolate.CLAMP
    );

    const scale = interpolate(
      scrollY.value,
      [0, 80],
      [1, 0.9],
      Extrapolate.CLAMP
    );

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  return (
    <Animated.View style={[
      styles.container, 
      headerAnimatedStyle,
      { paddingTop: insets.top + 8 }
    ]}>
      <Animated.View style={[styles.titleContainer, titleAnimatedStyle]}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: colors.subtext }]}>
            {subtitle}
          </Text>
        )}
      </Animated.View>
      {rightComponent && (
        <View style={styles.rightComponent}>
          {rightComponent}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    zIndex: 10,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontFamily: 'Playfair-Bold',
    fontSize: 24,
  },
  subtitle: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    marginTop: 4,
  },
  rightComponent: {
    marginLeft: 16,
  },
});