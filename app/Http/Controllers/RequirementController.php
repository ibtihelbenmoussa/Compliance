<?php

namespace App\Http\Controllers;

use App\Models\Requirement;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Framework;
use App\Models\Process;
use App\Models\Tag;

class RequirementController extends Controller
{
      public function index(Request $request)
    {
        $user = auth()->user();
        $currentOrgId = $user->current_organization_id;

        // Redirection si aucune organisation sélectionnée
        if (!$currentOrgId) {
            return redirect()->route('organizations.select.page')
                ->with('error', 'Please select an organization first.');
        }

        // Requête de base
        $query = Requirement::where('organization_id', $currentOrgId)
            ->with(['framework', 'process']);  // Charger les relations

        // Recherche (code ou titre)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                  ->orWhere('title', 'like', "%{$search}%");
            });
        }

        // Filtres (tu peux en ajouter/supprimer selon tes besoins)
        if ($request->filled('filter.status')) {
            $query->where('status', $request->input('filter.status'));
        }

        if ($request->filled('filter.type') && $request->input('filter.type') !== 'all') {
            $query->where('type', $request->input('filter.type'));
        }

        if ($request->filled('filter.priority') && $request->input('filter.priority') !== 'all') {
            $query->where('priority', $request->input('filter.priority'));
        }

        // Tri (comme pour Frameworks)
        if ($request->filled('sort')) {
            $sort = $request->sort;
            $direction = str_starts_with($sort, '-') ? 'desc' : 'asc';
            $column = ltrim($sort, '-');
            $query->orderBy($column, $direction);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        // Pagination + garder les query strings (filtres, recherche, tri)
        $requirements = $query->paginate(15)->withQueryString();

        // Charger tous les tags existants pour l'affichage
        $allTags = Tag::pluck('name', 'id')->toArray();

        // Décoder les tags JSON et les transformer en noms
        $requirements->getCollection()->each(function ($req) use ($allTags) {
            $tagIds = json_decode($req->tags ?? '[]', true) ?? [];
            $req->tags = collect($tagIds)
                ->map(fn($id) => $allTags[$id] ?? null)
                ->filter()
                ->values()
                ->toArray();
        });

        return Inertia::render('Requirements/Index', [
            'requirements' => $requirements
        ]);
    }
    public function create()
{
    return Inertia::render('Requirements/Create', [
        'frameworks' => Framework::select('id', 'code', 'name')->get(),
        'processes' => Process::select('id', 'name')->get(),
        'tags' => Tag::select('id', 'name')->get(),
    ]);
}
public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:255|unique:requirements,code',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:regulatory,internal,contractual',
            'status' => 'required|in:active,inactive,draft,archived',
            'priority' => 'required|in:low,medium,high',
            'frequency' => 'required|in:one_time,daily,weekly,monthly,quarterly,yearly,continuous',
            'framework_id' => 'required|exists:frameworks,id',
            'process_id' => 'nullable|exists:processes,id',
            'owner_id' => 'nullable|string|max:255',
            'tags' => 'nullable|array',
            'tags.*' => 'string',
            'deadline' => 'nullable|date',
            'completion_date' => 'nullable|date',
            'compliance_level' => 'required|in:Mandatory,Recommended,Optional',
            'attachments' => 'nullable|string',
        ]);

        Requirement::create($validated);

        return redirect()->route('requirements.index')
            ->with('success', 'Requirement created successfully.');
    }
}
