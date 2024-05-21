import { Toaster } from "sonner";

export default function AuthLayout({ children }: { children: React.ReactNode }){
  return(
    <div className="h-full flex items-center justify-center bg-sky-500">
      <Toaster richColors position="top-right" />
      {children}
    </div>
  )
}