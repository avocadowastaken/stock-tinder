import React from "react";
import { connect } from "react-redux";
import { AppStoreState } from "../store/RootReducer";
import { UserDTO } from "../dto/UserDTO";
import { ProfileEditContainer } from "./ProfileEditContainer";
import { NativeRouter, Route, Switch } from "react-router-native";
import { NotFoundContainer } from "./NotFoundContainer";
import { LandingContainer } from "./LandingContainer";
import { UploadPhotoContainer } from "./UploadPhotoContainer";
import { ProfileContainer } from "./ProfileContainer";

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

              <Route
                exact={true}
                path="/profile"
                component={ProfileContainer}
              />

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
