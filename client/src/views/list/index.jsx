import { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import { getFilesList, deleteFile } from "../../core/API";
import { Snackbar, Alert } from "@mui/material";
import ViewFile from "../preview/index";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

export default function ListFiles(props) {
  const [files, setFiles] = useState([]);
  const [prviewFile, setPreviewFile] = useState(null);
  const [deleteAlert, setDeleteAlert] = useState({ show: false, filename: "" });
  const [message, setMessage] = useState({
    messageText: "",
    messageType: "",
    show: false,
  });
  const SERVICE_ENDPOINT = import.meta.env.VITE_SERVER_ENDPOINT;

  useEffect(() => {
    console.log("File fteching");
    getFileList();
  }, []);

  const showMessage = (text, type) => {
    setMessage({ messageText: text, messageType: type, show: true });
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") return;
    setMessage({ messageText: "", messageType: "", show: false });
  };

  const handleDeleteAlertAction = (type) => {
    if (type == "YES") {
      removeFile(deleteAlert.filename);
    }
    setDeleteAlert({ show: false, filename: "" });
  };

  const refreshList = () => {
    getFileList();
  };

  const getFileList = () => {
    getFilesList()
      .then((res) => {
        let filesTemp = [];
        res.data.map((file) => {
          filesTemp.push({
            name: file.fileName,
            size: file.fileSize,
            type: file.fileType,
          });
        });
        setFiles(filesTemp);
      })
      .catch((err) => {
        console.error("Error fetching access info:", err);
      });
  };

  const removeFile = (fileName) => {
    deleteFile(fileName)
      .then((res) => {
        showMessage("Deleted successfully", "success");
        getFileList();
      })
      .catch((err) => {
        console.error("Error while deleting file:", err);
        showMessage(err.response.data.statusMessage, "error");
      });
  };

  return (
    <div>
      {prviewFile == null && (
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

          <Grid container justifyContent="center" alignItems="center">
            <table style={{ width: "100%", marginTop: "20px" }} border={1}>
              <thead>
                <tr>
                  <th style={{ width: "20%", textAlign: "left" }}>
                    📋 File Name
                  </th>
                  <th style={{ width: "5%", textAlign: "left" }}>🔖 Type</th>
                  <th style={{ width: "5%", textAlign: "left" }}>📦 Size</th>
                  <th style={{ width: "10%", textAlign: "center" }}>
                    ⚙️ Action{" "}
                    <a
                      onClick={refreshList}
                      style={{
                        color: "#1976d2",
                        textDecoration: "underline",
                        cursor: "pointer",
                        marginLeft: "8px",
                        fontSize: "14px",
                      }}
                    >
                      Refresh
                    </a>
                  </th>
                </tr>
              </thead>
              <tbody id="fileTableBody">
                {files.map((file, index) => (
                  <tr key={index}>
                    <td style={{ width: "15%", textAlign: "left" }}>
                      {file.name}
                    </td>
                    <td style={{ width: "10%", textAlign: "left" }}>
                      {file.type}
                    </td>
                    <td style={{ width: "10%", textAlign: "left" }}>
                      {file.size}
                    </td>
                    <td style={{ width: "10%" }}>
                      <a
                        onClick={() => {
                          setPreviewFile(file);
                        }}
                        style={{
                          color: "#1976d2",
                          textDecoration: "underline",
                          cursor: "pointer",
                          marginLeft: "8px",
                          fontSize: "14px",
                        }}
                      >
                        View
                      </a>
                      <a
                        href={SERVICE_ENDPOINT + "/api/view/" + file.name}
                        style={{
                          color: "#1976d2",
                          textDecoration: "underline",
                          cursor: "pointer",
                          marginLeft: "8px",
                          fontSize: "14px",
                        }}
                        download
                      >
                        Download
                      </a>
                      <a
                        onClick={() => {
                          setDeleteAlert({ show: true, filename: file.name });
                        }}
                        style={{
                          color: "#1976d2",
                          textDecoration: "underline",
                          cursor: "pointer",
                          marginLeft: "8px",
                          fontSize: "14px",
                        }}
                      >
                        Remove
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Grid>
        </div>
      )}

      {prviewFile != null && (
        <ViewFile
          setPreviewFile={setPreviewFile}
          fileObject={prviewFile}
        ></ViewFile>
      )}

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
      <Dialog
        open={deleteAlert.show}
        onClose={() => handleDeleteAlertAction("CLOSE")}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Are your sure to delete?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            This action will delete the file perminantly! Are you sure to
            proceed?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleDeleteAlertAction("YES")}>Yes</Button>
          <Button onClick={() => handleDeleteAlertAction("NO")} autoFocus>
            No
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
