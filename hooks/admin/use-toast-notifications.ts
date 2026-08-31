import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

type ToastReference = {
  id: string;
  update: (props: any) => void;
  dismiss: () => void;
};

/**
 * Hook para centralizar las notificaciones toast reutilizables del Admin.
 * Recibe: nada.
 * @returns Funciones "show" y "update" para disparar/actualizar toasts de éxito, error y carga.
 */
export function useToastNotifications() {
  const { toast } = useToast();
  const [loadingToasts, setLoadingToasts] = useState<Record<string, ToastReference>>({});
  
  const showSuccessToast = (title: string, description: string) => {
    toast({
      title,
      description,
      variant: "default",
    });
  };
  
  const showErrorToast = (title: string, description: string) => {
    toast({
      title,
      description,
      variant: "destructive",
    });
  };

  const showLoadingToast = (action: string, itemName: string) => {
    const toastRef = toast({
      title: `${action} ${itemName}...`,
      description: "Procesando...",
      duration: 100000,
    });
    
    setLoadingToasts(prev => ({
      ...prev,
      [itemName]: toastRef
    }));
    
    return toastRef.id;
  };
  
  const updateToastToSuccess = (toastId: string, title: string, description: string) => {
    const toastRef = Object.values(loadingToasts).find(ref => ref.id === toastId);
    
    if (toastRef) {
      toastRef.update({
        title,
        description,
        variant: "default",
        duration: 3000,
      });
    }
    
    setLoadingToasts(prev => {
      const newState = { ...prev };
      Object.keys(newState).forEach(key => {
        if (newState[key].id === toastId) delete newState[key];
      });
      return newState;
    });
  };
  
  const updateToastToError = (toastId: string, title: string, description: string) => {
    const toastRef = Object.values(loadingToasts).find(ref => ref.id === toastId);
    
    if (toastRef) {
      toastRef.update({
        title,
        description,
        variant: "destructive",
        duration: 3000,
      });
    }
    
    setLoadingToasts(prev => {
      const newState = { ...prev };
      Object.keys(newState).forEach(key => {
        if (newState[key].id === toastId) delete newState[key];
      });
      return newState;
    });
  };
  
  
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
  
  
  const showCreatedToast = (itemName: string) => {
    showSuccessToast(`${itemName} creado`, `El ${itemName.toLowerCase()} ha sido creado correctamente.`);
  };
  
  const showUpdatedToast = (itemName: string) => {
    showSuccessToast(`${itemName} actualizado`, `El ${itemName.toLowerCase()} ha sido actualizado correctamente.`);
  };
  
  const showDeletedToast = (itemName: string) => {
    showSuccessToast(`${itemName} eliminado`, `El ${itemName.toLowerCase()} ha sido eliminado correctamente.`);
  };
  
  const showErrorCreatingToast = (itemName: string) => {
    showErrorToast("Error", `No se pudo crear el ${itemName.toLowerCase()}. Intenta de nuevo.`);
  };
  
  const showErrorUpdatingToast = (itemName: string) => {
    showErrorToast("Error", `No se pudo actualizar el ${itemName.toLowerCase()}. Intenta de nuevo.`);
  };
  
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
