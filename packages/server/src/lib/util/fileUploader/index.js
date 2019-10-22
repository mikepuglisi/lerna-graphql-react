const { knex } = require("../../../database");
const config = require("config");
const moment = require("moment");
const path = require("path");
const makeDir = require("make-dir");
const fs = require("fs");
const fsPromises = fs.promises;
const sharp = require("sharp");
const Promise = require("bluebird");
const { parentDirectory } = config.imageUpload;

const getPublicPath = () => {
  const today = moment();
  return path
    .join("uploads", today.format("YYYY"), today.format("MM"))
    .replace(/\\/g, "/"); // Uploads should be in config, not hard coded.
};

const getFilePathData = async (filename, fileNamePrefix) => {
  try {
    const publicPath = getPublicPath();
    const fullUploadDirectory = await makeDir(
      path.resolve(parentDirectory, publicPath)
    );
    const fileNameParsed = path.parse(filename);
    const fileExtension = fileNameParsed.ext;
    let fileNameStub = `${fileNamePrefix}${fileNameParsed.name}`
      .replace(/[^a-zA-Z0-9-_.]/g, "")
      .toLowerCase();

    const existingFiles = await knex("siteFiles")
      .select("name")
      .where("path", `/${publicPath}/`)
      .andWhere("name", fileNameStub);

    if (existingFiles.length > 0) {
      fileNameStub = `${fileNameStub}-${new Date().getTime()}`;
    }
    const filePathStub = path.join(fullUploadDirectory, fileNameStub); //`${fullUploadDirectory}/${fileNameStub}`;
    // const rawPath = `${filePathStub}_raw${fileExtension}`;
    // const fullImagePath = `${filePathStub}${fileExtension}`;
    return {
      publicPath,
      filePathStub,
      fileNameStub,
      fileExtension
    };
  } catch (e) {
    console.log("getFilePath", e);
    throw e;
  }
};

const saveRawImage = async (uploadedFile, { filePathStub, fileExtension }) => {
  const { createReadStream, filename } = uploadedFile;
  const stream = createReadStream();
  const rawPath = `${filePathStub}_raw${fileExtension}`;
  return new Promise(async (resolve, reject) => {
    stream
      .on("error", error => {
        if (stream.truncated)
          // Delete the truncated file.
          fs.unlinkSync(rawPath);
        reject(error);
      })
      .pipe(fs.createWriteStream(rawPath))
      .on("error", error => reject(error))
      //.on("finish", () => resolve({ id, path }));
      .on("finish", () => {
        resolve(sharp(rawPath));
      });
  });
};

const saveFullImage = async (
  sharpRawImage,
  { filePathStub, fileExtension }
) => {
  try {
    const rawMetadata = await sharpRawImage.metadata();
    const fullImagePath = `${filePathStub}${fileExtension}`;
    if (rawMetadata.format === "jpeg" && rawMetadata.density > 72) {
      await sharpRawImage.jpeg({ quality: 70 }).toFile(fullImagePath);
    } else {
      await sharpRawImage.toFile(fullImagePath);
    }
    return fullImagePath;
  } catch (e) {
    console.log("saveFullImage", e);
    throw e;
  }
};

const saveResizedImages = async (
  fullImagePath,
  { fileExtension, filePathStub }
) => {
  try {
    const sizes = Object.entries(config.imageUpload.sizes);
    const fullImage = sharp(fullImagePath);
    const resized = await Promise.map(
      sizes,
      async ([key, value]) => {
        const resized = fullImage.resize(null, null, value);
        const { data, info } = await resized.toBuffer({
          resolveWithObject: true
        });
        const resizedImagePath = `${filePathStub}-${key}${fileExtension}`;
        await sharp(data).toFile(resizedImagePath);
        return {
          key,
          filePath: resizedImagePath,
          metadata: info
        };
      },
      { concurrency: 2 }
    ).catch(err => {
      console.log("errresize", err);
    });
    console.log("fullImagePath", fullImagePath);
    const fullImageMetadata = await sharp(fullImagePath).metadata();
    console.log("fullImageMeta", fullImageMetadata);
    return {
      full: {
        filePath: fullImagePath,
        metadata: fullImageMetadata
      },
      resized
    };
  } catch (e) {
    console.log("saveResizedImages", e);
    throw e;
  }
};

