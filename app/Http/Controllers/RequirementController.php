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
     * Liste des exigences avec statistiques de priorité
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $currentOrgId = $user->current_organization_id;

        if (!$currentOrgId) {
            return redirect()->route('organizations.select.page')
                ->with('error', 'Please select an organization first.');
        }

        $perPage = (int) $request->input('per_page', 10);
        $perPage = in_array($perPage, [10, 15, 20, 30, 50]) ? $perPage : 10;

        $query = Requirement::where('organization_id', $currentOrgId)
            ->where('is_deleted', 0)
            ->with(['framework', 'process', 'tags']);

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
            $sort      = $request->sort;
            $direction = str_starts_with($sort, '-') ? 'desc' : 'asc';
            $column    = ltrim($sort, '-');
            $allowed   = ['code', 'title', 'type', 'status', 'priority', 'deadline', 'created_at'];
            if (in_array($column, $allowed)) {
                $query->orderBy($column, $direction);
            }
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $requirements = $query->paginate($perPage)->withQueryString();

        // Statistiques globales (indépendantes des filtres/pagination)
        $statsQuery = Requirement::where('organization_id', $currentOrgId)
            ->where('is_deleted', 0)
            ->selectRaw('priority, COUNT(*) as count')
            ->groupBy('priority')
            ->pluck('count', 'priority')
            ->toArray();

        $total         = array_sum($statsQuery);
        $lowCount      = $statsQuery['low']    ?? 0;
        $mediumCount   = $statsQuery['medium'] ?? 0;
        $highCount     = $statsQuery['high']   ?? 0;

        $lowPercent    = $total > 0 ? round(($lowCount    / $total) * 100) : 0;
        $mediumPercent = $total > 0 ? round(($mediumCount / $total) * 100) : 0;
        $highPercent   = $total > 0 ? round(($highCount   / $total) * 100) : 0;

        // Transformation pour Inertia
        $requirements->through(function ($req) {
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
                'tags'             => $req->tags->map(fn($tag) => [
                    'id'   => $tag->id,
                    'name' => $tag->name,
                ])->toArray(),
                'deadline'         => $req->deadline,
                'completion_date'  => $req->completion_date,
                'compliance_level' => $req->compliance_level,
                'attachments'      => $req->attachments,
                'created_at'       => $req->created_at,
                'updated_at'       => $req->updated_at,
            ];
        });

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

    /**
     * Formulaire de création
     */
    public function create()
    {
        return Inertia::render('Requirements/Create', [
            'frameworks' => Framework::select('id', 'code', 'name')->get(),
            'processes'  => Process::select('id', 'name')->get(),
            'tags'       => Tag::select('id', 'name')->get(),
        ]);
    }

    /**
     * Enregistrement d'une nouvelle exigence
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        $currentOrgId = $user->current_organization_id;

        if (!$currentOrgId) {
            abort(403, 'No organization selected.');
        }

        $validated = $request->validate([
            'code'             => 'required|string|max:255|unique:requirements,code',
            'title'            => 'required|string|max:255',
            'description'      => 'nullable|string',
            'type'             => 'required|in:regulatory,internal,contractual',
            'status'           => 'required|in:active,draft,archived',
            'priority'         => 'required|in:low,medium,high',
            'frequency'        => 'required|in:one_time,daily,weekly,monthly,quarterly,yearly,continuous',
            'framework_id'     => 'required|exists:frameworks,id',
            'process_id'       => 'nullable|exists:processes,id',
            'deadline'         => 'nullable|date',
            'completion_date'  => 'nullable|date',
            'compliance_level' => 'required|in:Mandatory,Recommended,Optional',
            'attachments'      => 'nullable|string',
            'tags'             => 'nullable|array',
            'tags.*'           => 'integer|exists:tags,id',
            'auto_validate'    => 'boolean',
        ]);

        $requirement = Requirement::create([
            'code'             => $validated['code'],
            'title'            => $validated['title'],
            'description'      => $validated['description'] ?? null,
            'type'             => $validated['type'],
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
            'auto_validate'    => $validated['auto_validate'] ?? false,
        ]);

        $requirement->tags()->sync($validated['tags'] ?? []);

        return redirect()->route('predefined-tests-requirement.create')
            ->with('success', 'Requirement créé avec succès.');
    }

    /**
     * Affichage d'une exigence détaillée
     */
    public function show(Requirement $requirement)
    {
        $user = Auth::user();
        $currentOrgId = $user->current_organization_id;

        if ($requirement->organization_id != $currentOrgId || $requirement->is_deleted) {
            abort(403, 'Unauthorized');
        }

        $requirement->load('tags', 'framework', 'process');

        return Inertia::render('Requirements/Show', [
            'requirement' => $requirement,
        ]);
    }

    /**
     * Formulaire d'édition
     */
    public function edit(Requirement $requirement)
    {
        $user = Auth::user();
        $currentOrgId = $user->current_organization_id;

        if ($requirement->organization_id != $currentOrgId || $requirement->is_deleted) {
            abort(403, 'Unauthorized');
        }

        $requirement->load('tags');

        return Inertia::render('Requirements/Edit', [
            'requirement'    => $requirement,
            'frameworks'     => Framework::where('organization_id', $currentOrgId)
                                ->select('id', 'code', 'name')->get(),
            'processes'      => Process::select('id', 'name')->get(),
            'tags'           => Tag::where('organization_id', $currentOrgId)
                                ->select('id', 'name')->get(),
            'selectedTagIds' => $requirement->tags->pluck('id')->map(fn($id) => (string)$id)->toArray(),
        ]);
    }

    /**
     * Mise à jour d'une exigence
     */
    public function update(Request $request, Requirement $requirement)
    {
        $user = Auth::user();
        $currentOrgId = $user->current_organization_id;

        if ($requirement->organization_id != $currentOrgId || $requirement->is_deleted) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'code'             => 'sometimes|required|string|max:255|unique:requirements,code,' . $requirement->id,
            'title'            => 'sometimes|required|string|max:255',
            'description'      => 'nullable|string',
            'type'             => 'sometimes|required|in:regulatory,internal,contractual',
            'status'           => 'sometimes|required|in:active,draft,archived',
            'priority'         => 'sometimes|required|in:low,medium,high',
            'frequency'        => 'sometimes|required|in:one_time,daily,weekly,monthly,quarterly,yearly,continuous',
            'framework_id'     => 'sometimes|required|exists:frameworks,id',
            'process_id'       => 'sometimes|nullable|exists:processes,id',
            'deadline'         => 'sometimes|nullable|date',
            'completion_date'  => 'sometimes|nullable|date',
            'compliance_level' => 'sometimes|required|in:Mandatory,Recommended,Optional',
            'attachments'      => 'sometimes|nullable|string',
            'tags'             => 'sometimes|nullable|array',
            'tags.*'           => 'integer|exists:tags,id',
            'auto_validate'    => 'sometimes|boolean',
        ]);

        $tags = $validated['tags'] ?? [];
        unset($validated['tags']);

        $requirement->update($validated);
        $requirement->tags()->sync($tags);

        return back()->with('success', 'Requirement updated successfully.');
    }

    /**
     * Suppression logique (soft delete)
     */
    public function destroy(Requirement $requirement)
    {
        $user = Auth::user();
        $currentOrgId = $user->current_organization_id;

        if ($requirement->organization_id != $currentOrgId) {
            abort(403, 'Unauthorized');
        }

        $requirement->is_deleted = 1;
        $requirement->save();

        return redirect()->route('requirements.index')
            ->with('success', 'Requirement deleted successfully.');
    }

    /**
     * Export Excel des exigences filtrées
     */
    public function export(Request $request)
    {
        $user = Auth::user();
        $currentOrgId = $user->current_organization_id;

        if (!$currentOrgId) {
            abort(403, 'Please select an organization first.');
        }

        $query = Requirement::where('organization_id', $currentOrgId)
            ->where('is_deleted', 0)
            ->with(['framework', 'process', 'tags']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                  ->orWhere('title', 'like', "%{$search}%");
            });
        }

        $requirements = $query->get();

        $requirements->each(function ($req) {
            $req->tags_names = $req->tags->pluck('name')->toArray();
        });

        return Excel::download(
            new RequirementsExport($requirements),
            'requirements-' . now()->format('Y-m-d-His') . '.xlsx'
        );
    }

  
  


