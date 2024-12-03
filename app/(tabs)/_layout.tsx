import { Tabs } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen 
        name="MapView" 
        options={{ 
          title: "Map", 
          tabBarIcon: () => (
            <FontAwesome name="map-marker" size={24} color="black" />
          ), 
        }}  
      />
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: "Camera", 
          tabBarIcon: () => (
            <FontAwesome name="camera" size={24} color="black" />
          ), 
        }} 
      />
      <Tabs.Screen 
        name="Detail" 
        options={{ 
          title: "Photos", 
          tabBarIcon: () => (
            <FontAwesome name="photo" size={24} color="black" />
          ), 
        }} 
      />
    </Tabs>
  );
}