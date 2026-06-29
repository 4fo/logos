# Android App Signing

The LOGOS Android APK is signed at release time so it can be installed on standard Android devices with the correct app icon and name.

## CI Signing (GitHub Actions)

The CI workflow (`.github/workflows/release-android.yml`) signs the APK using secrets stored in the GitHub repository. The following secrets must be set in the repo settings under **Settings → Secrets and variables → Actions**:

| Secret | Description |
|---|---|
| `KEYSTORE_BASE64` | Base64-encoded `.keystore` file (PKCS12 format) |
| `KEYSTORE_PASSWORD` | Password for the keystore file |
| `KEY_ALIAS` | Key alias within the keystore (`logos`) |
| `KEY_PASSWORD` | Password for the key entry |

The `assembleRelease` step in `android/app/build.gradle` reads `android/keystore.properties` for signing config. The CI creates both `keystore.properties` and `logos-release.keystore` from secrets before building.

## Local Signing

To build a signed APK locally:

1. Place `logos-release.keystore` in `android/app/`
2. Create `android/keystore.properties` with:
   ```
   storePassword=<your-password>
   keyPassword=<your-password>
   keyAlias=logos
   storeFile=logos-release.keystore
   ```
3. Run `./gradlew assembleRelease`

Both files are in `.gitignore` — they will never be committed.

## Security Notes

- The keystore was generated with `keytool -genkey -keyalg RSA -keysize 2048 -validity 10000 -storetype PKCS12`
- The signing key is private and should never be committed to the repository
- The old keystore (password `emigna`) was scrubbed from git history via `git filter-repo`
