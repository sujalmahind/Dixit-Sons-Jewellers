"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CldImage, CldUploadWidget } from "next-cloudinary";

// Interface for the Category data
interface Category {
  _id: string;
  name: string;
  description: string;
  image: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

// Interface for Cloudinary upload result
interface CloudinaryResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
}

export default function AdminCategoriesPage() {
  const router = useRouter();

  // State for form
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    slug: "",
  });

  // State for categories list
  const [categories, setCategories] = useState<Category[]>([]);

  // State for feedback messages
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  // Fetch all categories on page load
  useEffect(() => {
    fetchCategories();
  }, []);

  // Function to fetch all categories
  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setCategories(data.categories);
      } else {
        setMessage({
          text: data.error || "Failed to fetch categories",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setMessage({
        text: "An error occurred while fetching categories",
        type: "error",
      });
    }
  };

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto-generate slug from name if slug field is empty
    if (name === "name" && !formData.slug) {
      const slug = value.toLowerCase().replace(/\s+/g, "-");
      setFormData((prev) => ({
        ...prev,
        slug,
      }));
    }
  };

  // Handle Cloudinary upload success
  const handleUploadSuccess = (result: any) => {
    console.log("Upload successful:", result);

    // Cloudinary widget returns results in different formats
    // Extract the secure_url correctly based on the response structure
    const secureUrl = result.info?.secure_url || result.secure_url;

    if (secureUrl) {
      setFormData((prev) => ({
        ...prev,
        image: secureUrl,
      }));
      console.log("Image URL set to:", secureUrl);
      setMessage({ text: "Image uploaded successfully!", type: "success" });
    } else {
      console.error("Could not extract secure_url from upload result:", result);
      setMessage({
        text: "Image upload succeeded but URL not found",
        type: "error",
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await fetch("/admin/api/category", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ text: "Category created successfully!", type: "success" });
        // Reset form
        setFormData({
          name: "",
          description: "",
          image: "",
          slug: "",
        });
        // Refresh categories list
        fetchCategories();
      } else {
        setMessage({
          text: data.error || "Failed to create category",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error creating category:", error);
      setMessage({
        text: "An error occurred while creating the category",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle category deletion
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      const response = await fetch("/admin/api/category", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ text: "Category deleted successfully!", type: "success" });
        // Refresh categories list
        fetchCategories();
      } else {
        setMessage({
          text: data.error || "Failed to delete category",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      setMessage({
        text: "An error occurred while deleting the category",
        type: "error",
      });
    }
  };

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Manage Categories</h1>

      {/* Feedback message */}
      {message.text && (
        <div
          className={`mb-6 rounded p-4 ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
        >
          {message.text}
        </div>
      )}

      {/* Category Form */}
      <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">Create New Category</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 text-gray-800 md:grid-cols-2">
            <div>
              <label
                htmlFor="name"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Category Name*
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Earrings"
              />
            </div>

            <div>
              <label
                htmlFor="slug"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Slug*
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                required
                className="w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. earrings"
              />
            </div>

            <div>
              <label
                htmlFor="image"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Category Image*
              </label>
              <CldUploadWidget
                uploadPreset={
                  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
                  "ml_default"
                }
                onSuccess={handleUploadSuccess as any}
                options={{
                  maxFiles: 1,
                  resourceType: "image",
                  clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
                  sources: ["local", "url", "camera"],
                }}
              >
                {({ open }) => {
                  return (
                    <button
                      type="button"
                      onClick={() => open()}
                      className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                    >
                      Upload an Image
                    </button>
                  );
                }}
              </CldUploadWidget>
              {formData.image && (
                <p className="mt-2 text-xs text-green-500">
                  Image uploaded: {formData.image.substring(0, 30)}...
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="description"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Description*
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                className="w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Write a description of the category..."
              />
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={
                loading ||
                !formData.name ||
                !formData.description ||
                !formData.image ||
                !formData.slug
              }
              className={`rounded-md px-4 py-2 text-white ${
                loading ||
                !formData.name ||
                !formData.description ||
                !formData.image ||
                !formData.slug
                  ? "cursor-not-allowed bg-blue-300"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Creating..." : "Create Category"}
            </button>
            {!formData.image && (
              <p className="mt-2 text-sm text-red-500">
                Please upload an image before submitting
              </p>
            )}
          </div>
        </form>
      </div>

      {/* Categories List */}
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">Existing Categories</h2>

        {categories.length === 0 ? (
          <p className="text-gray-500">
            No categories found. Create one using the form above.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Description
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {categories.map((category) => (
                  <tr key={category._id}>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="relative size-12 overflow-hidden rounded-md">
                        <CldImage
                          src={category.image}
                          alt={category.name}
                          width={50}
                          height={50}
                          className="size-12 rounded-md object-cover"
                          loading="lazy"
                        />
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {category.name}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {category.slug}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs truncate text-sm text-gray-500">
                        {category.description}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={() => handleDelete(category._id)}
                        className="ml-4 text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
