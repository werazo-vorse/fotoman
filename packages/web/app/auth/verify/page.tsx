import Link from 'next/link'

export default function VerifyPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-sm text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-3xl">
          ✉️
        </div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Revise su correo</h1>
        <p className="mb-6 text-sm text-gray-500">
          Le enviamos un enlace de acceso seguro. Haga clic en el enlace del correo para iniciar sesion.
        </p>
        <Link href="/" className="text-sm text-blue-600 hover:underline">
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
