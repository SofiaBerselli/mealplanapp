import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { useRecipeStore } from '@/stores/recipeStore';
import Colors from '@/constants/Colors';
import Header from '@/components/Header';
import PrimaryButton from '@/components/PrimaryButton';
import { Calendar, Plus, ArrowRight, RefreshCw } from 'lucide-react-native';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';

export default function MealPlanScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { getCurrentMealPlan, recipes, generateMealPlan } = useRecipeStore();
  
  const currentMealPlan = getCurrentMealPlan();
  const today = new Date();
  const startDate = currentMealPlan?.startDate || startOfWeek(today);
  const endDate = currentMealPlan?.endDate || endOfWeek(today);
  
  const weekDays = [];
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    weekDays.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const generateNewMealPlan = () => {
    generateMealPlan(startOfWeek(today), endOfWeek(today));
  };

  const getRecipeById = (id?: string) => {
    if (!id) return null;
    return recipes.find(r => r.id === id);
  };

  const findMealsForDay = (date: Date) => {
    if (!currentMealPlan) return [];
    
    return currentMealPlan.meals.filter(meal => {
      const mealDate = new Date(meal.date);
      return mealDate.getDate() === date.getDate() && 
             mealDate.getMonth() === date.getMonth() && 
             mealDate.getFullYear() === date.getFullYear();
    });
  };
  
  const findLeftoversForMeal = (mealId: string) => {
    if (!currentMealPlan) return null;
    return currentMealPlan.leftovers.find(leftover => 
      leftover.fromMealId === mealId || leftover.consumedInMealId === mealId);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header 
        title="Meal Plan" 
        subtitle={currentMealPlan ? `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}` : 'No active meal plan'}
        rightComponent={
          <TouchableOpacity 
            style={[styles.iconButton, { backgroundColor: colors.card }]}
            onPress={() => {}}
          >
            <Calendar size={20} color={colors.text} />
          </TouchableOpacity>
        }
      />
      
      <ScrollView style={styles.scrollView}>
        {!currentMealPlan ? (
          <Animated.View 
            entering={FadeInUp.duration(400)}
            style={styles.emptyState}
          >
            <Calendar size={60} color={colors.subtext} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No Meal Plan Yet
            </Text>
            <Text style={[styles.emptyDescription, { color: colors.subtext }]}>
              Create a meal plan to organize your week and generate shopping lists.
            </Text>
            <PrimaryButton
              title="Generate Meal Plan"
              onPress={generateNewMealPlan}
              icon={<Plus size={20} color="white" />}
              style={{ marginTop: 24 }}
            />
          </Animated.View>
        ) : (
          <>
            <View style={styles.weekContainer}>
              {weekDays.map((day, index) => (
                <Animated.View 
                  key={day.toISOString()}
                  entering={FadeInRight.delay(index * 50).duration(300)}
                  style={[
                    styles.dayColumn,
                    day.getDate() === today.getDate() && 
                    day.getMonth() === today.getMonth() && 
                    day.getFullYear() === today.getFullYear() && 
                    styles.todayColumn
                  ]}
                >
                  <View style={[
                    styles.dayHeader,
                    day.getDate() === today.getDate() && 
                    day.getMonth() === today.getMonth() && 
                    day.getFullYear() === today.getFullYear() && 
                    { backgroundColor: colors.primary }
                  ]}>
                    <Text style={[
                      styles.dayName,
                      { 
                        color: day.getDate() === today.getDate() && 
                               day.getMonth() === today.getMonth() && 
                               day.getFullYear() === today.getFullYear() 
                               ? '#FFFFFF' 
                               : colors.text 
                      }
                    ]}>
                      {format(day, 'E')}
                    </Text>
                    <Text style={[
                      styles.dayNumber,
                      { 
                        color: day.getDate() === today.getDate() && 
                               day.getMonth() === today.getMonth() && 
                               day.getFullYear() === today.getFullYear() 
                               ? '#FFFFFF' 
                               : colors.text 
                      }
                    ]}>
                      {format(day, 'd')}
                    </Text>
                  </View>
                  
                  <View style={styles.mealsContainer}>
                    {['breakfast', 'lunch', 'dinner'].map((mealType) => {
                      const meals = findMealsForDay(day).filter(m => m.type === mealType);
                      const meal = meals.length > 0 ? meals[0] : null;
                      const recipe = meal ? getRecipeById(meal.recipeId) : null;
                      const hasLeftovers = meal ? findLeftoversForMeal(meal.id) !== null : false;
                      
                      return (
                        <TouchableOpacity 
                          key={mealType}
                          style={[
                            styles.mealSlot, 
                            { backgroundColor: recipe ? colors.card : colors.border }
                          ]}
                          onPress={() => {}}
                          disabled={!recipe}
                        >
                          {recipe ? (
                            <View style={styles.mealContent}>
                              <Text style={[styles.mealType, { color: colors.primary }]}>
                                {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                              </Text>
                              <Text 
                                style={[styles.mealTitle, { color: colors.text }]}
                                numberOfLines={1}
                              >
                                {recipe.title}
                              </Text>
                              {hasLeftovers && (
                                <View style={[styles.leftoverTag, { backgroundColor: colors.accent1 }]}>
                                  <Text style={styles.leftoverText}>Leftover</Text>
                                </View>
                              )}
                            </View>
                          ) : (
                            <View style={styles.emptyMeal}>
                              <Text style={[styles.emptyMealText, { color: colors.subtext }]}>
                                {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                              </Text>
                              <Plus size={12} color={colors.subtext} />
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </Animated.View>
              ))}
            </View>
            
            <View style={styles.actionButtons}>
              <PrimaryButton
                title="Generate New Plan"
                onPress={generateNewMealPlan}
                icon={<RefreshCw size={18} color="white" />}
                style={{ marginBottom: 16 }}
                fullWidth
              />
              
              <PrimaryButton
                title="Create Grocery List"
                onPress={() => router.push('/groceries/create')}
                icon={<ArrowRight size={18} color="white" />}
                variant="secondary"
                fullWidth
              />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 60,
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
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekContainer: {
    flexDirection: 'row',
    marginHorizontal: 8,
  },
  dayColumn: {
    flex: 1,
    margin: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  todayColumn: {
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dayHeader: {
    paddingVertical: 10,
    alignItems: 'center',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  dayName: {
    fontFamily: 'DMSans-Medium',
    fontSize: 13,
  },
  dayNumber: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
  },
  mealsContainer: {
    paddingTop: 6,
  },
  mealSlot: {
    height: 70,
    margin: 4,
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  mealContent: {
    flex: 1,
    justifyContent: 'center',
  },
  mealType: {
    fontFamily: 'DMSans-Medium',
    fontSize: 10,
  },
  mealTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
    marginTop: 2,
  },
  leftoverTag: {
    position: 'absolute',
    top: 4,
    right: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  leftoverText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 8,
    color: '#FFFFFF',
  },
  emptyMeal: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyMealText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 10,
    marginRight: 4,
  },
  actionButtons: {
    padding: 16,
    marginTop: 16,
  },
});