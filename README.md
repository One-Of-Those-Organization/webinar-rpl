# Webinar UKDC - RPL2

---

## Member of Group

- Federico Matthew Pratama
- Fernando Perry
- Vincentius Johanes Lwie Jaya

---

## Prerequisites

Before running this project, make sure you have the following installed:

### Node.js and NPM
1. **Download and Install Node.js:**
   - Go to [https://nodejs.org/](https://nodejs.org/)
   - Download the LTS (Long Term Support) version
   - Run the installer and follow the setup wizard
   - Node.js installation includes npm automatically

2. **Verify Installation:**
   ```bash
   node --version
   npm --version
   ```
   Both commands should return version numbers if installed correctly.

---

### TypeScript + Vite (for Frontend)
- Read the documentation [https://vite.dev/guide/](https://vite.dev/guide/)

### Go (for Backend)
- Download and install Go from [https://golang.org/dl/](https://golang.org/dl/)
- Follow the installation instructions for your operating system

### SQLite Dependencies
- No separate SQLite download is required as it's included via Go dependencies
- However, you need a C compiler (GCC) installed on your system:
  - **Windows**: 
    - Install [TDM-GCC](https://jmeubank.github.io/tdm-gcc/download/) or 
    - Install [MSYS2](https://www.msys2.org/) and then install GCC:
      - for 64-bit
      ```
      pacman -S mingw-w64-x86_64-gcc
      ```
      - for 32-bit
      ```
      pacman -S mingw-w64-i686-gcc
      ```
  - **Linux**: Install GCC (`sudo apt install gcc` for Debian/Ubuntu)

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/One-Of-Those-Organization/webinar-rpl.git
cd webinar-rpl
```

---

### 2. Frontend Setup (React + Vite + TypeScript)

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

---

### 3. Backend Setup (Go)

#### a. Change to Backend Directory

```bash
cd backend
```

#### b. Build the Backend

```bash
go build .
```

#### c. Run the Backend Server

```bash
go run .
```
- The backend will be running at: [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```text
webinar-rpl/
├── backend/               # Go backend source code
├── public/                # Frontend static assets
├── src/                   # React frontend source code
├── package.json           # Node.js dependencies and scripts
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
├── README.md              # Project documentation
└── ...
```

---

## Useful Scripts

- `npm install` — Install all frontend dependencies
- `npm run dev` — Start frontend dev server ([http://localhost:5173](http://localhost:5173))
- `npm run build` — Build frontend for production
- `go build .` — Build backend Go binary (from `backend/`)
- `go run .` — Run backend server (from `backend/`)

---

## Troubleshooting

### Common Issues

1. **SQLite Compilation Errors**
   - Make sure GCC is properly installed and in your PATH
   - For Windows: Ensure you've restarted your terminal after installing TDM-GCC or MSYS2
   - If using Go modules, try `go clean -modcache` followed by `go mod tidy`

2. **Backend Connection Issues**
   - Check if the backend server is running
   - Verify the port is not being used by another application

---
