import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { categorizeWithAI } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, business_name, industry, help_text } = body;

    // Validate required fields
    if (!name || !email || !business_name || !industry || !help_text) {
      return NextResponse.json(
        { error: 'All fields are required.' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    // Call AI to categorize
    const { summary, category } = await categorizeWithAI(help_text);

    // Store in Supabase
    const { data, error } = await supabase
      .from('leads')
      .insert([
        {
          name,
          email,
          business_name,
          industry,
          help_text,
          ai_summary: summary,
          ai_category: category,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { error: 'Failed to save submission. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, lead: data }, { status: 201 });
  } catch (err) {
    console.error('Submit error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
