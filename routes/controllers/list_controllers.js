const { dynamodb } = require("../../db/db");

const LIST_TABLE = "pinterest-lists";
const IMAGE_TABLE = "pinterest-images";

const getList = async (list_name) => {
  const db_params = { TableName: LIST_TABLE, Key: { list_name: list_name } };
  try {
    const data = await dynamodb.get(db_params).promise();
    return data.Item
      ? { list: data.Item, existing_images: data.Item.images }
      : { list: null, existing_images: [] };
  } catch (error) {
    console.error("Error getting favorite images:", error);
    throw error;
  }
};

const imageExists = async (image_id) => {
  const db_params = { TableName: IMAGE_TABLE, Key: { image_id: image_id } };
  try {
    const { Item } = await dynamodb.get(db_params).promise();
    return Item ? true : false;
  } catch (error) {
    console.error("Error getting image by id:", error);
    throw error;
  }
};

const getAllLists = async (req, res) => {
  const db_params = { TableName: LIST_TABLE };
  const lists = await dynamodb.scan(db_params).promise();
  res.status(200).json(lists);
};

const getListById = async (req, res) => {
  const { list_name } = req.params;
  try {
    const { list } = await getList(list_name);
    if (!list) {
      res.status(404).json({ message: "List not found" });
      return;
    }
    res.status(200).json(list);
  } catch (error) {
    console.error("Error getting list:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const addToList = async (req, res) => {
  try {
    const { image_id, list_name } = req.body;
    const image_exists = await imageExists(image_id);
    if (!image_exists) {
      res.status(404).json({ message: "Image not found" });
      return;
    }
    const { list, existing_images } = await getList(list_name);
    let flag = 0;
    if (list && existing_images.length > 0) {
      if (req.user.user_id !== list.user_id) {
        res.status(405).json({ message: "Not Allowed to Update this List" });
        return;
      }
      if (existing_images.includes(image_id)) {
        res.status(409).json({ message: "Image already in the list" });
        return;
      }
      flag = 1;
    }
    const list_images = [...existing_images, image_id];
    const db_params = {
      TableName: LIST_TABLE,
      Item: {
        list_name: list_name,
        user_id: req.user.user_id,
        images: list_images,
      },
    };
    await dynamodb.put(db_params).promise();
    res
      .status(201)
      .json({ message: "Image added to the list successfully", flag: flag });
  } catch (error) {
    console.error("Error adding image to the list:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteFromList = async (req, res) => {
  try {
    const { image_id, list_name } = req.body;
    const { list, existing_images } = await getList(list_name);
    if (!list) {
      res.status(404).json({ message: "List not found" });
      return;
    }
    if (req.user.user_id !== list.user_id) {
      res
        .status(405)
        .json({ message: "Not Allowed to Delete Image from this List" });
      return;
    }
    if (!existing_images.includes(image_id)) {
      res.status(404).json({ message: "Image not found in the list" });
      return;
    }
    const updated_images = existing_images.filter(
      (image) => image !== image_id
    );
    const db_params = {
      TableName: LIST_TABLE,
      Item: {
        list_name: list_name,
        user_id: req.user.user_id,
        images: updated_images,
      },
    };
    const updated = await dynamodb.put(db_params).promise();
    res.status(200).json({
      message: "Image removed from the list successfully",
    });
  } catch (error) {
    console.error("Error deleting image from the list:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteList = async (req, res) => {
  try {
    const { list_name } = req.params;
    const { list } = await getList(list_name);
    if (!list) {
      res.status(404).json({ message: "List not found" });
      return;
    }
    if (req.user.user_id !== list.user_id) {
      res.status(405).json({ message: "Not Allowed to Delete List" });
      return;
    }
    const db_params = {
      TableName: LIST_TABLE,
      Key: {
        list_name: list_name,
      },
    };
    await dynamodb.delete(db_params).promise();
    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  addToList,
  getAllLists,
  getListById,
  deleteFromList,
  deleteList,
};
