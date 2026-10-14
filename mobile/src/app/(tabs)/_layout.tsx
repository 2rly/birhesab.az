import { Tabs } from "expo-router";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/constants/theme";
import Svg, { Path, Rect } from "react-native-svg";

function HomeIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1V10.5z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CatalogIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={3} width={8} height={8} rx={2} stroke={color} strokeWidth={1.8} />
      <Rect x={13} y={3} width={8} height={8} rx={2} stroke={color} strokeWidth={1.8} />
      <Rect x={3} y={13} width={8} height={8} rx={2} stroke={color} strokeWidth={1.8} />
      <Rect x={13} y={13} width={8} height={8} rx={2} stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

function FavoritesIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 4a2 2 0 012-2h10a2 2 0 012 2v17l-7-4-7 4V4z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function SettingsIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M4 6h16M4 12h16M4 18h16" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path
        d="M8 6a2 2 0 100-4 2 2 0 000 4zM16 12a2 2 0 100-4 2 2 0 000 4zM10 18a2 2 0 100-4 2 2 0 000 4z"
        fill={color}
      />
    </Svg>
  );
}

export default function TabLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.n580,
        tabBarStyle: {
          backgroundColor: colors.n165,
          borderTopColor: colors.n280,
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingTop: 8,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Əsas",
          tabBarIcon: ({ color }) => <HomeIcon color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: "Kataloq",
          tabBarIcon: ({ color }) => <CatalogIcon color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Seçilmişlər",
          tabBarIcon: ({ color }) => <FavoritesIcon color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Ayarlar",
          tabBarIcon: ({ color }) => <SettingsIcon color={color as string} />,
        }}
      />
    </Tabs>
  );
}
