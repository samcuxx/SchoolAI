import { Stack } from "expo-router";
import { PaperProvider, MD3LightTheme } from "react-native-paper";
import { AuthProvider } from "../contexts/AuthContext";

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#1a237e",
    secondary: "#4c669f",
    tertiary: "#192f6a",
    background: "#f5f5f5",
    surface: "rgba(255, 255, 255, 0.95)",
    surfaceVariant: "#f8f9fa",
    error: "#B00020",
    onPrimary: "#ffffff",
    onSecondary: "#ffffff",
    onBackground: "#000000",
    onSurface: "#000000",
    onSurfaceVariant: "#666666",
    outline: "#1a237e",
  },
  roundness: 10,
};

export default function Layout() {
  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </AuthProvider>
    </PaperProvider>
  );
}
