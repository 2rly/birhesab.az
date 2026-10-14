import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider, useTheme } from "@/constants/theme";
import { FavoritesProvider } from "@/constants/favorites";

function RootStack() {
  const { theme, colors } = useTheme();
  return (
    <>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.n165 },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="calculator/[slug]" />
        <Stack.Screen name="category/[id]" />
        <Stack.Screen
          name="search"
          options={{ animation: "fade", presentation: "transparentModal" }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <FavoritesProvider>
        <RootStack />
      </FavoritesProvider>
    </ThemeProvider>
  );
}
