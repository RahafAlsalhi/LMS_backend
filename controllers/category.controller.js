import * as CategoryModel from "../models/category.model.js";
import { createResponse } from "../utils/createResponse.js";

// Create category
export async function createCategory(req, res) {
  try {
    const { name } = req.body;
    if (!name || typeof name !== "string") {
      return res
        .status(400)
        .json(createResponse(false, "Invalid category name"));
    }

    const category = await CategoryModel.createCategory(name);
    if (category) {
      return res
        .status(201)
        .json(createResponse(true, "Category created successfully", category));
    }
    return res
      .status(400)
      .json(createResponse(false, "Category creation failed"));
  } catch (err) {
    return res
      .status(500)
      .json(createResponse(false, "Server error", null, err.message));
  }
}

// Update category
export async function updateCategory(req, res) {
  const id = Number(req.params.id);
  const { name } = req.body;

  if (!Number.isInteger(id) || !name || typeof name !== "string") {
    return res.status(400).json(createResponse(false, "Invalid input"));
  }

  try {
    const updated = await CategoryModel.updateCategory({ id, name });
    if (updated) {
      return res
        .status(200)
        .json(createResponse(true, "Category updated successfully", updated));
    }
    return res.status(404).json(createResponse(false, "Category not found"));
  } catch (err) {
    return res
      .status(500)
      .json(createResponse(false, "Server error", null, err.message));
  }
}

// Delete category
export async function deleteCategory(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json(createResponse(false, "Invalid category ID"));
  }

  try {
    const deleted = await CategoryModel.deleteCategory(id);
    if (deleted) {
      return res
        .status(200)
        .json(createResponse(true, "Category deleted successfully"));
    }
    return res.status(404).json(createResponse(false, "Category not found"));
  } catch (err) {
    return res
      .status(500)
      .json(createResponse(false, "Server error", null, err.message));
  }
}

// Get all categories
export async function getAllCategories(req, res) {
  try {
    const categories = await CategoryModel.getAllCategories();
    return res
      .status(200)
      .json(
        createResponse(true, "Categories fetched successfully", categories)
      );
  } catch (err) {
    return res
      .status(500)
      .json(createResponse(false, "Server error", null, err.message));
  }
}

// Get category by ID
export async function getCategoryById(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json(createResponse(false, "Invalid category ID"));
  }

  try {
    const category = await CategoryModel.getCategoryById(id);
    if (category) {
      return res
        .status(200)
        .json(createResponse(true, "Category fetched successfully", category));
    }
    return res.status(404).json(createResponse(false, "Category not found"));
  } catch (err) {
    return res
      .status(500)
      .json(createResponse(false, "Server error", null, err.message));
  }
}
