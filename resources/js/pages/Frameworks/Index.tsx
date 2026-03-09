// resources/js/pages/Frameworks/Index.tsx
import { useMemo, useState } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { ServerDataTable } from '@/components/server-data-table'
import { DataTableColumnHeader } from '@/components/server-data-table-column-header'
import {
  DataTableFacetedFilter,
  type FacetedFilterOption,
} from '@/components/server-data-table-faceted-filter'
import {
  DataTableSelectFilter,
  type SelectOption,
} from '@/components/server-data-table-select-filter'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Key,
  BookOpen,
  RefreshCw,
  Layers,
  User,
  Globe,
  Tag,
  SignalHigh,
  Building2,
  CheckCircle2,
  Eye,
  FileText,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  Archive,
  LayoutGrid,
  Table as TableIcon,
  GripVertical,
  ListFilter,
  Download,
} from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { PaginatedData } from '@/types'
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from '@hello-pangea/dnd'
import { cn } from '@/lib/utils'

const jurisdictionFlags: Record<string, string> = {
  'Algérie': 'dz', 'Algeria': 'dz',
  'Angola': 'ao',
  'Bénin': 'bj', 'Benin': 'bj',
  'Botswana': 'bw',
  'Burkina Faso': 'bf',
  'Burundi': 'bi',
  'Cameroun': 'cm', 'Cameroon': 'cm',
  'Cap-Vert': 'cv', 'Cape Verde': 'cv',
  'République centrafricaine': 'cf', 'Central African Republic': 'cf',
  'Tchad': 'td', 'Chad': 'td',
  'Comores': 'km', 'Comoros': 'km',
  'Congo': 'cg', 'Republic of the Congo': 'cg',
  'République démocratique du Congo': 'cd', 'Democratic Republic of the Congo': 'cd', 'RDC': 'cd',
  "Côte d'Ivoire": 'ci', "Cote d'Ivoire": 'ci',
  'Djibouti': 'dj',
  'Égypte': 'eg', 'Egypt': 'eg',
  'Guinée équatoriale': 'gq', 'Equatorial Guinea': 'gq',
  'Érythrée': 'er', 'Eritrea': 'er',
  'Eswatini': 'sz', 'Swaziland': 'sz',
  'Éthiopie': 'et', 'Ethiopia': 'et',
  'Gabon': 'ga',
  'Gambie': 'gm', 'Gambia': 'gm',
  'Ghana': 'gh',
  'Guinée': 'gn', 'Guinea': 'gn',
  'Guinée-Bissau': 'gw', 'Guinea-Bissau': 'gw',
  'Kenya': 'ke',
  'Lesotho': 'ls',
  'Liberia': 'lr',
  'Libye': 'ly', 'Libya': 'ly',
  'Madagascar': 'mg',
  'Malawi': 'mw',
  'Mali': 'ml',
  'Mauritanie': 'mr', 'Mauritania': 'mr',
  'Maurice': 'mu', 'Mauritius': 'mu',
  'Maroc': 'ma', 'Morocco': 'ma',
  'Mozambique': 'mz',
  'Namibie': 'na', 'Namibia': 'na',
  'Niger': 'ne',
  'Nigeria': 'ng',
  'Rwanda': 'rw',
  'Sao Tomé-et-Principe': 'st', 'Sao Tome and Principe': 'st',
  'Sénégal': 'sn', 'Senegal': 'sn',
  'Seychelles': 'sc',
  'Sierra Leone': 'sl',
  'Somalie': 'so', 'Somalia': 'so',
  'Afrique du Sud': 'za', 'South Africa': 'za',
  'Soudan du Sud': 'ss', 'South Sudan': 'ss',
  'Soudan': 'sd', 'Sudan': 'sd',
  'Tanzanie': 'tz', 'Tanzania': 'tz',
  'Togo': 'tg',
  'Tunisie': 'tn', 'Tunisia': 'tn',
  'Ouganda': 'ug', 'Uganda': 'ug',
  'Zambie': 'zm', 'Zambia': 'zm',
  'Zimbabwe': 'zw',

  'Antigua-et-Barbuda': 'ag', 'Antigua and Barbuda': 'ag',
  'Bahamas': 'bs',
  'Barbade': 'bb', 'Barbados': 'bb',
  'Belize': 'bz',
  'Canada': 'ca',
  'Costa Rica': 'cr',
  'Cuba': 'cu',
  'Dominique': 'dm', 'Dominica': 'dm',
  'République dominicaine': 'do', 'Dominican Republic': 'do',
  'Salvador': 'sv', 'El Salvador': 'sv',
  'Grenade': 'gd', 'Grenada': 'gd',
  'Guatemala': 'gt',
  'Haïti': 'ht', 'Haiti': 'ht',
  'Honduras': 'hn',
  'Jamaïque': 'jm', 'Jamaica': 'jm',
  'Mexique': 'mx', 'Mexico': 'mx',
  'Nicaragua': 'ni',
  'Panama': 'pa',
  'Saint-Kitts-et-Nevis': 'kn', 'Saint Kitts and Nevis': 'kn',
  'Sainte-Lucie': 'lc', 'Saint Lucia': 'lc',
  'Saint-Vincent-et-les-Grenadines': 'vc', 'Saint Vincent and the Grenadines': 'vc',
  'Trinité-et-Tobago': 'tt', 'Trinidad and Tobago': 'tt',
  'États-Unis': 'us', 'United States': 'us', 'USA': 'us', 'États-Unis d\'Amérique': 'us',

  'Argentine': 'ar', 'Argentina': 'ar',
  'Bolivie': 'bo', 'Bolivia': 'bo',
  'Brésil': 'br', 'Brazil': 'br',
  'Chili': 'cl', 'Chile': 'cl',
  'Colombie': 'co', 'Colombia': 'co',
  'Équateur': 'ec', 'Ecuador': 'ec',
  'Guyana': 'gy',
  'Paraguay': 'py',
  'Pérou': 'pe', 'Peru': 'pe',
  'Suriname': 'sr',
  'Uruguay': 'uy',
  'Venezuela': 've',

  'Afghanistan': 'af',
  'Arménie': 'am', 'Armenia': 'am',
  'Azerbaïdjan': 'az', 'Azerbaijan': 'az',
  'Bahreïn': 'bh', 'Bahrain': 'bh',
  'Bangladesh': 'bd',
  'Bhoutan': 'bt', 'Bhutan': 'bt',
  'Brunei': 'bn',
  'Cambodge': 'kh', 'Cambodia': 'kh',
  'Chine': 'cn', 'China': 'cn',
  'Chypre': 'cy', 'Cyprus': 'cy',
  'Corée du Nord': 'kp', 'North Korea': 'kp',
  'Corée du Sud': 'kr', 'South Korea': 'kr',
  'Émirats arabes unis': 'ae', 'United Arab Emirates': 'ae', 'UAE': 'ae',
  'Géorgie': 'ge', 'Georgia': 'ge',
  'Inde': 'in', 'India': 'in',
  'Indonésie': 'id', 'Indonesia': 'id',
  'Irak': 'iq', 'Iraq': 'iq',
  'Iran': 'ir',
  'Israël': 'il', 'Israel': 'il',
  'Japon': 'jp', 'Japan': 'jp',
  'Jordanie': 'jo', 'Jordan': 'jo',
  'Kazakhstan': 'kz',
  'Koweït': 'kw', 'Kuwait': 'kw',
  'Kirghizistan': 'kg', 'Kyrgyzstan': 'kg',
  'Laos': 'la',
  'Liban': 'lb', 'Lebanon': 'lb',
  'Malaisie': 'my', 'Malaysia': 'my',
  'Maldives': 'mv',
  'Mongolie': 'mn', 'Mongolia': 'mn',
  'Myanmar': 'mm', 'Birmanie': 'mm',
  'Népal': 'np', 'Nepal': 'np',
  'Oman': 'om',
  'Ouzbékistan': 'uz', 'Uzbekistan': 'uz',
  'Pakistan': 'pk',
  'Philippines': 'ph',
  'Qatar': 'qa',
  'Arabie saoudite': 'sa', 'Saudi Arabia': 'sa',
  'Singapour': 'sg', 'Singapore': 'sg',
  'Sri Lanka': 'lk',
  'Syrie': 'sy', 'Syria': 'sy',
  'Tadjikistan': 'tj', 'Tajikistan': 'tj',
  'Thaïlande': 'th', 'Thailand': 'th',
  'Timor oriental': 'tl', 'Timor-Leste': 'tl',
  'Turkménistan': 'tm', 'Turkmenistan': 'tm',
  'Turquie': 'tr', 'Turkey': 'tr',
  'Viêt Nam': 'vn', 'Vietnam': 'vn',
  'Yémen': 'ye', 'Yemen': 'ye',

  'Albanie': 'al', 'Albania': 'al',
  'Allemagne': 'de', 'Germany': 'de',
  'Andorre': 'ad', 'Andorra': 'ad',
  'Autriche': 'at', 'Austria': 'at',
  'Belgique': 'be', 'Belgium': 'be',
  'Biélorussie': 'by', 'Belarus': 'by',
  'Bosnie-Herzégovine': 'ba', 'Bosnia and Herzegovina': 'ba',
  'Bulgarie': 'bg', 'Bulgaria': 'bg',
  'Croatie': 'hr', 'Croatia': 'hr',
  'Danemark': 'dk', 'Denmark': 'dk',
  'Espagne': 'es', 'Spain': 'es',
  'Estonie': 'ee', 'Estonia': 'ee',
  'Finlande': 'fi', 'Finland': 'fi',
  'France': 'fr',
  'Grèce': 'gr', 'Greece': 'gr',
  'Hongrie': 'hu', 'Hungary': 'hu',
  'Irlande': 'ie', 'Ireland': 'ie',
  'Islande': 'is', 'Iceland': 'is',
  'Italie': 'it', 'Italy': 'it',
  'Lettonie': 'lv', 'Latvia': 'lv',
  'Liechtenstein': 'li',
  'Lituanie': 'lt', 'Lithuania': 'lt',
  'Luxembourg': 'lu',
  'Macédoine du Nord': 'mk', 'North Macedonia': 'mk',
  'Malte': 'mt', 'Malta': 'mt',
  'Moldavie': 'md', 'Moldova': 'md',
  'Monaco': 'mc',
  'Monténégro': 'me', 'Montenegro': 'me',
  'Norvège': 'no', 'Norway': 'no',
  'Pays-Bas': 'nl', 'Netherlands': 'nl',
  'Pologne': 'pl', 'Poland': 'pl',
  'Portugal': 'pt',
  'Roumanie': 'ro', 'Romania': 'ro',
  'Royaume-Uni': 'gb', 'United Kingdom': 'gb', 'UK': 'gb',
  'Russie': 'ru', 'Russia': 'ru',
  'Saint-Marin': 'sm', 'San Marino': 'sm',
  'Serbie': 'rs', 'Serbia': 'rs',
  'Slovaquie': 'sk', 'Slovakia': 'sk',
  'Slovénie': 'si', 'Slovenia': 'si',
  'Suède': 'se', 'Sweden': 'se',
  'Suisse': 'ch', 'Switzerland': 'ch',
  'Tchéquie': 'cz', 'Czech Republic': 'cz', 'République tchèque': 'cz',
  'Ukraine': 'ua',

  'Australie': 'au', 'Australia': 'au',
  'Fidji': 'fj', 'Fiji': 'fj',
  'Kiribati': 'ki',
  'Îles Marshall': 'mh', 'Marshall Islands': 'mh',
  'États fédérés de Micronésie': 'fm', 'Micronesia': 'fm',
  'Nauru': 'nr',
  'Nouvelle-Zélande': 'nz', 'New Zealand': 'nz',
  'Palaos': 'pw', 'Palau': 'pw',
  'Papouasie-Nouvelle-Guinée': 'pg', 'Papua New Guinea': 'pg',
  'Samoa': 'ws',
  'Îles Salomon': 'sb', 'Solomon Islands': 'sb',
  'Tonga': 'to',
  'Tuvalu': 'tv',
  'Vanuatu': 'vu',

  'Hong Kong': 'hk',
  'Macao': 'mo', 'Macau': 'mo',
  'Taïwan': 'tw', 'Taiwan': 'tw',
  'Kosovo': 'xk',
  'Palestine': 'ps',
  'Vatican': 'va', 'Cité du Vatican': 'va', 'Holy See': 'va',
  'Porto Rico': 'pr', 'Puerto Rico': 'pr',
  'Groenland': 'gl', 'Greenland': 'gl',
  'Îles Féroé': 'fo', 'Faroe Islands': 'fo',
  'Gibraltar': 'gi',
  'Guernesey': 'gg',
  'Jersey': 'je',
  'Île de Man': 'im', 'Isle of Man': 'im',

  'Union européenne': 'eu', 'European Union': 'eu',
};

