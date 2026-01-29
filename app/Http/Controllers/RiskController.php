<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\HasDataTable;
use App\Models\Risk;
use App\Models\User;
use App\Models\Process;
use App\Exports\RisksExport;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use Spatie\QueryBuilder\AllowedFilter;
use Illuminate\Support\Facades\Log;

class RiskController extends Controller
{
    use HasDataTable;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $currentOrgId = $user->current_organization_id;

        if (!$currentOrgId) {
            return redirect()->route('organizations.select.page')
                ->with('error', 'Please select an organization first.');
        }

        // Get stats from all risks (not filtered)
        $allRisks = Risk::where('organization_id', $currentOrgId)
            ->withCount(['processes', 'controls'])->with('owner')
            ->get();

        $stats = [
            'total' => $allRisks->count(),
            'active' => $allRisks->where('is_active', true)->count(),
            'high_inherent' => $allRisks->filter(function ($risk) {
                return $risk->inherent_score && $risk->inherent_score >= 15;
            })->count(),
            'high_residual' => $allRisks->filter(function ($risk) {
                return $risk->residual_score && $risk->residual_score >= 15;
            })->count(),
        ];

        // Build base query
        $baseQuery = Risk::where('organization_id', $currentOrgId);

        // Build data table query
        $risks = $this->buildDataTableQuery($baseQuery, [
            'searchColumns' => ['code', 'name', 'description', 'category', 'owner.name'],
            'filters' => [
                AllowedFilter::exact('is_active'),
                AllowedFilter::partial('category'),
                AllowedFilter::exact('owner_id'),
                AllowedFilter::callback('inherent_score_min', function ($query, $value) {
                    $query->whereRaw('(inherent_likelihood * inherent_impact) >= ?', [$value]);
                }),
                AllowedFilter::callback('inherent_score_max', function ($query, $value) {
                    $query->whereRaw('(inherent_likelihood * inherent_impact) <= ?', [$value]);
                }),
                AllowedFilter::callback('residual_score_min', function ($query, $value) {
                    $query->whereRaw('(residual_likelihood * residual_impact) >= ?', [$value]);
                }),
                AllowedFilter::callback('residual_score_max', function ($query, $value) {
                    $query->whereRaw('(residual_likelihood * residual_impact) <= ?', [$value]);
                }),
            ],
            'sorts' => [
                'code',
                'name',
                'category',
                'inherent_score' => 'inherent_likelihood * inherent_impact',
                'residual_score' => 'residual_likelihood * residual_impact',
                'created_at',
                'updated_at'
            ],
            'defaultSort' => 'code',
            'includes' => ['owner', 'processes'],
            'perPage' => 15,
        ]);

        // Get filter options
        $categories = Risk::where('organization_id', $currentOrgId)
            ->whereNotNull('category')
            ->distinct()
            ->pluck('category')
            ->sort()
            ->values();

        $owners = User::whereHas('organizations', function ($query) use ($currentOrgId) {
            $query->where('organization_id', $currentOrgId);
        })
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        // Load the active risk configuration
        $activeConfiguration = \App\Models\RiskConfiguration::forOrganization($currentOrgId)->first();
        $hasRiskSettings = $activeConfiguration !== null;

        // Check if there are any configurations
        $hasAnyRiskConfiguration = \App\Models\RiskConfiguration::forOrganization($currentOrgId)->exists();
        $hasInactiveConfigOnly = $hasAnyRiskConfiguration && !$hasRiskSettings;

