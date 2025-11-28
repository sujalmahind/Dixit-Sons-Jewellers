"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  PlusIcon,
  ShoppingBagIcon,
  FolderIcon,
  UsersIcon,
  BanknoteIcon,
} from "lucide-react";
import { Category, Product } from "@/types";

// Define the category shape to avoid the 'never' type issue
type CategoryRef = string | { _id: string; name: string };
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    featuredProducts: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch products with debugging
        console.log("Fetching products...");
        const productsResponse = await fetch("/api/products");
        const productsData = await productsResponse.json();
        console.log("Products API response:", productsData);

        // Fetch categories with debugging
        console.log("Fetching categories...");
        const categoriesResponse = await fetch("/api/categories");
        const categoriesData = await categoriesResponse.json();
        console.log("Categories API response:", categoriesData);

        if (productsData.products) {
          console.log("Setting products:", productsData.products.slice(0, 5));
          setProducts(productsData.products.slice(0, 5)); // Get only the first 5 for recent products
          setStats((prev) => ({
            ...prev,
            totalProducts: productsData.products.length,
            featuredProducts: productsData.products.filter(
              (p: Product) => p.featured,
            ).length,
          }));
        } else {
          console.warn("No products found in API response");
        }

        if (categoriesData.categories) {
          console.log("Setting categories:", categoriesData.categories);
          setCategories(categoriesData.categories);
          setStats((prev) => ({
            ...prev,
            totalCategories: categoriesData.categories.length,
          }));
        } else {
          console.warn("No categories found in API response");
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Calculate products per category for the category overview
  const getCategoryProductCount = (categoryId: string) => {
    return products.filter((p) =>
      typeof p.category === "string"
        ? p.category === categoryId
        : p.category && (p.category as Category)._id === categoryId,
    ).length;
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] w-full items-center justify-center">
        <div className="space-y-4">
          <Skeleton className="h-12 w-40" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your jewelry store management dashboard
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-t-4 border-t-blue-500">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <ShoppingBagIcon className="size-6 text-blue-500" />
              </div>
              <CardTitle className="text-lg font-medium">
                Total Products
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalProducts}</div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-amber-500">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-100 p-2">
                <FolderIcon className="size-6 text-amber-500" />
              </div>
              <CardTitle className="text-lg font-medium">Categories</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalCategories}</div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-emerald-500">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-100 p-2">
                <BanknoteIcon className="size-6 text-emerald-500" />
              </div>
              <CardTitle className="text-lg font-medium">
                Featured Products
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.featuredProducts}</div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-rose-500">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-rose-100 p-2">
                <UsersIcon className="size-6 text-rose-500" />
              </div>
              <CardTitle className="text-lg font-medium">Orders</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">--</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Products Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Products</CardTitle>
            <Link href="/admin/products">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Category</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length > 0 ? (
                  products.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/admin/products?edit=${product._id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {product.name}
                        </Link>
                      </TableCell>
                      <TableCell>₹{product.price.toLocaleString()}</TableCell>
                      <TableCell>
                        {typeof product.category === "string"
                          ? product.category
                          : (product.category as Category)?.name || "Unknown"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      No products found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Category Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Products by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {categories.length > 0 ? (
              <div className="space-y-4">
                {categories.map((category) => (
                  <div
                    key={category._id}
                    className="flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{category.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {getCategoryProductCount(category._id)} products
                      </p>
                    </div>
                    <div className="w-2/5">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full bg-blue-500"
                          style={{
                            width: `${Math.min(100, (getCategoryProductCount(category._id) / Math.max(1, stats.totalProducts)) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-40 items-center justify-center">
                <p className="text-muted-foreground">No categories found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/admin/products?new=true" className="w-full">
              <Button className="w-full">
                <PlusIcon className="mr-2 size-4" />
                Add Product
              </Button>
            </Link>
            <Link href="/admin/categories?new=true" className="w-full">
              <Button variant="outline" className="w-full">
                <PlusIcon className="mr-2 size-4" />
                Add Category
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
