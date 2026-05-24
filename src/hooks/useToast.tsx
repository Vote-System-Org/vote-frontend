import toast from 'react-hot-toast';
import { CheckCircle, XCircle, AlertCircle, Info, Loader } from 'lucide-react';

export const useToast = () => {

  const success = (message: string) => {
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'}
        flex items-center gap-3 bg-white border border-green-200 shadow-lg
        rounded-xl px-4 py-3 max-w-sm`}>
        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <CheckCircle size={18} className="text-green-600" />
        </div>
        <p className="text-gray-800 text-sm font-medium">{message}</p>
      </div>
    ), { duration: 4000 });
  };

  const error = (message: string) => {
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'}
        flex items-center gap-3 bg-white border border-red-200 shadow-lg
        rounded-xl px-4 py-3 max-w-sm`}>
        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <XCircle size={18} className="text-red-600" />
        </div>
        <p className="text-gray-800 text-sm font-medium">{message}</p>
      </div>
    ), { duration: 5000 });
  };

  const info = (message: string) => {
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'}
        flex items-center gap-3 bg-white border border-blue-200 shadow-lg
        rounded-xl px-4 py-3 max-w-sm`}>
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Info size={18} className="text-blue-600" />
        </div>
        <p className="text-gray-800 text-sm font-medium">{message}</p>
      </div>
    ), { duration: 4000 });
  };

  const warning = (message: string) => {
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'}
        flex items-center gap-3 bg-white border border-amber-200 shadow-lg
        rounded-xl px-4 py-3 max-w-sm`}>
        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <AlertCircle size={18} className="text-amber-600" />
        </div>
        <p className="text-gray-800 text-sm font-medium">{message}</p>
      </div>
    ), { duration: 4000 });
  };

  const loading = (message: string) => {
    return toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'}
        flex items-center gap-3 bg-white border border-gray-200 shadow-lg
        rounded-xl px-4 py-3 max-w-sm`}>
        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Loader size={18} className="text-gray-600 animate-spin" />
        </div>
        <p className="text-gray-800 text-sm font-medium">{message}</p>
      </div>
    ), { duration: Infinity });
  };

  const dismiss = (id?: string) => {
    toast.dismiss(id);
  };

  return { success, error, info, warning, loading, dismiss };
};