; Professional GPOS System Installer Script
; This script handles professional installation with Terms & Conditions

!macro customInstall
  ; Create application data directory
  CreateDirectory "$APPDATA\GPOS System"
  CreateDirectory "$APPDATA\GPOS System\database"
  CreateDirectory "$APPDATA\GPOS System\uploads"
  CreateDirectory "$APPDATA\GPOS System\logs"
  
  ; Copy database from resources to user's AppData
  SetOutPath "$APPDATA\GPOS System\database"
  File "${BUILD_RESOURCES_DIR}\database\pos.db"
  File "${BUILD_RESOURCES_DIR}\database\init.js"
  
  ; Copy migrations
  SetOutPath "$APPDATA\GPOS System\database\migrations"
  File /r "${BUILD_RESOURCES_DIR}\database\migrations\*"
  
  ; Copy models
  SetOutPath "$APPDATA\GPOS System\database\models"
  File /r "${BUILD_RESOURCES_DIR}\database\models\*"
  
  ; Create application registry entries
  WriteRegStr HKCU "Software\GPOS System" "InstallPath" "$INSTDIR"
  WriteRegStr HKCU "Software\GPOS System" "DataPath" "$APPDATA\GPOS System"
  WriteRegStr HKCU "Software\GPOS System" "Version" "1.0.0"
  
  ; Show installation success message
  MessageBox MB_OK "GPOS System has been successfully installed!$\r$\n$\r$\nDatabase location: $APPDATA\GPOS System\database$\r$\n$\r$\nYou can now start using GPOS System from your desktop or start menu."
!macroend

!macro customUnInstall
  ; Remove registry entries
  DeleteRegKey HKCU "Software\GPOS System"
  
  ; Ask user if they want to keep data
  MessageBox MB_YESNO "Do you want to keep your GPOS System data (database, uploads, etc.)?$\r$\n$\r$\nClick Yes to keep data in: $APPDATA\GPOS System$\r$\nClick No to remove all data." IDYES keep_data IDNO remove_data
  
  keep_data:
    MessageBox MB_OK "GPOS System has been uninstalled.$\r$\n$\r$\nYour data has been kept in: $APPDATA\GPOS System$\r$\n$\r$\nYou can manually delete this folder if you want to remove all data."
    Goto end_uninstall
  
  remove_data:
    RMDir /r "$APPDATA\GPOS System"
    MessageBox MB_OK "GPOS System has been completely uninstalled.$\r$\n$\r$\nAll data has been removed."
  
  end_uninstall:
!macroend
