import Link from "next/link"
import { FileQuestion } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center">
        <FileQuestion className="mx-auto h-24 w-24 text-muted-foreground" />
        <h1 className="mt-6 text-4xl font-bold">404</h1>
        <p className="mt-2 text-lg text-muted-foreground">Página no encontrada</p>
        <p className="mt-2 text-sm text-muted-foreground">La página que buscas no existe o ha sido movida.</p>
        <Button asChild className="mt-6">
          <Link href="/dashboard">Volver al Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
