import React from "react";
import { ActivityIndicator, View } from "react-native";

export function LoadingScreen() {
  return (
    <View flex={1} alignItems="center" justifyContent="center">
      <ActivityIndicator />
    </View>
  );
}
