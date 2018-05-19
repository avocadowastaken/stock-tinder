import { isEqual } from "lodash-es";
import React from "react";
import { Button, StyleSheet, TextInput, View } from "react-native";
import { DispatchProp, connect } from "react-redux";

import { AppHeader, AppHeaderLink } from "../components/layout/AppHeader";
import { LoadingScreen } from "../components/layout/LoadingScreen";
import { UserDTO } from "../dto/UserDTO";
import { updateMe } from "../reducers/UserReducer";
import { AppStoreState } from "../store/RootReducer";

const styles = StyleSheet.create({
  textInput: { minWidth: 100, borderWidth: 1 },
});

interface StateProps {
  me?: UserDTO;
}

const enhancer = connect((state: AppStoreState): StateProps => ({
  me: state.user.me,
}));

type Props = StateProps & DispatchProp;

interface State {
  username: string;
}

export const ProfileEditContainer = enhancer(
  class ProfileContainer extends React.Component<Props, State> {
    public state: State = { username: this.createUsername() };

    private createUsername({ me } = this.props): string {
      return (me && me.username) || "";
    }

    public componentWillReceiveProps(nextProps: Readonly<Props>): void {
      if (!isEqual(this.props.me, nextProps.me)) {
        this.setState({ username: this.createUsername(nextProps) });
      }
    }

    public render() {
      const { username } = this.state;
      const { me, dispatch } = this.props;

      return !me ? (
        <LoadingScreen />
      ) : (
        <View>
          <AppHeader
            title="Edit Profile"
            leftButton={<AppHeaderLink to="/" title="◀️" />}
          />

          <View>
            <TextInput
              autoFocus={true}
              value={username}
              style={styles.textInput}
              placeholder="Enter your username"
              onChangeText={x => this.setState({ username: x })}
            />

            <Button
              title="Save"
              onPress={() => {
                dispatch(updateMe(new UserDTO({ ...me, username })));
              }}
            />
          </View>
        </View>
      );
    }
  },
);
