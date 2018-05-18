import { View } from "react-native";
import React, { ReactNode } from "react";
import { AppTabBar } from "./AppTabBar";
import { AppHeader } from "./AppHeader";

interface Props {
  title: string;
  children: ReactNode;
}

export class AppLayout extends React.Component<Props> {
  public render() {
    return (
      <View flex={1}>
        <AppHeader title={this.props.title} />

        <View flexGrow={1}>{this.props.children}</View>

        <AppTabBar />
      </View>
    );
  }
}
