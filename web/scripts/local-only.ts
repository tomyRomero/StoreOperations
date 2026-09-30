const LOCAL_HOSTS = ["localhost", "127.0.0.1", "::1", "[::1]", "mongo", "s3"];

// Throws unless the URL points at a service on this machine. Used by scripts
// that delete data, so they can never run against a real database or bucket.
export function assertLocal(label: string, url: string | undefined) {
  if (!url) throw new Error(`${label} is not set. This script only runs against local services.`);
  const hostname = new URL(url.replace(/^mongodb(\+srv)?:/, "http:")).hostname;
  if (url.startsWith("mongodb+srv:") || !LOCAL_HOSTS.includes(hostname)) {
    throw new Error(`Refusing to run: ${label} points at "${hostname}", not a local service.`);
  }
}
