import React from 'react';
import { 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  useColorScheme,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle
} from 'react-native';
import Colors from '@/constants/Colors';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming 
} from 'react-native-reanimated';

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
};

export default function PrimaryButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const scale = useSharedValue(1);

  const handlePress = () => {
    if (disabled || loading) return;
    
    // Add haptic feedback on non-web platforms
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    onPress();
  };
  
  const onPressIn = () => {
    if (disabled || loading) return;
    scale.value = withSpring(0.97, { damping: 10, stiffness: 200 });
  };
  
  const onPressOut = () => {
    if (disabled || loading) return;
    scale.value = withSpring(1, { damping: 10, stiffness: 200 });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const getBackgroundColor = () => {
    if (disabled) return colors.border;
    
    switch (variant) {
      case 'primary':
        return colors.primary;
      case 'secondary':
        return colors.secondary;
      case 'outline':
        return 'transparent';
      default:
        return colors.primary;
    }
  };

  const getBorderColor = () => {
    if (disabled) return colors.border;
    
    switch (variant) {
      case 'outline':
        return variant === 'primary' ? colors.primary : colors.secondary;
      default:
        return 'transparent';
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.subtext;
    
    switch (variant) {
      case 'primary':
      case 'secondary':
        return colors.background;
      case 'outline':
        return variant === 'primary' ? colors.primary : colors.secondary;
      default:
        return colors.background;
    }
  };

  const buttonSize = {
    paddingVertical: size === 'small' ? 8 : size === 'medium' ? 12 : 16,
    paddingHorizontal: size === 'small' ? 16 : size === 'medium' ? 20 : 24,
    borderRadius: 30, // Pill shape
  };

  const textSize = {
    fontSize: size === 'small' ? 14 : size === 'medium' ? 16 : 18,
  };

  return (
    <Animated.View 
      style={[
        animatedStyle,
        styles.container,
        fullWidth && styles.fullWidth,
        style
      ]}
    >
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[
          styles.button,
          buttonSize,
          { backgroundColor: getBackgroundColor() },
          variant === 'outline' && { borderColor: getBorderColor(), borderWidth: 2 },
          fullWidth && styles.fullWidth
        ]}
      >
        {loading ? (
          <ActivityIndicator 
            size="small" 
            color={variant === 'outline' ? 
              (variant === 'primary' ? colors.primary : colors.secondary) : 
              colors.background} 
          />
        ) : (
          <View style={styles.content}>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <Text 
              style={[
                styles.text, 
                textSize, 
                { color: getTextColor() },
                textStyle
              ]}
            >
              {title}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: 'DMSans-Bold',
    textAlign: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
});