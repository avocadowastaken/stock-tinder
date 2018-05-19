import React, { ReactNode, isValidElement } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Link } from "react-router-native";

import { STATUS_BAR_HEIGHT } from "../../constants/PlatformConstants";

const styles = StyleSheet.create({
  button: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});

interface Props {
  leftButton?: ReactNode;
  onLeftButtonPress?: () => void;

  title: ReactNode;
  rightButton?: ReactNode;
}

export function AppHeaderLink(props: { to: string; title: string }) {
  return (
    <Link
      to={props.to}
      activeOpacity={0.8}
      style={styles.button}
      component={TouchableOpacity}
    >
      <Text>{props.title}️</Text>
    </Link>
  );
}

export class AppHeader extends React.Component<Props> {
  public render() {
    const { leftButton, rightButton, title } = this.props;

    return (
      <View height={64} flexDirection="row" marginTop={STATUS_BAR_HEIGHT}>
        <View
          flex={1}
          width={52}
          maxWidth={52}
          alignItems="center"
          justifyContent="center"
        >
          {isValidElement(leftButton)
            ? leftButton
            : Boolean(leftButton) && <Text>{leftButton}</Text>}
        </View>

        <View flex={1} alignItems="center" justifyContent="center">
          {isValidElement(title) ? title : <Text>{title}</Text>}
        </View>

        <View
          flex={1}
          width={64}
          maxWidth={64}
          alignItems="center"
          justifyContent="center"
        >
          {isValidElement(rightButton)
            ? rightButton
            : Boolean(rightButton) && <Text>{rightButton}</Text>}
        </View>
      </View>
    );
  }
}
