import React from 'react'
import { Head, router, usePage } from '@inertiajs/react'

interface Jurisdiction {
  id: number
  name: string
}

interface PageProps {
  jurisdictions: Jurisdiction[]
   [key: string]: any;
}

export default function Index() {
  const { jurisdictions } = usePage<PageProps>().props

  const deleteJurisdiction = (id: number) => {
    if (!confirm('Supprimer cette juridiction ?')) return

    router.delete(`/jurisdictions/${id}`)
  }

  return (
    <div className="p-6">
      <Head title="Jurisdictions" />

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Jurisdictions</h1>
        <a
          href="/jurisdictions/create"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          + Ajouter
        </a>
      </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2 text-left">ID</th>
            <th className="border px-4 py-2 text-left">Nom</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {jurisdictions.length === 0 && (
            <tr>
              <td colSpan={3} className="text-center py-4">
                Aucune juridiction
              </td>
            </tr>
          )}

          {jurisdictions.map((j) => (
            <tr key={j.id}>
              <td className="border px-4 py-2">{j.id}</td>
              <td className="border px-4 py-2">{j.name}</td>
              <td className="border px-4 py-2 text-center">
                <button
                  onClick={() => deleteJurisdiction(j.id)}
                  className="text-red-600 hover:underline"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
