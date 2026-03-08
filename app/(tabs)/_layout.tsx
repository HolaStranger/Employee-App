import { Colors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { router, Tabs } from "expo-router";
import {
  ClipboardList,
  LayoutDashboard,
  MessageCircle,
  User
} from "lucide-react-native";
import { useEffect } from "react";

export default function TabLayout() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    // 🔴 If logged out → EXIT tabs immediately
    if (!user) {
      router.replace("/welcome");
    }
  }, [user, isLoading]);

  // ⏳ Prevent flashing tabs while loading
  if (isLoading || !user) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.tabBarActive,
        tabBarInactiveTintColor: Colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: Colors.tabBar,
          borderTopColor: Colors.divider,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <LayoutDashboard size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          href: user?.role === 'manager' ? null : undefined,
          tabBarIcon: ({ color, size }) => (
            <MessageCircle size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="requests"
        options={{
          title: "Requests",
          tabBarIcon: ({ color, size }) => (
            <ClipboardList size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
