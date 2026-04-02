import { Request, Response } from 'express';
import { Category } from '../models/Category';
import { Product } from '../models/Product';

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching categories' });
  }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const categoryData = { ...req.body };
    if (req.file) {
      categoryData.image = req.file.path;
    }
    const category = new Category(categoryData);
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: 'Error creating category' });
  }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const categoryData = { ...req.body };
    if (req.file) {
      categoryData.image = req.file.path;
    }
    const category = await Category.findByIdAndUpdate(req.params.id, categoryData, { new: true });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: 'Error updating category' });
  }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await Category.findById(req.params.id);
    if (category) {
      // Check if products exist in category
      const productsCount = await Product.countDocuments({ category: category.name });
      if (productsCount > 0) {
        res.status(400).json({ message: 'Category contains products. Cannot delete.' });
        return;
      }
      await Category.findByIdAndDelete(req.params.id);
    }
    res.json({ message: 'Category removed' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting category' });
  }
};
