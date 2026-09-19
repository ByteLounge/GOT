# build-android-apk.ps1
$ErrorActionPreference = "Stop"

$jdkDir = "D:\android-build-env\jdk-17"
$sdkDir = "D:\android-build-env\android-sdk"
$mobileDir = "D:\Projects\GOT\apps\mobile"
$distDir = "D:\Projects\GOT\dist\apk"

Write-Host "========================================="
Write-Host "GovAlert Android APK Build Pipeline"
Write-Host "========================================="

# 1. Verify JDK 17
if (!(Test-Path "$jdkDir\bin\java.exe")) {
    throw "JDK 17 not found at $jdkDir"
}
$env:JAVA_HOME = $jdkDir
$env:PATH = "$jdkDir\bin;$sdkDir\platform-tools;$sdkDir\cmdline-tools\latest\bin;$env:PATH"
$env:ANDROID_HOME = $sdkDir
$env:ANDROID_SDK_ROOT = $sdkDir

Write-Host "Using Java: $(& java.exe -version 2>&1 | Select-Object -First 1)"
Write-Host "ANDROID_HOME: $env:ANDROID_HOME"

# 2. Build shared packages
Write-Host "Compiling shared TypeScript packages..."
Set-Location "D:\Projects\GOT\packages\types"
npm run build
Set-Location "D:\Projects\GOT\packages\validation"
npm run build
Set-Location "D:\Projects\GOT\packages\shared"
npm run build

# 3. Prebuild Android Native Files (if not already generated)
$androidDir = Join-Path $mobileDir "android"
$appDir = Join-Path $androidDir "app"
$keystoreFile = Join-Path $appDir "release.keystore"

if (!(Test-Path $androidDir)) {
    Write-Host "Running Expo Prebuild for Android..."
    Set-Location $mobileDir
    npx expo prebuild --platform android --no-install
}

# 4. Configure Keystore for Release
if (!(Test-Path $keystoreFile)) {
    Write-Host "Generating release signing keystore..."
    & "$jdkDir\bin\keytool.exe" -genkeypair -v -storetype PKCS12 -keystore $keystoreFile -alias govalert -keyalg RSA -keysize 2048 -validity 10000 -storepass govalert123 -keypass govalert123 -dname "CN=GovAlert, OU=Engineering, O=GovAlert, L=Bengaluru, ST=Karnataka, C=IN"
}

# 5. Build Release & Debug APK via Gradle
Set-Location $androidDir

Write-Host "Running Gradle assembleRelease..."
cmd.exe /c "gradlew.bat assembleRelease --no-daemon"

if (!(Test-Path "$appDir\build\outputs\apk\release\app-release.apk")) {
    Write-Host "Release APK with default config not found, running assembleDebug..."
    cmd.exe /c "gradlew.bat assembleDebug --no-daemon"
}

# 6. Copy output APK to dist/apk/
if (!(Test-Path $distDir)) {
    New-Item -ItemType Directory -Path $distDir -Force
}

$releaseApk = Join-Path $appDir "build\outputs\apk\release\app-release.apk"
$releaseUnsignedApk = Join-Path $appDir "build\outputs\apk\release\app-release-unsigned.apk"
$debugApk = Join-Path $appDir "build\outputs\apk\debug\app-debug.apk"

if (Test-Path $releaseApk) {
    Copy-Item -Path $releaseApk -Destination (Join-Path $distDir "GovAlert-release.apk") -Force
    Copy-Item -Path $releaseApk -Destination (Join-Path $distDir "GovAlert.apk") -Force
    Write-Host "SUCCESS: Release APK generated at $distDir\GovAlert.apk"
} elseif (Test-Path $debugApk) {
    Copy-Item -Path $debugApk -Destination (Join-Path $distDir "GovAlert.apk") -Force
    Write-Host "SUCCESS: APK generated at $distDir\GovAlert.apk"
}

Get-ChildItem $distDir
