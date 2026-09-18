import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../stores/themeStore';
import { useSavedStore } from '../../stores/savedStore';
import { useTrackerStore } from '../../stores/trackerStore';

export default function TabLayout() {
  const { colors } = useThemeStore();
  const { savedList } = useSavedStore();
  const { trackedList } = useTrackerStore();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size || 22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass-outline" size={size || 22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved',
          tabBarBadge: savedList.length > 0 ? savedList.length : undefined,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bookmark-outline" size={size || 22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="applications"
        options={{
          title: 'Tracker',
          tabBarBadge: trackedList.length > 0 ? trackedList.length : undefined,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="briefcase-outline" size={size || 22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size || 22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
