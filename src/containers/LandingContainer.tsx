import { Text } from "react-native";
import React from "react";
import { AppLayout } from "../components/layout/AppLayout";

export class LandingContainer extends React.Component {
  public render() {
    return (
      <AppLayout title="Rate">
        <Text>LandingContainer</Text>
      </AppLayout>
    );
  }
}
