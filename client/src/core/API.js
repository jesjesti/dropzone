import axios from "axios";

export const getAccesInfo = async () => {
  try {
    const response = await axios.get("/api/access-info", {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getFilesList = async () => {
  try {
    const response = await axios.get("/api/list", {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const viewFile = async () => {
  try {
    const response = await axios.get("/api", {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const deleteFile = async (fileName) => {
  try {
    const response = await axios.delete("/api/delete?name=" + fileName, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const uploadFile = async (body) => {
  try {
    const response = await axios.post("/api/upload", body);
    return response.data;
  } catch (error) {
    throw error;
  }
};
