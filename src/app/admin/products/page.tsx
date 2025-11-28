"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CldImage, CldUploadWidget } from "next-cloudinary";

// Interface for the Category data (needed for dropdown)
interface Category {
  _id: string;
  name: string;
}

// Interface for the Product data
interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string[];
  category: Category; // Populate this in fetch
  inStock: boolean;
  featured: boolean;
  attributes: {
    material?: string;
    weight?: string;
    dimensions?: string;
    gemstone?: string;
    purity?: string;
  };
  slug: string;
  createdAt: string;
  updatedAt: string;
}

// Interface for Cloudinary upload result
interface CloudinaryResult {
  secure_url: string;
}

export default function AdminProductsPage() {
  const router = useRouter();

  // State for form
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    discountPrice: "",
    images: [] as string[],
    category: "",
    inStock: true,
    featured: false,
    attributes: {
      material: "",
      weight: "",
      dimensions: "",
      gemstone: "",
      purity: "",
    },
    slug: "",
  });

  // State for products list
  const [products, setProducts] = useState<Product[]>([]);
  // State for categories list (for dropdown)
  const [categories, setCategories] = useState<Category[]>([]);

  // State for feedback messages
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  // Fetch categories and products on page load
  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  // Function to fetch all categories
  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
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

  // Function to fetch all products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch("/admin/api/product");
      const data = await response.json();

      if (response.ok) {
        setProducts(data.products);
      } else {
        setMessage({
          text: data.error || "Failed to fetch products",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setMessage({
        text: "An error occurred while fetching products",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;

    // Check if this is an attribute field
    if (name.startsWith("attr_")) {
      const attributeName = name.replace("attr_", "");
      setFormData((prev) => ({
        ...prev,
        attributes: {
          ...prev.attributes,
          [attributeName]: value,
        },
      }));
      return;
    }

    let processedValue: string | boolean | string[] = value;

    if (type === "checkbox") {
      processedValue = (e.target as HTMLInputElement).checked;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    // Auto-generate slug from name if slug field is empty
    if (name === "name" && !formData.slug) {
      const slug = value
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "");
      setFormData((prev) => ({
        ...prev,
        slug,
      }));
    }
  };

  // Handle Cloudinary upload success
  const handleUploadSuccess = (result: any) => {
    const secureUrl = result.info?.secure_url;
    if (secureUrl) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, secureUrl],
      }));
      setMessage({ text: "Image uploaded successfully!", type: "success" });
    } else {
      console.error("Could not extract secure_url from upload result:", result);
      setMessage({
        text: "Image upload succeeded but URL not found",
        type: "error",
      });
    }
  };

  // Remove an image from the list
  const handleRemoveImage = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove),
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    const productData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      discountPrice: formData.discountPrice
        ? parseFloat(formData.discountPrice)
        : undefined,
      images: formData.images,
      category: formData.category,
      inStock: formData.inStock,
      featured: formData.featured,
      attributes: {
        material: formData.attributes.material || undefined,
        weight: formData.attributes.weight || undefined,
        dimensions: formData.attributes.dimensions || undefined,
        gemstone: formData.attributes.gemstone || undefined,
        purity: formData.attributes.purity || undefined,
      },
      slug: formData.slug,
    };

    // Basic validation
    if (
      !productData.name ||
      !productData.description ||
      isNaN(productData.price) ||
      productData.price <= 0 ||
      productData.images.length === 0 ||
      !productData.category ||
      !productData.slug
    ) {
      setMessage({
        text: "Please fill all required fields (Name, Description, Price, Category, Slug) and upload at least one image.",
        type: "error",
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/admin/api/product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ text: "Product created successfully!", type: "success" });
        // Reset form
        setFormData({
          name: "",
          description: "",
          price: "",
          discountPrice: "",
          images: [],
          category: "",
          inStock: true,
          featured: false,
          attributes: {
            material: "",
            weight: "",
            dimensions: "",
            gemstone: "",
            purity: "",
          },
          slug: "",
        });
        // Refresh products list
        fetchProducts();
      } else {
        setMessage({
          text: data.error || "Failed to create product",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error creating product:", error);
      setMessage({
        text: "An error occurred while creating the product",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle product deletion
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await fetch("/admin/api/product", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ text: "Product deleted successfully!", type: "success" });
        // Refresh products list
        fetchProducts();
      } else {
        setMessage({
          text: data.error || "Failed to delete product",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      setMessage({
        text: "An error occurred while deleting the product",
        type: "error",
      });
    }
  };

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Manage Products</h1>

      {/* Feedback message */}
      {message.text && (
        <div
          className={`mb-6 rounded p-4 ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
        >
          {message.text}
        </div>
      )}

      {/* Product Form */}
      <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">Create New Product</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 text-gray-800 md:grid-cols-2 lg:grid-cols-3">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Product Name*
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Gold Diamond Ring"
              />
            </div>

            {/* Slug */}
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
                placeholder="e.g. gold-diamond-ring"
              />
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="category"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Category*
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full rounded-md border bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>
                  Select a category
                </option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label
                htmlFor="price"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Price (₹)*
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 50000"
              />
            </div>

            {/* Discount Price */}
            <div>
              <label
                htmlFor="discountPrice"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Discount Price (₹)
              </label>
              <input
                type="number"
                id="discountPrice"
                name="discountPrice"
                value={formData.discountPrice}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 45000 (Optional)"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2 lg:col-span-3">
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
                rows={4}
                placeholder="Detailed description of the product..."
              />
            </div>

            {/* Attributes */}
            <h3 className="col-span-1 text-base font-semibold md:col-span-2 lg:col-span-3">
              Attributes
            </h3>
            <div>
              <label
                htmlFor="attr_material"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Material
              </label>
              <input
                type="text"
                id="attr_material"
                name="attr_material"
                value={formData.attributes.material}
                onChange={handleChange}
                className="w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 22K Gold"
              />
            </div>
            <div>
              <label
                htmlFor="attr_weight"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Weight
              </label>
              <input
                type="text"
                id="attr_weight"
                name="attr_weight"
                value={formData.attributes.weight}
                onChange={handleChange}
                className="w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 5 grams"
              />
            </div>
            <div>
              <label
                htmlFor="attr_dimensions"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Dimensions
              </label>
              <input
                type="text"
                id="attr_dimensions"
                name="attr_dimensions"
                value={formData.attributes.dimensions}
                onChange={handleChange}
                className="w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 10x10x2 mm"
              />
            </div>
            <div>
              <label
                htmlFor="attr_gemstone"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Gemstone
              </label>
              <input
                type="text"
                id="attr_gemstone"
                name="attr_gemstone"
                value={formData.attributes.gemstone}
                onChange={handleChange}
                className="w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Diamond"
              />
            </div>
            <div>
              <label
                htmlFor="attr_purity"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Purity
              </label>
              <input
                type="text"
                id="attr_purity"
                name="attr_purity"
                value={formData.attributes.purity}
                onChange={handleChange}
                className="w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. VVS1"
              />
            </div>

            {/* Status Toggles */}
            <div className="flex items-center gap-4 lg:col-span-1">
              <label
                htmlFor="inStock"
                className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700"
              >
                <input
                  type="checkbox"
                  id="inStock"
                  name="inStock"
                  checked={formData.inStock}
                  onChange={handleChange}
                  className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                In Stock
              </label>
              <label
                htmlFor="featured"
                className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700"
              >
                <input
                  type="checkbox"
                  id="featured"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Featured
              </label>
            </div>

            {/* Image Upload */}
            <div className="md:col-span-2 lg:col-span-3">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Product Images*
              </label>
              <CldUploadWidget
                uploadPreset={
                  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
                  "ml_default"
                }
                onSuccess={handleUploadSuccess as any}
                options={{
                  maxFiles: 5, // Allow multiple files
                  resourceType: "image",
                  clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
                  sources: ["local", "url", "camera"],
                }}
              >
                {({ open }) => (
                  <button
                    type="button"
                    onClick={() => open()}
                    className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                  >
                    Upload Images
                  </button>
                )}
              </CldUploadWidget>
              {/* Display uploaded image previews */}
              <div className="mt-4 flex flex-wrap gap-4">
                {formData.images.map((imageUrl, index) => (
                  <div
                    key={index}
                    className="relative size-20 overflow-hidden rounded border"
                  >
                    <CldImage
                      src={imageUrl}
                      alt={`Product image ${index + 1}`}
                      width={80}
                      height={80}
                      crop="fill"
                      className="object-cover"
                    />
                    {/* Button to remove image */}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute right-0 top-0 rounded-bl bg-red-500 p-1 text-xs text-white opacity-80 hover:opacity-100"
                      title="Remove image"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              {formData.images.length === 0 && (
                <p className="mt-2 text-xs text-red-500">
                  Please upload at least one image.
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6">
            <button
              type="submit"
              disabled={
                loading ||
                formData.images.length === 0 ||
                !formData.name ||
                !formData.description ||
                !formData.price ||
                !formData.category ||
                !formData.slug
              }
              className={`rounded-md px-4 py-2 text-white ${
                loading ||
                formData.images.length === 0 ||
                !formData.name ||
                !formData.description ||
                !formData.price ||
                !formData.category ||
                !formData.slug
                  ? "cursor-not-allowed bg-blue-300"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Creating..." : "Create Product"}
            </button>
          </div>
        </form>
      </div>

      {/* Products List */}
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">Existing Products</h2>

        {products.length === 0 && !loading ? (
          <p className="text-gray-500">
            No products found. Create one using the form above.
          </p>
        ) : (
          <div className="overflow-x-auto rounded border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-4 md:px-6">
                    Image
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-4 md:px-6">
                    Name
                  </th>
                  <th className="hidden px-2 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:table-cell sm:px-4 md:px-6">
                    Category
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-4 md:px-6">
                    Price (₹)
                  </th>
                  <th className="hidden px-2 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:table-cell sm:px-4 md:px-6">
                    Stock
                  </th>
                  <th className="hidden px-2 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-4 md:table-cell md:px-6">
                    Featured
                  </th>
                  <th className="px-2 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-4 md:px-6">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap p-2 sm:p-4 md:px-6">
                      <div className="relative size-10 overflow-hidden rounded-md sm:size-12">
                        {product.images.length > 0 && (
                          <CldImage
                            src={product.images[0]} // Display first image
                            alt={product.name}
                            width={48}
                            height={48}
                            crop="fill"
                            className="object-cover"
                          />
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap p-2 sm:p-4 md:px-6">
                      <div className="text-xs font-medium text-gray-900 sm:text-sm">
                        {product.name.length > 20
                          ? `${product.name.substring(0, 20)}...`
                          : product.name}
                      </div>
                      <div className="hidden text-xs text-gray-500 sm:block">
                        {product.slug}
                      </div>
                    </td>
                    <td className="hidden whitespace-nowrap p-2 text-xs text-gray-500 sm:table-cell sm:p-4 sm:text-sm md:px-6">
                      {product.category?.name || "N/A"}
                    </td>
                    <td className="whitespace-nowrap p-2 text-xs text-gray-900 sm:p-4 sm:text-sm md:px-6">
                      {product.discountPrice ? (
                        <>
                          <span className="text-red-600">
                            ₹{product.discountPrice.toFixed(2)}
                          </span>{" "}
                          <span className="hidden text-xs text-gray-500 line-through sm:inline">
                            ₹{product.price.toFixed(2)}
                          </span>
                        </>
                      ) : (
                        `₹${product.price.toFixed(2)}`
                      )}
                    </td>
                    <td className="hidden whitespace-nowrap p-2 sm:table-cell sm:p-4 md:px-6">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          product.inStock
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.inStock ? "In Stock" : "Out of Stock"}
                      </span>
                    </td>
                    <td className="hidden whitespace-nowrap p-2 text-xs text-gray-500 sm:p-4 sm:text-sm md:table-cell md:px-6">
                      {product.featured ? "Yes" : "No"}
                    </td>
                    <td className="whitespace-nowrap p-2 text-right text-xs font-medium sm:p-4 sm:text-sm md:px-6">
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="text-red-600 hover:text-red-900"
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
        {loading && products.length === 0 && (
          <p className="mt-4 text-center text-gray-500">Loading products...</p>
        )}
      </div>
    </div>
  );
}
