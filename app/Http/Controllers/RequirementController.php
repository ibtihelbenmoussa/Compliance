<?php

namespace App\Http\Controllers;

use App\Models\Requirement;
use App\Models\Framework;
use App\Models\Process;
use App\Models\Tag;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\RequirementsExport;
use Carbon\Carbon;

class RequirementController extends Controller
{
    /**
     * Display a listing of the requirements with priority statistics.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $currentOrgId = $user->current_organization_id;

        if (!$currentOrgId) {
            return redirect()->route('organizations.select.page')
                ->with('error', 'Please select an organization first.');
        }

        $query = Requirement::where('organization_id', $currentOrgId)
            ->where('is_deleted', 0)
            ->with(['framework', 'process']);

        // Recherche
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                  ->orWhere('title', 'like', "%{$search}%");
            });
        }

        // Filtres
        if ($request->filled('filter.status')) {
            $query->where('status', $request->input('filter.status'));
        }

        if ($request->filled('filter.type') && $request->input('filter.type') !== 'all') {
            $query->where('type', $request->input('filter.type'));
        }

        if ($request->filled('filter.priority') && $request->input('filter.priority') !== 'all') {
            $query->where('priority', $request->input('filter.priority'));
        }

        // Tri
        if ($request->filled('sort')) {
            $sort = $request->sort;
            $direction = str_starts_with($sort, '-') ? 'desc' : 'asc';
            $column = ltrim($sort, '-');
            $query->orderBy($column, $direction);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        // Pagination
        $requirements = $query->paginate(15)->withQueryString();

        // Statistiques par priorité (sur toutes les exigences, pas seulement la page paginée)
        $allForStats = Requirement::where('organization_id', $currentOrgId)
            ->where('is_deleted', 0)
            ->get(['priority']);

        $total = $allForStats->count();
        $lowCount    = $allForStats->where('priority', 'low')->count();
        $mediumCount = $allForStats->where('priority', 'medium')->count();
        $highCount   = $allForStats->where('priority', 'high')->count();

        $lowPercent    = $total > 0 ? round(($lowCount / $total) * 100) : 0;
        $mediumPercent = $total > 0 ? round(($mediumCount / $total) * 100) : 0;
        $highPercent   = $total > 0 ? round(($highCount / $total) * 100) : 0;

        // Transformation des tags pour l'affichage
        $allTags = Tag::pluck('name', 'id')->toArray();

        $requirementsTransformed = $requirements->getCollection()->map(function ($req) use ($allTags) {
            $tagIds = json_decode($req->tags ?? '[]', true) ?? [];
            $tags = collect($tagIds)
                ->map(fn($id) => $allTags[$id] ?? null)
                ->filter()
                ->values()
                ->toArray();

            return [
                'id'               => $req->id,
                'code'             => $req->code,
                'title'            => $req->title,
                'description'      => $req->description,
                'type'             => $req->type,
                'status'           => $req->status,
                'priority'         => $req->priority,
                'frequency'        => $req->frequency,
                'framework'        => $req->framework ? [
                    'code' => $req->framework->code,
                    'name' => $req->framework->name,
                ] : null,
                'process'          => $req->process ? [
                    'name' => $req->process->name,
                ] : null,
                'owner_id'         => $req->owner_id,
                'tags'             => $tags,
                'deadline'         => $req->deadline,
                'completion_date'  => $req->completion_date,
                'compliance_level' => $req->compliance_level,
                'attachments'      => $req->attachments,
                'created_at'       => $req->created_at,
                'updated_at'       => $req->updated_at,
            ];
        });

        $requirements->setCollection($requirementsTransformed);

        return Inertia::render('Requirements/Index', [
            'requirements' => $requirements,
            'stats' => [
                'total'         => $total,
                'lowCount'      => $lowCount,
                'mediumCount'   => $mediumCount,
                'highCount'     => $highCount,
                'lowPercent'    => $lowPercent,
                'mediumPercent' => $mediumPercent,
                'highPercent'   => $highPercent,
            ],
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
        $user = Auth::user();
        $currentOrgId = $user->current_organization_id;

        $validated = $request->validate([
            'code'             => 'required|string|max:255|unique:requirements,code',
            'title'            => 'required|string|max:255',
            'description'      => 'nullable|string',
            'type'             => 'required|in:regulatory,internal,contractual',
            'status'           => 'required|in:active,inactive,draft,archived',
            'priority'         => 'required|in:low,medium,high',
            'frequency'        => 'required|in:one_time,daily,weekly,monthly,quarterly,yearly,continuous',
            'framework_id'     => 'required|exists:frameworks,id',
            'process_id'       => 'nullable|exists:processes,id',
            'owner_id'         => 'nullable|string|max:255',
            'tags'             => 'nullable|array',
            'tags.*'           => 'string',
            'deadline'         => 'nullable|date',
            'completion_date'  => 'nullable|date',
            'compliance_level' => 'required|in:Mandatory,Recommended,Optional',
            'attachments'      => 'nullable|string',
        ]);

        Requirement::create([
            'code'             => $validated['code'],
            'title'            => $validated['title'],
            'description'      => $validated['description'] ?? null,
            'type'             => $validated['type'],
            'tags'             => json_encode($validated['tags'] ?? []),
            'status'           => $validated['status'],
            'priority'         => $validated['priority'],
            'frequency'        => $validated['frequency'],
            'framework_id'     => $validated['framework_id'],
            'process_id'       => $validated['process_id'] ?? null,
            'owner_id'         => $user->id,
            'deadline'         => $validated['deadline'] ?? null,
            'completion_date'  => $validated['completion_date'] ?? null,
            'compliance_level' => $validated['compliance_level'],
            'attachments'      => $validated['attachments'] ?? null,
            'organization_id'  => $currentOrgId,
        ]);

        return redirect('/requirements')
            ->with('success', 'Requirement created successfully.');
    }

    /**
     * Display the specified requirement.
     */
    public function show(Requirement $requirement)
    {
        $user = Auth::user();
        $currentOrgId = $user->current_organization_id;

        if ($requirement->organization_id != $currentOrgId || $requirement->is_deleted) {
            abort(403, 'Unauthorized');
        }

        // Transformer les tags en noms lisibles
        $allTags = Tag::pluck('name', 'id')->toArray();

        $tagIds = json_decode($requirement->tags ?? '[]', true) ?? [];
        $requirement->tags_names = collect($tagIds)
            ->map(fn($id) => $allTags[$id] ?? null)
            ->filter()
            ->values()
            ->toArray();

        $requirement->framework_name = $requirement->framework ? $requirement->framework->name : null;
        $requirement->process_name   = $requirement->process ? $requirement->process->name : null;

        return Inertia::render('Requirements/Show', [
            'requirement' => $requirement,
        ]);
    }

