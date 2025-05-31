import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity,
  useColorScheme,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { router } from 'expo-router';
import { useRecipeStore } from '@/stores/recipeStore';
import Colors from '@/constants/Colors';
import { Category } from '@/types/recipe';
import PrimaryButton from '@/components/PrimaryButton';
import Header from '@/components/Header';
import { ArrowLeft, Plus, Minus, Image as ImageIcon, Clock, Users } from 'lucide-react-native';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';

export default function CreateRecipe() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { addRecipe } = useRecipeStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('main');
  const [servings, setServings] = useState(4);
  const [prepTime, setPrepTime] = useState(15);
  const [cookTime, setCookTime] = useState(30);
  const [ingredients, setIngredients] = useState([
    { id: '1', name: '', amount: '', unit: '' },
    { id: '2', name: '', amount: '', unit: '' },
  ]);
  const [instructions, setInstructions] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleAddIngredient = () => {
    setIngredients([
      ...ingredients, 
      { id: Date.now().toString(), name: '', amount: '', unit: '' }
    ]);
  };

  const handleRemoveIngredient = (id: string) => {
    if (ingredients.length <= 1) return;
    setIngredients(ingredients.filter(ing => ing.id !== id));
  };

  const updateIngredient = (id: string, field: string, value: string) => {
    setIngredients(
      ingredients.map(ing => 
        ing.id === id ? { ...ing, [field]: value } : ing
      )
    );
  };

  const handleSave = () => {
    // Basic validation
    if (!title.trim()) {
      alert('Please enter a recipe title');
      return;
    }

    if (ingredients.some(ing => !ing.name.trim())) {
      alert('Please fill in all ingredient names');
      return;
    }

    setIsSaving(true);

    // Create new recipe
    const newRecipe = {
      id: Date.now().toString(),
      title,
      description,
      ingredients: ingredients.filter(ing => ing.name.trim() !== ''),
      instructions,
      servings,
      prepTimeMinutes: prepTime,
      cookTimeMinutes: cookTime,
      category,
      favorite: false,
      dateCreated: new Date(),
      dateModified: new Date(),
    };

    // Add to store
    addRecipe(newRecipe);
    
    // Navigate back
    setTimeout(() => {
      setIsSaving(false);
      router.back();
    }, 600);
  };

  const handleCancel = () => {
    router.back();
  };

  const categories: { label: string; value: Category }[] = [
    { label: 'Main Dish', value: 'main' },
    { label: 'Breakfast', value: 'breakfast' },
    { label: 'Salad', value: 'salad' },
    { label: 'Snack', value: 'snack' },
    { label: 'Sweet', value: 'sweet' },
    { label: 'Side', value: 'side' },
    { label: 'Other', value: 'other' },
  ];

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <Header 
        title="Add New Recipe" 
        rightComponent={
          <TouchableOpacity onPress={handleCancel}>
            <Text style={[styles.cancelText, { color: colors.primary }]}>Cancel</Text>
          </TouchableOpacity>
        }
      />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <Animated.View entering={FadeInUp.delay(100).duration(400)}>
          <View style={[styles.imageSection, { backgroundColor: colors.card }]}>
            <ImageIcon size={36} color={colors.subtext} />
            <Text style={[styles.imageText, { color: colors.subtext }]}>
              Tap to add a photo
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(400)}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Recipe Name</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.text,
              }]}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Creamy Garlic Pasta"
              placeholderTextColor={colors.subtext}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(250).duration(400)}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Description</Text>
            <TextInput
              style={[styles.textArea, { 
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.text,
              }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Briefly describe your recipe..."
              placeholderTextColor={colors.subtext}
              multiline
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300).duration(400)}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Category</Text>
            <View style={styles.categoriesContainer}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  style={[
                    styles.categoryButton,
                    category === cat.value && { backgroundColor: colors.primary },
                    { borderColor: colors.primary }
                  ]}
                  onPress={() => setCategory(cat.value)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      { color: category === cat.value ? '#FFFFFF' : colors.primary }
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(350).duration(400)} style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={[styles.label, { color: colors.text }]}>
              <Clock size={14} color={colors.text} /> Prep Time (min)
            </Text>
            <View style={styles.numberInput}>
              <TouchableOpacity
                style={[styles.numberButton, { backgroundColor: colors.card }]}
                onPress={() => setPrepTime(Math.max(0, prepTime - 5))}
              >
                <Minus size={18} color={colors.text} />
              </TouchableOpacity>
              <TextInput
                style={[styles.numberValue, { 
                  backgroundColor: colors.card,
                  color: colors.text,
                }]}
                value={prepTime.toString()}
                onChangeText={(text) => setPrepTime(parseInt(text) || 0)}
                keyboardType="numeric"
              />
              <TouchableOpacity
                style={[styles.numberButton, { backgroundColor: colors.card }]}
                onPress={() => setPrepTime(prepTime + 5)}
              >
                <Plus size={18} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={[styles.label, { color: colors.text }]}>
              <Clock size={14} color={colors.text} /> Cook Time (min)
            </Text>
            <View style={styles.numberInput}>
              <TouchableOpacity
                style={[styles.numberButton, { backgroundColor: colors.card }]}
                onPress={() => setCookTime(Math.max(0, cookTime - 5))}
              >
                <Minus size={18} color={colors.text} />
              </TouchableOpacity>
              <TextInput
                style={[styles.numberValue, { 
                  backgroundColor: colors.card,
                  color: colors.text,
                }]}
                value={cookTime.toString()}
                onChangeText={(text) => setCookTime(parseInt(text) || 0)}
                keyboardType="numeric"
              />
              <TouchableOpacity
                style={[styles.numberButton, { backgroundColor: colors.card }]}
                onPress={() => setCookTime(cookTime + 5)}
              >
                <Plus size={18} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(400).duration(400)} style={styles.servingsContainer}>
          <Text style={[styles.label, { color: colors.text }]}>
            <Users size={14} color={colors.text} /> Servings
          </Text>
          <View style={styles.servingsControls}>
            <TouchableOpacity
              style={[styles.servingButton, { backgroundColor: colors.card }]}
              onPress={() => setServings(Math.max(1, servings - 1))}
            >
              <Minus size={18} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.servingValue, { color: colors.text }]}>{servings}</Text>
            <TouchableOpacity
              style={[styles.servingButton, { backgroundColor: colors.card }]}
              onPress={() => setServings(servings + 1)}
            >
              <Plus size={18} color={colors.text} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(450).duration(400)}>
          <View style={styles.inputGroup}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Ingredients</Text>
            
            {ingredients.map((ingredient, index) => (
              <View key={ingredient.id} style={styles.ingredientRow}>
                <View style={styles.amountUnit}>
                  <TextInput
                    style={[styles.ingredientAmount, { 
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      color: colors.text,
                    }]}
                    value={ingredient.amount}
                    onChangeText={(text) => updateIngredient(ingredient.id, 'amount', text)}
                    placeholder="Qty"
                    placeholderTextColor={colors.subtext}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[styles.ingredientUnit, { 
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      color: colors.text,
                    }]}
                    value={ingredient.unit}
                    onChangeText={(text) => updateIngredient(ingredient.id, 'unit', text)}
                    placeholder="Unit"
                    placeholderTextColor={colors.subtext}
                  />
                </View>
                <View style={styles.nameActionContainer}>
                  <TextInput
                    style={[styles.ingredientName, { 
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      color: colors.text,
                    }]}
                    value={ingredient.name}
                    onChangeText={(text) => updateIngredient(ingredient.id, 'name', text)}
                    placeholder="Ingredient name"
                    placeholderTextColor={colors.subtext}
                  />
                  <TouchableOpacity
                    style={[styles.removeButton, { opacity: ingredients.length > 1 ? 1 : 0.5 }]}
                    onPress={() => handleRemoveIngredient(ingredient.id)}
                    disabled={ingredients.length <= 1}
                  >
                    <Minus size={16} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            
            <TouchableOpacity
              style={[styles.addButton, { borderColor: colors.primary }]}
              onPress={handleAddIngredient}
            >
              <Plus size={18} color={colors.primary} />
              <Text style={[styles.addButtonText, { color: colors.primary }]}>
                Add Ingredient
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(500).duration(400)}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Instructions</Text>
            <TextInput
              style={[styles.textArea, { 
                height: 150,
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.text,
              }]}
              value={instructions}
              onChangeText={setInstructions}
              placeholder="Enter step-by-step instructions..."
              placeholderTextColor={colors.subtext}
              multiline
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(550).duration(400)} style={styles.buttons}>
          <PrimaryButton
            title="Save Recipe"
            onPress={handleSave}
            loading={isSaving}
            fullWidth
          />
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  imageSection: {
    height: 200,
    borderRadius: 16,
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageText: {
    marginTop: 8,
    fontFamily: 'DMSans-Medium',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontFamily: 'DMSans-Medium',
    fontSize: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: 'Playfair-Medium',
    fontSize: 20,
    marginBottom: 16,
  },
  input: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    textAlignVertical: 'top',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 100,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  categoryText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  numberInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    overflow: 'hidden',
  },
  numberButton: {
    width: 40,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberValue: {
    flex: 1,
    textAlign: 'center',
    height: 50,
    fontFamily: 'DMSans-Medium',
    fontSize: 16,
  },
  servingsContainer: {
    marginBottom: 24,
  },
  servingsControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  servingButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  servingValue: {
    fontFamily: 'DMSans-Medium',
    fontSize: 18,
    marginHorizontal: 16,
  },
  ingredientRow: {
    marginBottom: 12,
  },
  amountUnit: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  ingredientAmount: {
    width: '30%',
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    marginRight: 8,
    fontFamily: 'DMSans-Regular',
  },
  ingredientUnit: {
    width: '30%',
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    fontFamily: 'DMSans-Regular',
  },
  nameActionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ingredientName: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    fontFamily: 'DMSans-Regular',
  },
  removeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 8,
  },
  addButtonText: {
    fontFamily: 'DMSans-Medium',
    marginLeft: 8,
  },
  buttons: {
    marginTop: 16,
  },
  cancelText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 16,
  },
});