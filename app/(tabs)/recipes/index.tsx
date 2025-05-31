import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, useColorScheme, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { useRecipeStore } from '@/stores/recipeStore';
import Header from '@/components/Header';
import RecipeCard from '@/components/RecipeCard';
import FloatingActionButton from '@/components/FloatingActionButton';
import { Plus, Filter, Search } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const categories = [
  { key: 'all', label: 'All' },
  { key: 'main', label: 'Mains' },
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'salad', label: 'Salads' },
  { key: 'snack', label: 'Snacks' },
  { key: 'sweet', label: 'Sweets' },
  { key: 'side', label: 'Sides' },
];

export default function RecipesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { recipes, getFavoriteRecipes } = useRecipeStore();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const scrollY = useSharedValue(0);

  const filteredRecipes = selectedCategory === 'all' 
    ? recipes 
    : selectedCategory === 'favorites'
      ? getFavoriteRecipes()
      : recipes.filter(recipe => recipe.category === selectedCategory);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const handleAddRecipe = () => {
    router.push('/recipes/create');
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.categoriesContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categories}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.key}
              style={[
                styles.categoryButton,
                selectedCategory === category.key && { backgroundColor: colors.primary },
                { borderColor: colors.primary }
              ]}
              onPress={() => setSelectedCategory(category.key)}
            >
              <Text
                style={[
                  styles.categoryText,
                  { color: selectedCategory === category.key ? '#FFFFFF' : colors.primary }
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === 'favorites' && { backgroundColor: colors.primary },
              { borderColor: colors.primary }
            ]}
            onPress={() => setSelectedCategory('favorites')}
          >
            <Text
              style={[
                styles.categoryText,
                { color: selectedCategory === 'favorites' ? '#FFFFFF' : colors.primary }
              ]}
            >
              Favorites
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      <View style={styles.separator} />
      
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {selectedCategory === 'favorites' ? 'My Favorite Recipes' : 
         selectedCategory === 'all' ? 'All Recipes' : 
         `${categories.find(c => c.key === selectedCategory)?.label} Recipes`}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header 
        title="My Recipes" 
        subtitle="Your personal collection"
        scrollY={scrollY}
        rightComponent={
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={[styles.iconButton, { backgroundColor: colors.card }]}
              onPress={() => router.push('/recipes/search')}
            >
              <Search size={20} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.iconButton, { backgroundColor: colors.card }]}
              onPress={() => {}}
            >
              <Filter size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        }
      />
      
      <AnimatedFlatList
        data={filteredRecipes}
        renderItem={({ item, index }) => (
          <RecipeCard recipe={item} index={index} />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.subtext }]}>
              {selectedCategory === 'all' 
                ? "You don't have any recipes yet." 
                : selectedCategory === 'favorites'
                  ? "You don't have any favorite recipes yet."
                  : `You don't have any ${selectedCategory} recipes yet.`}
            </Text>
          </View>
        }
      />
      
      <FloatingActionButton
        onPress={handleAddRecipe}
        icon={<Plus color="#FFFFFF\" size={24} />}
      />
    </View>
  );
}

import { ScrollView } from 'react-native-gesture-handler';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  headerContainer: {
    marginTop: 16,
    marginBottom: 24,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesScroll: {
    overflow: 'visible',
  },
  categories: {
    paddingRight: 16,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 100,
    marginRight: 8,
    borderWidth: 1,
  },
  categoryText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
  },
  separator: {
    height: 1,
    marginVertical: 16,
    opacity: 0.1,
    backgroundColor: '#000',
  },
  sectionTitle: {
    fontFamily: 'Playfair-Medium',
    fontSize: 20,
    marginBottom: 16,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
  },
});