import React, { useState } from 'react'
import { Head, Link, useForm } from '@inertiajs/react'
import { router } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ChevronLeft, ChevronDownIcon, X } from 'lucide-react';
import { Calendar } from "@/components/ui/calendar"
import { format } from 'date-fns'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'

// Initial jurisdictions
const initialJurisdictions = [
  'International',
  'European Union',
  'United States',
  'Tunisia',
]

// Tags list
const tagsList = [
  'Information Security',
  'Cybersecurity',
  'Compliance',
  'Audit',
  'Risk Management',
  'GDPR',
  'Privacy',
  'ISO 27001',
  'NIST',
  'PCI-DSS',
]

export default function CreateFramework() {

  const { data, setData, post, processing } = useForm({
    code: '',
    name: '',
    version: '',
    type: '',
    status: '',
    publisher: '',
    jurisdiction: '',
    scope: '',
    release_date: '',
    effective_date: '',
    retired_date: '',
    description: '',
    language: '',
    url_reference: '',
    tags: '',
  })

  // Dates
  const [releaseDate, setReleaseDate] = useState<Date | undefined>(data.release_date ? new Date(data.release_date) : undefined)
  const [effectiveDate, setEffectiveDate] = useState<Date | undefined>(data.effective_date ? new Date(data.effective_date) : undefined)
  const [retiredDate, setRetiredDate] = useState<Date | undefined>(data.retired_date ? new Date(data.retired_date) : undefined)
  const formatDate = (date: Date | undefined) => date ? format(date, 'yyyy-MM-dd') : ''

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    post('/frameworks')
  }

  // Jurisdiction modals
  const [jurisdictionsList, setJurisdictionsList] = useState(initialJurisdictions)
  const [isJurisdictionListOpen, setIsJurisdictionListOpen] = useState(false)
  const [isJurisdictionModalOpen, setIsJurisdictionModalOpen] = useState(false)
  const [newJurisdiction, setNewJurisdiction] = useState('')

  const openJurisdictionList = () => setIsJurisdictionListOpen(true)
  const closeJurisdictionList = () => setIsJurisdictionListOpen(false)
  const openJurisdictionModal = () => setIsJurisdictionModalOpen(true)
  const closeJurisdictionModal = () => setIsJurisdictionModalOpen(false)

  const addJurisdiction = () => {
    const trimmed = newJurisdiction.trim()
    if (!trimmed) return

    router.post(
      '/jurisdictions',
      { name: trimmed },
      {
        preserveScroll: true,
        onSuccess: () => {
          setJurisdictionsList((prev) => [...prev, trimmed])
          setData('jurisdiction', trimmed)
          setNewJurisdiction('')
          closeJurisdictionModal()
        },
        onError: (errors) => {
          alert(errors.name)
        },
      }
    )
  }

  return (
    <AppLayout
      breadcrumbs={[
        { title: 'Frameworks', href: '/frameworks' },
        { title: 'Create', href: '' },
      ]}
    >
      <Head title="Create Framework" />

      <div className="space-y-6 p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create Framework</h1>
            <p className="text-muted-foreground">Add a new framework</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/frameworks">
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
              </Link>
            </Button>

            <Button variant="outline" onClick={openJurisdictionList}>
              Jurisdiction
            </Button>
          </div>
        </div>

        {/* Form Card */}
        <Card className="w-full">
          <CardContent className="pt-6">
            <form onSubmit={submit} className="space-y-6">

              {/* Row 1: Code & Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Code" required>
                  <Input
                    placeholder="e.g. ISO27001, GDPR, PCI-DSS"
                    value={data.code}
                    onChange={(e) => setData('code', e.target.value)}
                  />
                </Field>
                <Field label="Name" required>
                  <Input
                    placeholder="ISO/IEC 27001:2022 Information Security Management"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                  />
                </Field>
              </div>

              {/* Row 2: Version, Type, Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Version">
                  <Input
                    placeholder="e.g. v4.0, 2022, rev.2"
                    value={data.version}
                    onChange={(e) => setData('version', e.target.value)}
                  />
                </Field>
                <Field label="Type" required>
                  <Select value={data.type} onValueChange={(v) => setData('type', v)}>
                    <SelectTrigger><SelectValue placeholder="Select a type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="regulation">Regulation</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internal_policy">Internal Policy</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Status" required>
                  <Select value={data.status} onValueChange={(v) => setData('status', v)}>
                    <SelectTrigger><SelectValue placeholder="Select a status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="deprecated">Deprecated</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              {/* Row 3: Publisher, Jurisdiction, Scope */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Publisher">
                  <Input
                    placeholder="e.g. ISO, CNIL, PCI SSC"
                    value={data.publisher}
                    onChange={(e) => setData('publisher', e.target.value)}
                  />
                </Field>
                <Field label="Jurisdiction" required>
                  <Select
                    value={data.jurisdiction || undefined}
                    onValueChange={(v) => setData('jurisdiction', v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a jurisdiction" />
                    </SelectTrigger>
                    <SelectContent>
                      {jurisdictionsList.map((j) => (
                        <SelectItem key={j} value={j}>{j}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Scope">
                  <Input
                    placeholder="Information Security, Privacy, Finance..."
                    value={data.scope}
                    onChange={(e) => setData('scope', e.target.value)}
                  />
                </Field>
              </div>

              {/* Row 4: Dates */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Release Date">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-between text-left">
                        {releaseDate ? format(releaseDate, 'PPP') : 'Select a date'}
                        <ChevronDownIcon className="ml-2 h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={releaseDate}
                        onSelect={(date) => {
                          setReleaseDate(date)
                          setData('release_date', date ? formatDate(date) : '')
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </Field>

                <Field label="Effective Date">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-between text-left">
                        {effectiveDate ? format(effectiveDate, 'PPP') : 'Select a date'}
                        <ChevronDownIcon className="ml-2 h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={effectiveDate}
                        onSelect={(date) => {
                          setEffectiveDate(date)
                          setData('effective_date', date ? formatDate(date) : '')
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </Field>

                <Field label="Retired Date">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-between text-left">
                        {retiredDate ? format(retiredDate, 'PPP') : 'Select a date'}
                        <ChevronDownIcon className="ml-2 h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={retiredDate}
                        onSelect={(date) => {
                          setRetiredDate(date)
                          setData('retired_date', date ? formatDate(date) : '')
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </Field>
              </div>

              {/* Row 5: Description */}
              <Field label="Description">
                <Textarea
                  rows={3}
                  placeholder="Description or implementation notes..."
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                />
              </Field>

              {/* Row 6: Language & Reference URL */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Language">
                  <Input
                    placeholder="Primary language"
                    value={data.language}
                    onChange={(e) => setData('language', e.target.value)}
                  />
                </Field>
                <Field label="Reference URL">
                  <Input
                    type="url"
                    placeholder="https://www.iso.org/standard/82875.html"
                    value={data.url_reference}
                    onChange={(e) => setData('url_reference', e.target.value)}
                  />
                </Field>
              </div>

              {/* Row 7: Tags */}
              <Field label="Tags">
                <Select value={data.tags} onValueChange={(v) => setData('tags', v)}>
                  <SelectTrigger><SelectValue placeholder="Select a tag" /></SelectTrigger>
                  <SelectContent>
                    {tagsList.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-6 border-t">
                <Button type="button" variant="outline">Cancel</Button>
                <Button type="submit" disabled={processing}>Save</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* --- Modal Add Jurisdiction --- */}
    {isJurisdictionModalOpen && (
  <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
    <div className="bg-white dark:bg-gray-800 rounded-lg w-1/2 p-6 relative shadow-lg">
      {/* Bouton fermer */}
      <button
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
        onClick={closeJurisdictionModal}
      >
        <X />
      </button>

      {/* Titre */}
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        Add Jurisdiction
      </h2>

      <div className="space-y-4">
        {/* Input */}
        <Input
          placeholder="Enter new jurisdiction"
          value={newJurisdiction}
          onChange={(e) => setNewJurisdiction(e.target.value)}
          className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-300"
        />

        {/* Boutons */}
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={closeJurisdictionModal}
            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            Cancel
          </Button>
          <Button className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
            Add
          </Button>
        </div>
      </div>
    </div>
  </div>
)}


      {/* --- Modal Liste des Jurisdictions --- */}
      {isJurisdictionListOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg w-1/2 max-h-[70vh] overflow-y-auto p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={closeJurisdictionList}
            >
              <X />
            </button>

            <h2 className="text-xl font-bold mb-4">Jurisdictions List</h2>

            <ul className="space-y-2">
              {jurisdictionsList.length === 0 && (
                <li className="text-gray-500">No jurisdictions found.</li>
              )}
              {jurisdictionsList.map((j) => (
                <li
                  key={j}
                  className="flex justify-between items-center border-b py-2 px-2 hover:bg-gray-100 rounded"
                >
                  <span>{j}</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setData('jurisdiction', j)
                        closeJurisdictionList()
                      }}
                    >
                      Select
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        setJurisdictionsList((prev) => prev.filter((item) => item !== j))
                      }
                    >
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>

            {/* Ajouter une nouvelle juridiction */}
            <div className="mt-4 flex gap-2">
              <Input
                placeholder="Add new jurisdiction"
                value={newJurisdiction}
                onChange={(e) => setNewJurisdiction(e.target.value)}
              />
              <Button onClick={addJurisdiction}>Add</Button>
            </div>
          </div>
        </div>
      )}

    </AppLayout>
  )
}

/* ---------- Reusable Field ---------- */
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {children}
    </div>
  )
}
