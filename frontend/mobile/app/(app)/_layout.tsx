import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#081120" }
      }}
    >
      <Stack.Screen name="discovery" />
      <Stack.Screen name="reservations" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="booking/[id]" />
    </Stack>
  );
}
