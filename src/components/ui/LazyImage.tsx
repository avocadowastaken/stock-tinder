import React from "react";
import { Image, ImageProps, StyleSheet, View } from "react-native";

import { PhotoDTO } from "../../dto/PhotoDTO";
import { isEqualChildren } from "../../helpers/DataUtils";
import { ImageCache } from "../../helpers/ImageCache";
import ImagePlaceholder from "./assets/loading-placeholder.png";

const styles = StyleSheet.create({
  root: { overflow: "hidden" },
});

interface Props {
  width: number;
  height: number;
  photo: PhotoDTO;
  borderRadius?: number;
  sourceHeight?: number;
  style?: ImageProps["style"];
  resizeMode?: ImageProps["resizeMode"];
}

interface State {
  src?: string;
  uri?: string;
}

function createState(props: Props): State {
  const src = props.photo.url;
  const uri = src && ImageCache.getCached(src);

  return { src, uri };
}

export class LazyImage extends React.PureComponent<Props, State> {
  public state: State;
  private subscriptions: Array<() => void> = [];

  public constructor(props: Props) {
    super(props);

    this.state = createState(props);
  }

  private unsubscribe() {
    let subscription;

    while ((subscription = this.subscriptions.shift())) {
      subscription();
    }
  }

  private download() {
    const { src } = this.state;

    this.unsubscribe();

    if (src) {
      this.subscriptions.push(
        ImageCache.onCacheComplete(src, uri => {
          this.setState(
            // Reset `src` if could not load it.
            uri ? { uri } : { uri: undefined, src: undefined },
          );
        }),
      );
    }
  }

  public componentDidMount() {
    this.download();
  }

  public componentWillReceiveProps(nextProps: Readonly<Props>): void {
    if (!isEqualChildren(this.props, nextProps, ["width", "height", "photo"])) {
      this.setState(createState(nextProps));
    }
  }

  public componentDidUpdate(
    _prevProps: Readonly<Props>,
    prevState: Readonly<State>,
  ): void {
    if (!isEqualChildren(this.state, prevState, ["src"])) {
      this.download();
    }
  }

  public componentWillUnmount() {
    this.unsubscribe();
  }

  public render() {
    const { uri } = this.state;
    const { style, height, width, borderRadius } = this.props;

    const imageStyle = { width, height, borderRadius };

    return (
      <View style={[style, styles.root, imageStyle]}>
        {uri ? (
          <Image
            source={{ uri }}
            fadeDuration={0}
            style={imageStyle}
            resizeMode="cover"
          />
        ) : (
          <Image
            fadeDuration={0}
            style={imageStyle}
            resizeMode="cover"
            source={ImagePlaceholder}
          />
        )}
      </View>
    );
  }
}
