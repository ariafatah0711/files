import { apiDomain } from "../config";
const BASE_URL = `${apiDomain}/api/v1`;

export async function fetchRepos() {
  try {
    const response = await fetch(`${BASE_URL}/repo?action=fetchRepos`);
    if (response.ok) {
      const repos = await response.json();
      console.log("Repositories:", repos); // Log the entire response data
      return repos; // Make sure you return the actual data, not the response object
    } else {
      console.error("Error fetching repositories");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// Create a Repository
export async function createRepoAPI(repoName) {
  try {
    const response = await fetch(`${BASE_URL}/repo?action=createRepo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ repoName }),
    });

    if (response.ok) {
      const repo = await response.json();
      console.log("Repository created:", repo);
      return response;
    } else {
      console.error("Error creating repository");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// Delete a Repository
export async function deleteRepoAPI(repoName) {
  try {
    const response = await fetch(`${BASE_URL}/repo?action=deleteRepo`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ repoName }),
    });

    if (response.ok) {
      console.log("Repository deleted successfully");
      return response;
    } else {
      console.error("Error deleting repository");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// Fetch Repository Contents
export async function fetchRepoContents(repoName, path = "") {
  try {
    console.log(`fetch: ${BASE_URL}/repo?action=fetchRepoContents&repoName=${repoName}&path=${path}`);
    const response = await fetch(`${BASE_URL}/repo?action=fetchRepoContents&repoName=${repoName}&path=${path}`);
    if (response.ok) {
      const data = await response.json();

      if (!Array.isArray(data)) {
        console.error(`Failed to fetch repo contents: ${data.message || "Unknown error"}`);
        return [];
      }

      return data;
    } else {
      console.error("Error fetching repository contents");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// Upload a File to a Repository
export async function uploadFile(repoName, path, file) {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("repoName", repoName);
    formData.append("path", path);
    console.log(formData);

    const response = await fetch(`${BASE_URL}/repo?action=uploadFile`, {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      console.log("File uploaded successfully");
      // return response.json();
      return response;
    } else {
      console.error("Error uploading file");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// Delete a File from a Repository
export async function deleteFileOrFolder(repoName, path) {
  try {
    const response = await fetch(`${BASE_URL}/repo?action=deleteFile`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ repoName, path }),
    });

    if (response.ok) {
      console.log("File deleted successfully");
      return response.json();
    } else {
      console.error("Error deleting file");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}
