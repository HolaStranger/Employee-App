import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import React from "react";

import { AuthProvider } from "@/contexts/AuthContext";
import { RequestsProvider } from "@/contexts/RequestsContext"; // <- make sure this exists

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RequestsProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="welcome" />
            <Stack.Screen name="login" />
            <Stack.Screen name="signin" />
            <Stack.Screen name="signup" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </RequestsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
