
## Deployment via Ionic Appflow (Recommended for Windows Users)

Ionic Appflow is a CI/CD service specifically designed for mobile apps (Capacitor/Cordova). It solves the "I'm on Windows" problem by building your iOS app in the cloud and managing your signing certificates securely.

### Step 1: Create an Appflow Account
1.  Go to [dashboard.ionicframework.com](https://dashboard.ionicframework.com/signup).
2.  Sign up for an account.

### Step 2: Link Your Repository
1.  In the Appflow Dashboard, click **New App**.
2.  Choose **Import existing app**.
3.  Connect your GitHub account and select this repository (`ramkdataeng-lab/student-success-navigator`).

### Step 3: Configure Certificates (The Hard Part made Easier)
Appflow provides a secure vault for your certificates.
1.  **Apple Developer Account**: Ensure you have a paid Apple Developer account.
2.  **Generate Certificates**: You still need a `.p12` file (Certificate) and `.mobileprovision` file.
    *   *Tip*: You can use a tool like **Appflow's CLI** or open-source tools to generate these if you don't have a Mac.
3.  **Upload to Appflow**:
    *   Go to **Signing Certificates** in Appflow.
    *   Upload your Production Certificate (`.p12`) and Provisioning Profile.

### Step 4: Create a Build
1.  Go to **Builds** -> **New Build**.
2.  Select the **Commit** you want to build (e.g., latest `main`).
3.  Target Platform: **iOS**.
4.  Build Type: **App Store** (Release).
5.  Select your **Signing Certificate** from the dropdown.
6.  Click **Build**.

### Step 5: Deploy to App Store
Once the build is successful (green checkmark):
1.  Click the **Deploy** button on the build detail page.
2.  Choose **App Store Connect**.
3.  Enter your Apple ID credentials (or App Store Connect API Key).
4.  Appflow will upload the `.ipa` file directly to TestFlight/App Store for you.

### Why use this over GitHub Actions?
*   **Easier Certificate Management**: They provide a UI for uploading certs, rather than dealing with base64 encoding secrets in GitHub.
*   **Native Support**: It's built by the team behind Capacitor, so standard issues are handled automatically.
*   **Live Updates**: You can push JavaScript updates (bug fixes) to users instantly without waiting for App Store review (a unique Appflow feature).
