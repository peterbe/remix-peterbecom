import { join, relative } from "path";
import { readFileSync, readdirSync, statSync } from "fs";

const [dir1, dir2] = process.argv.slice(2);
main(dir1, dir2);

function main(dir1, dir2) {
  const totalSize1 = getTotalSize(dir1);
  const totalSize2 = getTotalSize(dir2);
  console.log(`Total size of ${dir1}: ${formatFilSize(totalSize1)}`);
  console.log(`Total size of ${dir2}: ${formatFilSize(totalSize2)}`);
  const totalDifference = totalSize1 - totalSize2;
  console.log(`\n**Difference: ${formatFilSize(totalDifference)}**\n`);
  if (!totalDifference) {
    // console.log("The directories have the same size.");
    return;
  }
  const tuples = getTuples(dir1, dir2);
  const notables = tuples.filter(({ before, after }) => before !== after);
  if (notables.length) {
    console.log("Notable changes...");
  }
  for (const { path, before, after } of notables.sort(
    (a, b) => b.before - a.before
  )) {
    const sizeDifference = after - before;
    console.log(
      ` - \`${relative(dir1, path)}\`: ${formatFilSize(before)} -> ${formatFilSize(after)} (${formatFilSize(sizeDifference)})`
    );
  }
  // console.log(tuples);
}

function getSizes(dir) {
  const sizes = {};
  const ents = readdirSync(dir, { withFileTypes: true });
  for (const ent of ents) {
    if (ent.isDirectory()) {
      Object.assign(sizes, getSizes(join(dir, ent.name)));
    } else {
      const { size } = statSync(join(dir, ent.name));
      sizes[normalizeName(join(dir, ent.name))] = size;
      // totalSize += size;
    }
  }
  return sizes;
}
function getTuples(baseDir, otherDir) {
  const baseSizes = getSizes(baseDir);
  const otherSizes = getSizes(otherDir);
  const tuples = [];
  for (const [path, before] of Object.entries(baseSizes)) {
    const after = otherSizes[path] || 0;
    tuples.push({
      path,
      before,
      after,
    });
  }

  return tuples;
}

function normalizeName(name) {
  return name.replace(/-[A-Z0-9]{8}\./, ".");
}

function formatFilSize(size) {
  const units = ["B", "KB", "MB", "GB"];
  let unitIndex = 0;
  while (size > 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

function getTotalSize(dir) {
  let totalSize = 0;
  const ents = readdirSync(dir, { withFileTypes: true });
  for (const ent of ents) {
    if (ent.isDirectory()) {
      totalSize += getTotalSize(join(dir, ent.name));
    } else {
      const { size } = statSync(join(dir, ent.name));
      totalSize += size;
    }
  }
  return totalSize;
}
