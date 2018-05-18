import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Link } from "react-router-native";

export class NotFoundContainer extends React.Component {
  public render() {
    return (
      <View>
        <View>
          <Text>Screen Not Found</Text>

          <Link to="/" activeOpacity={0.8} component={TouchableOpacity}>
            <Text>Go Home️</Text>
          </Link>
        </View>
      </View>
    );
  }
}
