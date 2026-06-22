# TheVisionReality

[![GitHub release](https://img.shields.io/github/v/release/vuisme/escrcpy?label=release)](https://github.com/vuisme/escrcpy/releases)

TheVisionReality is a VR-focused fork of [Escrcpy](https://github.com/viarotel-org/escrcpy), built for Meta Quest mirroring, streaming presets, and quick VR app launching while preserving the upstream Electron + scrcpy foundation.

## What's New in 2.0

- Dedicated TheVisionReality branding, app icon, and VR-oriented interface.
- Meta Quest crop presets for Full View, Quest 2 16x9, Quest 3 16x9, Quest 3 9x16, and Quest 3 1x1.
- Reworked main layout with rail navigation, improved device cards, cleaner control buttons, and responsive header tools.
- Dedicated VR App Catalog page with UI editing instead of raw JSON editing.
- Scan apps from any connected Android/Quest device and import package/activity metadata into the catalog.
- VR Apps menu fetches installed app icons dynamically from the connected device.
- Expanded Vietnamese localization for the custom VR interface.

## Features

- High-performance Android and Meta Quest mirroring powered by scrcpy.
- Quest-oriented crop presets and angle options for VR streaming.
- Wireless ADB connection, LAN discovery, recording, screenshots, terminal, and file tools.
- VR App launcher with catalog management and connected-device scanning.
- Multi-device management inherited from upstream Escrcpy.

## Installation

### Manual Installation via Released Packages

Check the [TheVisionReality Releases Page](https://github.com/vuisme/escrcpy/releases).

## Documentation

Upstream Escrcpy documentation remains useful for the core app behavior:

- [Getting Started](https://viarotel.eu.org/guide/started)
- [Scrcpy video options](https://viarotel.eu.org/reference/scrcpy/video)
- [Device Operations](https://viarotel.eu.org/guide/operation)
- [Preferences](https://viarotel.eu.org/guide/preferences)

## For Developers

This repo keeps the upstream pnpm + Turborepo + Electron architecture. See [develop.md](develop.md) and [AGENTS.md](AGENTS.md) for local development notes.

## Upstream Credit

TheVisionReality is based on [viarotel-org/escrcpy](https://github.com/viarotel-org/escrcpy). Credit, architecture, and much of the core Electron/scrcpy integration come from the upstream project.

## Acknowledgments

This project owes its existence to the upstream Escrcpy project and the following open-source projects:

- [Escrcpy](https://github.com/viarotel-org/escrcpy)
- [scrcpy](https://github.com/Genymobile/scrcpy)
- [adbkit](https://github.com/DeviceFarmer/adbkit)
- [electron](https://www.electronjs.org/)
- [vue](https://vuejs.org/)
- [gnirehtet](https://github.com/Genymobile/gnirehtet/)
- [autoglm.js](https://github.com/FliPPeDround/autoglm.js)
- [tangoadb](https://tangoadb.dev/)
