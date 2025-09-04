import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

export default function Whiteboard() {
  const [text, setText] = useState("");
  const [clearAlert, setClearAlert] = useState(false);

  const handleClearAlertAction = (type) => {
    if (type == "YES") {
      setText("");
    }
    setClearAlert(false);
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
            value={text}
            onChange={(e) => setText(e.target.value)}
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
            <Button variant="outlined" onClick={() => setClearAlert(true)}>
              Clear
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                // Save logic here
              }}
            >
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
