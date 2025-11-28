import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connection";
import Category, { CategoryDocument } from "@/models/Category";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Improved helper function to extract public ID from Cloudinary URL for next-cloudinary
function getPublicIdFromUrl(url: string): string | null {
  try {
    // Extract the public ID from the URL
    const regex = /\/([^/]+\/[^/]+)(?:\.[^/.]+)?$/;
    const match = url.match(regex);

    if (match && match[1]) {
      // Return the matched public ID without file extension
      return match[1];
    }
    return null;
  } catch (error) {
    console.error("Error extracting public ID from URL:", error);
    return null;
  }
}

// POST handler to create a new category
export async function POST(request: Request) {
  try {
    const body = await request.json();

    await dbConnect();

    const collision = await Category.findOne({ slug: body.slug });

    if (collision) {
      return NextResponse.json(
        { error: "Category with this slug already exists" },
        { status: 409 },
      );
    }

    const newCategory = await Category.create(body);

    return NextResponse.json(
      { message: "Category created successfully", category: newCategory },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 },
    );
  }
}

// POST handler to update a category
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    await dbConnect();

    const oldCategory: CategoryDocument | null = await Category.findOne({
      _id: body.id,
    });

    if (oldCategory) {
      // Only update allowed fields on CategoryDocument that exist in body
      const allowedFields = ["name", "description", "image", "slug"];

      allowedFields.forEach((field) => {
        if (field in body) {
          // Use type assertion to safely set properties
          (oldCategory as any)[field] = body[field];
        }
      });

      await oldCategory.save();

      return NextResponse.json(
        { message: "Category updated successfully", category: oldCategory },
        { status: 200 },
      );
    } else {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 },
    );
  }
}

// DELETE handler to remove a category
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 },
      );
    }

    await dbConnect();

    // Find the category first to get the image URL
    const category = await Category.findById(id);

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    // Try to delete the image from Cloudinary if it exists
    if (category.image) {
      try {
        const publicId = getPublicIdFromUrl(category.image);
        if (publicId) {
          // Log the publicId for debugging
          console.log(
            "Attempting to delete Cloudinary image with public ID:",
            publicId,
          );

          // Delete the image from Cloudinary using their SDK
          const result = await cloudinary.uploader.destroy(publicId);

          console.log("Cloudinary delete result:", result);

          // Check if deletion was successful
          if (result.result !== "ok") {
            console.warn(
              `Image deletion from Cloudinary returned: ${result.result}`,
            );
          }
        } else {
          console.warn(
            "Could not extract public ID from image URL:",
            category.image,
          );
        }
      } catch (cloudinaryError) {
        // Log error but don't stop the category deletion
        console.error("Error deleting image from Cloudinary:", cloudinaryError);
      }
    }

    // Now delete the category from the database
    const deletedCategory = await Category.findByIdAndDelete(id);

    return NextResponse.json(
      { message: "Category and associated image deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 },
    );
  }
}
