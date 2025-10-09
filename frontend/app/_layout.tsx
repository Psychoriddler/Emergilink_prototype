import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" backgroundColor="#dc2626" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#dc2626',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'EmergiLink',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ambulance"
          options={{
            title: 'Book Ambulance',
          }}
        />
        <Stack.Screen
          name="hospitals"
          options={{
            title: 'Nearby Hospitals',
          }}
        />
        <Stack.Screen
          name="alerts"
          options={{
            title: 'Disaster Alerts',
          }}
        />
        <Stack.Screen
          name="contacts"
          options={{
            title: 'Emergency Contacts',
          }}
        />
      </Stack>
    </>
  );
}