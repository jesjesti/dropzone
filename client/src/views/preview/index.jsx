import Grid from "@mui/material/Grid";

export default function ViewFile(props) {
  const renderPreview = (fileObject) => {
    if (fileObject == null) {
      return <div>No file found for display</div>;
    } else {
      const fileUrl = `${props.serviceEndPoint}/api/view/${fileObject.name}`;

      const mediaStyle = {
        width: "100%",
        maxWidth: "100%",
        maxHeight: "80vh", // Keeps it inside viewport height
        objectFit: "contain",
        border: "1px solid #ccc",
        borderRadius: "8px",
        marginBottom: "1rem",
      };

      if (fileObject.type.startsWith("image")) {
        return <img src={fileUrl} alt={fileObject.name} style={mediaStyle} />;
      }

      if (fileObject.type.startsWith("video")) {
        return <video src={fileUrl} controls style={mediaStyle} />;
      }

      if (fileObject.type.startsWith("audio")) {
        return <audio src={fileUrl} controls style={mediaStyle} />;
      }

      if (fileObject.type === "pdf" || fileObject.type === "application/pdf") {
        return (
          <iframe
            src={fileUrl}
            title={fileObject.name}
            width="100%"
            height="100%"
            style={mediaStyle}
          />
        );
      }

      return (
        <div>
          Preview is not available for this file!
          <br /> <br />
          <a href={fileUrl} download>
            ⬇️ Download {fileObject.name}
          </a>
        </div>
      );
    }
  };
  return (
    <div>
      {" "}
      <Grid container>
        <Grid sx={{ xs: 4 }}></Grid>
        <Grid sx={{ xs: 4 }}>
          <button
            id="backHomeBtn"
            onClick={() => {
              props.setPreviewFile(null);
            }}
          >
            Home
          </button>
        </Grid>
        <Grid sx={{ xs: 4 }}></Grid>
      </Grid>
      <br />
      <br />
      <br />
      {renderPreview(props.fileObject)}
    </div>
  );
}
