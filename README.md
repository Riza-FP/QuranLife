# QuLife

QuLife is a modern, feature-rich mobile Quran application built with React Native and Expo. It provides a seamless reading experience with multiple translations, advanced audio playback controls, and a clean, user-friendly interface.

## Features

*   **Surah List**: Browse all Surahs with their verse counts.
*   **Verse View**: Swipe through verses one by one for focused reading.
*   **Translations**:
    *   **Default (ID)**: Indonesian Ministry of Religion (Kemenag).
    *   **Muyassar (ID)**: Tafsir Muyassar (Indonesian).
    *   **Jalalayn (EN)**: Tafsir Jalalayn (English).
    *   *Toggle translation visibility instantly from the player.*
*   **Audio Playback**:
    *   High-quality audio from Mishary Rashid Alafasy.
    *   **Auto Play**: Automatically advance to the next verse.
    *   **Repeat**: Repeat a verse 1x, 2x, 3x, or infinitely (Loop).
    *   **Delay**: Add a pause (3s, 5s, 10s) between verses for recitation practice.
    *   **Smart Resume**: Remembers where you left off.
*   **Customization**:
    *   Adjust Arabic font size.
    *   Toggle translations on/off globally or locally.

## Tech Stack

*   **Framework**: [Expo](https://expo.dev/) (React Native)
*   **Navigation**: React Navigation (Stack)
*   **Audio**: `expo-av`
*   **Icons**: `@expo/vector-icons` (Ionicons)
*   **Storage**: Local JSON data for instant loading (no network required for text).

## Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/Roni-Emhade-Learning-Center/qulife.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd qulife
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```

## Running the App

Start the development server:

```bash
npm start
```

*   **Android**: Press `a` (requires Android Emulator or connected device).
*   **iOS**: Press `i` (requires iOS Simulator or Mac).
*   **Physical Device**: Scan the QR code with the Expo Go app.

## Data Sources

*   **Quran Text & Translations**: Compiled from open-source datasets.
*   **Audio**: Sourced from [Islamic Network API](https://alquran.cloud/).

## License

This project is open source and available under the [MIT License](LICENSE).
