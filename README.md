# 📁 Dropzone – Local File Sharing Over Wi-Fi

**Dropzone** is a lightweight, offline-first file sharing application built with **React (Vite)** and **Node.js (Express)**. It enables seamless file uploads, previews, and downloads across devices connected to the same local network, eliminating the need for internet connectivity.

![Dropzone Screenshot](screenshot.png)

---

## 🚀 Features

- **Drag-and-Drop Uploads**: Intuitive interface for uploading files.
- **Media Previews**: Inline previews for images, videos, audio, and PDFs.
- **Streaming Support**: Stream large media files with range-based requests.
- **File Management**: Download and delete files directly from the interface.
- **Local Network Access**: Access the app from any device on the same Wi-Fi network.
- **Offline Functionality**: Operates without internet access.
- **Large File Handling**: Efficiently manages files exceeding 2GB.
- **Mobile Compatibility**: Optimized for mobile browsers.
- **Security**: Sanitizes filenames to prevent path traversal attacks.

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Material UI
- **Backend**: Node.js (Express), Multer
- **Storage**: Local filesystem (`uploads/` directory)
- **Optional Tools**: FFmpeg (for media processing)

---

## ⚙️ Installation & Setup

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** (v7 or higher)
- **Git**

### Clone the Repository

```bash
git clone https://github.com/jesjesti/dropzone.git
cd dropzone
```

### Install Dependencies

#### Frontend

```bash
cd frontend
npm install
```

#### Backend

```bash
cd ../server
npm install
```

---

## 🚧 Development

### Start the Frontend

```bash
cd frontend
npm run dev
```

### Start the Backend

```bash
cd ../server
node index.js
```

The frontend will be available at `http://localhost:5173`, and the backend API at `http://localhost:3001`.

---

## 📦 Production Build

### Build the Frontend

```bash
cd client
npm run build
```

This will generate a production-ready build in the `dist/` directory.

### Serve with Backend

Move the `dist/` folder to the server directory:

```bash
mv dist ../server/dist
```

Start the backend server:

```bash
cd ../server
node index.js
```

The application will be accessible at `http://localhost:3001`.

---

## 🌐 Accessing from Other Devices

To access Dropzone from other devices on the same network:

1. Determine your local IP address (e.g., `192.168.1.100`).
2. On the other device, open a browser and navigate to `http://192.168.1.100:3001`.

Ensure that your firewall settings allow incoming connections on port `3001`.

---

## 📁 API Endpoints

### Upload File

**POST** `/api/upload?filename=yourfile.ext`

- Uploads a file with the specified filename.
- Returns `409 Conflict` if a file with the same name already exists.

### List Files

**GET** `/api/list`

- Retrieves a list of all uploaded files with metadata.

### View/Download File

**GET** `/api/view/:filename`

- Streams or downloads the specified file.

### Delete File

**DELETE** `/api/delete?name=filename.ext`

- Deletes the specified file from the server.

### Access Information

**GET** `/access-info`

- Provides the local IP address and access URL for the application.

---

## 🧪 Testing Large File Uploads

To test the application's handling of large files:

```bash
# Create a 5GB dummy file
fallocate -l 5G testfile.zip
```

Upload `testfile.zip` through the Dropzone interface to verify large file support.

---

## ⚠️ Known Issues & Solutions

### Client-Side Timeout on Large Uploads

**Issue**: Uploads may fail on devices with unstable or slow connections due to client-side timeouts.

**Solution**:

- Increase the timeout settings in your HTTP client (e.g., Axios):

  ```javascript
  axios.post("/api/upload", formData, {
    timeout: 0, // Disable timeout
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      console.log(`Upload Progress: ${percentCompleted}%`);
    },
  });
  ```

- Implement chunked uploads for better reliability on unstable networks.

### Server Not Logging Errors on Upload Failure

**Issue**: When an upload fails, the server does not log any errors.

**Solution**:

- Add an `aborted` event listener to log when a client aborts a request:

  ```javascript
  app.use((req, res, next) => {
    req.on("aborted", () => {
      console.warn(`Request aborted by the client: ${req.url}`);
    });
    next();
  });
  ```

- Implement global error handling middleware to catch unhandled errors:

  ```javascript
  app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).send("Server error");
  });
  ```

### `process is not defined` Error in React

**Issue**: Using `process.env.REACT_APP_SERVER_ENDPOINT` results in a `process is not defined` error.

**Solution**:

- In Vite, environment variables should be accessed using `import.meta.env`:

  ```javascript
  const SERVICE_ENDPOINT = import.meta.env.VITE_SERVER_ENDPOINT;
  ```

- Ensure that your `.env` file is correctly configured with the `VITE_` prefix:

  ```
  VITE_SERVER_ENDPOINT=http://localhost:3001
  ```

---

## 🖼️ Custom Favicon from Emojipedia

To set a custom favicon using an emoji:

1. Visit [Emojipedia](https://emojipedia.org/) and select your desired emoji.
2. Download the emoji image as a `.png` file.
3. Convert the `.png` to `.ico` format using an online converter.
4. Place the `favicon.ico` file in the `public/` directory.
5. Update the `index.html` file to include the favicon:

   ```html
   <link rel="icon" href="/favicon.ico" />
   ```

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
