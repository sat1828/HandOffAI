import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { addSSEClient, removeSSEClient, getIO } from '@/lib/socket';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  getIO();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      addSSEClient(user.id, controller);

      controller.enqueue(
        encoder.encode(`event: connected\ndata: ${JSON.stringify({ userId: user.id })}\n\n`),
      );

      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(':keepalive\n\n'));
        } catch {
          clearInterval(keepAlive);
        }
      }, 15000);

      (controller as unknown as { _cleanup: () => void })._cleanup = () => clearInterval(keepAlive);
    },
    cancel(controller) {
      removeSSEClient(user.id, controller);
      const ctrl = controller as unknown as { _cleanup?: () => void };
      if (typeof ctrl._cleanup === 'function') ctrl._cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}

export async function POST() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  return NextResponse.json({ status: 'ok', userId: user.id });
}
