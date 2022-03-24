import axios from "axios";

export const uploadToIPFS = async (data) => {
  const formData = new FormData();
  formData.append('file', data);
  const response = await axios.post(
    "https://ipfs.infura.io:5001/api/v0/add",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return `https://ipfs.infura.io/ipfs/${response.data.Hash}`;
};
