import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

// Tipo para almacenar las referencias completas de los toasts
type ToastReference = {
  id: string;
  update: (props: any) => void;
  dismiss: () => void;
};

/**
 * Hook para centralizar las notificaciones toast reutilizables
 * @returns Funciones para mostrar diferentes tipos de notificaciones toast
 */
export function useToastNotifications() {
  const { toast } = useToast();
  const [loadingToasts, setLoadingToasts] = useState<Record<string, ToastReference>>({});
  
  /**
   * Muestra una notificación toast de éxito
   */
  const showSuccessToast = (title: string, description: string) => {
    toast({
      title,
      description,
      variant: "default",
    });
  };
  
  /**
   * Muestra una notificación toast de error
   */
  const showErrorToast = (title: string, description: string) => {
    toast({
      title,
      description,
      variant: "destructive",
    });
  };

  /**
   * Muestra una notificación toast de carga
   * @returns ID del toast para actualizarlo posteriormente
   */
  const showLoadingToast = (action: string, itemName: string) => {
    const toastRef = toast({
      title: `${action} ${itemName}...`,
      description: "Procesando...",
      duration: 100000, // Duración larga hasta que se actualice
    });
    
    // Guardar referencia completa del toast
    setLoadingToasts(prev => ({
      ...prev,
      [itemName]: toastRef
    }));
    
    return toastRef.id;
  };
  
  /**
   * Actualiza un toast de carga a un toast de éxito
   */
  const updateToastToSuccess = (toastId: string, title: string, description: string) => {
    // Buscar la referencia del toast por su ID
    const toastRef = Object.values(loadingToasts).find(ref => ref.id === toastId);
    
    if (toastRef) {
      // Usar el método update para modificar el toast
      toastRef.update({
        title,
        description,
        variant: "default",
        duration: 3000,
      });
    }
    
    // Limpiar referencia
    setLoadingToasts(prev => {
      const newState = { ...prev };
      Object.keys(newState).forEach(key => {
        if (newState[key].id === toastId) delete newState[key];
      });
      return newState;
    });
  };
  
  /**
   * Actualiza un toast de carga a un toast de error
   */
  const updateToastToError = (toastId: string, title: string, description: string) => {
    // Buscar la referencia del toast por su ID
    const toastRef = Object.values(loadingToasts).find(ref => ref.id === toastId);
    
    if (toastRef) {
      // Usar el método update para modificar el toast
      toastRef.update({
        title,
        description,
        variant: "destructive",
        duration: 3000,
      });
    }
    
    // Limpiar referencia
    setLoadingToasts(prev => {
      const newState = { ...prev };
      Object.keys(newState).forEach(key => {
        if (newState[key].id === toastId) delete newState[key];
      });
      return newState;
    });
  };
  
  // Mensajes predefinidos para operaciones comunes con indicador de carga
  
  /**
   * Muestra una notificación de carga y luego actualiza a creación exitosa
   * @param itemName Nombre del elemento (ej: "Proyecto", "Habilidad")
   * @param operation Función asíncrona que realiza la operación
   */
  const showLoadingAndSuccessToast = async (itemName: string, operation: () => Promise<any>) => {
    const toastId = showLoadingToast("Creando", itemName);
    
    try {
      await operation();
      updateToastToSuccess(
        toastId, 
        `${itemName} creado`, 
        `El ${itemName.toLowerCase()} ha sido creado correctamente.`
      );
      return true;
    } catch (error) {
      updateToastToError(
        toastId, 
        "Error", 
        `No se pudo crear el ${itemName.toLowerCase()}. Intenta de nuevo.`
      );
      return false;
    }
  };
  
  /**
   * Muestra una notificación de carga y luego actualiza a actualización exitosa
   * @param itemName Nombre del elemento (ej: "Proyecto", "Habilidad")
   * @param operation Función asíncrona que realiza la operación
   */
  const showLoadingAndUpdateToast = async (itemName: string, operation: () => Promise<any>) => {
    const toastId = showLoadingToast("Actualizando", itemName);
    
    try {
      await operation();
      updateToastToSuccess(
        toastId, 
        `${itemName} actualizado`, 
        `El ${itemName.toLowerCase()} ha sido actualizado correctamente.`
      );
      return true;
    } catch (error) {
      updateToastToError(
        toastId, 
        "Error", 
        `No se pudo actualizar el ${itemName.toLowerCase()}. Intenta de nuevo.`
      );
      return false;
    }
  };
  
  /**
   * Muestra una notificación de carga y luego actualiza a eliminación exitosa
   * @param itemName Nombre del elemento (ej: "Proyecto", "Habilidad")
   * @param operation Función asíncrona que realiza la operación
   */
  const showLoadingAndDeleteToast = async (itemName: string, operation: () => Promise<any>) => {
    const toastId = showLoadingToast("Eliminando", itemName);
    
    try {
      await operation();
      updateToastToSuccess(
        toastId, 
        `${itemName} eliminado`, 
        `El ${itemName.toLowerCase()} ha sido eliminado correctamente.`
      );
      return true;
    } catch (error) {
      updateToastToError(
        toastId, 
        "Error", 
        `No se pudo eliminar el ${itemName.toLowerCase()}. Intenta de nuevo.`
      );
      return false;
    }
  };
  
  // Funciones simples para mantener compatibilidad con el código existente
  
  /**
   * Muestra una notificación de creación exitosa
   */
  const showCreatedToast = (itemName: string) => {
    showSuccessToast(`${itemName} creado`, `El ${itemName.toLowerCase()} ha sido creado correctamente.`);
  };
  
  /**
   * Muestra una notificación de actualización exitosa
   */
  const showUpdatedToast = (itemName: string) => {
    showSuccessToast(`${itemName} actualizado`, `El ${itemName.toLowerCase()} ha sido actualizado correctamente.`);
  };
  
  /**
   * Muestra una notificación de eliminación exitosa
   */
  const showDeletedToast = (itemName: string) => {
    showSuccessToast(`${itemName} eliminado`, `El ${itemName.toLowerCase()} ha sido eliminado correctamente.`);
  };
  
  /**
   * Muestra una notificación de error en la creación
   */
  const showErrorCreatingToast = (itemName: string) => {
    showErrorToast("Error", `No se pudo crear el ${itemName.toLowerCase()}. Intenta de nuevo.`);
  };
  
  /**
   * Muestra una notificación de error en la actualización
   */
  const showErrorUpdatingToast = (itemName: string) => {
    showErrorToast("Error", `No se pudo actualizar el ${itemName.toLowerCase()}. Intenta de nuevo.`);
  };
  
  /**
   * Muestra una notificación de error en la eliminación
   */
  const showErrorDeletingToast = (itemName: string) => {
    showErrorToast("Error", `No se pudo eliminar el ${itemName.toLowerCase()}. Intenta de nuevo.`);
  };
  
  return {
    showSuccessToast,
    showErrorToast,
    showLoadingToast,
    updateToastToSuccess,
    updateToastToError,
    showLoadingAndSuccessToast,
    showLoadingAndUpdateToast,
    showLoadingAndDeleteToast,
    showCreatedToast,
    showUpdatedToast,
    showDeletedToast,
    showErrorCreatingToast,
    showErrorUpdatingToast,
    showErrorDeletingToast
  };
}
