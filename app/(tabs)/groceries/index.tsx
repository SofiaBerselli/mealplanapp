import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { useRecipeStore } from '@/stores/recipeStore';
import Colors from '@/constants/Colors';
import Header from '@/components/Header';
import PrimaryButton from '@/components/PrimaryButton';
import { ShoppingCart, CircleCheck as CheckCircle, Circle, ChevronRight, Plus } from 'lucide-react-native';
import Animated, { FadeInUp, SlideInLeft, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useEffect } from 'react';

export default function GroceryListsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { groceryLists, getMealPlanById, toggleGroceryItem } = useRecipeStore();

  const createGroceryList = () => {
    router.push('/groceries/create');
  };

  if (groceryLists.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header 
          title="Grocery Lists" 
          subtitle="Your shopping lists"
        />
        
        <Animated.View 
          entering={FadeInUp.duration(400)}
          style={styles.emptyState}
        >
          <ShoppingCart size={60} color={colors.subtext} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No Grocery Lists
          </Text>
          <Text style={[styles.emptyDescription, { color: colors.subtext }]}>
            Create grocery lists based on your meal plans to make shopping easier.
          </Text>
          <PrimaryButton
            title="Create Grocery List"
            onPress={createGroceryList}
            icon={<Plus size={20} color="white" />}
            style={{ marginTop: 24 }}
          />
        </Animated.View>
      </View>
    );
  }

  const renderGroceryList = ({ item, index }) => {
    const mealPlan = getMealPlanById(item.mealPlanId);
    const completedItems = item.items.filter(i => i.checked).length;
    const progress = completedItems / item.items.length;
    
    return (
      <Animated.View entering={SlideInLeft.delay(index * 100).springify()}>
        <TouchableOpacity
          style={[styles.listCard, { backgroundColor: colors.card }]}
          onPress={() => router.push(`/groceries/${item.id}`)}
        >
          <View style={styles.listHeader}>
            <Text style={[styles.listTitle, { color: colors.text }]}>
              {item.title}
            </Text>
            <ChevronRight size={20} color={colors.subtext} />
          </View>
          
          <View style={styles.listDetails}>
            <Text style={[styles.listDate, { color: colors.subtext }]}>
              Created: {item.dateCreated.toLocaleDateString()}
            </Text>
            
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      backgroundColor: colors.success,
                      width: `${progress * 100}%` 
                    }
                  ]}
                />
              </View>
              <Text style={[styles.progressText, { color: colors.subtext }]}>
                {completedItems} / {item.items.length} items
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header 
        title="Grocery Lists" 
        subtitle="Your shopping lists"
      />
      
      <FlatList
        data={groceryLists}
        renderItem={renderGroceryList}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
      
      <View style={styles.fabContainer}>
        <PrimaryButton
          title="Create New List"
          onPress={createGroceryList}
          icon={<Plus size={20} color="white" />}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontFamily: 'Playfair-Bold',
    fontSize: 24,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  listCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 18,
  },
  listDetails: {
    marginTop: 12,
  },
  listDate: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    marginBottom: 8,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  progressText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
});