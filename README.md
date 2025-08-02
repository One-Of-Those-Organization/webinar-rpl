# Webinar UKDC - RPL2

---

## Member of Group

- Federico Matthew Pratama
- Fernando Perry
- Vincentius Johanes Lwie Jaya

---

## IMPORTANT NOTE

- Example of systemd service and nginx config are located at `./deploy-example/`.
- The cert editor will not work if the backend and frontend is not hosted on the same port and ip by default.
- To make it accessible on seperate frontend and backend couple of changes is needed:
    * Set all of this `HttpOnly` to `false`:
    ```
    backend/server_handler_user.go:187:            HTTPOnly: true,
    backend/server_handler_user.go:1057:            HTTPOnly: true,
    backend/server_handler_user.go:1085:            HTTPOnly: true,
    ```
    * Uncomment this line in `editor.html` that located at `backend/static-hidden` and comment the current active one which looks like this `"/api/c/API_HERE",`:
    ```
    backend/static-hidden/editor.html:605:                // "{{ .APIPath }}/api/protected/-cert-editor-upload-image",
    backend/static-hidden/editor.html:633:                // "{{ .APIPath }}/api/protected/-cert-editor-upload-html",
    ```

## Prerequisites

Before running this project, make sure you have the following installed:

### Node.js and NPM

__Windows:__

1. Download and Install Node.js:
   - Go to [https://nodejs.org/](https://nodejs.org/)
   - Download the Latest version version (24.4.1 to be safe)
   - Run the installer and follow the setup wizard
   - Node.js installation includes npm automatically

2. Verify Installation:
   ```bash
   node --version
   npm --version
   ```
   Both commands should return version numbers if installed correctly.

__Linux (ARCH):__

1. Install NodeJS and NPM:
   ```bash
   sudo pacman -S nodejs npm
   ```

---


### Go (for Backend)

__Windows:__

1. Download and install Go from [https://golang.org/dl/](https://golang.org/dl/)
2. Follow the installation instructions

__Linux (ARCH):__

1. Install golang:
   ```bash
   sudo pacman -S go
   ```

---

### SQLite

__Windows:__

1. No separate SQLite download is required as it's included via Go dependencies
2. However, you need a C compiler (GCC) installed on your system:
   - **Windows**: 
     - Install [MSYS2](https://www.msys2.org/) and then install GCC:
        - for 64-bit
        ```
        pacman -S mingw-w64-x86_64-gcc
        ```
        - for 32-bit
        ```
        pacman -S mingw-w64-i686-gcc
        ```

__Linux (ARCH):__

1. Install gcc:
   ```bash
   sudo pacman -S gcc
   ```

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/One-Of-Those-Organization/webinar-rpl.git
cd webinar-rpl
```

---

### 2. Frontend Setup

#### z. Edit Backend Endpoint

- Edit `src/api/endpoint.ts` to `http://localhost:3000` if using `npm run dev`. _(DEFAULT)_
- Edit `src/api/endpoint.ts` to empty if using `nginx reverse proxy, etc`.

#### a. Install Dependencies

```bash
npm install
```

#### b. Start the Development Server

```bash
npm run dev
```
- The frontend will be accessible at: [http://localhost:5173](http://localhost:5173)

#### c. Build for Production (optional)

```bash
npm run build
```
- This will generate an optimized production build in the `dist/` folder.
- Then deploy with nginx or use `npx serve -s dist/`

---

### 3. Backend Setup (Go)

#### a. Change to Backend Directory

```bash
cd backend
mkdir db
```

#### b. Build the Backend

```bash
go build .
```

#### c. Run the Backend Server

- Run with the proper env:

```sh
WRPL_SECRET=YOUR_SECRET_PASSWORD WRPL_EMAIL=GMAIL_APP WRPL_EMAPPPASS="GMAIL_APP_PASSWORD" WRPL_IP="BACKEND_IP" WRPL_PORT=BACKEND_PORT go run .
```

- The backend will be running at: [http://localhost:3000](http://localhost:3000)

---
