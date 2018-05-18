import { AppLoading } from "expo";
import * as firebase from "firebase";
import React from "react";
import { Provider } from "react-redux";

import { AppStore, configureStore } from "../store/AppStore";
import { RootContainer } from "./RootContainer";
import { initApp } from "../reducers/AppReducer";

interface State {
  store?: AppStore;
}

firebase.initializeApp({
  apiKey: "AIzaSyCmQrtTWUp3iLu-iU_IPiXNUFmDl7WYSeM",
  authDomain: "stock-tinder.firebaseapp.com",
  databaseURL: "https://stock-tinder.firebaseio.com",
  projectId: "stock-tinder",
  storageBucket: "stock-tinder.appspot.com",
  messagingSenderId: "168364217408",
});

export class AppContainer extends React.Component<{}, State> {
  public state: State = {};

  public componentDidMount(): void {
    const store = configureStore({
      storage: firebase.storage(),
      database: firebase.database(),
    });

    store.dispatch(initApp());

    requestAnimationFrame(() => {
      this.setState({ store });
    });
  }

  public render() {
    const { store } = this.state;

    if (!store) {
      return <AppLoading />;
    }

    return (
      <Provider store={store}>
        <RootContainer />
      </Provider>
    );
  }
}