const getFlagUrl = (jurisdictionName: string) => {
  const normalizedName = jurisdictionName.trim()
  const code = jurisdictionFlags[normalizedName] || 'un'
  return `https://flagcdn.com/w20/${code}.png`
}

interface RelationItem {
  id: number
  name: string
  pivot?: Record<string, any>
}

export interface Framework {
  id: number
  code: string
  name: string
  version?: string | null
  type: string
  publisher?: string | null
  jurisdictions: (string | RelationItem)[] | null
  tags: (string | RelationItem)[] | null
  status: string
  description?: string | null
  updated_at?: string | null
}

interface FrameworksIndexProps {
  frameworks: PaginatedData<Framework>
}

type GroupBy = 'status' | 'type'
type ViewMode = 'table' | 'cards'

const statusColors: Record<string, { bg: string; border: string; text: string }> = {
  active:   { bg: 'bg-emerald-950/40', border: 'border-emerald-700', text: 'text-emerald-400' },
  draft:    { bg: 'bg-amber-950/40',   border: 'border-amber-700',   text: 'text-amber-400'   },
  archived: { bg: 'bg-slate-950/50',   border: 'border-slate-700',  text: 'text-slate-400'   },
}

const typeColors: Record<string, { bg: string; border: string; text: string }> = {
  standard:        { bg: 'bg-emerald-950/40', border: 'border-emerald-700', text: 'text-emerald-400' },
  regulation:      { bg: 'bg-violet-950/40',  border: 'border-violet-700',  text: 'text-violet-400' },
  contract:        { bg: 'bg-amber-950/40',   border: 'border-amber-700',   text: 'text-amber-400'  },
  internal_policy: { bg: 'bg-indigo-950/40',  border: 'border-indigo-700',  text: 'text-indigo-400' },
}

