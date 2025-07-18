const username = "arialinux";
const token = process.env.VITE_TOKEN;

import formidable from "formidable";
import fs from "fs/promises";
import FormData from "form-data";
import fetch from "node-fetch"; // Pastikan Anda menginstal node-fetch

export default async function uploadFileToGitHub(repoName, path, fileData, fileName) {
  try {
    const formData = new FormData();
    formData.append("message", `Upload ${fileName}`);
    formData.append("content", fileData);
    formData.append("branch", "main");

    const url = `https://api.github.com/repos/${username}/${repoName}/contents/${path}/${fileName}`;

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        // header content type formData, akan di generete otomatis oleh form-data.
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload ${fileName}: ${response.statusText}`);
    }

    console.log(`Uploaded ${fileName} to ${repoName}/${path}`);
    return;
  } catch (error) {
    console.error(`Error uploading ${fileName} to ${repoName}/${path}:`, error);
    throw error;
  }
}
