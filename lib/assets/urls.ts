const UPLOAD_PREFIX = "/uploads/";
const MEDIA_PREFIX = "/media/";

export function normalizeAssetUrl(value: string | null | undefined) {
  if (!value) return null;

  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("data:")) {
    return value;
  }

  if (value.startsWith(MEDIA_PREFIX)) {
    return value;
  }

  if (value.startsWith(UPLOAD_PREFIX)) {
    return value.replace(UPLOAD_PREFIX, MEDIA_PREFIX);
  }

  return value.startsWith("/") ? value : `/${value}`;
}

export function getBucketFilePath(publicPath: string, bucket: string) {
  const prefixes = [`/uploads/${bucket}/`, `/media/${bucket}/`];

  for (const prefix of prefixes) {
    if (publicPath.startsWith(prefix)) {
      return publicPath.slice(prefix.length);
    }
  }

  return null;
}
