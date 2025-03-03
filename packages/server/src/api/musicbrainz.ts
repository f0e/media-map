import { MusicBrainzApi } from "musicbrainz-api";
import {
  MUSICBRAINZ_APP_NAME,
  MUSICBRAINZ_CONTACT,
  MUSICBRAINZ_VERSION,
} from "../config";

const mbApi = new MusicBrainzApi({
  appName: MUSICBRAINZ_APP_NAME,
  appVersion: MUSICBRAINZ_VERSION,
  appContactInfo: MUSICBRAINZ_CONTACT,
});

export default mbApi;
