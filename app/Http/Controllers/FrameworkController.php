<?php

namespace App\Http\Controllers;

use App\Models\Framework;
use App\Models\Tag;
use App\Models\Jurisdiction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\FrameworksExport;
use Illuminate\Support\Collection;


class FrameworkController extends Controller
{
   public function index(Request $request)
{
    $user = auth()->user();
    $currentOrgId = $user->current_organization_id;

    if (!$currentOrgId) {
        return redirect()->route('organizations.select.page')
            ->with('error', 'Please select an organization first.');
    }

    $query = Framework::where('is_deleted', 0)
        ->where('organization_id', $currentOrgId)
        ->with('jurisdiction');

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

    $allTags = Tag::pluck('name', 'id')->toArray();

    $frameworks->getCollection()->each(function ($fw) use ($allTags) {
        $tagIds = json_decode($fw->tags ?? '[]', true) ?? [];
        $fw->tags = collect($tagIds)
            ->map(fn($id) => $allTags[$id] ?? null)
            ->filter()
            ->values()
            ->toArray();
    });

    return Inertia::render('Frameworks/Index', [
        'frameworks' => $frameworks
    ]);
}

    public function create()
    {
        $user = auth()->user();
        $currentOrgId = $user->current_organization_id;

        $jurisdictions = Jurisdiction::where('is_deleted', 0)
            ->where('organization_id', $currentOrgId)
            ->get();

        $tags = Tag::where('is_deleted', 0)
            ->where('organization_id', $currentOrgId)
            ->get();

        return Inertia::render('Frameworks/Create', [
            'jurisdictions' => $jurisdictions,
            'tags' => $tags,
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
            'scope'           => 'nullable|string',
            'status'          => 'required|in:active,draft,deprecated,archived',
            'release_date'    => 'nullable|date',
            'effective_date'  => 'nullable|date',
            'retired_date'    => 'nullable|date',
            'description'     => 'nullable|string',
            'language'        => 'nullable|string',
            'url_reference'   => 'nullable|url',
            'jurisdiction_id' => 'nullable|exists:jurisdictions,id',
        ]);

        Framework::create([
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
            'jurisdiction_id' => $data['jurisdiction_id'] ?? null,
        ]);

        return redirect('/frameworks')
            ->with('success', 'Framework created successfully.');
    }

    public function show(Framework $framework)
    {
        $user = auth()->user();
        $currentOrgId = $user->current_organization_id;

        if ($framework->organization_id != $currentOrgId || $framework->is_deleted) {
            abort(403, 'Unauthorized');
        }

        $allTags = Tag::pluck('name', 'id')->toArray();

        $tagIds = json_decode($framework->tags ?? '[]', true) ?? [];
        $framework->tags_names = collect($tagIds)
            ->map(fn($id) => $allTags[$id] ?? null)
            ->filter()
            ->values()
            ->toArray();

        $framework->jurisdiction_name = $framework->jurisdiction?->name ?? null;

        return Inertia::render('Frameworks/Show', [
            'framework' => $framework
        ]);
    }

    public function edit(Framework $framework)
    {
        $user = auth()->user();
        $currentOrgId = $user->current_organization_id;

        $jurisdictions = Jurisdiction::where('is_deleted', 0)
            ->where('organization_id', $currentOrgId)
            ->get(['id', 'name']);

        $tags = Tag::where('is_deleted', 0)
            ->where('organization_id', $currentOrgId)
            ->get(['id', 'name']);

        $selectedTagIds = collect(
            json_decode($framework->tags ?? '[]', true) ?? []
        )->map(fn($id) => (string) $id)->values();

        return Inertia::render('Frameworks/Edit', [
            'framework'       => $framework,
            'jurisdictions'   => $jurisdictions,
            'tags'            => $tags,
            'selectedTagIds'  => $selectedTagIds,
        ]);
    }

    public function update(Request $request, Framework $framework)
    {
        $data = $request->validate([
            'code'            => 'required|unique:frameworks,code,' . $framework->id,
            'name'            => 'required|string|max:255',
            'version'         => 'nullable|string|max:255',
            'type'            => 'required|in:standard,regulation,contract,internal_policy',
            'publisher'       => 'nullable|string|max:255',
            'jurisdiction_id' => 'nullable|exists:jurisdictions,id',
            'tags'            => 'nullable|array',
            'tags.*'          => 'string',
            'scope'           => 'nullable|string',
            'status'          => 'required|in:active,draft,deprecated,archived',
            'release_date'    => 'nullable|date',
            'effective_date'  => 'nullable|date',
            'retired_date'    => 'nullable|date',
            'description'     => 'nullable|string',
            'language'        => 'nullable|string',
            'url_reference'   => 'nullable|url',
        ]);

        if (isset($data['tags'])) {
            $data['tags'] = json_encode($data['tags']);
        }

        $framework->update($data);

        return redirect('/frameworks')
            ->with('success', 'Framework updated successfully.');
    }

    public function destroy(Framework $framework)
    {
        $framework->is_deleted = 1;
        $framework->save();

        return redirect('/frameworks')
            ->with('success', 'Framework deleted successfully.');
    }

    /**
     * Export filtered frameworks to Excel
     */
  public function export(Request $request)
{
    $user = auth()->user();
    $currentOrgId = $user->current_organization_id;

    if (!$currentOrgId) {
        abort(403, 'Please select an organization first.');
    }

    $query = Framework::where('is_deleted', 0)
        ->where('organization_id', $currentOrgId)
        ->with('jurisdiction');

    // Search filter (from ?search=...)
    if ($request->filled('search')) {
        $search = $request->search;
        $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('code', 'like', "%{$search}%");
        });
    }

    // Status filter (filter[status]=active)
    if ($request->filled('filter.status')) {
        $query->where('status', $request->input('filter.status'));
    }

    // Type filter (filter[type]=regulation)
    if ($request->filled('filter.type') && $request->input('filter.type') !== 'all') {
        $query->where('type', $request->input('filter.type'));
    }

    // Sorting (sort=name or sort=-created_at)
    if ($request->filled('sort')) {
        $sort = $request->sort;
        $direction = str_starts_with($sort, '-') ? 'desc' : 'asc';
        $column = ltrim($sort, '-');
        $query->orderBy($column, $direction);
    } else {
        $query->orderBy('created_at', 'desc');
    }

    $frameworks = $query->get();

    // Transform tags (exactly like in index())
    $allTags = Tag::pluck('name', 'id')->toArray();

    $frameworks->each(function ($fw) use ($allTags) {
        $tagIds = json_decode($fw->tags ?? '[]', true) ?? [];
        $fw->tags_names = collect($tagIds)
            ->map(fn($id) => $allTags[$id] ?? null)
            ->filter()
            ->values()
            ->toArray();
    });

    return Excel::download(
        new FrameworksExport($frameworks),
        'frameworks-' . now()->format('Y-m-d-His') . '.xlsx'
    );
}

}