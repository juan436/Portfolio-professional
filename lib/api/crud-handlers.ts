import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/conection';
import type { Model } from 'mongoose';

type RouteParams = { params: Promise<{ id: string }> };

interface ListHandlersOptions {
  Model: Model<any>;
  sort?: Record<string, 1 | -1>;
  categoryFilter?: boolean;
  entityLabelPlural: string;
  entityLabelSingular: string;
  validateCreate?: (body: any) => string | null;
  createSuccessMessage?: string;
}

/**
 * GET (lista, con sort/filtro por categoría opcionales) + POST (crear).
 * Reemplaza el mismo find/create/try-catch copiado en 5 pares de rutas
 * (auditoría 2026-08-18 §6.4). Cada dominio conserva su propio sort,
 * validación de creación y mensajes — no es un genérico ciego.
 */
export function createListHandlers({
  Model,
  sort,
  categoryFilter,
  entityLabelPlural,
  entityLabelSingular,
  validateCreate,
  createSuccessMessage,
}: ListHandlersOptions) {
  const GET = async (request: Request) => {
    await dbConnect();
    try {
      let query = {};
      if (categoryFilter) {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        if (category) query = { category };
      }

      let cursor = Model.find(query);
      if (sort) cursor = cursor.sort(sort);
      const items = await cursor;

      return NextResponse.json({ success: true, data: items });
    } catch (error) {
      console.error(`Error obteniendo ${entityLabelPlural}:`, error);
      return NextResponse.json({ success: false, message: 'Error del servidor' }, { status: 500 });
    }
  };

  const POST = async (request: Request) => {
    await dbConnect();
    try {
      const body = await request.json();

      if (validateCreate) {
        const validationError = validateCreate(body);
        if (validationError) {
          return NextResponse.json({ success: false, message: validationError }, { status: 400 });
        }
      }

      const item = new Model(body);
      await item.save();

      const payload: Record<string, unknown> = { success: true, data: item };
      if (createSuccessMessage) payload.message = createSuccessMessage;

      return NextResponse.json(payload, { status: 201 });
    } catch (error) {
      console.error(`Error creando ${entityLabelSingular}:`, error);
      return NextResponse.json({ success: false, message: 'Error del servidor' }, { status: 500 });
    }
  };

  return { GET, POST };
}

interface ItemHandlersOptions {
  Model: Model<any>;
  entityErrorLabel: string;
  notFoundMessage: string;
  deletedMessage: string;
  updatedMessage?: string;
  updateStrategy?: 'assign-save' | 'findByIdAndUpdate';
  includeErrorDetail?: boolean;
}

/**
 * GET-por-id + PATCH + DELETE. Mismo reemplazo que createListHandlers,
 * para el otro archivo del par (`[id]/route.ts`). `other-skills` no exporta
 * GET (nunca lo tuvo) — cada route.ts elige qué handlers reexportar.
 */
export function createItemHandlers({
  Model,
  entityErrorLabel,
  notFoundMessage,
  deletedMessage,
  updatedMessage,
  updateStrategy = 'assign-save',
  includeErrorDetail = false,
}: ItemHandlersOptions) {
  const GET = async (_request: Request, { params }: RouteParams) => {
    await dbConnect();
    try {
      const { id } = await params;
      const item = await Model.findById(id);

      if (!item) {
        return NextResponse.json({ success: false, message: notFoundMessage }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: item });
    } catch (error) {
      console.error(`Error obteniendo ${entityErrorLabel}:`, error);
      return NextResponse.json({ success: false, message: 'Error del servidor' }, { status: 500 });
    }
  };

  const PATCH = async (request: Request, { params }: RouteParams) => {
    await dbConnect();
    try {
      const { id } = await params;
      const body = await request.json();

      let item: any;
      if (updateStrategy === 'findByIdAndUpdate') {
        item = await Model.findByIdAndUpdate(id, body, { new: true });
        if (!item) {
          return NextResponse.json({ success: false, message: notFoundMessage }, { status: 404 });
        }
      } else {
        item = await Model.findById(id);
        if (!item) {
          return NextResponse.json({ success: false, message: notFoundMessage }, { status: 404 });
        }
        // .set() en vez de asignar campo por campo con cast a any — misma
        // actualización parcial (solo los campos presentes en body), API
        // nativa de Mongoose para esto.
        item.set(body);
        await item.save();
      }

      const payload: Record<string, unknown> = { success: true, data: item };
      if (updatedMessage) payload.message = updatedMessage;

      return NextResponse.json(payload);
    } catch (error) {
      console.error(`Error actualizando ${entityErrorLabel}:`, error);
      const payload: Record<string, unknown> = { success: false, message: 'Error del servidor' };
      if (includeErrorDetail) payload.error = (error as Error).message;
      return NextResponse.json(payload, { status: 500 });
    }
  };

  const DELETE = async (_request: Request, { params }: RouteParams) => {
    await dbConnect();
    try {
      const { id } = await params;
      const item = await Model.findByIdAndDelete(id);

      if (!item) {
        return NextResponse.json({ success: false, message: notFoundMessage }, { status: 404 });
      }

      return NextResponse.json({ success: true, message: deletedMessage });
    } catch (error) {
      console.error(`Error eliminando ${entityErrorLabel}:`, error);
      return NextResponse.json({ success: false, message: 'Error del servidor' }, { status: 500 });
    }
  };

  return { GET, PATCH, DELETE };
}
