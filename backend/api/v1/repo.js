// import { fetchRepos, createRepoAPI, deleteRepoAPI, fetchRepoContents, uploadFile, deleteFileOrFolder } from "../handlers/api.js"; // Adjusted import

// export default async function handler(req, res) {
//   try {
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
//     res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

//     if (req.method === "GET" && req.query.action === "fetchRepos") {
//       const repos = await fetchRepos();
//       return res.status(200).json(repos);
//     }

//     if (req.method === "OPTIONS") {
//       return res.status(204).end(); // Handle preflight requests
//     }

//     if (req.method === "POST" && req.query.action === "createRepo") {
//       const { repoName } = req.body;
//       const repo = await createRepoAPI(repoName);
//       return res.status(200).json(repo);
//     }

//     if (req.method === "DELETE" && req.query.action === "deleteRepo") {
//       const { repoName } = req.body;
//       await deleteRepoAPI(repoName);
//       return res.status(200).send("Repository deleted successfully");
//     }

//     // if (req.method === "GET" && req.query.action === "fetchRepoContents") {
//     //   const { repoName, path } = req.query;
//     //   const contents = await fetchRepoContents(repoName, path);s
//     //   return res.status(200).json(contents);
//     // }

//     if (req.method === "GET" && req.query.action === "fetchRepoContents") {
//       const { repoName, path } = req.query;

//       // Make sure repoName and path are properly logged and defined
//       if (!repoName) {
//         return res.status(400).json({ error: "Repo name is required" });
//       }

//       const contents = await fetchRepoContents(repoName, path);
//       if (!contents) {
//         return res.status(404).json({ error: "No contents found" });
//       }

//       return res.status(200).json(contents);
//     }

//     if (req.method === "POST" && req.query.action === "uploadFile") {
//       const { repoName, path, file } = req.body;
//       console.log(req);
//       await uploadFile(repoName, path, file);
//       return res.status(200).send("File uploaded successfully");
//     }

//     if (req.method === "DELETE" && req.query.action === "deleteFile") {
//       const { repoName, path } = req.body;
//       await deleteFileOrFolder(repoName, path);
//       return res.status(200).send("File deleted successfully");
//     }

//     return res.status(400).json({ message: "Unknown action" });
//   } catch (error) {
//     console.error("API error:", error); // Log error for debugging
//     return res.status(500).json({ message: error.message });
//   }
// }

import { fetchRepos, createRepoAPI, deleteRepoAPI, fetchRepoContents, uploadFile, deleteFileOrFolder } from "./handlers/api.js"; // Adjusted import
import uploadFileToGitHub from "./handlers/upload.js";
// import formidable from "formidable";
import { IncomingForm } from "formidable";
import fs from "fs/promises";
import formidable from "formidable";

export default async function handler(req, res) {
  try {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "GET" && req.query.action === "fetchRepos") {
      const repos = await fetchRepos();
      return res.status(200).json(repos);
    }

    if (req.method === "OPTIONS") {
      return res.status(204).end(); // Handle preflight requests
    }

    if (req.method === "POST" && req.query.action === "createRepo") {
      const { repoName } = req.body;
      const repo = await createRepoAPI(repoName);
      return res.status(200).json(repo);
    }

    if (req.method === "DELETE" && req.query.action === "deleteRepo") {
      const { repoName } = req.body;
      await deleteRepoAPI(repoName);
      return res.status(200).json({ message: "Repository deleted successfully" });
    }

    if (req.method === "GET" && req.query.action === "fetchRepoContents") {
      const { repoName, path } = req.query;

      if (!repoName) {
        return res.status(400).json({ error: "Repo name is required" });
      }

      const contents = await fetchRepoContents(repoName, path);
      if (!contents) {
        return res.status(404).json({ error: "No contents found" });
      }

      return res.status(200).json(contents);
    }

    // if (req.method === "POST" && req.query.action === "uploadFile") {
    //   const { repoName, path, file } = req.body;
    //   console.log("req.body:", req.body); // Tambahkan log untuk debug

    //   try {
    //     await uploadFile(repoName, path, file);
    //     return res.status(200).json({ message: "File uploaded successfully" });
    //   } catch (uploadError) {
    //     console.error("Upload error:", uploadError);
    //     return res.status(500).json({ message: "Failed to upload file", error: uploadError.message });
    //   }
    // }

    if (req.method === "POST" && req.query.action === "uploadFile") {
      const form = new formidable.IncomingForm();
      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error("Error parsing form:", err);
          return res.status(500).json({ error: "Failed to parse form" });
        }

        console.log("Fields:", fields);
        console.log("Files:", files);

        const { repoName, path } = fields;
        const uploadedFile = files.file;

        if (!uploadedFile) {
          return res.status(400).json({ error: "No file uploaded" });
        }

        try {
          const fileContent = await fs.readFile(uploadedFile.filepath, "base64");
          await uploadFileToGitHub(repoName, path, fileContent, uploadedFile.originalFilename);
          return res.status(200).json({ message: "File uploaded successfully" });
        } catch (uploadError) {
          console.error("Upload error:", uploadError);
          return res.status(500).json({ error: "Failed to upload file" });
        }
      });
    }

    if (req.method === "DELETE" && req.query.action === "deleteFile") {
      // console.log(req.body);
      console.log("Method:", req.method);
      console.log("Headers:", JSON.stringify(req.headers));
      console.log("Body:", JSON.stringify(req.body));
      const { repoName, path } = req.body;
      await deleteFileOrFolder(repoName, path);
      return res.status(200).json({ message: "File deleted successfully" });
    }

    return res.status(400).json({ message: "Unknown action" });
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ message: error.message });
  }
}
