import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Grid from "@mui/material/Grid";
//import { uploadFile } from "../../core/API";
import { Snackbar, Alert } from "@mui/material";
import axios from "axios";
import CircularProgressWithLabel from "../components/circularprogress/index";

export default function UploadFiles(props) {
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState({
    messageText: "",
    messageType: "",
    show: false,
  });

  const showMessage = (text, type) => {
    setMessage({ messageText: text, messageType: type, show: true });
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") return;
    setMessage({ messageText: "", messageType: "", show: false });
  };

  const onDrop = useCallback((acceptedFiles) => {
    const mappedFiles = acceptedFiles.map((file) => ({
      name: file.name,
      size: file.size,
      file: file,
      status: "PENDING",
      progress: 0,
    }));
    setFiles((prev) => [...prev, ...mappedFiles]);
  }, []);
  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const uploadAllFiles = () => {
    const filesTempList = [...files];
    filesTempList.map((fileObject) => {
      uploadSingleFile(fileObject);
    });
  };

  const uploadSingleFile = (fileObject) => {
    setFileStatus(fileObject, "IN-PROGRESS");
    const formData = new FormData();
    formData.append("file", fileObject.file);
    uploadFile(formData, fileObject.name)
      .then((res) => {
        showMessage("Uploaded successfully", "success");
        setFileStatus(fileObject, "COMPLETED");
      })
      .catch((err) => {
        console.error("Error while uploading file:", err);
        showMessage(err.response.data.statusMessage, "error");
        setFileStatus(fileObject, "ERROR");
      });
  };

  const setFileStatus = (fileObject, status) => {
    setFiles((prevFiles) =>
      prevFiles.map((file) =>
        file.name === fileObject.name ? { ...file, status: status } : file
      )
    );
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    const kb = bytes / 1024;
    if (kb < 1024) return kb.toFixed(2) + " KB";
    const mb = kb / 1024;
    if (mb < 1024) return mb.toFixed(2) + " MB";
    const gb = mb / 1024;
    return gb.toFixed(2) + " GB";
  };

  const uploadFile = async (formData, fileName) => {
    try {
      const response = await axios.post(
        "/api/upload?filename=" + fileName,
        formData,
        {
          timeout: 0, // disables timeout
          onUploadProgress: (event) => {
            const percent = Math.round((event.loaded * 100) / event.total);
            setFileUploadProgress(fileName, percent);
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const setFileUploadProgress = (fileName, progressVal) => {
    setFiles((prevFiles) =>
      prevFiles.map((file) =>
        file.name === fileName ? { ...file, progress: progressVal } : file
      )
    );
  };

  return (
    <div>
      <Grid container>
        <Grid sx={{ xs: 4 }}></Grid>
        <Grid sx={{ xs: 4 }}>
          <button
            id="backHomeBtn"
            onClick={() => {
              props.setActiveView("HOME");
            }}
          >
            Home
          </button>
        </Grid>
        <Grid sx={{ xs: 4 }}></Grid>
      </Grid>
      {/* Dropzone Row */}
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        sx={{ minHeight: "40vh" }}
      >
        <Grid {...getRootProps({ className: "dropzone" })}>
          <input {...getInputProps()} />
          <img
            src="/upload-icon.png"
            alt="Upload"
            style={{
              width: "128px",
              height: "128px",
              marginBottom: "5px",
            }}
          />
          <p>Drag & drop some files here, or click to select</p>
        </Grid>
      </Grid>
      <Grid container justifyContent="center" alignItems="center">
        <table style={{ width: "100%", marginTop: "20px" }} border={1}>
          <thead>
            <tr>
              <th style={{ width: "20%", textAlign: "left" }}>📋 File Name</th>
              <th style={{ width: "5%", textAlign: "center" }}>📦 Size</th>
              <th style={{ width: "5%", textAlign: "center" }}>
                ⚙️ Action {""}
                <a
                  onClick={uploadAllFiles}
                  style={{
                    color: "#1976d2",
                    textDecoration: "underline",
                    cursor: "pointer",
                    marginLeft: "8px",
                    fontSize: "14px",
                  }}
                >
                  Upload All
                </a>
              </th>
            </tr>
          </thead>
          <tbody id="fileTableBody">
            {files.map((file, index) => (
              <tr key={index}>
                <td style={{ width: "20%", textAlign: "left" }}>{file.name}</td>
                <td style={{ width: "5%", textAlign: "center" }}>
                  {formatFileSize(file.size)}
                </td>
                <td style={{ width: "5%" }}>
                  {file.status === "PENDING" && (
                    <a
                      onClick={() => {
                        uploadSingleFile(file);
                      }}
                      style={{
                        color: "#1976d2",
                        textDecoration: "underline",
                        cursor: "pointer",
                        marginLeft: "8px",
                        fontSize: "14px",
                      }}
                    >
                      Upload
                    </a>
                  )}
                  {file.status === "COMPLETED" && <b>Uploaded</b>}
                  {file.status === "IN-PROGRESS" && (
                    <div>
                      <CircularProgressWithLabel value={file.progress} />
                    </div>
                  )}
                  {file.status === "ERROR" && <b>Error while uploading</b>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Grid>
      <Snackbar
        open={message.show}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={message.messageType}
          onClose={handleClose}
          variant="filled"
        >
          {message.messageText}
        </Alert>
      </Snackbar>
    </div>
  );
}