export default function FrameworksIndex({ frameworks }: FrameworksIndexProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [frameworkToDelete, setFrameworkToDelete] = useState<Framework | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [groupBy, setGroupBy] = useState<GroupBy>('status')
  const [exportLoading, setExportLoading] = useState(false)

  // Statistiques
  const statusStats = useMemo(() => {
    const data = frameworks.data
    const total = data.length
    const active   = data.filter(f => f.status?.toLowerCase() === 'active').length
    const draft    = data.filter(f => f.status?.toLowerCase() === 'draft').length
    const archived = data.filter(f => f.status?.toLowerCase() === 'archived').length

    return {
      total,
      items: [
        { label: 'Total', count: total, percent: 100, color: 'blue', icon: Building2 },
        { label: 'Active', count: active, percent: total ? Math.round((active / total) * 100) : 0, color: 'emerald', icon: CheckCircle2 },
        { label: 'Draft', count: draft, percent: total ? Math.round((draft / total) * 100) : 0, color: 'amber', icon: FileText },
        { label: 'Archived', count: archived, percent: total ? Math.round((archived / total) * 100) : 0, color: 'slate', icon: Archive },
      ]
    }
  }, [frameworks.data])

  const typeStats = useMemo(() => {
    const data = frameworks.data
    const total = data.length
    const standard       = data.filter(f => f.type?.toLowerCase() === 'standard').length
    const regulation     = data.filter(f => f.type?.toLowerCase() === 'regulation').length
    const contract       = data.filter(f => f.type?.toLowerCase() === 'contract').length
    const internalPolicy = data.filter(f => f.type?.toLowerCase() === 'internal_policy').length

    return {
      total,
      items: [
        { label: 'Total', count: total, percent: 100, color: 'blue', icon: Building2 },
        { label: 'Standard', count: standard, percent: total ? Math.round((standard / total) * 100) : 0, color: 'emerald', icon: Layers },
        { label: 'Regulation', count: regulation, percent: total ? Math.round((regulation / total) * 100) : 0, color: 'violet', icon: Globe },
        { label: 'Contract', count: contract, percent: total ? Math.round((contract / total) * 100) : 0, color: 'amber', icon: FileText },
        { label: 'Internal Policy', count: internalPolicy, percent: total ? Math.round((internalPolicy / total) * 100) : 0, color: 'indigo', icon: Building2 },
      ]
    }
  }, [frameworks.data])

  const currentStats = groupBy === 'status' ? statusStats : typeStats

  const handleExport = async () => {
    setExportLoading(true)
    try {
      const params = new URLSearchParams(window.location.search)
      const response = await fetch(`/frameworks/export?${params.toString()}`, {
        method: 'GET',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      })

      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `frameworks-${new Date().toISOString().split('T')[0]}.xlsx`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export error:', error)
    } finally {
      setExportLoading(false)
    }
  }

  // Données groupées pour Kanban
  const groupedData = useMemo(() => {
    return frameworks.data.reduce((acc, fw) => {
      const key = groupBy === 'status'
        ? (fw.status || 'other').toLowerCase()
        : (fw.type || 'other').toLowerCase()
      acc[key] = acc[key] || []
      acc[key].push(fw)
      return acc
    }, {} as Record<string, Framework[]>)
  }, [frameworks.data, groupBy])

  const columnConfig = groupBy === 'status' ? {
    keys: ['active', 'draft', 'archived'],
    getTitle: (key: string) => key.charAt(0).toUpperCase() + key.slice(1),
    colors: statusColors,
    field: 'status' as const,
  } : {
    keys: ['standard', 'regulation', 'contract', 'internal_policy'],
    getTitle: (key: string) =>
      key === 'internal_policy' ? 'Internal Policy' :
      key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    colors: typeColors,
    field: 'type' as const,
  }

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    const frameworkId = Number(draggableId)
    const newValue = destination.droppableId

    router.put(`/frameworks/${frameworkId}`, { [columnConfig.field]: newValue }, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        // toast.success("Framework updated")
      },
      onError: (errors) => console.error('Update failed', errors),
    })
  }

  // ─── Colonnes du tableau ────────────────────────────────
  const columns: ColumnDef<Framework>[] = [
    {
      accessorKey: 'code',
      header: ({ column }) => (
        <div className="flex items-center gap-1.5">
          <Key className="h-4 w-4 text-muted-foreground" />
          <DataTableColumnHeader column={column} title="Code" />
        </div>
      ),
      cell: ({ row }) => <div className="font-mono font-medium">{row.getValue('code')}</div>,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <div className="flex items-center gap-1.5">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          <DataTableColumnHeader column={column} title="Name" />
        </div>
      ),
      cell: ({ row }) => (
        <Link href={`/frameworks/${row.original.id}`} className="font-medium hover:underline">
          {row.getValue('name')}
        </Link>
      ),
    },
    {
      accessorKey: 'version',
      header: ({ column }) => (
        <div className="flex items-center gap-1.5">
          <RefreshCw className="h-4 w-4 text-muted-foreground" />
          <DataTableColumnHeader column={column} title="Version" />
        </div>
      ),
      cell: ({ row }) => row.getValue('version') ?? '—',
    },
    {
      accessorKey: 'type',
      header: ({ column }) => (
        <div className="flex items-center gap-1.5">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <DataTableColumnHeader column={column} title="Type" />
        </div>
      ),
      cell: ({ row }) => {
        const typeVal = (row.getValue('type') as string)?.toLowerCase() || 'other'
        const { bg, border, text } = typeColors[typeVal] || typeColors.standard
        return (
          <Badge variant="outline" className={`capitalize ${bg} ${border} ${text}`}>
            {(row.getValue('type') as string)?.replace('_', ' ') || '—'}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'publisher',
      header: ({ column }) => (
        <div className="flex items-center gap-1.5">
          <User className="h-4 w-4 text-muted-foreground" />
          <DataTableColumnHeader column={column} title="Publisher" />
        </div>
      ),
      cell: ({ row }) => row.getValue('publisher') ?? '—',
    },
    {
      id: 'jurisdictions',
      header: ({ column }) => (
        <div className="flex items-center gap-1.5">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <DataTableColumnHeader column={column} title="Jurisdictions" />
        </div>
      ),
      cell: ({ row }) => {
        const items = row.original.jurisdictions || []
        if (!items.length) return <span className="text-muted-foreground text-xs">—</span>

        return (
          <div className="flex flex-wrap gap-1">
            {items.slice(0, 5).map((item, i) => {
              const name = typeof item === 'string' ? item : item.name || '—'
              const flagUrl = getFlagUrl(name)
              return (
                <Badge key={i} variant="outline" className="text-xs flex items-center gap-1 px-2 py-0.5">
                  <img
                    src={flagUrl}
                    alt={`${name} flag`}
                    className="w-4 h-3 rounded-sm object-cover"
                    loading="lazy"
                  />
                  {name}
                </Badge>
              )
            })}
            {items.length > 5 && <Badge variant="outline" className="text-xs px-2 py-0.5">+{items.length - 5}</Badge>}
          </div>
        )
      },
      enableSorting: false,
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <div className="flex items-center gap-1.5">
          <SignalHigh className="h-4 w-4 text-muted-foreground" />
          <DataTableColumnHeader column={column} title="Status" />
        </div>
      ),
      cell: ({ row }) => {
        const statusVal = (row.getValue('status') as string)?.toLowerCase() || 'other'
        const { bg, border, text } = statusColors[statusVal] || statusColors.archived
        return (
          <Badge variant="outline" className={`capitalize ${bg} ${border} ${text}`}>
            {statusVal.charAt(0).toUpperCase() + statusVal.slice(1)}
          </Badge>
        )
      },
    },
    {
      id: 'tags',
      header: ({ column }) => (
        <div className="flex items-center gap-1.5">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <DataTableColumnHeader column={column} title="Tags" />
        </div>
      ),
      cell: ({ row }) => {
        const tags = row.original.tags || []
        if (!tags.length) return <span className="text-muted-foreground text-xs">—</span>

        return (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag, i) => {
              const name = typeof tag === 'string' ? tag : (tag as RelationItem).name || '—'
              return <Badge key={i} variant="secondary" className="text-xs">{name}</Badge>
            })}
            {tags.length > 3 && <Badge variant="secondary" className="text-xs">+{tags.length - 3}</Badge>}
          </div>
        )
      },
      enableSorting: false,
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const framework = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => router.visit(`/frameworks/${framework.id}`)}>
                <Eye className="mr-2 h-4 w-4" /> View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.visit(`/frameworks/${framework.id}/edit`)}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:bg-destructive/10"
                onClick={() => {
                  setFrameworkToDelete(framework)
                  setDeleteDialogOpen(true)
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const handleDeleteConfirm = () => {
    if (frameworkToDelete) {
      router.delete(`/frameworks/${frameworkToDelete.id}`, {
        onSuccess: () => {
          setDeleteDialogOpen(false)
          setFrameworkToDelete(null)
        },
      })
    }
  }

  return (
    <AppLayout>
      <Head title="Frameworks" />

      <div className="container mx-auto space-y-6 py-6 px-4 md:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Frameworks</h1>
            <p className="text-muted-foreground mt-1.5">
              Manage compliance and regulatory frameworks
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button asChild>
              <Link href="/frameworks/create">
                <Plus className="mr-2 h-4 w-4" />
                New Framework
              </Link>
            </Button>

          {/*   <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleExport}
                    disabled={exportLoading}
                  >
                    {exportLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Export to Excel</TooltipContent>
              </Tooltip>
            </TooltipProvider> */}

            <Tabs
              value={viewMode}
              onValueChange={(v) => setViewMode(v as ViewMode)}
              className="hidden sm:block"
            >
              <TabsList className="grid w-44 grid-cols-2">
                <TabsTrigger value="table">
                  <TableIcon className="mr-2 h-4 w-4" />
                  Table
                </TabsTrigger>
                <TabsTrigger value="cards">
                  <LayoutGrid className="mr-2 h-4 w-4" />
                  Cards
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {currentStats.items.map((stat, i) => (
            <Card
              key={stat.label}
              className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <stat.icon className="h-4 w-4" />
                  {stat.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {stat.count}
                  {i > 0 && (
                    <span className="ml-2 text-base font-normal text-muted-foreground">
                      ({stat.percent}%)
                    </span>
                  )}
                </div>
                <div className="mt-3 h-1.5 w-full rounded-full bg-muted/60 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out bg-${stat.color}-600`}
                    style={{ width: `${stat.percent}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Separator className="my-6" />

        {viewMode === 'table' ? (
          <ServerDataTable
            columns={columns}
            data={frameworks}
            searchPlaceholder="Search code, name, publisher..."
            onExport={handleExport}
            exportLoading={exportLoading}
            filters={
              <>
                <DataTableFacetedFilter
                  filterKey="status"
                  title="Status"
                  options={[
                    { label: 'Active', value: 'active', icon: CheckCircle2 },
                    { label: 'Draft', value: 'draft', icon: FileText },
                    { label: 'Archived', value: 'archived', icon: Archive },
                  ]}
                />
                <DataTableSelectFilter
                  filterKey="type"
                  title="Type"
                  placeholder="All types"
                  options={[
                    { label: 'All', value: 'all' },
                    { label: 'Standard', value: 'standard' },
                    { label: 'Regulation', value: 'regulation' },
                    { label: 'Contract', value: 'contract' },
                    { label: 'Internal Policy', value: 'internal_policy' },
                  ]}
                />
              </>
            }
            initialState={{ columnPinning: { right: ['actions'] } }}
          />
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h2 className="text-lg font-semibold tracking-tight">
                {groupBy === 'status' ? 'Status Board' : 'Type Board'}
              </h2>

              <Select value={groupBy} onValueChange={(v) => setGroupBy(v as GroupBy)}>
                <SelectTrigger className="w-48">
                  <ListFilter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Group by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="status">Group by Status</SelectItem>
                  <SelectItem value="type">Group by Type</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
              <div className="overflow-x-auto pb-6 scrollbar-thin">
                <div className="grid grid-flow-col auto-cols-[minmax(320px,1fr)] gap-5 lg:gap-6">
                  {columnConfig.keys.map((key) => {
                    const items = groupedData[key] || []
                    const color = columnConfig.colors[key] || { bg: 'bg-muted/40', border: 'border-muted', text: 'text-muted-foreground' }

                    return (
                      <Droppable droppableId={key} key={key}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={cn(
                              "flex flex-col min-w-[320px] rounded-xl border bg-gradient-to-b from-card/80 to-card/40 shadow-sm transition-all duration-200",
                              snapshot.isDraggingOver && "ring-2 ring-primary/50 shadow-xl"
                            )}
                          >
                            <div className={cn(
                              "px-5 py-4 rounded-t-xl border-b font-medium text-lg flex items-center justify-between",
                              color.bg,
                              color.border,
                              "border-b-2"
                            )}>
                              <span>{columnConfig.getTitle(key)}</span>
                              <Badge variant="outline" className="bg-background/70">
                                {items.length}
                              </Badge>
                            </div>

                            <div className="p-4 flex-1 space-y-4 min-h-[500px]">
                              {items.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-muted-foreground/70 italic py-12">
                                  Empty column
                                </div>
                              ) : (
                                items.map((fw, idx) => (
                                  <Draggable key={fw.id} draggableId={String(fw.id)} index={idx}>
                                    {(dragProvided, dragSnapshot) => (
                                      <Card
                                        ref={dragProvided.innerRef}
                                        {...dragProvided.draggableProps}
                                        className={cn(
                                          "transition-all duration-200 cursor-grab active:cursor-grabbing",
                                          dragSnapshot.isDragging
                                            ? "shadow-2xl ring-2 ring-primary/60 scale-[1.02]"
                                            : "hover:shadow-md hover:ring-1 hover:ring-primary/30"
                                        )}
                                      >
                                        <CardContent className="p-4 space-y-3">
                                          <div className="flex items-start justify-between gap-3">
                                            <div {...dragProvided.dragHandleProps}>
                                              <GripVertical className="h-5 w-5 text-muted-foreground/70 hover:text-foreground transition-colors" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                              <div className="font-medium leading-tight mb-1.5">
                                                {fw.code} — {fw.name}
                                              </div>
                                              <p className="text-sm text-muted-foreground line-clamp-2">
                                                {fw.description || 'No description provided'}
                                              </p>
                                            </div>
                                          </div>

                                          <div className="flex flex-wrap gap-2 pt-2">
                                            <Badge variant="outline" className="text-xs">
                                              v{fw.version || '—'}
                                            </Badge>
                                            <Badge variant="outline" className="text-xs">
                                              {fw.type?.replace('_', ' ') || '—'}
                                            </Badge>
                                            <Badge
                                              variant="outline"
                                              className={cn(
                                                "text-xs",
                                                statusColors[fw.status?.toLowerCase() as keyof typeof statusColors]?.text || 'text-muted-foreground'
                                              )}
                                            >
                                              {fw.status || '—'}
                                            </Badge>
                                          </div>

                                          {fw.jurisdictions && fw.jurisdictions.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 pt-2">
                                              {fw.jurisdictions.slice(0, 4).map((j, i) => {
                                                const name = typeof j === 'string' ? j : j.name || '—'
                                                const flagUrl = getFlagUrl(name)
                                                return (
                                                  <Badge
                                                    key={i}
                                                    variant="outline"
                                                    className="text-xs flex items-center gap-1.5 px-2.5 py-1"
                                                  >
                                                    <img
                                                      src={flagUrl}
                                                      alt={`${name} flag`}
                                                      className="w-5 h-4 rounded-sm object-cover"
                                                      loading="lazy"
                                                    />
                                                    <span className="truncate max-w-[140px]">{name}</span>
                                                  </Badge>
                                                )
                                              })}
                                              {fw.jurisdictions.length > 4 && (
                                                <Badge variant="outline" className="text-xs px-2.5 py-1">
                                                  +{fw.jurisdictions.length - 4}
                                                </Badge>
                                              )}
                                            </div>
                                          )}

                                          {fw.tags && fw.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 pt-1">
                                              {fw.tags.slice(0, 4).map((tag, i) => {
                                                const name = typeof tag === 'string' ? tag : (tag as RelationItem).name || '—'
                                                return <Badge key={i} variant="secondary" className="text-xs">{name}</Badge>
                                              })}
                                              {fw.tags.length > 4 && (
                                                <Badge variant="secondary" className="text-xs">
                                                  +{fw.tags.length - 4}
                                                </Badge>
                                              )}
                                            </div>
                                          )}

                                          <div className="pt-3 flex gap-2">
                                            <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" asChild>
                                              <Link href={`/frameworks/${fw.id}`}>
                                                <Eye className="mr-1.5 h-3.5 w-3.5" />
                                                View
                                              </Link>
                                            </Button>
                                            <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" asChild>
                                              <Link href={`/frameworks/${fw.id}/edit`}>
                                                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                                                Edit
                                              </Link>
                                            </Button>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    )}
                                  </Draggable>
                                ))
                              )}
                              {provided.placeholder}
                            </div>
                          </div>
                        )}
                      </Droppable>
                    )
                  })}
                </div>
              </div>
            </DragDropContext>
          </div>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Framework</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{frameworkToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  )
}