public function getRequirementsForTesting(Request $request)
{
    $user         = Auth::user();
    $currentOrgId = $user->current_organization_id;

    if (!$currentOrgId) {
        abort(403, 'No organization selected.');
    }

    // ── Date cible ───────────────────────────────────────────────────────────
    $dateStr = $request->query('date', today()->format('Y-m-d'));
    try {
        $targetDate = Carbon::parse($dateStr)->startOfDay();
    } catch (\Exception $e) {
        $targetDate = today()->startOfDay();
    }

    // ── Paramètres ───────────────────────────────────────────────────────────
    $search  = trim($request->query('search', ''));
    $perPage = (int) $request->input('per_page', 15);
    $perPage = in_array($perPage, [10, 15, 20, 30, 50]) ? $perPage : 15;

    // ── Query de base ────────────────────────────────────────────────────────
    $query = Requirement::query()
        ->where('organization_id', $currentOrgId)
        ->where('is_deleted', 0)
        ->with([
            'framework:id,code,name',
            'process:id,name',
            'tags:id,name',
            'tests' => function ($q) use ($targetDate) {
                $q->whereDate('test_date', $targetDate)
                  ->latest('created_at')
                  ->limit(1)
                  ->select([
                      'id',
                      'requirement_id',
                      'validation_status',
                      'validation_comment',
                      'test_date',
                      'created_at',
                  ]);
            },
        ])
        // Garder uniquement les requirements pertinents pour la date cible
        ->where(function ($q) use ($targetDate) {

            // 1) A déjà un test ce jour-là (peu importe la fréquence)
            $q->whereHas('tests', fn($sub) =>
                $sub->whereDate('test_date', $targetDate)
            )

            // 2) one_time : deadline exactement ce jour
            ->orWhere(fn($q2) =>
                $q2->where('frequency', 'one_time')
                   ->whereDate('deadline', $targetDate)
            )

            // 3) daily : deadline <= aujourd'hui
            ->orWhere(fn($q2) =>
                $q2->where('frequency', 'daily')
                   ->whereDate('deadline', '<=', $targetDate)
            )

            // 4) weekly : même jour de semaine, deadline <= aujourd'hui
            ->orWhere(fn($q2) =>
                $q2->where('frequency', 'weekly')
                   ->whereRaw('DAYOFWEEK(deadline) = ?', [$targetDate->dayOfWeek + 1])
                   ->whereDate('deadline', '<=', $targetDate)
            )

            // 5) monthly : même jour du mois, deadline <= aujourd'hui
            ->orWhere(fn($q2) =>
                $q2->where('frequency', 'monthly')
                   ->whereRaw('DAY(deadline) = ?', [$targetDate->day])
                   ->whereDate('deadline', '<=', $targetDate)
            )

            // 6) quarterly : même jour + même modulo de mois
            ->orWhere(fn($q2) =>
                $q2->where('frequency', 'quarterly')
                   ->whereRaw('DAY(deadline) = ?', [$targetDate->day])
                   ->whereRaw('MOD(MONTH(deadline), 3) = MOD(?, 3)', [$targetDate->month])
                   ->whereDate('deadline', '<=', $targetDate)
            )

            // 7) yearly : même jour + même mois
            ->orWhere(fn($q2) =>
                $q2->where('frequency', 'yearly')
                   ->whereRaw('DAY(deadline) = ?', [$targetDate->day])
                   ->whereRaw('MONTH(deadline) = ?', [$targetDate->month])
                   ->whereDate('deadline', '<=', $targetDate)
            )

            // 8) continuous : toujours visible
            ->orWhere('frequency', 'continuous');
        });

    // ── Recherche ────────────────────────────────────────────────────────────
    if ($search !== '') {
        $query->where(function ($q) use ($search) {
            $q->where('code', 'like', "%{$search}%")
              ->orWhere('title', 'like', "%{$search}%");
        });
    }

    // ── Tri ──────────────────────────────────────────────────────────────────
    if ($request->filled('sort')) {
        $sort      = $request->sort;
        $direction = str_starts_with($sort, '-') ? 'desc' : 'asc';
        $column    = ltrim($sort, '-');
        $allowed   = ['code', 'title', 'frequency', 'deadline'];
        $query->orderBy(in_array($column, $allowed) ? $column : 'code', $direction);
    } else {
        $query->orderBy('code');
    }

    $requirements = $query->paginate($perPage)->withQueryString();

    // ── Injecter les infos du dernier test sur chaque item ───────────────────
    $requirements->through(function (Requirement $req) {
        $latestTest               = $req->tests->first();
        $req->latest_test_status  = $latestTest?->validation_status  ?? null;
        $req->latest_test_comment = $latestTest?->validation_comment ?? null;
        $req->latest_test_id      = $latestTest?->id                 ?? null;
        return $req;
    });

    return Inertia::render('RequirementTests/Index', [
        'requirements' => $requirements,   // ← PaginatedData ✅ (plus une collection simple)
        'date'         => $targetDate->format('Y-m-d'),
        'isToday'      => $targetDate->isToday(),
        'filters'      => $request->only(['search', 'date']),
    ]);
}}