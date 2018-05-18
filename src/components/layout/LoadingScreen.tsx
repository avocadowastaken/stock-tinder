import { ActivityIndicator, View } from "react-native";
import React from "react";

export function LoadingScreen() {
  return (
    <View flex={1} alignItems="center" justifyContent="center">
      <ActivityIndicator />
    </View>
  );
}
