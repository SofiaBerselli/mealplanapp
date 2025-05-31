import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  useColorScheme,
  Pressable,
  Dimensions
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useRecipeStore } from '@/stores/recipeStore';
import Colors from '@/constants/Colors';
import { ArrowLeft, Heart, Clock, Users, CreditCard as Edit2, Trash2, Plus } from 'lucide-react-native';
import PrimaryButton from '@/components/PrimaryButton';
import Animated, { 
  useSharedValue, 
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  withTiming,
  withSpring,
  FadeIn,
  FadeInDown
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const HEADER_HEIGHT = 300;

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { getRecipeById, toggleFavorite, deleteRecipe } = useRecipeStore();
  
  const recipe = getRecipeById(id as string);
  const scrollY = useSharedValue(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const deleteScale = useSharedValue(0);

  if (!recipe) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Recipe not found</Text>
        <PrimaryButton title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const imageAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollY.value,
      [-100, 0],
      [1.5, 1],
      Extrapolate.CLAMP
    );
    
    const translateY = interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT],
      [0, HEADER_HEIGHT / 2],
      Extrapolate.CLAMP
    );
    
    const opacity = interpolate(
      scrollY.value,
      [HEADER_HEIGHT * 0.6, HEADER_HEIGHT],
      [1, 0],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }, { translateY }],
      opacity,
    };
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [HEADER_HEIGHT - 100, HEADER_HEIGHT - 50],
      [0, 1],
      Extrapolate.CLAMP
    );

    return {
      opacity,
    };
  });

  const handleToggleFavorite = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    toggleFavorite(recipe.id);
  };
  
  const handleEditRecipe = () => {
    router.push(`/recipes/edit/${recipe.id}`);
  };

  const confirmDeleteAnimation = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    setShowDeleteConfirm(true);
    deleteScale.value = withSpring(1);
  };

  const cancelDelete = () => {
    deleteScale.value = withTiming(0, { duration: 200 }, () => {
      setShowDeleteConfirm(false);
    });
  };

  const handleDeleteRecipe = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    deleteRecipe(recipe.id);
    router.back();
  };

  const deleteConfirmStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: deleteScale.value }],
      opacity: deleteScale.value,
    };
  });

  const getPlaceholderImage = () => {
    return 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg';
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header Image */}
      <Animated.View style={[styles.headerImageContainer, imageAnimatedStyle]}>
        <Image
          source={{ uri: recipe.imageUrl || getPlaceholderImage() }}
          style={styles.headerImage}
        />
      </Animated.View>
      
      {/* Header Bar */}
      <Animated.View style={[
        styles.headerBar,
        headerAnimatedStyle,
        { backgroundColor: colors.background }
      ]}>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {recipe.title}
        </Text>
      </Animated.View>
      
      {/* Back Button */}
      <TouchableOpacity
        style={[styles.backButton, { backgroundColor: colors.background }]}
        onPress={() => router.back()}
      >
        <ArrowLeft size={20} color={colors.text} />
      </TouchableOpacity>
      
      <Animated.ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {/* Recipe Header Section */}
        <View style={{ marginTop: HEADER_HEIGHT - 50 }}>
          <Animated.View 
            entering={FadeIn.delay(100).duration(400)}
            style={styles.titleSection}
          >
            <Text style={[styles.recipeTitle, { color: colors.text }]}>
              {recipe.title}
            </Text>
            <TouchableOpacity onPress={handleToggleFavorite}>
              <Heart
                size={24}
                color={recipe.favorite ? colors.error : colors.subtext}
                fill={recipe.favorite ? colors.error : 'none'}
              />
            </TouchableOpacity>
          </Animated.View>
          
          <Animated.Text 
            entering={FadeIn.delay(150).duration(400)}
            style={[styles.description, { color: colors.subtext }]}
          >
            {recipe.description}
          </Animated.Text>
          
          <Animated.View 
            entering={FadeIn.delay(200).duration(400)}
            style={styles.metaSection}
          >
            <View style={styles.metaItem}>
              <Clock size={16} color={colors.primary} />
              <Text style={[styles.metaText, { color: colors.text }]}>
                {recipe.prepTimeMinutes + recipe.cookTimeMinutes} min
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Users size={16} color={colors.primary} />
              <Text style={[styles.metaText, { color: colors.text }]}>
                {recipe.servings} servings
              </Text>
            </View>
            <View style={[
              styles.categoryTag, 
              { backgroundColor: colors.primaryLight }
            ]}>
              <Text style={[styles.categoryTagText, { color: colors.background }]}>
                {recipe.category.charAt(0).toUpperCase() + recipe.category.slice(1)}
              </Text>
            </View>
          </Animated.View>
        </View>
        
        <View style={styles.divider} />
        
        {/* Ingredients Section */}
        <Animated.View entering={FadeInDown.delay(250).duration(400)}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Ingredients
          </Text>
          <View style={styles.ingredientsContainer}>
            {recipe.ingredients.map((ingredient, index) => (
              <View key={ingredient.id || index} style={styles.ingredientRow}>
                <View style={[
                  styles.ingredientBullet, 
                  { backgroundColor: colors.primary }
                ]} />
                <Text style={[styles.ingredientText, { color: colors.text }]}>
                  {ingredient.amount} {ingredient.unit} {ingredient.name}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>
        
        <View style={styles.divider} />
        
        {/* Instructions Section */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Instructions
          </Text>
          <Text style={[styles.instructions, { color: colors.text }]}>
            {recipe.instructions}
          </Text>
        </Animated.View>
        
        {/* Actions Section */}
        <Animated.View 
          entering={FadeInDown.delay(350).duration(400)}
          style={styles.actionsContainer}
        >
          <PrimaryButton
            title="Add to Meal Plan"
            onPress={() => {}}
            icon={<Plus size={20} color="white" />}
            style={{ marginBottom: 16 }}
            fullWidth
          />
          
          <View style={styles.editDeleteContainer}>
            <TouchableOpacity
              style={[
                styles.actionButton, 
                styles.editButton,
                { borderColor: colors.secondary }
              ]}
              onPress={handleEditRecipe}
            >
              <Edit2 size={20} color={colors.secondary} />
              <Text style={[styles.actionText, { color: colors.secondary }]}>
                Edit
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.actionButton, 
                styles.deleteButton,
                { borderColor: colors.error }
              ]}
              onPress={confirmDeleteAnimation}
            >
              <Trash2 size={20} color={colors.error} />
              <Text style={[styles.actionText, { color: colors.error }]}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.ScrollView>
      
      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <Pressable 
          style={styles.overlay}
          onPress={cancelDelete}
        >
          <Animated.View 
            style={[
              styles.deleteConfirm, 
              deleteConfirmStyle, 
              { backgroundColor: colors.background }
            ]}
          >
            <Text style={[styles.deleteTitle, { color: colors.text }]}>
              Delete Recipe?
            </Text>
            <Text style={[styles.deleteMessage, { color: colors.subtext }]}>
              This action cannot be undone. Are you sure you want to delete this recipe?
            </Text>
            <View style={styles.deleteActions}>
              <TouchableOpacity
                style={[styles.deleteAction, styles.cancelButton]}
                onPress={cancelDelete}
              >
                <Text style={[styles.deleteActionText, { color: colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.deleteAction, 
                  styles.confirmButton,
                  { backgroundColor: colors.error }
                ]}
                onPress={handleDeleteRecipe}
              >
                <Text style={[styles.deleteActionText, { color: colors.background }]}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Pressable>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 100,
  },
  headerImageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    zIndex: 1,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 90,
    paddingTop: 40,
    paddingHorizontal: 60,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  headerTitle: {
    fontFamily: 'Playfair-Bold',
    fontSize: 18,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  recipeTitle: {
    fontFamily: 'Playfair-Bold',
    fontSize: 26,
    flex: 1,
    marginRight: 16,
  },
  description: {
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
    paddingHorizontal: 20,
  },
  metaSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    marginLeft: 4,
  },
  categoryTag: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 100,
  },
  categoryTagText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginVertical: 24,
    marginHorizontal: 20,
  },
  sectionTitle: {
    fontFamily: 'Playfair-Bold',
    fontSize: 22,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  ingredientsContainer: {
    paddingHorizontal: 20,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ingredientBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  ingredientText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  instructions: {
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  editDeleteContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    width: '48%',
  },
  actionText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 16,
    marginLeft: 8,
  },
  editButton: {},
  deleteButton: {},
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  deleteConfirm: {
    width: screenWidth - 64,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 5,
  },
  deleteTitle: {
    fontFamily: 'Playfair-Bold',
    fontSize: 22,
    marginBottom: 12,
    textAlign: 'center',
  },
  deleteMessage: {
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  deleteActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  deleteAction: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 100,
    width: '48%',
    alignItems: 'center',
  },
  deleteActionText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  confirmButton: {},
});