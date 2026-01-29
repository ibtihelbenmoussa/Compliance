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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'

const initialJurisdictions = [
  'International',
  'European Union',
  'United States',
  'Tunisia',
]

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

interface Jurisdiction {
  id: number
  name: string
}

interface FrameworkCreateProps {
  jurisdictions: Jurisdiction[];
}

export default function CreateFramework({ jurisdictions }: FrameworkCreateProps) {
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

  const [releaseDate, setReleaseDate] = useState<Date | undefined>(data.release_date ? new Date(data.release_date) : undefined)
  const [effectiveDate, setEffectiveDate] = useState<Date | undefined>(data.effective_date ? new Date(data.effective_date) : undefined)
  const [retiredDate, setRetiredDate] = useState<Date | undefined>(data.retired_date ? new Date(data.retired_date) : undefined)
  const formatDate = (date: Date | undefined) => date ? format(date, 'yyyy-MM-dd') : ''

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    post('/frameworks')
  }

const [jurisdictionsList, setJurisdictionsList] = useState<Jurisdiction[]>(jurisdictions)
  const [localJurisdictions, setLocalJurisdictions] = useState<string[]>([])
  const [isJurisdictionListOpen, setIsJurisdictionListOpen] = useState(false)
  const [isJurisdictionModalOpen, setIsJurisdictionModalOpen] = useState(false)
  const [newJurisdiction, setNewJurisdiction] = useState('')

  const openJurisdictionList = () => setIsJurisdictionListOpen(true)
  const closeJurisdictionList = () => setIsJurisdictionListOpen(false)
  const openJurisdictionModal = () => setIsJurisdictionModalOpen(true)
  const closeJurisdictionModal = () => setIsJurisdictionModalOpen(false)
const handleDeleteJurisdiction = (id: number) => {
  if (!confirm("Are you sure you want to delete this jurisdiction?")) return;

  router.delete(`/jurisdictions/${id}`, {
    preserveScroll: true,
    onSuccess: (page) => {
      // Vérifier si Inertia a envoyé un flash message
      const flash = page.props.flash as { success?: string; error?: string } | undefined;
      if (flash?.success) {
        setMessageType('success');
        setMessage(flash.success);
        // Retirer la juridiction du state local
        setJurisdictionsList(prev => prev.filter(j => j.id !== id));
      } else if (flash?.error) {
        setMessageType('error');
        setMessage(flash.error);
      } else {
        setMessageType('success');
        setMessage('Jurisdiction successfully deleted.');
        setJurisdictionsList(prev => prev.filter(j => j.id !== id));
      }

      setTimeout(() => setMessage(null), 4000);
    },
    onError: (errors: any) => {
      setMessageType('error');
      setMessage(errors.message || "Unable to delete this jurisdiction.");
      setTimeout(() => setMessage(null), 4000);
    },
  });
};



const addJurisdiction = () => {
  const trimmed = newJurisdiction.trim()
  if (!trimmed) return





  const newItem: Jurisdiction = { id: Date.now(), name: trimmed }

  setJurisdictionsList(prev => [...prev, newItem])
  setLocalJurisdictions(prev => [...prev, trimmed])
  setData('jurisdiction', trimmed)
  setNewJurisdiction('')
  closeJurisdictionModal()

  router.post('/jurisdictions', { name: trimmed }, { preserveScroll: true, onError: (errors) => alert(errors.name) })
}

