import { useCallback, useState } from "react";
import {
  prepareImageUploadAction,
  prepareVideoUploadAction,
  confirmMediaUploadAction,
  deleteMediaAction,
} from "@/lib/actions/media";
import { useToastNotifications } from "../../use-toast-notifications";

export type MediaUploadStatus = "idle" | "uploading" | "confirming" | "error";

export interface MediaUploadState {
  status: MediaUploadStatus;
  progress: number; // 0-100
  error?: string;
}

/**
 * Hook de media (imagen/video) para el Admin — mismo patrón que
 * `use-projects-actions.ts`, pero sin CRUD propio: solo orquesta el flujo
 * presigned URL contra `lib/actions/media.ts` (preparar → PUT directo a R2
 * → confirmar) para que `MediaUploader` quede simple.
 * @returns Estado de progreso + `uploadImage`/`uploadVideo`/`removeMedia`.
 */
function base64ToBlob(base64: string, contentType: string): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: contentType });
}

// `fetch` no expone progreso de subida — XHR sí, y la barra de progreso es
// justamente el feedback que pide A4 del plan (CORS del bucket puede fallar
// silenciosamente si no está configurado, ver A5).
function putToR2(uploadUrl: string, body: Blob, contentType: string, onProgress: (pct: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl, true);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Subida a R2 falló (${xhr.status}) — revisar CORS del bucket (ver A5 del plan)`));
    };
    xhr.onerror = () => reject(new Error("Subida a R2 falló — revisar CORS del bucket (ver A5 del plan)"));
    xhr.send(body);
  });
}

export function useMediaActions() {
  const toastNotifications = useToastNotifications();
  const [state, setState] = useState<MediaUploadState>({ status: "idle", progress: 0 });

  const uploadImage = useCallback(
    async (file: File): Promise<string> => {
      setState({ status: "uploading", progress: 0 });
      try {
        const formData = new FormData();
        formData.append("file", file);
        const prepared = await prepareImageUploadAction(formData);

        await putToR2(
          prepared.uploadUrl,
          base64ToBlob(prepared.fileBase64!, prepared.contentType),
          prepared.contentType,
          (progress) => setState({ status: "uploading", progress })
        );

        setState({ status: "confirming", progress: 100 });
        const { url } = await confirmMediaUploadAction({ key: prepared.key });
        setState({ status: "idle", progress: 100 });
        return url;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error subiendo la imagen";
        setState({ status: "error", progress: 0, error: message });
        toastNotifications.showErrorToast("Error al subir imagen", message);
        throw error;
      }
    },
    [toastNotifications]
  );

  const uploadVideo = useCallback(
    async (file: File): Promise<string> => {
      setState({ status: "uploading", progress: 0 });
      try {
        const prepared = await prepareVideoUploadAction({ filename: file.name, contentType: file.type, size: file.size });

        await putToR2(prepared.uploadUrl, file, prepared.contentType, (progress) => setState({ status: "uploading", progress }));

        setState({ status: "confirming", progress: 100 });
        const { url } = await confirmMediaUploadAction({ key: prepared.key });
        setState({ status: "idle", progress: 100 });
        return url;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error subiendo el video";
        setState({ status: "error", progress: 0, error: message });
        toastNotifications.showErrorToast("Error al subir video", message);
        throw error;
      }
    },
    [toastNotifications]
  );

  // No deja huérfanos en R2 al reemplazar/quitar — si la URL no es del
  // bucket configurado (ej. path viejo de `public/`), `deleteMediaAction`
  // no hace nada y no lanza, así que este catch es solo para errores reales.
  const removeMedia = useCallback(async (url: string) => {
    try {
      await deleteMediaAction({ url });
    } catch (error) {
      console.error("Error borrando media de R2:", error);
    }
  }, []);

  const reset = useCallback(() => setState({ status: "idle", progress: 0 }), []);

  return { state, uploadImage, uploadVideo, removeMedia, reset };
}
