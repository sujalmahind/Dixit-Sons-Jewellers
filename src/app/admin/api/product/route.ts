import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/db/connection";
import Product from "@/models/Product";
import Category from "@/models/Category";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to extract public ID from Cloudinary URL
function getPublicIdFromUrl(url: string): string | null {
  try {
    const regex = /\/([^/]+\/[^/]+)(?:\.[^/.]+)?$/;
    const match = url.match(regex);
    return match && match[1] ? match[1] : null;
  } catch (error) {
    console.error("Error extracting public ID from URL:", error);
    return null;
  }
}

// GET: Fetch all products
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Fetch products and populate the category field
    const products = await Product.find({})
      .populate({
        path: "category",
        model: Category,
        select: "name",
      })
      .sort({ createdAt: -1 });

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products", details: (error as Error).message },
      { status: 500 },
    );
  }
}

// POST: Create a new product
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    const {
      name,
      description,
      price,
      discountPrice,
      images,
      category,
      inStock,
      featured,
      attributes,
      slug,
    } = body;

    // Basic validation
    if (
      !name ||
      !description ||
      !price ||
      !images ||
      images.length === 0 ||
      !category ||
      !slug
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields (name, description, price, images, category, slug)",
        },
        { status: 400 },
      );
    }

    // Validate category ID format
    if (!mongoose.Types.ObjectId.isValid(category)) {
      return NextResponse.json(
        { error: "Invalid category ID format" },
        { status: 400 },
      );
    }

    // Check if category exists
    const existingCategory = await Category.findById(category);
    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    // Check for duplicate slug
    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
      return NextResponse.json(
        { error: "Product with this slug already exists" },
        { status: 409 },
      );
    }

    // Create new product with proper data structure
    const newProduct = new Product({
      name,
      description,
      price: parseFloat(price),
      discountPrice: discountPrice ? parseFloat(discountPrice) : undefined,
      images,
      category,
      inStock: inStock ?? true,
      featured: featured ?? false,
      attributes: {
        material: attributes?.material || undefined,
        weight: attributes?.weight || undefined,
        dimensions: attributes?.dimensions || undefined,
        gemstone: attributes?.gemstone || undefined,
        purity: attributes?.purity || undefined,
      },
      slug,
    });

    await newProduct.save();

    return NextResponse.json(
      { message: "Product created successfully", product: newProduct },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating product:", error);
    // Handle potential validation errors from Mongoose
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Failed to create product", details: (error as Error).message },
      { status: 500 },
    );
  }
}

// DELETE: Delete a product by ID
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 },
      );
    }

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid product ID format" },
        { status: 400 },
      );
    }

    // Find the product first to get the image URLs
    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Delete images from Cloudinary if they exist
    if (product.images && product.images.length > 0) {
      for (const imageUrl of product.images) {
        try {
          const publicId = getPublicIdFromUrl(imageUrl);
          if (publicId) {
            console.log(
              "Attempting to delete Cloudinary image with public ID:",
              publicId,
            );
            const result = await cloudinary.uploader.destroy(publicId);
            console.log("Cloudinary delete result:", result);
          }
        } catch (cloudinaryError) {
          // Log error but continue with deletion
          console.error(
            "Error deleting image from Cloudinary:",
            cloudinaryError,
          );
        }
      }
    }

    // Delete the product from the database
    await Product.findByIdAndDelete(id);

    return NextResponse.json(
      {
        message: "Product and associated images deleted successfully",
        productId: id,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product", details: (error as Error).message },
      { status: 500 },
    );
  }
}
