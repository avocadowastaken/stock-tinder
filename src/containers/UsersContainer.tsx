import { toArray } from "lodash-es";
import React from "react";
import { FlatList, ListRenderItem, Text, View } from "react-native";
import { connectAdvanced } from "react-redux";
import { createSelector } from "reselect";

import { AppLayout } from "../components/layout/AppLayout";
import { UserDTO } from "../dto/UserDTO";
import { AppStoreState } from "../store/RootReducer";

interface StateProps {
  users: UserDTO[];
}

const enhancer = connectAdvanced<AppStoreState, StateProps, {}>(() =>
  createSelector<AppStoreState, {}, any, StateProps>(
    state => state.user.users,
    (users): StateProps => ({
      users: toArray(users).filter((x: UserDTO) => x.username),
    }),
  ),
);

type Props = StateProps;

export const UsersContainer = enhancer(
  class UsersContainer extends React.Component<Props> {
    private keyExtractor = (item: UserDTO) => item.id;

    private renderItem: ListRenderItem<UserDTO> = x => (
      <View>
        <Text>{x.item.username}</Text>
      </View>
    );

    public render() {
      return (
        <AppLayout title="Users">
          <FlatList
            data={this.props.users}
            renderItem={this.renderItem}
            keyExtractor={this.keyExtractor}
          />
        </AppLayout>
      );
    }
  },
);
