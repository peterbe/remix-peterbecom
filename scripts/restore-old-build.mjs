import fs from "fs";
import path from "path";

function copyDirectory(src, dest) {
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest);
  }

  // Read the contents of the source directory
  const files = fs.readdirSync(src);

  // Iterate through each file in the source directory
  files.forEach((file) => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);

    // Check if the current item is a directory
    if (fs.statSync(srcPath).isDirectory()) {
      // If it is a directory, recursively copy its contents
      copyDirectory(srcPath, destPath);
    } else if (fs.existsSync(destPath)) {
      // If it is a file, copy the file to the destination
      fs.copyFileSync(srcPath, destPath);
      const ageSeconds =
        (new Date().getTime() - fs.statSync(srcPath).mtimeMs) / 1000;
      console.log(
        "COPY",
        srcPath,
        "-->",
        destPath,
        ageSeconds / 60,
        "minutes old"
      );
    }
  });
}

const ROOT = "/tmp/_old_build";
const DESTINATION = "public/build";

copyDirectory(ROOT, DESTINATION);
