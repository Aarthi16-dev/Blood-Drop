# How to Push to GitHub

Since I cannot access your GitHub account directly, follow these steps to push your project:

1.  **Log in to GitHub**: Go to [https://github.com](https://github.com) and log in.
2.  **Create a New Repository**:
    *   Click the "+" icon in the top right corner -> **New repository**.
    *   Name it `blood-drop`.
    *   Description: "Smart Blood Donation Web Application".
    *   Select **Public** or **Private** as desired.
    *   **Do NOT** initialize with README, .gitignore, or license (we already have them).
    *   Click **Create repository**.

3.  **Push Existing Repository**:
    *   Copy the URL of your new repository (e.g., `https://github.com/your-username/blood-drop.git`).
    *   Open your terminal in `c:\Users\Admin\OneDrive\Desktop\Blood Drop`.
    *   Run the following commands (replace `YOUR_REPO_URL` with the URL you copied):

```bash
git remote add origin YOUR_REPO_URL
git branch -M main
git push -u origin main
```

4.  **Verification**:
    *   Refresh your GitHub repository page. You should see all your project files there!
