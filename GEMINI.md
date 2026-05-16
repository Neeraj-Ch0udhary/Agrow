# Agrow - Expert Farming Assistant

Agrow is an Expo-based mobile application designed to empower Indian farmers with modern agricultural knowledge, AI-driven assistance, and marketplace access.

## Project Overview

- **Purpose:** Provide practical, actionable advice on modern farming techniques (hydroponics, mushroom cultivation, etc.) and market information.
- **Target Audience:** Indian farmers (Bilingual: English & Hindi).
- **Core Features:**
    - **Agrow AI:** An expert chatbot providing agricultural advice using Llama 3.1 (via Groq).
    - **Market/Mandi:** Information on crop prices and market trends.
    - **Calculator:** Agricultural calculators for yield and profitability.
    - **Disease Detection:** AI-driven crop disease identification.
    - **Marketplace:** Buying and selling agricultural goods.

## Tech Stack

- **Framework:** [Expo](https://expo.dev/) (SDK 54) with [React Native](https://reactnative.dev/).
- **Language:** TypeScript.
- **Routing:** [Expo Router](https://docs.expo.dev/router/introduction/) (File-based navigation).
- **Backend:** [Supabase](https://supabase.com/) (Auth, Database, Edge Functions).
- **AI Integration:** Groq API (running `llama-3.1-8b-instant`).
- **Internationalization:** `i18next` with `react-i18next`.
- **State/Storage:** `AsyncStorage` for local persistence.

## Project Structure

- `app/`: Root directory for file-based routing.
    - `(tabs)/`: Main tab-based navigation.
    - `_layout.tsx`: Root layout with `LanguageProvider` and navigation stack.
- `lib/`: Core utilities and service configurations.
    - `gemini.ts`: AI assistant logic (uses Groq).
    - `supabase.ts`: Supabase client initialization.
    - `i18n.ts`: Internationalization setup.
    - `responsive.ts`: Helper for responsive UI scaling.
- `assets/`: Static assets like icons, splashes, and images.
- `supabase/`: Supabase configuration and Edge Functions.

## Building and Running

### Prerequisites
- Node.js (v18 or later recommended)
- npm or yarn
- Expo Go app or a development build environment

### Commands
- **Install Dependencies:** `npm install`
- **Start Development Server:** `npx expo start`
- **Run on Android:** `npx expo start --android`
- **Run on iOS:** `npx expo start --ios`
- **Run on Web:** `npx expo start --web`
- **Lint Code:** `npm run lint`

## Development Conventions

- **File-based Routing:** Follow Expo Router conventions when adding new screens.
- **Internationalization:** Always use translation keys via `useTranslation` hook for UI text. Locales are stored in `lib/locales/`.
- **Typing:** Use TypeScript interfaces/types for all data models and API responses.
- **Styling:** Use standard React Native `StyleSheet` or inline styles where appropriate, utilizing `responsive.ts` for scaling.
- **Backend:** Prefer using the `supabase` client from `lib/supabase.ts` for database and auth operations.

## TODOs / Known Technical Debt
- `lib/gemini.ts` uses Groq API but is named `gemini.ts`. Consider renaming or clarifying if Gemini API is intended to be used in the future.
- Supabase Anon Key is currently hardcoded in `lib/supabase.ts`. Move to environment variables for production.
