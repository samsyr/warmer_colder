// WEB IS A DEV / MANUAL-TESTING TARGET ONLY — not a production platform.
// See the "Running on web (dev/testing only)" section in README.md.
//
// expo-file-system's File/Paths API is not available on web, so there is no
// on-disk storage here: the Home location is kept in memory only and is lost
// on reload. Metro resolves THIS file for the web platform; native production
// uses homeLocation.js. Keep the exported surface identical to homeLocation.js.

let home = null;

export async function getHomeLocation() {
  return home;
}

export async function saveHomeLocation(latitude, longitude) {
  home = { latitude, longitude };
}
