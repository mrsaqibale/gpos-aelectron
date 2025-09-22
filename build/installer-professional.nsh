!macro customInstall
  SetOutPath "$APPDATA\\GPOS System\\database"
  File "${BUILD_RESOURCES_DIR}\\database\\pos.db"
  File "${BUILD_RESOURCES_DIR}\\database\\init.js"
!macroend

