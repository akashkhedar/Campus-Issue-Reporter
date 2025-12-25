#!/usr/bin/env node
// Create a Firebase Auth user and set custom claim 'admin'
// Usage:
// 1. Install: npm install firebase-admin yargs
// 2. Export service account JSON path: export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccount.json"
// 3. Run: node tools/create_admin.cjs --email admin@campus.edu --password "Secret123"

const admin = require("firebase-admin");
const argv = require("yargs/yargs")(process.argv.slice(2)).argv;

if (!argv.email || !argv.password) {
  console.error(
    "Usage: node tools/create_admin.cjs --email admin@domain --password MyPass123"
  );
  process.exit(1);
}

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error(
    "Set GOOGLE_APPLICATION_CREDENTIALS to your service account JSON file path."
  );
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

(async () => {
  try {
    // Try to find existing user
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(argv.email);
      console.log("User already exists:", userRecord.uid);
    } catch (err) {
      // create user
      userRecord = await admin.auth().createUser({
        email: argv.email,
        password: argv.password,
        emailVerified: true,
      });
      console.log("Created user:", userRecord.uid);
    }

    // Set custom claims
    await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });
    console.log("Set custom claim { admin: true } for", userRecord.uid);

    console.log("\nAdmin user ready. Sign in via the app using:");
    console.log("  email:", argv.email);
    console.log("  password:", argv.password);
  } catch (err) {
    console.error("Error creating admin:", err);
    process.exit(1);
  }
})();
