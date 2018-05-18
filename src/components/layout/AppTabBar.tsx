import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Link } from "react-router-native";

const styles = StyleSheet.create({
  button: {
    flex: 1,
    height: "100%",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: { fontSize: 32 },
});

function AppTabBarLink(props: { to: string; icon: string }) {
  return (
    <Link
      to={props.to}
      activeOpacity={0.8}
      style={styles.button}
      component={TouchableOpacity}
    >
      <Text style={styles.buttonText}>{props.icon}</Text>
    </Link>
  );
}

export class AppTabBar extends React.Component {
  public render() {
    return (
      <View flexDirection="row" flex={1} height={64} maxHeight={64}>
        <AppTabBarLink to="/" icon="📑" />
        <AppTabBarLink to="/upload-photo" icon="📸" />
        <AppTabBarLink to="/profile" icon="👤" />
      </View>
    );
  }
}
