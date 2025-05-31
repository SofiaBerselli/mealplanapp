import React from 'react';
import { StyleSheet, TouchableOpacity, View, useColorScheme } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  Easing
} from 'react-native-reanimated';
import { Plus } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

type FABProps = {
  onPress: () => void;
  icon?: React.ReactNode;
  position?: 'bottom-right' | 'bottom-center';
};

export default function FloatingActionButton({ 
  onPress, 
  icon, 
  position = 'bottom-right' 
}: FABProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    // Animate rotation for a fun effect
    rotation.value = withTiming(rotation.value + 180, {
      duration: 300,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
    
    onPress();
  };
  
  const onPressIn = () => {
    scale.value = withSpring(0.9);
  };
  
  const onPressOut = () => {
    scale.value = withSpring(1);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotate: `${rotation.value}deg` }
      ],
    };
  });

  const positionStyle = position === 'bottom-center' ? styles.bottomCenter : styles.bottomRight;

  return (
    <View style={[styles.container, positionStyle]}>
      <Animated.View style={[styles.fabContainer, animatedStyle]}>
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={handlePress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          activeOpacity={0.8}
        >
          {icon || <Plus color="white\" size={24} />}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 999,
  },
  bottomRight: {
    right: 20,
    bottom: 20,
  },
  bottomCenter: {
    alignSelf: 'center',
    bottom: 20,
  },
  fabContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 6,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});