import SHA1 from "crypto-js/sha1";
import { FileSystem } from "expo";

type LoadListener = (path?: string) => void;

const IMAGE_CACHE_VERSION = "0.1.0";
const BASE_DIR = `${FileSystem.cacheDirectory}ImageCache`;

export class ImageCache {
  private static imageCache = new Map<string, string>();
  private static listeners = new Map<string, Set<LoadListener>>();
  private static directoryPromise?: Promise<void>;

  private static notifyListeners(uri: string, path?: string) {
    const { listeners, imageCache } = ImageCache;
    const uriListeners = listeners.get(uri);

    if (path) {
      imageCache.set(uri, path);
    }

    if (uriListeners) {
      uriListeners.forEach(listener => {
        listener(path);
      });

      listeners.delete(uri);
    }
  }

  private static async makeDirectory(directory: string): Promise<void> {
    const { exists, isDirectory } = await FileSystem.getInfoAsync(directory);

    if (exists && !isDirectory) {
      await FileSystem.deleteAsync(directory);
    }

    if (!exists || !isDirectory) {
      await FileSystem.makeDirectoryAsync(directory);
    }
  }

  private static obtainDirectory(): Promise<void> {
    if (!ImageCache.directoryPromise) {
      ImageCache.directoryPromise = ImageCache.makeDirectory(BASE_DIR);
    }

    return ImageCache.directoryPromise;
  }

  private static async download(uri: string): Promise<void> {
    const hash = SHA1(uri);
    const fileUri = `${BASE_DIR}/${hash}_${IMAGE_CACHE_VERSION}.jpg`;

    await ImageCache.obtainDirectory();

    const { exists, isDirectory } = await FileSystem.getInfoAsync(fileUri);

    if (isDirectory) {
      await FileSystem.deleteAsync(fileUri);
    }

    if (!exists) {
      const tmpUri = `${fileUri}__tmp`;
      const response = await FileSystem.downloadAsync(uri, tmpUri);

      if (response.status === 200) {
        await FileSystem.moveAsync({ from: tmpUri, to: fileUri });
        await FileSystem.deleteAsync(tmpUri, { idempotent: true });
      } else {
        try {
          await FileSystem.deleteAsync(tmpUri, { idempotent: true });
        } catch {}

        throw new Error("Файл не найден");
      }
    }

    ImageCache.notifyListeners(uri, fileUri);
  }

  public static getCached(uri: string): string | undefined {
    return ImageCache.imageCache.get(uri);
  }

  public static onCacheComplete(
    uri: string,
    listener: LoadListener,
  ): () => void {
    const { imageCache, listeners } = ImageCache;
    const cachedPath = imageCache.get(uri);
    const existListeners = listeners.get(uri);

    if (cachedPath) {
      listener(cachedPath);
    } else if (existListeners) {
      existListeners.add(listener);
    } else {
      listeners.set(uri, new Set([listener]));

      ImageCache.download(uri).catch(() => {
        ImageCache.notifyListeners(uri);
      });
    }

    return () => {
      const uriListeners = listeners.get(uri);

      if (uriListeners) {
        uriListeners.delete(listener);
      }
    };
  }
}
