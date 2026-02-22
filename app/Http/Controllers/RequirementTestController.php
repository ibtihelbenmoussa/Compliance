<?php

namespace App\Http\Controllers;

use App\Models\Requirement;
use App\Models\RequirementTest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Carbon;

class RequirementTestController extends Controller
{
    /**
     * Display a listing of the requirement tests.
     */
    public function index(Request $request)
    {
        $query = RequirementTest::query()
            ->with([
                'requirement' => fn($q) => $q->select('id', 'code', 'title', 'frequency', 'deadline'),
                'user' => fn($q) => $q->select('id', 'name'),
            ])
            ->select([
                'id',
                'requirement_id',
                'user_id',
                'test_date',
                'status',
                'comment',
                'evidence',
                'created_at',
            ])
            ->latest('test_date');

        // Filtre par date (YYYY-MM-DD) - utilisé par ton calendrier frontend
        if ($date = $request->query('date')) {
            try {
                $parsedDate = Carbon::parse($date);
                $query->whereDate('test_date', $parsedDate);
            } catch (\Exception $e) {
                // Date invalide → ignorer silencieusement ou logger
            }
        }

        // Recherche texte (code ou titre du requirement)
        if ($search = trim($request->query('search', ''))) {
            $query->whereHas('requirement', function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                  ->orWhere('title', 'like', "%{$search}%");
            });
        }

        // Statut (compliant, non_compliant, etc.)
        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $tests = $query->paginate(15)->withQueryString();

        return Inertia::render('RequirementTests/Index', [
            'tests' => $tests,
            'filters' => $request->only(['date', 'search', 'status']),
            'canCreate' => Auth::user()->can('create', RequirementTest::class), // optionnel
        ]);
    }

    /**
     * Show the form for creating a new test.
     */
    public function create()
    {
        $requirements = Requirement::query()
            ->select('id', 'code', 'title', 'frequency', 'deadline')
            ->orderBy('code')
            ->get();

        return Inertia::render('RequirementTests/Create', [
            'requirements' => $requirements,
        ]);
    }

    /**
     * Store a newly created test in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'requirement_id' => ['required', 'exists:requirements,id'],
            'test_date'      => ['required', 'date'],
            'status'         => ['required', 'in:compliant,non_compliant,partial,na'],
            'comment'        => ['nullable', 'string', 'max:2000'],
            'evidence'       => ['nullable', 'array'],
            'evidence.*'     => ['nullable', 'string', 'max:2048'], // ex: URLs ou chemins de fichiers
        ]);

        RequirementTest::create([
            'requirement_id' => $validated['requirement_id'],
            'user_id'        => Auth::id(),
            'test_date'      => $validated['test_date'],
            'status'         => $validated['status'],
            'comment'        => $validated['comment'] ?? null,
            'evidence'       => $validated['evidence'] ?? null,
        ]);

        return redirect()
            ->route('requirement-tests.index')
            ->with('success', 'Test enregistré avec succès.');
    }

    // Optionnel : méthode show (détail d’un test)
    public function show(RequirementTest $requirementTest)
    {
        $requirementTest->load(['requirement', 'user']);

        return Inertia::render('RequirementTests/Show', [
            'test' => $requirementTest,
        ]);
    }

    // Optionnel : edit + update (si tu veux pouvoir modifier un test)
    public function edit(RequirementTest $requirementTest)
    {
        $requirementTest->load('requirement');

        $requirements = Requirement::select('id', 'code', 'title')->get();

        return Inertia::render('RequirementTests/Edit', [
            'test' => $requirementTest,
            'requirements' => $requirements,
        ]);
    }

    public function update(Request $request, RequirementTest $requirementTest)
    {
        $validated = $request->validate([
            'test_date' => ['required', 'date'],
            'status'    => ['required', 'in:compliant,non_compliant,partial,na'],
            'comment'   => ['nullable', 'string', 'max:2000'],
            'evidence'  => ['nullable', 'array'],
            'evidence.*' => ['nullable', 'string', 'max:2048'],
        ]);

        $requirementTest->update($validated);

        return redirect()
            ->route('requirement-tests.index')
            ->with('success', 'Test mis à jour avec succès.');
    }

    // Optionnel : destroy (suppression)
    public function destroy(RequirementTest $requirementTest)
    {
        $requirementTest->delete();

        return redirect()
            ->route('requirement-tests.index')
            ->with('success', 'Test supprimé avec succès.');
    }
}