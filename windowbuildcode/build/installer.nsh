; Custom NSIS installer script for GPOS System
; This script provides additional customization for the Windows installer

!macro preInit
  ; Set the installation directory
  SetRegView 64
  WriteRegExpandStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation "$INSTDIR"
  WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "$INSTDIR"
  SetRegView 32
  WriteRegExpandStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation "$INSTDIR"
  WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "$INSTDIR"
!macroend

!macro customInstall
  ; Create application data directory
  CreateDirectory "$APPDATA\GPOS System"
  CreateDirectory "$APPDATA\GPOS System\database"
  CreateDirectory "$APPDATA\GPOS System\logs"
  CreateDirectory "$APPDATA\GPOS System\config"
  
  ; Create desktop shortcut
  CreateShortCut "$DESKTOP\GPOS System.lnk" "$INSTDIR\GPOS System.exe"
  
  ; Create start menu shortcut
  CreateDirectory "$SMPROGRAMS\GPOS System"
  CreateShortCut "$SMPROGRAMS\GPOS System\GPOS System.lnk" "$INSTDIR\GPOS System.exe"
  CreateShortCut "$SMPROGRAMS\GPOS System\Uninstall GPOS System.lnk" "$INSTDIR\Uninstall GPOS System.exe"
!macroend

!macro customUnInstall
  ; Remove application data (optional - user can choose to keep data)
  MessageBox MB_YESNO "Do you want to remove all application data (database, logs, config)?" IDNO skip_data_removal
  RMDir /r "$APPDATA\GPOS System"
  skip_data_removal:
  
  ; Remove shortcuts
  Delete "$DESKTOP\GPOS System.lnk"
  RMDir /r "$SMPROGRAMS\GPOS System"
!macroend

!macro customHeader
  ; Custom header text
  !define MUI_HEADER_TEXT "GPOS System Installation"
  !define MUI_HEADER_SUBTEXT "Smart Restaurant Billing System"
!macroend

!macro customWelcomePage
  ; Custom welcome page
  !define MUI_WELCOMEPAGE_TITLE "Welcome to GPOS System Setup"
  !define MUI_WELCOMEPAGE_TEXT "This wizard will guide you through the installation of GPOS System, a smart restaurant billing system.$\r$\n$\r$\nIt is recommended that you close all other applications before starting Setup. This will make it possible to update relevant system files without having to reboot your computer.$\r$\n$\r$\nClick Next to continue."
!macroend
