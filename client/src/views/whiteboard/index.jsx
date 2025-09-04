import { useState, useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { getWhiteBoardContent, saveWhiteBoardContent } from "../../core/API";

export default function Whiteboard() {
  const [content, setContent] = useState("");
  const [clearAlert, setClearAlert] = useState(false);
  const [connected, setConnected] = useState(false);
  const eventSourceRef = useRef(null);

  const connect = () => {
    if (eventSourceRef.current) return; // already connected
    const es = new EventSource("/api/whiteboard/events");

    es.addEventListener("CONTENT_UPDATE_NOTIFICATION", () => {
      console.log("Content update notification received");
      fetchContent();
    });

    es.onerror = () => {
      console.error("EventSource error");
      es.close();
      eventSourceRef.current = null;
      setConnected(false);
    };

    es.onopen = () => {
      console.log("Connected to SSE");
      setConnected(true);
    };

    eventSourceRef.current = es;
  };

  const disconnect = () => {
    if (eventSourceRef.current) {
      console.log("Disconnecting from SSE...");
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setConnected(false);
    }
  };

  useEffect(() => {
    fetchContent();
    connect(); // auto connect when component mounts
    return () => disconnect(); // auto cleanup
  }, []);

  const fetchContent = async () => {
    getWhiteBoardContent()
      .then((res) => {
        setContent(res.data);
      })
      .catch((err) => {
        console.error("Error fetching white board content:", err);
      });
  };

  const handleClearAlertAction = (type) => {
    if (type == "YES") {
      setContent("");
    }
    setClearAlert(false);
  };

  const saveContent = () => {
    const formData = new FormData();
    formData.append("content", content);
    saveWhiteBoardContent(formData)
      .then((res) => {
        console.log("White board content saved successfully");
      })
      .catch((err) => {
        console.error("Error saving white board content:", err);
      });
  };

  return (
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
      {/* Dropzone Row */}
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        sx={{ minHeight: "40vh" }}
      >
        <Box
          sx={{
            mt: 8,
            width: "100%",
            maxWidth: 900,
            bgcolor: "#fff",
            borderRadius: 2,
            boxShadow: 2,
            p: 2,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <TextField
            id="whiteBoardText"
            label="Type here..."
            multiline
            rows={20}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            sx={{
              width: "100%",
              bgcolor: "#fff",
              borderRadius: 1,
              flexGrow: 1,
              resize: "none",
            }}
          />
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 2,
              mt: 2,
            }}
          >
            <h3>
              Content sharing network connection:{" "}
              {connected ? "🟢 Active" : "🔴 Disconnected"}
            </h3>
            <Button variant="outlined" onClick={() => setClearAlert(true)}>
              Clear
            </Button>
            <Button variant="contained" onClick={saveContent}>
              Save
            </Button>
          </Box>
        </Box>
      </Grid>
      <Dialog
        open={clearAlert}
        onClose={() => handleClearAlertAction("CLOSE")}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Are your sure to clear editor contents?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            This action will delete the content in the editor perminantly! Are
            you sure to proceed?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => handleClearAlertAction("YES")}
            variant="contained"
          >
            Yes
          </Button>
          <Button
            onClick={() => handleClearAlertAction("NO")}
            variant="contained"
            autoFocus
          >
            No
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
