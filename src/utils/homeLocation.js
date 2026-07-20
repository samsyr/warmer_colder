import { File, Paths } from 'expo-file-system';

const file = new File(Paths.document, 'home_location.json');

export async function getHomeLocation() {
  try {
    if (!file.exists) return null;
    return JSON.parse(await file.text());
  } catch {
    return null;
  }
}

export async function saveHomeLocation(latitude, longitude) {
  file.write(JSON.stringify({ latitude, longitude }));
}
