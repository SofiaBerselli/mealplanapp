import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import Header from '@/components/Header';
import { User, Moon, Bell, Lock, CircleHelp as HelpCircle, LogOut, ChevronRight, Github } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function SettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [isDarkMode, setIsDarkMode] = React.useState(colorScheme === 'dark');
  const [notifications, setNotifications] = React.useState(true);

  const settingsSections = [
    {
      title: 'Preferences',
      items: [
        {
          icon: <Moon size={22} color={colors.text} />,
          title: 'Dark Mode',
          type: 'toggle',
          value: isDarkMode,
          onToggle: () => setIsDarkMode(!isDarkMode),
        },
        {
          icon: <Bell size={22} color={colors.text} />,
          title: 'Notifications',
          type: 'toggle',
          value: notifications,
          onToggle: () => setNotifications(!notifications),
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          icon: <User size={22} color={colors.text} />,
          title: 'Profile',
          type: 'link',
        },
        {
          icon: <Lock size={22} color={colors.text} />,
          title: 'Privacy',
          type: 'link',
        },
      ],
    },
    {
      title: 'Other',
      items: [
        {
          icon: <HelpCircle size={22} color={colors.text} />,
          title: 'Help & Support',
          type: 'link',
        },
        {
          icon: <Github size={22} color={colors.text} />,
          title: 'About',
          type: 'link',
        },
        {
          icon: <LogOut size={22} color={colors.error} />,
          title: 'Log Out',
          type: 'link',
          textColor: colors.error,
        },
      ],
    },
  ];

  const renderSettingsItem = (item, index) => {
    return (
      <Animated.View 
        key={item.title} 
        entering={FadeInDown.delay(100 + index * 50).duration(300)}
      >
        <TouchableOpacity 
          style={[styles.settingsItem, { borderBottomColor: colors.border }]}
          disabled={item.type === 'toggle'}
          onPress={() => {}}
        >
          <View style={styles.settingsItemLeft}>
            <View style={styles.iconContainer}>
              {item.icon}
            </View>
            <Text style={[
              styles.settingsItemText, 
              { color: item.textColor || colors.text }
            ]}>
              {item.title}
            </Text>
          </View>
          
          {item.type === 'toggle' ? (
            <Switch
              value={item.value}
              onValueChange={item.onToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={'#FFFFFF'}
            />
          ) : (
            <ChevronRight size={20} color={colors.subtext} />
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header 
        title="Settings" 
        subtitle="Customize your experience"
      />
      
      <ScrollView style={styles.scrollView}>
        <Animated.View 
          entering={FadeInDown.duration(400)}
          style={[styles.profileCard, { backgroundColor: colors.card }]}
        >
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>JD</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text }]}>
              Jane Doe
            </Text>
            <Text style={[styles.profileEmail, { color: colors.subtext }]}>
              jane.doe@example.com
            </Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Text style={[styles.editText, { color: colors.primary }]}>
              Edit
            </Text>
          </TouchableOpacity>
        </Animated.View>
        
        {settingsSections.map((section, sectionIndex) => (
          <View key={section.title} style={styles.section}>
            <Animated.Text 
              entering={FadeInDown.delay(50 + sectionIndex * 100).duration(300)}
              style={[styles.sectionTitle, { color: colors.subtext }]}
            >
              {section.title}
            </Animated.Text>
            <View style={[styles.sectionContent, { backgroundColor: colors.card }]}>
              {section.items.map((item, index) => renderSettingsItem(item, index))}
            </View>
          </View>
        ))}
        
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.subtext }]}>
            Recipe Meal Planner v1.0.0
          </Text>
        </View>
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
  profileCard: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 20,
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontFamily: 'DMSans-Bold',
    fontSize: 18,
    marginBottom: 4,
  },
  profileEmail: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
  },
  editButton: {
    padding: 8,
  },
  editText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    marginLeft: 16,
    marginBottom: 8,
  },
  sectionContent: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsItemText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    marginLeft: 12,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
  },
});