import connectToDb from "@/lib/db/connection";
import Testimonial from "@/models/Testimonial";
import { NextRequest, NextResponse } from "next/server";

// Get all testimonials
export async function GET() {
  try {
    await connectToDb();
    const testimonials = await Testimonial.find({}).sort({ createdAt: -1 });
    return NextResponse.json(testimonials, { status: 200 });
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return NextResponse.json(
      { message: "Error fetching testimonials" },
      { status: 500 },
    );
  }
}

// Create a new testimonial
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, review, image } = body;

    await connectToDb();
    const newTestimonial = new Testimonial({
      name,
      review,
      image,
    });

    await newTestimonial.save();
    return NextResponse.json(
      {
        message: "Testimonial created successfully",
        testimonial: newTestimonial,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating testimonial:", error);
    return NextResponse.json(
      { message: "Error creating testimonial" },
      { status: 500 },
    );
  }
}
