<?php

namespace App\Http\Controllers;

use App\Models\Framework;
use App\Models\Tag;
use App\Models\Jurisdiction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\FrameworksExport;

class FrameworkController extends Controller
{

   public function index(Request $request)
{
    $user = auth()->user();
    $currentOrgId = $user->current_organization_id;

    if (!$currentOrgId) {
        return redirect()->route('organizations.select.page')
            ->with('error', 'Veuillez sélectionner une organisation d\'abord.');
    }

    $query = Framework::where('is_deleted', 0)
        ->where('organization_id', $currentOrgId)
        ->with('jurisdictions');

    if ($request->filled('search')) {
        $search = $request->search;
        $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('code', 'like', "%{$search}%");
        });
    }

    if ($request->filled('filter.status')) {
        $query->where('status', $request->input('filter.status'));
    }

    if ($request->filled('filter.type') && $request->input('filter.type') !== 'all') {
        $query->where('type', $request->input('filter.type'));
    }

    if ($request->filled('sort')) {
        $sort = $request->sort;
        $direction = str_starts_with($sort, '-') ? 'desc' : 'asc';
        $column = ltrim($sort, '-');
        $query->orderBy($column, $direction);
    } else {
        $query->orderBy('created_at', 'desc');
    }

    $frameworks = $query->paginate(15)->withQueryString();

    $allTags = Tag::where('is_deleted', 0)
        ->pluck('name', 'id')
        ->toArray();

    $frameworks->getCollection()->transform(function ($fw) use ($allTags) {
        // Tags
        $tagIds = json_decode($fw->tags ?? '[]', true) ?? [];
        $fw->tags = collect($tagIds)
            ->map(fn($id) => $allTags[$id] ?? null)
            ->filter()
            ->values()
            ->toArray();

        // Juridictions - protection contre null
        $fw->jurisdictions = $fw->jurisdictions
            ? $fw->jurisdictions->pluck('name')->toArray()
            : [];

        return $fw;
    });

    return Inertia::render('Frameworks/Index', [
        'frameworks' => $frameworks
    ]);
}
    public function create()
    {
        $user = auth()->user();
        $currentOrgId = $user->current_organization_id;

        return Inertia::render('Frameworks/Create', [
            'jurisdictions' => Jurisdiction::where('is_deleted', 0)
                ->where('organization_id', $currentOrgId)
                ->get(['id', 'name']),
            'tags' => Tag::where('is_deleted', 0)
                ->where('organization_id', $currentOrgId)
                ->get(['id', 'name']),
        ]);
    }


    public function store(Request $request)
    {
        $user = auth()->user();
        $currentOrgId = $user->current_organization_id;

        $data = $request->validate([
            'code'            => 'required|string|max:255',
            'name'            => 'required|string|max:255',
            'version'         => 'nullable|string|max:255',
            'type'            => 'required|in:standard,regulation,contract,internal_policy',
            'publisher'       => 'nullable|string|max:255',
            'tags'            => 'nullable|array',
            'tags.*'          => 'exists:tags,id',
            'jurisdictions'   => 'nullable|array',
            'jurisdictions.*' => 'exists:jurisdictions,id',
            'scope'           => 'nullable|string',
            'status'          => 'required|in:active,draft,deprecated,archived',
            'release_date'    => 'nullable|date',
            'effective_date'  => 'nullable|date',
            'retired_date'    => 'nullable|date',
            'description'     => 'nullable|string',
            'language'        => 'nullable|string',
            'url_reference'   => 'nullable|url',
        ]);

        $framework = Framework::create([
            'name'            => $data['name'],
            'code'            => $data['code'],
            'version'         => $data['version'] ?? null,
            'type'            => $data['type'],
            'publisher'       => $data['publisher'] ?? null,
            'scope'           => $data['scope'] ?? null,
            'status'          => $data['status'],
            'release_date'    => $data['release_date'] ?? null,
            'effective_date'  => $data['effective_date'] ?? null,
            'retired_date'    => $data['retired_date'] ?? null,
            'description'     => $data['description'] ?? null,
            'language'        => $data['language'] ?? null,
            'url_reference'   => $data['url_reference'] ?? null,
            'organization_id' => $currentOrgId,
            'tags'            => !empty($data['tags']) ? json_encode($data['tags']) : null,
        ]);

        $framework->jurisdictions()->sync($data['jurisdictions'] ?? []);

        return redirect('/frameworks')->with('success', 'Framework created successfully.');
    }


   public function show(Framework $framework)
{
    $this->authorizeFramework($framework);

    $framework->load('jurisdictions');

    $allTags = Tag::pluck('name', 'id')->toArray();

    $tagIds = json_decode($framework->tags ?? '[]', true) ?: [];

    $framework->tags_names = collect($tagIds)
        ->map(fn($id) => $allTags[$id] ?? null)
        ->filter()
        ->values()
        ->toArray();

    $framework->jurisdictions_names = collect($framework->jurisdictions)
        ->pluck('name')
        ->filter()
        ->values()
        ->toArray();

    return Inertia::render('Frameworks/Show', [
        'framework' => $framework
    ]);
}


