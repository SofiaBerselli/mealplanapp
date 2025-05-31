import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Recipe } from '@/types/recipe';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';
import { Clock, Users } from 'lucide-react-native';
import Animated, { FadeInRight, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

type RecipeCardProps = {
  recipe: Recipe;
  index?: number;
};

const screenWidth = Dimensions.get('window').width;
const cardWidth = screenWidth > 500 ? 230 : screenWidth * 0.8;

export default function RecipeCard({ recipe, index = 0 }: RecipeCardProps) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const onPressIn = () => {
    scale.value = withSpring(0.97);
  };

  const onPressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    router.push(`/recipes/${recipe.id}`);
  };

  const getPlaceholderImage = () => {
    const placeholders = [
      'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg',
      'https://images.pexels.com/photos/1640771/pexels-photo-1640771.jpeg',
      'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg'
    ];
    return placeholders[index % placeholders.length];
  };

  const getTotalTime = () => {
    const total = recipe.prepTimeMinutes + recipe.cookTimeMinutes;
    if (total < 60) {
      return `${total} min`;
    }
    const hours = Math.floor(total / 60);
    const minutes = total % 60;
    return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;
  };

  return (
    <Animated.View 
      entering={FadeInRight.delay(index * 100).springify()}
      style={[styles.container, animatedStyle, { backgroundColor: colors.card }]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={styles.touchable}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: recipe.imageUrl || getPlaceholderImage() }}
            style={styles.image}
          />
          <View style={[styles.categoryTag, { backgroundColor: colors.primary }]}>
            <Text style={[styles.categoryText, { color: colors.background }]}>
              {recipe.category.charAt(0).toUpperCase() + recipe.category.slice(1)}
            </Text>
          </View>
        </View>
        <View style={styles.contentContainer}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {recipe.title}
          </Text>
          <Text style={[styles.description, { color: colors.subtext }]} numberOfLines={2}>
            {recipe.description}
          </Text>
          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Clock size={14} color={colors.subtext} />
              <Text style={[styles.metaText, { color: colors.subtext }]}>
                {getTotalTime()}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Users size={14} color={colors.subtext} />
              <Text style={[styles.metaText, { color: colors.subtext }]}>
                {recipe.servings} {recipe.servings === 1 ? 'serving' : 'servings'}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    borderRadius: 16,
    marginRight: 16,
    marginVertical: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  touchable: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    height: 150,
    width: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  categoryTag: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'DMSans-Bold',
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    fontFamily: 'DMSans-Bold',
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
    fontFamily: 'DMSans-Regular',
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    marginLeft: 4,
    fontFamily: 'DMSans-Regular',
  },
});