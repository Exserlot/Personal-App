import { bucket } from '@/lib/gcs';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  // Ensure the user is authenticated before serving images
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const slipId = url.searchParams.get('slipId'); 

  if (!slipId) {
    return NextResponse.json({ error: 'slipId required' }, { status: 400 });
  }

  try {
    // Verify ownership in database
    const slip = await prisma.paymentSlip.findUnique({
      where: { id: slipId }
    });

    if (!slip) {
      return NextResponse.json({ error: 'Slip not found' }, { status: 404 });
    }

    if (slip.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const file = bucket.file(slip.imagePath);

    // Generate a Signed URL (v4) valid for 15 minutes
    const [signedUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 15 * 60 * 1000, 
    });

    // Redirect the browser directly to the Signed URL
    return NextResponse.redirect(signedUrl);
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return NextResponse.json({ error: 'Failed to generate URL' }, { status: 500 });
  }
}
