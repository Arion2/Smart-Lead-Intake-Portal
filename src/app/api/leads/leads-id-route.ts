import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { reviewed } = await req.json();
    if (typeof reviewed !== 'boolean') {
      return NextResponse.json({ error: 'reviewed must be a boolean' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('leads')
      .update({ reviewed })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      return NextResponse.json({ error: 'Failed to update lead.' }, { status: 500 });
    }

    return NextResponse.json({ lead: data });
  } catch (err) {
    console.error('Toggle reviewed error:', err);
    return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 });
  }
}
