import { mapValues, toArray } from "lodash-es";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  Text,
  View,
} from "react-native";
import { connectAdvanced } from "react-redux";
import { createSelector } from "reselect";

import { AppLayout } from "../components/layout/AppLayout";
import { LazyImage } from "../components/ui/LazyImage";
import { DEVICE_WIDTH } from "../constants/PlatformConstants";
import { PhotoDTO } from "../dto/PhotoDTO";
import { UserDTO } from "../dto/UserDTO";
import { Dict } from "../helpers/ReduxUtils";
import { AppStoreState } from "../store/RootReducer";

interface Props {
  photos: PhotoDTO[];
  authors: Dict<UserDTO>;
}

const enhancer = connectAdvanced(() =>
  createSelector<
    AppStoreState,
    {},
    Dict<UserDTO>,
    Dict<PhotoDTO>,
    Dict<string>,
    Props
  >(
    state => state.user.users,
    state => state.photo.photos,
    state => state.photo.photoAuthors,
    (users, photos, photoAuthors): Props => ({
      photos: toArray(photos).sort(
        (a, b) => Number(b.createdAt) - Number(a.createdAt),
      ),
      authors: mapValues(photoAuthors, x => users[x]),
    }),
  ),
);

export const LandingContainer = enhancer(
  class LandingContainer extends React.Component<Props> {
    private keyExtractor = (x: PhotoDTO) => x.id;
    private renderItem: ListRenderItem<PhotoDTO> = x => {
      const author = this.props.authors[x.item.id];

      return (
        <View>
          <LazyImage width={DEVICE_WIDTH} height={300} photo={x.item} />

          <Text>{x.item.name}</Text>

          {!author ? (
            <View>
              <ActivityIndicator />
            </View>
          ) : (
            <Text>By: {author.username}</Text>
          )}
        </View>
      );
    };

    public render() {
      return (
        <AppLayout title="Rate">
          <FlatList
            data={this.props.photos}
            keyExtractor={this.keyExtractor}
            renderItem={this.renderItem}
          />
        </AppLayout>
      );
    }
  },
);
