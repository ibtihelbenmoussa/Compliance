import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout'
import { type BreadcrumbItem } from '@/types'
import { type ReactNode } from 'react'
import { usePage } from '@inertiajs/react'

interface AppLayoutProps {
  children: ReactNode
  breadcrumbs?: BreadcrumbItem[]
}

interface Flash {
  success?: string
  error?: string
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => {
  const { flash } = usePage().props as { flash?: Flash }

  return (
    <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
      {/* ✅ Flash messages */}
     {/*  {flash?.success && (
        <div className="mb-4 rounded bg-green-100 px-4 py-2 text-green-800">
          {flash.success}
        </div>
      )}

      {flash?.error && (
        <div className="mb-4 rounded bg-red-100 px-4 py-2 text-red-800">
          {flash.error}
        </div>
      )} */}

      {children}
    </AppLayoutTemplate>
  )
}
