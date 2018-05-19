import React from "react";
import { connect } from "react-redux";
import { NativeRouter, Route, Switch } from "react-router-native";

import { UserDTO } from "../dto/UserDTO";
import { AppStoreState } from "../store/RootReducer";
import { LandingContainer } from "./LandingContainer";
import { NotFoundContainer } from "./NotFoundContainer";
import { ProfileEditContainer } from "./ProfileEditContainer";
import { UploadPhotoContainer } from "./UploadPhotoContainer";
import { UsersContainer } from "./UsersContainer";

interface Props {
  me?: UserDTO;
}

const enhancer = connect((state: AppStoreState): Props => ({
  me: state.user.me,
}));

export const RootContainer = enhancer(
  class RootContainer extends React.Component<Props> {
    public render() {
      const { me } = this.props;

      return (
        <NativeRouter>
          {!me || !me.username ? (
            <Route component={ProfileEditContainer} />
          ) : (
            <Switch>
              <Route path="/" exact={true} component={LandingContainer} />

              <Route
                exact={true}
                path="/upload-photo"
                component={UploadPhotoContainer}
              />

              <Route exact={true} path="/users" component={UsersContainer} />

              <Route
                exact={true}
                path="/profile-edit"
                component={ProfileEditContainer}
              />

              <Route component={NotFoundContainer} />
            </Switch>
          )}
        </NativeRouter>
      );
    }
  },
);
