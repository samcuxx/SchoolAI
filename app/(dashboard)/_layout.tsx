import { Stack } from 'expo-router';

export default function DashboardLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Dashboard',
        }}
      />
      <Stack.Screen
        name="assignments/index"
        options={{
          title: 'Assignments',
        }}
      />
      <Stack.Screen
        name="assignments/new"
        options={{
          title: 'New Assignment',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="assignments/[id]"
        options={{
          title: 'Assignment Details',
        }}
      />
      <Stack.Screen
        name="assignments/[id]/generate"
        options={{
          title: 'Generate Content',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="assignments/[id]/edit"
        options={{
          title: 'Edit Assignment',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="profile/edit"
        options={{
          title: 'Edit Profile',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
} 