const [message, setMessage] = useState<string | null>(null)
const [messageType, setMessageType] = useState<'success' | 'error'>('success')
  const showError = () => {
    setMessageType('error')
    setMessage('Unable to delete this jurisdiction because it is assigned to a framework.')
    setTimeout(() => setMessage(null), 4000) 
  }
  
  return (
    <AppLayout
      breadcrumbs={[
        { title: 'Frameworks', href: '/frameworks' },
        { title: 'Create', href: '' },
      ]}
    >
      <Head title="Create Framework" />


  {message && (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg text-white z-50 ${
        messageType === 'success' ? 'bg-green-600' : 'bg-red-600'
      }`}
    >
      {message}
    </div>
  )}
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
            <Button variant="outline" onClick={openJurisdictionList}> Jurisdiction </Button>
          </div>
        </div>

        {/* Form Card */}
        <Card className="w-full">
          <CardContent className="pt-6">
            <form onSubmit={submit} className="space-y-6">

              {/* Row 1: Code & Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Code" required>
                  <Input placeholder="e.g. ISO27001, GDPR, PCI-DSS" value={data.code} onChange={(e) => setData('code', e.target.value)} />
                </Field>
                <Field label="Name" required>
                  <Input placeholder="ISO/IEC 27001:2022 Information Security Management" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                </Field>
              </div>

              {/* Row 2: Version, Type, Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Version">
                  <Input placeholder="e.g. v4.0, 2022, rev.2" value={data.version} onChange={(e) => setData('version', e.target.value)} />
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
                  <Input placeholder="e.g. ISO, CNIL, PCI SSC" value={data.publisher} onChange={(e) => setData('publisher', e.target.value)} />
                </Field>
                <Field label="Jurisdiction" required>
                  <Select value={data.jurisdiction || undefined} onValueChange={(v) => setData('jurisdiction', v)} >
                    <SelectTrigger> <SelectValue placeholder="Select a jurisdiction" /> </SelectTrigger>
                    <SelectContent>
                    {jurisdictionsList.map((j) => (
  <SelectItem key={j.id} value={j.id.toString()}>{j.name}</SelectItem>
))}

                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Scope">
                  <Input placeholder="Information Security, Privacy, Finance..." value={data.scope} onChange={(e) => setData('scope', e.target.value)} />
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
                      <Calendar mode="single" selected={releaseDate} onSelect={(date) => { setReleaseDate(date); setData('release_date', date ? formatDate(date) : '') }} />
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
                      <Calendar mode="single" selected={effectiveDate} onSelect={(date) => { setEffectiveDate(date); setData('effective_date', date ? formatDate(date) : '') }} />
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
                      <Calendar mode="single" selected={retiredDate} onSelect={(date) => { setRetiredDate(date); setData('retired_date', date ? formatDate(date) : '') }} />
                    </PopoverContent>
                  </Popover>
                </Field>
              </div>

              {/* Row 5: Description */}
              <Field label="Description">
                <Textarea rows={3} placeholder="Description or implementation notes..." value={data.description} onChange={(e) => setData('description', e.target.value)} />
              </Field>

              {/* Row 6: Language & Reference URL */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Language">
                  <Input placeholder="Primary language" value={data.language} onChange={(e) => setData('language', e.target.value)} />
                </Field>
                <Field label="Reference URL">
                  <Input type="url" placeholder="https://www.iso.org/standard/82875.html" value={data.url_reference} onChange={(e) => setData('url_reference', e.target.value)} />
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 relative shadow-2xl border border-gray-200 dark:border-gray-700 transition-transform transform scale-100">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white transition" onClick={closeJurisdictionModal}>
              <X size={20} />
            </button>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Add Jurisdiction</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm"> Enter a new jurisdiction to add it to the list. </p>
            </div>
            <div className="space-y-5">
              <Input placeholder="Enter new jurisdiction" value={newJurisdiction} onChange={(e) => setNewJurisdiction(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition" />
              <div className="flex justify-end gap-3 mt-2">
                <Button variant="outline" onClick={closeJurisdictionModal} className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition" > Cancel </Button>
                <Button onClick={addJurisdiction} className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition" > Add </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Modal Liste des Jurisdictions --- */}
      {isJurisdictionListOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg max-h-[70vh] overflow-y-auto p-6 relative shadow-2xl border border-gray-200 dark:border-gray-700 transition-transform transform scale-100">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white transition" onClick={closeJurisdictionList}>
              <X size={20} />
            </button>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Jurisdictions List</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm"> Select or delete jurisdictions. </p>
            </div>
            <ul className="space-y-3">
              {jurisdictionsList.length === 0 && (
                <li className="text-gray-500 dark:text-gray-400 text-center py-2"> No jurisdictions found. </li>
              )}
              {jurisdictionsList.map((j) => (
                <li key={j.name} className="flex justify-between items-center border-b py-2 px-3 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition" >
                  <span className="text-gray-900 dark:text-gray-100">{j.name}</span>
                  <div className="flex gap-2">
<Button size="sm" variant="outline" onClick={() => { 
  setData('jurisdiction', j.name.toString()); 
  closeJurisdictionList(); 
}}> Select </Button>
<Button
  size="sm"
  variant="destructive"
  onClick={() => handleDeleteJurisdiction(j.id)}
>
  Delete
</Button>

                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex gap-2 items-center">
              <Input placeholder="Add new jurisdiction" value={newJurisdiction} onChange={(e) => setNewJurisdiction(e.target.value)} className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition" />
              <Button onClick={addJurisdiction} className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition" > Add </Button>
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
      <label className="text-sm font-medium"> {label} {required && <span className="text-red-500"> *</span>} </label>
      {children}
    </div>
  )
}
