import { Dimensions, Platform } from "react-native";

const { height, width } = Dimensions.get("window");

//
// Platform
//

export const PLATFORM_OS = Platform.OS;
export const PLATFORM_VERSION = Platform.Version;

export const IS_IOS = PLATFORM_OS === "ios";
export const IS_IPHONE_X = IS_IOS && height === 812 && width === 375;

//
// Dimensions
//

export const DEVICE_HEIGHT = height;
export const DEVICE_WIDTH = width;

export const STATUS_BAR_HEIGHT = IS_IPHONE_X ? 40 : IS_IOS ? 20 : 25;
export const FOOTER_OFFSET = IS_IPHONE_X ? 34 : 0;
