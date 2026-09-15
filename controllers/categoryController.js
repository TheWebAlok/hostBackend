const Category = require("../models/Category");

// ======================================================
// CREATE CATEGORY
// ======================================================

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private

exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create({
      ...req.body,
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    console.error("CREATE CATEGORY ERROR:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


// ======================================================
// GET ALL CATEGORIES
// ======================================================

// @desc    Get all categories
// @route   GET /api/categories
// @access  Private

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    console.error("GET CATEGORIES ERROR:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


// ======================================================
// GET SINGLE CATEGORY
// ======================================================

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Private

exports.getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("GET CATEGORY ERROR:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


// ======================================================
// UPDATE CATEGORY
// ======================================================

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private

exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    console.error("UPDATE CATEGORY ERROR:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


// ======================================================
// DELETE CATEGORY
// ======================================================

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(
      req.params.id
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      data: {},
    });
  } catch (error) {
    console.error("DELETE CATEGORY ERROR:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};