import { join, relative } from "path";
import { readdirSync, statSync } from "fs";

const [dir1, dir2] = process.argv.slice(2);
main(dir1, dir2);

function main(dir1, dir2) {
  const totalSize1 = getTotalSize(dir1);
  const totalSize2 = getTotalSize(dir2);
  console.log(`Total size of ${dir1}: ${formatFilSize(totalSize1)}`);
  console.log(`Total size of ${dir2}: ${formatFilSize(totalSize2)}`);
  const totalDifference = totalSize2 - totalSize1;
  console.log(`\n**Difference: ${formatFilSize(totalDifference)}**\n`);
  if (!totalDifference) {
    return;
  }
  const tuples = getTuples(dir1, dir2);
  const notables = tuples.filter(({ before, after }) => before !== after);
  if (notables.length) {
    console.log("Notable changes...");
  }
  for (const { path, before, after, isNew } of notables.sort(
    (a, b) => b.before - a.before
  )) {
    if (isNew) {
    }
    const sizeDifference = after - before;
    console.log(
      ` - \`${path}\`: ${formatFilSize(before)} -> ${formatFilSize(after)} (${formatFilSize(sizeDifference)}) (${isNew ? "new" : "changed"})`
    );
  }
}

function getSizes(dir) {
  const sizes = {};
  const ents = readdirSync(dir, { withFileTypes: true });
  for (const ent of ents) {
    if (ent.isDirectory()) {
      Object.assign(sizes, getSizes(join(dir, ent.name)));
    } else {
      // Too weird to compare! Skip.
      if (/chunk-[A-Z0-9]{8}\./.test(ent.name)) {
        continue;
      }
      const { size } = statSync(join(dir, ent.name));
      sizes[normalizeName(join(dir, ent.name))] = size;
    }
  }
  return sizes;
}
function getTuples(baseDir, otherDir) {
  const baseSizes = Object.fromEntries(
    Object.entries(getSizes(baseDir)).map(([path, size]) => [
      relative(baseDir, path),
      size,
    ])
  );
  const otherSizes = Object.fromEntries(
    Object.entries(getSizes(otherDir)).map(([path, size]) => [
      relative(otherDir, path),
      size,
    ])
  );
  const tuples = [];
  for (const [path, before] of Object.entries(baseSizes)) {
    const after = otherSizes[path] || 0;
    tuples.push({
      path,
      before,
      after,
      isNew: !(path in otherSizes),
    });
  }

  return tuples;
}

function normalizeName(name) {
  return name.replace(/-[A-Z0-9]{8}\./, ".");
}

function formatFilSize(size) {
  const negative = size < 0;
  size = Math.abs(size);
  const units = ["B", "KB", "MB", "GB"];
  let unitIndex = 0;
  while (size > 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${negative ? "-" : ""}${size.toFixed(2)} ${units[unitIndex]}`;
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
