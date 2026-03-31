Firebase setup

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Authentication -> Sign-in method -> Email/Password (and Google if desired).
3. Create a Firestore database (start in test mode while developing).
4. In project settings, copy the Firebase SDK config (apiKey, authDomain, projectId, etc.).

How to wire to the app

- Open `app/_layout.tsx` and replace `firebaseConfig = null` with your config object, for example:

const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};

- Install dependencies:

```bash
npm install
```

- Run the app:

```bash
npx expo start
```

Notes

- Orders are saved to Firestore under collection `orders` with a `userId` field.
- Local AsyncStorage orders will be migrated to Firestore automatically on user login.
- Firestore security rules should be configured to limit access to each user's documents (example rules are not included here). Please secure your database before production.
