import "reflect-metadata";
import { AppContainer } from "./src/containers/AppContainer";

if (__DEV__) {
  // eslint-disable-next-line global-require
  require("react-native").YellowBox.ignoreWarnings([]);
}

export default AppContainer;