const insertSavedFiles = async (
  savedImageData,
  { publicPath, fileNameStub, fileExtension, title, description }
) => {
  try {
    const { full, resized } = savedImageData;
    const fileInsertData = {
      legacyUrl: "", //
      domain: config.imageUpload.baseUrl,
      path: `/${publicPath}/`,
      name: fileNameStub,
      extension: fileExtension,
      width: full.metadata.width,
      height: full.metadata.height,
      mimetype: `image/${full.metadata.format}`,
      title: title || fileNameStub,
      description: description || ""
    };
    const insertedFileData = await knex("siteFiles")
      .insert(fileInsertData)
      .returning("*");
    console.log("insertedFileData", insertedFileData);
    const siteFileId = insertedFileData[0].id;
    const resizedFileInsertData = resized.map(resizedData => {
      return {
        siteFileId,
        key: resizedData.key,
        extension: fileExtension,
        width: resizedData.metadata.width,
        height: resizedData.metadata.height,
        mimetype: `image/${resizedData.metadata.format}`
      };
    });
    await knex("siteFileVersions").insert(resizedFileInsertData);
    return insertedFileData[0];
  } catch (e) {
    console.log("insertSavedFiles", e);
    throw e;
  }
};

const insertFileTags = async (siteFileId, tagIds) => {
  const fileTagsToInsert = tagIds.map(tagId => {
    return {
      siteTagId: tagId,
      siteFileId
    };
  });
  return knex("siteTagFiles")
    .insert(fileTagsToInsert)
    .then(() => {
      return siteFileId;
    });
};

const insertFileInstance = async siteFileId => {
  try {
    const siteFileInstanceId = await knex("siteFileInstances")
      .insert({ siteFileId })
      .returning("id");

    return siteFileInstanceId;
  } catch (e) {
    console.log("insertFileInstance", e);
    throw e;
  }
};

const addFileToCollection = async (
  siteFileInstanceId,
  siteFileCollectionId
) => {
  // const siteFileId = await knex("siteFileInstances")
  //   .insert({ siteFileId })
  //   .returning("id");

  return knex("siteFileCollectionFileInstances").insert({
    siteFileCollectionId,
    siteFileInstanceId
  });
};

module.exports = async (
  file,
  { title, description, tagIds, fileNamePrefix = "", siteFileCollectionId }
) => {
  try {
    const uploadedFile = await file;
    const { createReadStream, filename, mimetype, encoding } = uploadedFile;
    const {
      publicPath,
      filePathStub,
      fileNameStub,
      fileExtension
    } = await getFilePathData(filename, fileNamePrefix);
    const sharpRawImage = await saveRawImage(uploadedFile, {
      filePathStub,
      fileExtension
    });
    const fullImagePath = await saveFullImage(sharpRawImage, {
      filePathStub,
      fileExtension
    });
    const savedImageData = await saveResizedImages(fullImagePath, {
      filePathStub,
      fileExtension
    });
    const insertedFileRecord = await insertSavedFiles(savedImageData, {
      publicPath,
      fileNameStub,
      fileExtension,
      title,
      description
    });
    const siteFileId = insertedFileRecord.id;
    console.log("tagIds", tagIds);
    console.log("siteFileId", siteFileId);
    if (tagIds) {
      await insertFileTags(siteFileId, tagIds);
    }
    const siteFileInstanceId = await insertFileInstance(siteFileId);

    if (siteFileCollectionId) {
      await addFileToCollection(siteFileInstanceId, siteFileCollectionId);
    }
    console.log("siteFileInstanceId", siteFileInstanceId);
    return insertedFileRecord;
  } catch (err) {
    console.log("UPLOAD ERROR", err);
    return err;
  }
};
