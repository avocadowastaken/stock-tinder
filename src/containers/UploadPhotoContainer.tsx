import {
  Alert,
  Button,
  Image,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React from "react";
import { ImagePicker, Permissions } from "expo";
import { LoadingScreen } from "../components/layout/LoadingScreen";
import { AppLayout } from "../components/layout/AppLayout";
import { DEVICE_WIDTH } from "../constants/PlatformConstants";
import { connect, DispatchProp } from "react-redux";
import { AppStoreState } from "../store/RootReducer";
import { resetUploadPhotoState, uploadPhoto } from "../reducers/PhotoReducer";

const styles = StyleSheet.create({
  textInput: {
    borderWidth: 1,
  },
});

interface StateProps {
  uploading: boolean;
  uploaded: boolean;
  uploadError?: Error;
}

const enhancer = connect((state: AppStoreState): StateProps => ({
  uploadError: state.photo.upload.error,
  uploaded: state.photo.upload.requested,
  uploading: state.photo.upload.requesting,
}));

type Props = StateProps & DispatchProp;

interface State {
  uri?: string;
  name: string;

  accessingCamera: boolean;
  hasCameraPermissions: boolean;
  cameraPermissionsRequesting: boolean;

  accessingCameraRoll: boolean;
  hasCameraRollPermissions: boolean;
  cameraRollPermissionsRequesting: boolean;
}

export const UploadPhotoContainer = enhancer(
  class UploadPhotoContainer extends React.Component<Props, State> {
    public state: State = {
      name: "",

      accessingCamera: false,
      hasCameraPermissions: false,
      cameraPermissionsRequesting: true,

      accessingCameraRoll: false,
      hasCameraRollPermissions: false,
      cameraRollPermissionsRequesting: true,
    };

    private resetUploadPhotoState() {
      this.props.dispatch(resetUploadPhotoState());
    }

    public componentDidMount(): void {
      Permissions.askAsync(Permissions.CAMERA).then(({ status }) => {
        this.setState({
          cameraPermissionsRequesting: false,
          hasCameraPermissions: status === "granted",
        });
      });

      Permissions.askAsync(Permissions.CAMERA_ROLL).then(({ status }) => {
        this.setState({
          cameraRollPermissionsRequesting: false,
          hasCameraRollPermissions: status === "granted",
        });
      });
    }

    public componentDidUpdate(prevProps: Readonly<Props>): void {
      if (this.props.uploaded && !this.props.uploading && prevProps.uploading) {
        const { uploadError } = this.props;

        if (uploadError) {
          Alert.alert("Upload Error", uploadError.message, [
            { text: "Ok", onPress: () => this.resetUploadPhotoState() },
          ]);
        } else {
          Alert.alert("Uploaded", "File successfully uploaded", [
            {
              text: "Ok",
              onPress: () => {
                this.resetUploadPhotoState();
                this.setState({ uri: undefined, name: "" });
              },
            },
          ]);
        }
      }
    }

    public componentWillUnmount(): void {
      this.resetUploadPhotoState();
    }

    public render() {
      const {
        uri,
        name,
        accessingCamera,
        hasCameraPermissions,
        cameraPermissionsRequesting,
        accessingCameraRoll,
        hasCameraRollPermissions,
        cameraRollPermissionsRequesting,
      } = this.state;

      return (
        <AppLayout title="Upload">
          {accessingCamera ||
          accessingCameraRoll ||
          cameraPermissionsRequesting ||
          cameraRollPermissionsRequesting ||
          this.props.uploading ? (
            <LoadingScreen />
          ) : !hasCameraPermissions ? (
            <Text>Please allow access to your camera</Text>
          ) : !hasCameraRollPermissions ? (
            <Text>Please allow access to your camera roll</Text>
          ) : (
            <View>
              <View flexDirection="row" justifyContent="center">
                <Button
                  title="Take Photo"
                  onPress={() => {
                    this.resetUploadPhotoState();
                    this.setState({ accessingCamera: true });

                    ImagePicker.launchCameraAsync({
                      quality: 1,
                    })
                      .then(x => {
                        this.setState({
                          accessingCamera: false,

                          name: "",
                          uri: x.cancelled ? undefined : x.uri,
                        });
                      })
                      .catch((error: Error) => {
                        this.setState({ accessingCamera: false });

                        Alert.alert("Error", error.message, [
                          { text: "Close" },
                        ]);
                      });
                  }}
                />

                <Button
                  title="Choose Photo"
                  onPress={() => {
                    this.resetUploadPhotoState();
                    this.setState({ accessingCameraRoll: true });

                    ImagePicker.launchImageLibraryAsync({
                      quality: 1,
                      mediaTypes: "Images",
                    })
                      .then(x => {
                        this.setState({
                          accessingCameraRoll: false,

                          name: "",
                          uri: x.cancelled ? undefined : x.uri,
                        });
                      })
                      .catch(() => {
                        this.setState({ accessingCameraRoll: false });
                      });
                  }}
                />
              </View>

              {uri && (
                <View justifyContent="center">
                  <TextInput
                    value={name}
                    autoFocus={true}
                    style={styles.textInput}
                    placeholder="Enter image name"
                    onChangeText={x => this.setState({ name: x })}
                  />

                  <Image source={{ uri, height: 300, width: DEVICE_WIDTH }} />

                  <Button
                    title="Upload"
                    onPress={() => {
                      if (!name) {
                        Alert.alert("Invalid file name");
                      } else {
                        this.props.dispatch(uploadPhoto(name, uri));
                      }
                    }}
                  />
                </View>
              )}
            </View>
          )}
        </AppLayout>
      );
    }
  },
);
