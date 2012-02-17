@echo off

setlocal

set Path=C:\WINDOWS;C:\WINDOWS\system32;C:\Progra~1\7-Zip;C:\Progra~1\Windows Resource Kits\Tools;C:\cygwin\bin
set APP_NAME="implicit-wait"
set CHROME_PROVIDERS="content"

set ROOT_DIR=%CD%
set TMP_DIR="build"

rem remove any left-over files from previous build
del /Q %APP_NAME%.xpi
del /S /Q %TMP_DIR%

mkdir %TMP_DIR%\chrome\content

robocopy content %TMP_DIR%\chrome\content /E
robocopy locale %TMP_DIR%\chrome\locale /E
robocopy skin %TMP_DIR%\chrome\skin /E
robocopy defaults %TMP_DIR%\defaults /E
copy install.rdf %TMP_DIR%
copy chrome.manifest %TMP_DIR%

rem generate the XPI file
cd %TMP_DIR%
echo "Generating %APP_NAME%.xpi..."

7z a -r -y -tzip ../%APP_NAME%.zip *

cd %ROOT_DIR%
rename %APP_NAME%.zip %APP_NAME%.xpi

echo "Generating sha1 hashcode : "
del /Q hash.txt
sha1sum %APP_NAME%.xpi>hash.txt

endlocal

pause