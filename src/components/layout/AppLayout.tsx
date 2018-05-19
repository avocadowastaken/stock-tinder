import React, { ReactNode } from "react";
import { View } from "react-native";

import { AppHeader } from "./AppHeader";
import { AppTabBar } from "./AppTabBar";

interface Props {
  title: string;
  children: ReactNode;
}

export class AppLayout extends React.Component<Props> {
  public render() {
    return (
      <View flex={1}>
        <AppHeader title={this.props.title} />

        <View flex={1}>{this.props.children}</View>

        <AppTabBar />
      </View>
    );
  }
}