/* public function edit(Framework $framework)
{
    $user = auth()->user();
    $currentOrgId = $user->current_organization_id;

    $framework->load('jurisdictions');

    $jurisdictions = Jurisdiction::where('is_deleted', 0)
        ->where('organization_id', $currentOrgId)
        ->get(['id', 'name']);

    $tags = Tag::where('is_deleted', 0)
        ->where('organization_id', $currentOrgId)
        ->get(['id', 'name']);

    $selectedTagIds = collect(json_decode($framework->tags ?? '[]', true))
        ->map(fn($id) => (string)$id)
        ->values();

    $selectedJurisdictionIds = $framework->jurisdictions
        ? $framework->jurisdictions->pluck('id')->map(fn($id) => (string)$id)->values()
        : collect(); 

    return Inertia::render('Frameworks/Edit', [
        'framework' => $framework,
        'jurisdictions' => $jurisdictions,
        'tags' => $tags,
        'selectedTagIds' => $selectedTagIds,
        'selectedJurisdictionIds' => $selectedJurisdictionIds,
    ]);
} */


public function edit(Framework $framework)
{
    $this->authorizeFramework($framework);

    $user = auth()->user();
    $currentOrgId = $user->current_organization_id;

    // 1. Charger explicitement la relation (très important)
    $framework->load('jurisdictions');

    // 2. Récupérer les listes disponibles pour le select
    $jurisdictions = Jurisdiction::where('is_deleted', 0)
        ->where('organization_id', $currentOrgId)
        ->get(['id', 'name']);

    $tags = Tag::where('is_deleted', 0)
        ->where('organization_id', $currentOrgId)
        ->get(['id', 'name']);

    // 3. IDs des juridictions déjà attachées (sécurisé contre null)
    $selectedJurisdictionIds = collect($framework->jurisdictions)
        ->pluck('id')
        ->map(fn($id) => (string) $id)
        ->values()
        ->toArray();

    $selectedTagIds = collect(json_decode($framework->tags ?? '[]', true) ?: [])
        ->map(fn($id) => (string) $id)
        ->values()
        ->toArray();

   
/*     dd([
        'framework_id'                    => $framework->id,
        'framework_tags_json_raw'         => $framework->tags,
        'selectedTagIds'                  => $selectedTagIds,
        'framework_jurisdictions_count'   => $framework->jurisdictions?->count() ?? 0,
        'selectedJurisdictionIds'         => $selectedJurisdictionIds,
        'jurisdictions_from_pivot_direct' => \DB::table('framework_jurisdiction')
            ->where('framework_id', $framework->id)
            ->pluck('jurisdiction_id')
            ->toArray(),
    ]); 
     */

    return Inertia::render('Frameworks/Edit', [
        'framework'               => $framework,
        'jurisdictions'           => $jurisdictions,
        'tags'                    => $tags,
        'selectedTagIds'          => $selectedTagIds,
        'selectedJurisdictionIds' => $selectedJurisdictionIds,
    ]);
}
    public function update(Request $request, Framework $framework)
    {
        $this->authorizeFramework($framework);

        $data = $request->validate([
            'code'            => 'required|unique:frameworks,code,' . $framework->id,
            'name'            => 'required|string|max:255',
            'version'         => 'nullable|string|max:255',
            'type'            => 'required|in:standard,regulation,contract,internal_policy',
            'publisher'       => 'nullable|string|max:255',
            'tags'            => 'nullable|array',
            'tags.*'          => 'exists:tags,id',
            'jurisdictions'   => 'nullable|array',
            'jurisdictions.*' => 'exists:jurisdictions,id',
            'scope'           => 'nullable|string',
            'status'          => 'required|in:active,draft,deprecated,archived',
            'release_date'    => 'nullable|date',
            'effective_date'  => 'nullable|date',
            'retired_date'    => 'nullable|date',
            'description'     => 'nullable|string',
            'language'        => 'nullable|string',
            'url_reference'   => 'nullable|url',
        ]);

        $framework->update([
            'name'           => $data['name'],
            'code'           => $data['code'],
            'version'        => $data['version'] ?? null,
            'type'           => $data['type'],
            'publisher'      => $data['publisher'] ?? null,
            'scope'          => $data['scope'] ?? null,
            'status'         => $data['status'],
            'release_date'   => $data['release_date'] ?? null,
            'effective_date' => $data['effective_date'] ?? null,
            'retired_date'   => $data['retired_date'] ?? null,
            'description'    => $data['description'] ?? null,
            'language'       => $data['language'] ?? null,
            'url_reference'  => $data['url_reference'] ?? null,
            'tags'           => !empty($data['tags']) ? json_encode($data['tags']) : null,
        ]);

        $framework->jurisdictions()->sync($data['jurisdictions'] ?? []);

        return redirect('/frameworks')->with('success', 'Framework updated successfully.');
    }

    public function destroy(Framework $framework)
    {
        $this->authorizeFramework($framework);
        $framework->update(['is_deleted' => 1]);

        return redirect('/frameworks')->with('success', 'Framework deleted successfully.');
    }

    public function export()
    {
        $frameworks = Framework::where('is_deleted', 0)
            ->with(['jurisdictions'])
            ->get();

        return Excel::download(
            new FrameworksExport($frameworks),
            'frameworks-' . now()->format('Y-m-d-His') . '.xlsx'
        );
    }


    private function authorizeFramework($framework)
    {
        $user = auth()->user();
        if ($framework->organization_id != $user->current_organization_id || $framework->is_deleted) {
            abort(403, 'Unauthorized');
        }
    }
}
