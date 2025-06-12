import * as ReportModel from "../models/reports.model.js";
import { createResponse } from "../utils/helper.js";

export async function getUserActivityReport(req, res) {
  try {
    const report = await ReportModel.getUserActivityReport();
    return res
      .status(200)
      .json(createResponse(true, "User activity report generated", report));
  } catch (err) {
    return res
      .status(500)
      .json(createResponse(false, "Server error", null, err.message));
  }
}

export async function getCoursePopularityReport(req, res) {
  try {
    const report = await ReportModel.getCoursePopularityReport();
    return res
      .status(200)
      .json(createResponse(true, "Course popularity report generated", report));
  } catch (err) {
    return res
      .status(500)
      .json(createResponse(false, "Server error", null, err.message));
  }
}

export async function getEnrollmentStats(req, res) {
  try {
    const stats = await ReportModel.getEnrollmentStats();
    return res
      .status(200)
      .json(createResponse(true, "Enrollment statistics generated", stats));
  } catch (err) {
    return res
      .status(500)
      .json(createResponse(false, "Server error", null, err.message));
  }
}

export async function getCategoryStats(req, res) {
  try {
    const stats = await ReportModel.getCategoryStats();
    return res
      .status(200)
      .json(createResponse(true, "Category statistics generated", stats));
  } catch (err) {
    return res
      .status(500)
      .json(createResponse(false, "Server error", null, err.message));
  }
}
