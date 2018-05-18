import { Text } from "react-native";
import React from "react";
import { AppLayout } from "../components/layout/AppLayout";

export class ProfileContainer extends React.Component {
  public render() {
    return (
      <AppLayout title="Profile">
        <Text>ProfileContainer</Text>
      </AppLayout>
    );
  }
}
