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
    public function index(Request $request)
    {
        $this->authorize('viewAny', RequirementTest::class);

        $query = RequirementTest::query()
            ->with([
                'framework:id,code,name',
                'requirement.framework:id,code,name',
                'user:id,name',
            ])
            ->select([
                'id',
                'requirement_id',
                'user_id',
                'framework_id',
                'test_date',
                'status',
                'comment',
                'evidence',
                'created_at',
            ])
            ->latest('test_date');

        // Filtre date
        if ($date = $request->query('date')) {
            try {
                $parsedDate = Carbon::parse($date);
                $query->whereDate('test_date', $parsedDate);
            } catch (\Exception $e) {
                \Log::warning("Invalid date in requirement-tests index", ['date' => $date]);
            }
        }

        if ($search = trim($request->query('search', ''))) {
            $query->whereHas('requirement', function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                    ->orWhere('title', 'like', "%{$search}%");
            });
        }

        // Satut
        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $tests = $query->paginate(15)->withQueryString();

        return Inertia::render('RequirementTests/Index', [
            'tests' => $tests,
            'filters' => $request->only(['date', 'search', 'status']),
            'canCreate' => Auth::user()->can('create', RequirementTest::class),
        ]);
    }

    public function create()
    {
        $this->authorize('create', RequirementTest::class);

        $requirements = Requirement::query()
            ->select('id', 'code', 'title', 'frequency', 'deadline', 'framework_id')
            ->with('framework:id,code,name')
            ->orderBy('code')
            ->get();

        return Inertia::render('RequirementTests/Create', [
            'requirements' => $requirements,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', RequirementTest::class);

        $validated = $request->validate([
            'requirement_id' => ['required', 'exists:requirements,id'],
            'test_date' => ['required', 'date'],
            'status' => ['required', 'in:compliant,non_compliant,partial,na'],
            'comment' => ['nullable', 'string', 'max:2000'],
            'evidence' => ['nullable', 'array'],
            'evidence.*' => ['nullable', 'string', 'max:2048'],
        ]);

        $requirement = Requirement::findOrFail($validated['requirement_id']);

        RequirementTest::create([
            'requirement_id' => $validated['requirement_id'],
            'framework_id' => $requirement->framework_id,
            'user_id' => Auth::id(),
            'test_date' => $validated['test_date'],
            'status' => $validated['status'],
            'comment' => $validated['comment'] ?? null,
            'evidence' => $validated['evidence'] ?? null,
        ]);

        return redirect()
            ->route('requirement-tests.index')
            ->with('success', 'Test created successfully.');
    }

    public function show(RequirementTest $requirementTest)
    {
        $this->authorize('view', $requirementTest);

        $requirementTest->load(['requirement.framework', 'user', 'framework']);

        return Inertia::render('RequirementTests/Show', [
            'test' => $requirementTest,
        ]);
    }

    public function edit(RequirementTest $requirementTest)
    {
        $this->authorize('update', $requirementTest);

        $requirementTest->load('requirement.framework');

        $requirements = Requirement::select('id', 'code', 'title', 'frequency', 'deadline')
            ->with('framework:id,code,name')
            ->orderBy('code')
            ->get();

        return Inertia::render('RequirementTests/Edit', [
            'test' => $requirementTest,
            'requirements' => $requirements,
        ]);
    }

    public function update(Request $request, RequirementTest $requirementTest)
    {
        $this->authorize('update', $requirementTest);

        $validated = $request->validate([
            'test_date' => ['required', 'date'],
            'status' => ['required', 'in:compliant,non_compliant,partial,na'],
            'comment' => ['nullable', 'string', 'max:2000'],
            'evidence' => ['nullable', 'array'],
            'evidence.*' => ['nullable', 'string', 'max:2048'],
        ]);

        $requirementTest->update($validated);

        return redirect()
            ->route('requirement-tests.index')
            ->with('success', 'Test updated successfully.');
    }

    public function destroy(RequirementTest $requirementTest)
    {
        $this->authorize('delete', $requirementTest);

        $requirementTest->delete();

        return redirect()
            ->route('requirement-tests.index')
            ->with('success', 'Test deleted successfully.');
    }

    /**
     * Show form to create test for a specific requirement
     */
    public function createForRequirement(Requirement $requirement)
    {
        $this->authorize('create', RequirementTest::class);

        $requirement->load('framework:id,code,name');

        return Inertia::render('RequirementTests/Create', [
            'requirement' => $requirement,
        ]);
    }

    /**
     * Store test for a specific requirement
     */
    public function storeForRequirement(Request $request, Requirement $requirement)
    {
        $data = $request->validate([
            'test_code' => 'required|string|max:50|unique:requirement_tests,test_code',
            'name' => 'required|string',
            'objective' => 'required|string',
            'procedure' => 'required|string',
            'status' => 'required|string',
            'result' => 'required|string',
            'efficacy' => 'required|string',
            'effective_date' => 'nullable|date',
            'evidence' => 'nullable|string',
        ]);

        $data['user_id'] = auth()->id();
        $data['framework_id'] = $requirement->framework_id;

        $test = $requirement->tests()->create($data);

        return redirect('/req-testing')
            
            ->with('success', 'Test créé avec succès !');
    }
}