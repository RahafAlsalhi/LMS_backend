import * as ModuleModel from "../models/module.model.js";
import { createResponse } from "../utils/helper.js";

// Create module
export async function createModule(req, res) {
  try {
    const module = await ModuleModel.createModule(req.body);
    if (module !== null) {
      return res
        .status(200)
        .json(createResponse(true, "Module Created Successfully", module));
    }
    return res
      .status(400)
      .json(createResponse(false, "Cannot create the module"));
  } catch (err) {
    return res
      .status(500)
      .json(createResponse(false, "Server error", null, err.message));
  }
}

// Update module
export async function updateModule(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json(createResponse(false, "Invalid module ID"));
  }
  try {
    const module = await ModuleModel.updateModule({ ...req.body, id });
    if (module !== null) {
      return res
        .status(200)
        .json(createResponse(true, "Module updated successfully", module));
    }
    return res
      .status(404)
      .json(
        createResponse(false, "Module not found", null, "Module does not exist")
      );
  } catch (err) {
    return res
      .status(500)
      .json(createResponse(false, "Server error", null, err.message));
  }
}

// Delete module
export async function deleteModule(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json(createResponse(false, "Invalid module ID"));
  }
  try {
    const deleted = await ModuleModel.deleteModule(id);
    if (deleted) {
      return res
        .status(200)
        .json(createResponse(true, "Module deleted successfully"));
    }
    return res
      .status(404)
      .json(
        createResponse(false, "Module not found", null, "Module does not exist")
      );
  } catch (err) {
    return res
      .status(500)
      .json(createResponse(false, "Server error", null, err.message));
  }
}

// Get all modules for a course
export async function getModulesByCourse(req, res) {
  const course_id = Number(req.params.course_id);
  if (!Number.isInteger(course_id)) {
    return res.status(400).json(createResponse(false, "Invalid course ID"));
  }
  try {
    const modules = await ModuleModel.getModulesByCourse(course_id);
    return res
      .status(200)
      .json(createResponse(true, "Modules fetched successfully", modules));
  } catch (err) {
    return res
      .status(500)
      .json(createResponse(false, "Server error", null, err.message));
  }
}

// Get module by id
export async function getModuleById(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json(createResponse(false, "Invalid module ID"));
  }
  try {
    const module = await ModuleModel.getModuleById(id);
    if (module) {
      return res
        .status(200)
        .json(createResponse(true, "Module fetched successfully", module));
    }
    return res
      .status(404)
      .json(
        createResponse(false, "Module not found", null, "Module does not exist")
      );
  } catch (err) {
    return res
      .status(500)
      .json(createResponse(false, "Server error", null, err.message));
  }
}
