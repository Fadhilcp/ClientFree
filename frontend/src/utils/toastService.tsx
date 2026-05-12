import { toast } from "sonner";

export const notify = {
  success: (msg: string) => toast.success(msg),
  
  error: (msg: string) => toast.error(msg),
  
  info: (msg: string) => toast.info(msg),
  
  warn: (msg: string) => toast.warning(msg),
  
  promise: (
    promise: Promise<any>, 
    { loading, success, error }: { loading: string; success: string; error: string }
  ) =>
    toast.promise(promise, {
      loading,
      success,
      error,
    }),
};