    public function edit(Requirement $requirement)
    {
        $user = Auth::user();
        $currentOrgId = $user->current_organization_id;

        if ($requirement->organization_id != $currentOrgId) {
            abort(403, 'Unauthorized');
        }

        $frameworks = Framework::where('organization_id', $currentOrgId)
            ->select('id', 'code', 'name')
            ->get();

        $processes = Process::select('id', 'name')->get();

        $tags = Tag::where('organization_id', $currentOrgId)
            ->select('id', 'name')
            ->get();

        $selectedTagIds = collect(json_decode($requirement->tags ?? '[]', true) ?? [])
            ->map(fn($id) => (string) $id)
            ->values();

        return Inertia::render('Requirements/Edit', [
            'requirement'     => $requirement,
            'frameworks'      => $frameworks,
            'processes'       => $processes,
            'tags'            => $tags,
            'selectedTagIds'  => $selectedTagIds,
        ]);
    }

    /**
     * Update the requirement (clé : validation partielle pour permettre les mises à jour depuis Kanban)
     */
    public function update(Request $request, Requirement $requirement)
    {
        $user = Auth::user();
        $currentOrgId = $user->current_organization_id;

        if ($requirement->organization_id != $currentOrgId) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'code'             => 'sometimes|required|string|max:255|unique:requirements,code,' . $requirement->id,
            'title'            => 'sometimes|required|string|max:255',
            'description'      => 'nullable|string',
            'type'             => 'sometimes|required|in:regulatory,internal,contractual',
            'status'           => 'sometimes|required|in:active,inactive,draft,archived',
            'priority'         => 'sometimes|required|in:low,medium,high',
            'frequency'        => 'sometimes|required|in:one_time,daily,weekly,monthly,quarterly,yearly,continuous',
            'framework_id'     => 'sometimes|required|exists:frameworks,id',
            'process_id'       => 'sometimes|nullable|exists:processes,id',
            'owner_id'         => 'sometimes|nullable|string|max:255',
            'tags'             => 'sometimes|nullable|array',
            'tags.*'           => 'string',
            'deadline'         => 'sometimes|nullable|date',
            'completion_date'  => 'sometimes|nullable|date',
            'compliance_level' => 'sometimes|required|in:Mandatory,Recommended,Optional',
            'attachments'      => 'sometimes|nullable|string',
        ]);

        $requirement->update($validated);

        if ($request->has('tags')) {
            $requirement->tags = !empty($validated['tags']) ? json_encode($validated['tags']) : null;
            $requirement->saveQuietly(); // save sans toucher updated_at
        }

        return back()->with('success', 'Requirement updated successfully.');
    }

    public function destroy(Requirement $requirement)
    {
        $requirement->is_deleted = 1;
        $requirement->save();

        return redirect('/requirements')
            ->with('success', 'Requirement deleted successfully.');
    }

    /**
     * Export filtered requirements to Excel
     */
    public function export(Request $request)
    {
        $user = Auth::user();
        $currentOrgId = $user->current_organization_id;

        if (!$currentOrgId) {
            abort(403, 'Please select an organization first.');
        }

        $query = Requirement::where('is_deleted', 0)
            ->where('organization_id', $currentOrgId)
            ->with(['framework', 'process']);

        // Recherche
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                  ->orWhere('title', 'like', "%{$search}%");
            });
        }

        // Filtres
        if ($request->filled('filter.status')) {
            $query->where('status', $request->input('filter.status'));
        }

        if ($request->filled('filter.type') && $request->input('filter.type') !== 'all') {
            $query->where('type', $request->input('filter.type'));
        }

        if ($request->filled('filter.priority') && $request->input('filter.priority') !== 'all') {
            $query->where('priority', $request->input('filter.priority'));
        }

        // Tri
        if ($request->filled('sort')) {
            $sort = $request->sort;
            $direction = str_starts_with($sort, '-') ? 'desc' : 'asc';
            $column = ltrim($sort, '-');
            $query->orderBy($column, $direction);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $requirements = $query->get();

        // Transformation des tags
        $allTags = Tag::pluck('name', 'id')->toArray();

        $requirements->each(function ($req) use ($allTags) {
            $tagIds = json_decode($req->tags ?? '[]', true) ?? [];
            $req->tags_names = collect($tagIds)
                ->map(fn($id) => $allTags[$id] ?? null)
                ->filter()
                ->values()
                ->toArray();
        });

        return Excel::download(
            new RequirementsExport($requirements),
            'requirements-' . now()->format('Y-m-d-His') . '.xlsx'
        );
    }

    /**
     * Afficher l'interface de test pour les exigences
     */
    public function getRequirementsForTesting(Request $request)
    {
        $user = Auth::user();
        $currentOrgId = $user->current_organization_id;

        $date = $request->query('date')
            ? Carbon::parse($request->query('date'))
            : Carbon::today();

        $requirements = Requirement::where('organization_id', $currentOrgId)
            ->where('is_deleted', 0)
            ->get();

        $toTest = $requirements->filter(function ($req) use ($date) {
            if (!$req->deadline) {
                return false;
            }

            $deadline = Carbon::parse($req->deadline);

            switch ($req->frequency) {
                case 'one_time':
                    return $deadline->isSameDay($date);
                case 'daily':
                    return $deadline->lessThanOrEqualTo($date);
                case 'weekly':
                    return $deadline->dayOfWeek === $date->dayOfWeek
                        && $deadline->lessThanOrEqualTo($date);
                case 'monthly':
                    return $deadline->day === $date->day
                        && $deadline->lessThanOrEqualTo($date);
                case 'quarterly':
                    return $deadline->month % 3 === $date->month % 3
                        && $deadline->day === $date->day
                        && $deadline->lessThanOrEqualTo($date);
                case 'yearly':
                    return $deadline->month === $date->month
                        && $deadline->day === $date->day
                        && $deadline->lessThanOrEqualTo($date);
                case 'continuous':
                    return true;
                default:
                    return false;
            }
        });

        return Inertia::render('RequirementTests/Index', [
            'date' => $date->toDateString(),
            'requirements' => $toTest->values()
        ]);
    }
}