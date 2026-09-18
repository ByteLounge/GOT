# setup-android-env.ps1
$baseDir = "D:\android-build-env"
if (!(Test-Path $baseDir)) { New-Item -ItemType Directory -Path $baseDir -Force }

$jdkZip = Join-Path $baseDir "jdk17.zip"
$jdkDir = Join-Path $baseDir "jdk-17"
$cmdlineZip = Join-Path $baseDir "cmdline-tools.zip"
$sdkDir = Join-Path $baseDir "android-sdk"

# 1. Download & Extract JDK 17 if not present
if (!(Test-Path (Join-Path $jdkDir "bin\java.exe"))) {
    Write-Host "Downloading OpenJDK 17..."
    $jdkUrl = "https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.12+7/OpenJDK17U-jdk_x64_windows_hotspot_17.0.12_7.zip"
    curl.exe -L -o $jdkZip $jdkUrl
    Write-Host "Extracting OpenJDK 17..."
    Expand-Archive -Path $jdkZip -DestinationPath $baseDir -Force
    $extractedJdk = Get-ChildItem -Path $baseDir -Directory | Where-Object { $_.Name -like "jdk-17*" } | Select-Object -First 1
    if ($extractedJdk.FullName -ne $jdkDir) {
        Rename-Item -Path $extractedJdk.FullName -NewName "jdk-17" -Force
    }
    Remove-Item -Path $jdkZip -Force -ErrorAction SilentlyContinue
    Write-Host "JDK 17 ready at $jdkDir"
} else {
    Write-Host "JDK 17 already exists at $jdkDir"
}

# 2. Download & Extract Android Commandline Tools
$cmdlineBin = Join-Path $sdkDir "cmdline-tools\latest\bin\sdkmanager.bat"
if (!(Test-Path $cmdlineBin)) {
    Write-Host "Downloading Android Commandline Tools..."
    $cmdlineUrl = "https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip"
    curl.exe -L -o $cmdlineZip $cmdlineUrl
    Write-Host "Extracting Commandline Tools..."
    $tempCmdline = Join-Path $baseDir "temp_cmdline"
    Expand-Archive -Path $cmdlineZip -DestinationPath $tempCmdline -Force
    
    # Android SDK requires structure: $sdkDir/cmdline-tools/latest/...
    $targetLatest = Join-Path $sdkDir "cmdline-tools\latest"
    if (!(Test-Path $targetLatest)) { New-Item -ItemType Directory -Path $targetLatest -Force }
    Copy-Item -Path (Join-Path $tempCmdline "cmdline-tools\*") -Destination $targetLatest -Recurse -Force
    Remove-Item -Path $tempCmdline -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item -Path $cmdlineZip -Force -ErrorAction SilentlyContinue
    Write-Host "Android Commandline Tools ready at $targetLatest"
} else {
    Write-Host "Commandline Tools already exists at $cmdlineBin"
}

# 3. Setup Environment for SDK installation
$env:JAVA_HOME = $jdkDir
$env:PATH = "$jdkDir\bin;$sdkDir\cmdline-tools\latest\bin;$sdkDir\platform-tools;$env:PATH"
$env:ANDROID_HOME = $sdkDir

Write-Host "Accepting Android licenses and installing platforms;android-34, build-tools;34.0.0, platform-tools..."
cmd.exe /c "echo y | `"$cmdlineBin`" --licenses"
cmd.exe /c "`"$cmdlineBin`" `"platform-tools`" `"platforms;android-34`" `"build-tools;34.0.0`""

Write-Host "Android Environment successfully initialized at $sdkDir!"
