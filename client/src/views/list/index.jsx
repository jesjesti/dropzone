import { useState, useEffect } from "react";
import {
  getFilesList,
  deleteFile,
  convertFile,
  getAccesInfo,
} from "../../core/API";
import { Snackbar, Alert } from "@mui/material";
import ViewFile from "../preview/index";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import {
  useMediaQuery,
  useTheme,
  Button,
  Grid,
  Typography,
  Paper,
} from "@mui/material";

export default function ListFiles(props) {
  const [files, setFiles] = useState([]);
  const [prviewFile, setPreviewFile] = useState(null);
  const [deleteAlert, setDeleteAlert] = useState({ show: false, filename: "" });
  const [message, setMessage] = useState({
    messageText: "",
    messageType: "",
    show: false,
  });
  const [serviceEndPoint, setServiceEndPoint] = useState("");
  //const SERVICE_ENDPOINT = import.meta.env.VITE_SERVER_ENDPOINT;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    console.log("File fteching");
    getFileList();

    getAccesInfo()
      .then((res) => {
        setServiceEndPoint(res.data);
      })
      .catch((err) => {
        console.error("Error fetching access info:", err);
      });
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

  const convertFileToCompatibleFormat = (fileName) => {
    convertFile(fileName)
      .then((res) => {
        showMessage(
          "Conversion initiated, refresh list to see progress",
          "success"
        );
        getFileList();
      })
      .catch((err) => {
        console.error("Error while converting file:", err);
        showMessage(err.response.data.statusMessage, "error");
      });
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
              <Button
                variant="outlined"
                id="backHomeBtn"
                onClick={() => {
                  props.setActiveView("HOME");
                }}
              >
                Home
              </Button>
            </Grid>
            <Grid sx={{ xs: 4 }}></Grid>
          </Grid>

          <Grid container justifyContent="center" alignItems="center">
            {isMobile ? (
              <Grid container spacing={2} style={{ marginTop: "30px" }}>
                {files.map((file, index) => (
                  <Grid item xs={12} key={index}>
                    <Paper elevation={2} style={{ padding: "10px" }}>
                      <Typography
                        variant="subtitle2"
                        style={{
                          wordBreak: "break-word",
                          whiteSpace: "normal",
                        }}
                      >
                        📋 {file.name}
                      </Typography>
                      <Typography variant="body2">🔖 {file.type}</Typography>
                      <Typography variant="body2">📦 {file.size}</Typography>
                      <div style={{ marginTop: 8 }}>
                        <Button
                          variant="outlined"
                          onClick={() => setPreviewFile(file)}
                          style={{ marginLeft: 8, minWidth: 120, marginTop: 8 }}
                        >
                          View
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() =>
                            setDeleteAlert({ show: true, filename: file.name })
                          }
                          style={{ marginLeft: 8, minWidth: 120, marginTop: 8 }}
                        >
                          Remove
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() =>
                            convertFileToCompatibleFormat(file.name)
                          }
                          style={{ marginLeft: 8, minWidth: 120, marginTop: 8 }}
                        >
                          Convert
                        </Button>
                        <Button
                          variant="outlined"
                          component="a"
                          href={serviceEndPoint + "/api/view/" + file.name}
                          download
                          style={{ marginLeft: 8, minWidth: 120, marginTop: 8 }}
                        >
                          Download
                        </Button>
                      </div>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <table style={{ width: "100%", marginTop: "20px" }} border={1}>
                <thead>
                  <tr>
                    <th style={{ width: "20%", textAlign: "left" }}>
                      📋 File Name
                    </th>
                    <th style={{ width: "5%", textAlign: "left" }}>🔖 Type</th>
                    <th style={{ width: "5%", textAlign: "left" }}>📦 Size</th>
                    <th style={{ width: "10%", textAlign: "center" }}>
                      ⚙️ Action
                      <Button
                        style={{ marginLeft: "10px" }}
                        variant="outlined"
                        id="btnRefreshAll"
                        onClick={refreshList}
                      >
                        Refresh
                      </Button>
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
                        <Button
                          style={{
                            marginLeft: 8,
                            minWidth: 120,
                            marginTop: 8,
                          }}
                          variant="outlined"
                          id="btnRefreshAll"
                          onClick={() => {
                            setPreviewFile(file);
                          }}
                        >
                          View
                        </Button>
                        <Button
                          style={{ marginLeft: 8, minWidth: 120, marginTop: 8 }}
                          variant="outlined"
                          id="btnRefreshAll"
                          onClick={() => {
                            setDeleteAlert({ show: true, filename: file.name });
                          }}
                        >
                          Remove
                        </Button>
                        <Button
                          style={{ marginLeft: 8, minWidth: 120, marginTop: 8 }}
                          variant="outlined"
                          id="btnRefreshAll"
                          onClick={() => {
                            convertFileToCompatibleFormat(file.name);
                          }}
                        >
                          Convert
                        </Button>
                        <Button
                          variant="outlined"
                          component="a"
                          href={serviceEndPoint + "/api/view/" + file.name}
                          download
                          style={{ marginLeft: 8, minWidth: 120, marginTop: 8 }}
                        >
                          Download
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Grid>
        </div>
      )}

      {prviewFile != null && (
        <ViewFile
          setPreviewFile={setPreviewFile}
          fileObject={prviewFile}
          serviceEndPoint={serviceEndPoint}
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
