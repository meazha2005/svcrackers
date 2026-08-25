import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getAdminSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 });
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN || 'vercel_blob_rw_edE5PiWuT1xowkkD_ftuIdKX1FaNySewrvA1Al7clBRmI3e';
    const filename = `products/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    const blob = await put(filename, file, {
      access: 'public',
      token
    });

    return NextResponse.json({
      success: true,
      url: blob.url
    });
  } catch (error: any) {
    console.error('Blob upload error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
