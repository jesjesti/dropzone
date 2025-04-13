import "./index.css";
import { useState, useEffect } from "react";
import ListFiles from "../list/index";
import UploadFiles from "../upload/index";
import { getAccesInfo } from "../../core/API";
import { QRCodeCanvas } from "qrcode.react";

export default function App() {
  const [activeView, setActiveView] = useState("HOME");
  const [accessUrl, setAccessUrl] = useState("");

  useEffect(() => {
    getAccesInfo()
      .then((res) => {
        setAccessUrl(res.data);
      })
      .catch((err) => {
        console.error("Error fetching access info:", err);
      });
  }, []);

  return (
    <>
      {activeView === "HOME" && (
        <div>
          <h1>📂 Drop Zone</h1>

          <div>
            <button
              id="listBtn"
              onClick={() => {
                setActiveView("LIST");
              }}
            >
              📋 List Files
            </button>
            <span style={{ margin: "10px" }}></span>
            <button
              id="uploadBtn"
              onClick={() => {
                setActiveView("UPLOAD");
              }}
            >
              ⬆️ Upload files
            </button>
          </div>
          <br />
          <br />
          <QRCodeCanvas value={accessUrl} size={200} />
          <p>
            Please scan the QR above or use this URL
            <br />
            You must enable javascript in browser
            <br />
            {accessUrl}
          </p>
        </div>
      )}
      {activeView === "LIST" && <ListFiles setActiveView={setActiveView} />}
      {activeView === "UPLOAD" && <UploadFiles setActiveView={setActiveView} />}
    </>
  );
}