        $configData = null;
        if ($activeConfiguration) {
            $configData = $activeConfiguration->toConfigArray();
        }
        return Inertia::render('risks/index', [
            'risks' => $this->formatPaginationData($risks),
            'stats' => $stats,
            'filters' => $this->getCurrentFilters(),
            'filterOptions' => [
                'categories' => $categories,
                'owners' => $owners,
            ],
            'hasRiskSettings' => $hasRiskSettings,
            'hasInactiveConfigOnly' => $hasInactiveConfigOnly,
            'canManageRiskMatrix' => $user->can('manage_risk_matrix'),
            'activeConfiguration' => $configData,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $user = $request->user();
        $currentOrgId = $user->current_organization_id;

        if (!$currentOrgId) {
            return redirect()->route('organizations.select.page')
                ->with('error', 'Please select an organization first.');
        }

        // Get available owners
        $owners = User::whereHas('organizations', function ($query) use ($currentOrgId) {
            $query->where('organization_id', $currentOrgId);
        })
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        // Get available processes
        $processes = Process::whereHas('macroProcess.businessUnit', function ($query) use ($currentOrgId) {
            $query->where('organization_id', $currentOrgId);
        })
            ->with(['macroProcess.businessUnit'])
            ->select('id', 'code', 'name', 'macro_process_id')
            ->orderBy('code')
            ->get();

        return Inertia::render('risks/create', [
            'owners' => $owners,
            'processes' => $processes,
            // TODO: risks categories
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = $request->user();
        $currentOrgId = $user->current_organization_id;

        if (!$currentOrgId) {
            return redirect()->route('organizations.select.page')
                ->with('error', 'Please select an organization first.');
        }

        $validated = $request->validate([
            'code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('risks')
                    ->where('organization_id', $currentOrgId)
                    ->whereNull('deleted_at'),
            ],
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:100',
            'inherent_likelihood' => 'nullable|integer|between:1,5',
            'inherent_impact' => 'nullable|integer|between:1,5',
            'residual_likelihood' => 'nullable|integer|between:1,5',
            'residual_impact' => 'nullable|integer|between:1,5',
            'owner_id' => 'nullable|exists:users,id',
            'is_active' => 'boolean',
            'process_ids' => 'nullable|array',
            'process_ids.*' => 'exists:processes,id',
        ]);

        // Verify owner belongs to current organization if specified
        if (isset($validated['owner_id'])) {
            $ownerBelongsToOrg = User::whereHas('organizations', function ($query) use ($currentOrgId) {
                $query->where('organization_id', $currentOrgId);
            })->where('id', $validated['owner_id'])->exists();

            if (!$ownerBelongsToOrg) {
                abort(403, 'Invalid owner.');
            }
        }

        // Verify processes belong to current organization if specified
        if (!empty($validated['process_ids'])) {
            $validProcessCount = Process::whereHas('macroProcess.businessUnit', function ($query) use ($currentOrgId) {
                $query->where('organization_id', $currentOrgId);
            })->whereIn('id', $validated['process_ids'])->count();

            if ($validProcessCount !== count($validated['process_ids'])) {
                abort(403, 'Invalid processes.');
            }
        }

        $processIds = $validated['process_ids'] ?? [];
        unset($validated['process_ids']);

        $validated['organization_id'] = $currentOrgId;

        $risk = Risk::create($validated);

        // Attach processes
        if (!empty($processIds)) {
            $risk->processes()->attach($processIds);
        }

        return redirect()->route('risks.index', $risk)
            ->with('success', 'Risk created successfully.');
    }
    

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Risk $risk)
    {
        $user = $request->user();
        $currentOrgId = $user->current_organization_id;

        // Verify risk belongs to current organization
        if ($risk->organization_id !== $currentOrgId) {
            abort(403, 'You do not have access to this risk.');
        }

        $risk->load(['owner', 'processes.macroProcess.businessUnit', 'controls', 'tests']);

        return Inertia::render('risks/show', [
            'risk' => $risk,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */public function edit(Request $request, Risk $risk)
    {
        $user = $request->user();

        // 🔐 Sécurité : vérifier que le risque appartient à l'organisation courante
        if ($risk->organization_id !== $user->current_organization_id) {
            abort(403, 'Unauthorized');
        }

        // Charger les relations nécessaires
        $risk->load('processes');

        // Retourner la page Inertia avec les données pré-remplies
        return Inertia::render('risks/edit', [
            'risk' => [
                'id' => $risk->id,
                'name' => $risk->name,
                'code' => $risk->code,
                'description' => $risk->description,
                'category' => $risk->category,
                'inherent_likelihood' => $risk->inherent_likelihood,
                'inherent_impact' => $risk->inherent_impact,
                'residual_likelihood' => $risk->residual_likelihood,
                'residual_impact' => $risk->residual_impact,
                'owner_id' => $risk->owner_id,
                'is_active' => (bool) $risk->is_active,

                // ✅ Les IDs des processes liés
                'processes' => $risk->processes->map(fn($process) => [
                    'id' => $process->id,
                ]),
            ],

            // Liste des owners pour le select
            'owners' => User::select('id', 'name')
                ->orderBy('name')
                ->get(),

            // Liste des processes actifs pour le MultiSelect
            'processes' => Process::where('is_active', 1)
                ->select('id', 'code', 'name')
                ->orderBy('code')
                ->get(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
/*     public function update(Request $request, Risk $risk)
    {
        $user = $request->user();
        $currentOrgId = $user->current_organization_id;

        // Verify risk belongs to current organization
        if ($risk->organization_id !== $currentOrgId) {
            abort(403, 'You do not have access to this risk.');
        }

        $validated = $request->validate([
            'code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('risks')
                    ->ignore($risk->id)
                    ->where('organization_id', $currentOrgId)
                    ->whereNull('deleted_at'),
            ],
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:100',
            'inherent_likelihood' => 'nullable|integer|between:1,5',
            'inherent_impact' => 'nullable|integer|between:1,5',
            'residual_likelihood' => 'nullable|integer|between:1,5',
            'residual_impact' => 'nullable|integer|between:1,5',
            'owner_id' => 'nullable|exists:users,id',
            'is_active' => 'boolean',
            'process_ids' => 'nullable|array',
            'process_ids.*' => 'exists:processes,id',
        ]);

        // Verify owner belongs to current organization if specified
        if (isset($validated['owner_id'])) {
            $ownerBelongsToOrg = User::whereHas('organizations', function ($query) use ($currentOrgId) {
                $query->where('organization_id', $currentOrgId);
            })->where('id', $validated['owner_id'])->exists();

            if (!$ownerBelongsToOrg) {
                abort(403, 'Invalid owner.');
            }
        }

        // Verify processes belong to current organization if specified
        if (!empty($validated['process_ids'])) {
            $validProcessCount = Process::whereHas('macroProcess.businessUnit', function ($query) use ($currentOrgId) {
                $query->where('organization_id', $currentOrgId);
            })->whereIn('id', $validated['process_ids'])->count();

            if ($validProcessCount !== count($validated['process_ids'])) {
                abort(403, 'Invalid processes.');
            }
        }

        $processIds = $validated['process_ids'] ?? [];
        unset($validated['process_ids']);

        $risk->update($validated);

        // Sync processes
        $risk->processes()->sync($processIds);

        return redirect()->route('risks.show', $risk)
            ->with('success', 'Risk updated successfully.');
    }
 */
public function update(Request $request, Risk $risk)
{
   

    $user = $request->user();
    $currentOrgId = $user->current_organization_id;

    dd($request);

    if (!$currentOrgId) {
        return redirect()
            ->route('organizations.select.page')
            ->with('error', 'Please select an organization first.');
    }

    // 🔐 Sécurité : vérifier l’organisation
    if ($risk->organization_id !== $currentOrgId) {
        abort(403, 'Unauthorized action.');
    }



    // ✅ Validation (IDENTIQUE à store + ignore)
    $validated = $request->validate([
        'code' => [
            'required',
            'string',
            'max:50',
            Rule::unique('risks')
                ->where('organization_id', $currentOrgId)
                ->whereNull('deleted_at')
                ->ignore($risk->id),
        ],
        'name' => 'required|string|max:255',
        'description' => 'nullable|string',
        'category' => 'nullable|string|max:100',

        'inherent_likelihood' => 'nullable|integer|between:1,5',
        'inherent_impact' => 'nullable|integer|between:1,5',
        'residual_likelihood' => 'nullable|integer|between:1,5',
        'residual_impact' => 'nullable|integer|between:1,5',

        'owner_id' => 'nullable|exists:users,id',
        'is_active' => 'boolean',

        'process_ids' => 'nullable|array',
        'process_ids.*' => 'exists:processes,id',
    ]);

    /**
     * 🔍 Vérifier que le owner appartient à l’organisation
     */
    if (isset($validated['owner_id'])) {
        $ownerBelongsToOrg = User::whereHas('organizations', function ($query) use ($currentOrgId) {
            $query->where('organization_id', $currentOrgId);
        })
        ->where('id', $validated['owner_id'])
        ->exists();

        if (!$ownerBelongsToOrg) {
            abort(403, 'Invalid owner.');
        }
    }

    /**
     * 🔍 Vérifier que les processus appartiennent à l’organisation
     */
    if (!empty($validated['process_ids'])) {
        $validProcessCount = Process::whereHas(
            'macroProcess.businessUnit',
            function ($query) use ($currentOrgId) {
                $query->where('organization_id', $currentOrgId);
            }
        )
        ->whereIn('id', $validated['process_ids'])
        ->count();

        if ($validProcessCount !== count($validated['process_ids'])) {
            abort(403, 'Invalid processes.');
        }
    }

    // 🧹 Nettoyage
    $processIds = $validated['process_ids'] ?? [];
    unset($validated['process_ids']);

    // Valeur par défaut si le switch n’est pas envoyé
    $validated['is_active'] = $request->boolean('is_active');

    /**
     * 💾 Mise à jour du risque
     */
    $risk->update($validated);

    /**
     * 🔗 Synchronisation des processus
     */
    $risk->processes()->sync($processIds);

    return redirect()
        ->route('risks.index')
        ->with('success', 'Risk updated successfully.');
}
    public function ShowById($id)
    {
        $risk = Risk::findOrFail($id);
        return Inertia::render('risks/show', 
             $risk
        );
    }
    /*
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Risk $risk)
    {
        $user = $request->user();
        $currentOrgId = $user->current_organization_id;

        // Verify risk belongs to current organization
        if ($risk->organization_id !== $currentOrgId) {
            abort(403, 'You do not have access to this risk.');
        }

        $risk->delete();

        return redirect()->route('risks.index')
            ->with('success', 'Risk deleted successfully.');
    }

    /**
     * Export risks to Excel.
     */
    public function export(Request $request)
    {
        $user = $request->user();
        $currentOrgId = $user->current_organization_id;

        if (!$currentOrgId) {
            return redirect()->route('organizations.select.page')
                ->with('error', 'Please select an organization first.');
        }

        // Get all risks with relationships for export
        $risks = Risk::where('organization_id', $currentOrgId)
            ->with(['owner', 'processes'])
            ->withCount('controls')
            ->orderBy('code')
            ->get();

        $filename = 'risks-' . now()->format('Y-m-d-H-i-s') . '.xlsx';

        return Excel::download(new RisksExport($risks), $filename);
    }

    /**
     * Display the risk assessment matrix.
     */
    public function matrix(Request $request)
    {
        $user = $request->user();
        $currentOrgId = $user->current_organization_id;

        if (!$currentOrgId) {
            return redirect()->route('organizations.select.page')
                ->with('error', 'Please select an organization first.');
        }

        // Load the active risk configuration
        $activeConfiguration = \App\Models\RiskConfiguration::forOrganization($currentOrgId)->first();

        $configData = null;
        if ($activeConfiguration) {
            $configData = $activeConfiguration->toConfigArray();
        }

        // Load risks for the matrix
        $risks = Risk::where('organization_id', $currentOrgId)
            ->select('id', 'name', 'inherent_impact', 'inherent_likelihood', 'residual_impact', 'residual_likelihood')
            ->get();

        return Inertia::render('risks/matrix', [
            'initialConfiguration' => $configData,
            'risks' => $risks,
        ]);
    }
}
