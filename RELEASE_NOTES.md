# TheVisionReality 2.0.0

This release updates the fork for VR-focused Meta Quest mirroring workflows while keeping credit to the upstream Escrcpy project.

## Highlights

- Updated the app branding to TheVisionReality with restored custom icon/logo resources.
- Added Meta Quest streaming presets:
  - Full View
  - Quest 2 - 16x9
  - Quest 3 - 16x9
  - Quest 3 - 9x16
  - Quest 3 - 1x1
- Reworked the main UI with a VR-focused layout, rail navigation, refreshed device cards, and polished control buttons.
- Added a dedicated VR App Catalog page in the main navigation.
- Added UI-based VR app catalog editing, including scanning installed apps from a connected Android/Quest device.
- VR Apps now fetch installed app icons dynamically from the connected device when the menu opens.
- Improved Vietnamese localization coverage for the new VR-specific UI.
- Updated the header quick tools so they sit away from window controls and collapse into a proper expand button on narrow windows.
- Removed the old raw JSON app-list setting now that the catalog has a proper UI.

## Upstream Credit

TheVisionReality is a fork/customization of [Escrcpy](https://github.com/viarotel-org/escrcpy), an Electron GUI around [scrcpy](https://github.com/Genymobile/scrcpy). The original project and upstream maintainers remain credited in the README and acknowledgments.
