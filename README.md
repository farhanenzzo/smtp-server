# PayWifiBill SMTP Server

A lightweight Node.js email server for the PayWifiBill referral system. Built with Express and Nodemailer.

## 🚀 Features

-   **Status Page**: A visual dashboard at the root (`/`) to verify server health and SMTP configuration.
-   **Referral Endpoint**: Send referral emails from users to the team.
-   **Health Check**: Simple JSON endpoint for monitoring.
-   **Security**: CORS enabled and environment variable protection.
-   **Modern Design**: HTML emails styled for a premium look.

## 🛠️ Prerequisites

-   [Node.js](https://nodejs.org/) (v18+ recommended)
-   [npm](https://www.npmjs.com/)
-   An SMTP account (e.g., Gmail with App Password)

## 📦 Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd smtp-server
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**:
    Create a `.env` file from the example:
    ```bash
    cp .env.example .env
    ```
    Then, edit `.env` with your SMTP and server details:
    ```env
    # Email Configuration
    EMAIL_USER=your-email@gmail.com
    EMAIL_PASS=your-app-password
    
    # SMTP Settings (Defaults to Gmail)
    SMTP_HOST=smtp.gmail.com
    SMTP_PORT=587

    # Server Port
    PORT=3000
    ```

## 🏃 Running the Server

-   **Development mode** (reloads on file changes):
    ```bash
    npm run dev
    ```

-   **Production mode**:
    ```bash
    npm start
    ```

## 📡 API Endpoints

### 1. Health Check
Checks if the server is alive.

-   **URL**: `/health`
-   **Method**: `GET`
-   **Success Response**:
    -   **Code**: 200 OK
    -   **Content**: `{ "status": "ok", "timestamp": "2026-03-31T12:00:00Z" }`

### 2. Refer a Friend
Sends a referral email.

-   **URL**: `/api/refer-friend`
-   **Method**: `POST`
-   **Body Parameters**:
    -   `refererName` (string, required): Name of the person referring.
    -   `refererEmail` (string, required): Email of the person referring.
    -   `refererPhone` (string, optional): Phone of the person referring.
    -   `friendName` (string, required): Name of the referred friend.
    -   `friendPhone` (string, required): Phone identifier for the friend.

## 🧪 Testing the API

You can test the API using `curl` or tools like Postman.

### Test Health Check
```bash
curl http://localhost:3000/health
```

### Test Referral Endpoint
Replace the placeholders with your test data:
```bash
curl -X POST http://localhost:3000/api/refer-friend \
-H "Content-Type: application/json" \
-d '{
  "refererName": "John Doe",
  "refererEmail": "john@example.com",
  "refererPhone": "1234567890",
  "friendName": "Jane Smith",
  "friendPhone": "0987654321"
}'
```

## 🔒 Security Note
When using Gmail, you **must** use an [App Password](https://myaccount.google.com/apppasswords), not your regular account password. Ensure "2-Step Verification" is enabled on your Google account first.
