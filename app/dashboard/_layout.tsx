import { Stack } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import { Redirect } from "expo-router";
import LoadingScreen from "../../components/LoadingScreen";

export default function DashboardLayout() {
  const { session, loading } = useAuth();

  if (loading) {
    return <LoadingScreen message="Preparing dashboard..." />;
  }

  if (!session) {
    return <Redirect href="/auth/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#1a237e",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Dashboard",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="assignments/index"
        options={{
          title: "Assignments",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="assignments/new"
        options={{
          title: "New Assignment",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="assignments/[id]"
        options={{
          title: "Assignment Details",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="assignments/[id]/edit"
        options={{
          title: "Edit Assignment",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="assignments/[id]/generate"
        options={{
          title: "Generate Solution",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="profile/edit"
        options={{
          title: "Edit Profile",
          headerShown: true,
        }}
      />
    </Stack>
  );
}
