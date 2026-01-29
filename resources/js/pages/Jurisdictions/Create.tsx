import React, { FormEvent } from 'react'
import { Head, router, useForm } from '@inertiajs/react'

export default function Create() {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
  })

  const submit = (e: FormEvent) => {
    e.preventDefault()
    post('/jurisdictions')
  }

  return (
    <div className="p-6 max-w-md">
      <Head title="Créer Jurisdiction" />

      <h1 className="text-xl font-bold mb-4">Créer une Jurisdiction</h1>

      <form onSubmit={submit}>
        <div className="mb-4">
          <label className="block mb-1">Nom</label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => setData('name', e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
          {errors.name && (
            <div className="text-red-600 text-sm mt-1">
              {errors.name}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={processing}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Enregistrer
          </button>

          <a
            href="/jurisdictions"
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Annuler
          </a>
        </div>
      </form>
    </div>
  )
}
