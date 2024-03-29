const { dynamodb, s3 } = require("../../db/db");
const { v4: uuidv4 } = require("uuid");

const IMAGE_TABLE = "pinterest-images";

const addImage = async (req, res) => {
  const { image_name, tags } = req.body;
  const tagsArray =
    typeof tags === "string" ? tags.toLowerCase().split(",") : tags;
  const s3_params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${Date.now()}-${image_name}`,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
    ACL: "public-read",
  };
  try {
    const data = await s3.upload(s3_params).promise();
    const db_params = {
      TableName: IMAGE_TABLE,
      Item: {
        image_id: uuidv4(),
        name: image_name,
        location: data.Location,
        image_key: data.Key,
        uploadedBy: req.user.user_id,
        uploadedAt: Date.now(),
        tags: tagsArray,
      },
    };
    const img = db_params.Item.image_id;
    await dynamodb.put(db_params).promise();
    res.status(201).json({ message: "Image uploaded", image_id: img });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getImages = async (req, res) => {
  const db_params = {
    TableName: IMAGE_TABLE,
  };
  const { tags } = req.query;
  try {
    const { Items } = await dynamodb.scan(db_params).promise();
    let images = Items;
    if (tags) {
      const filteredImages = Items.filter((img) => {
        return tags.every((tag) => img.tags.includes(tag.toLowerCase()));
      });
      images = filteredImages;
    }
    res.status(200).json({ images: images });
  } catch (error) {
    console.error("Error fetching images by tags:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getImageById = async (req, res) => {
  const { image_id } = req.params;
  const db_params = {
    TableName: IMAGE_TABLE,
    Key: {
      image_id: image_id,
    },
  };
  try {
    const { Item } = await dynamodb.get(db_params).promise();
    if (!Item) {
      res.status(404).json({ message: "Image not found" });
      return;
    }
    res.status(200).json({ image: Item });
  } catch (error) {
    console.error("Error getting image:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteImage = async (req, res) => {
  const image_id = req.params.image_id;
  const db_params = {
    TableName: IMAGE_TABLE,
    Key: {
      image_id: image_id,
    },
  };
  try {
    const { Item } = await dynamodb.get(db_params).promise();
    if (!Item) {
      res.status(404).json({ message: "Image not found" });
      return;
    }
    if (req.user.user_id !== Item.uploadedBy) {
      res.status(405).json({ message: "Not Allowed to Delete This Image" });
      return;
    }
    const s3_params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: Item.image_key,
    };
    await s3.deleteObject(s3_params).promise();
    await dynamodb.delete(db_params).promise();
    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  addImage,
  getImages,
  deleteImage,
  getImageById,
};
