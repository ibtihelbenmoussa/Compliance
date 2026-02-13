<?php

namespace App\Http\Controllers;

use App\Models\Requirement;
use App\Models\RequirementTest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RequirementTestController extends Controller
{
public function index()
{
    $tests = RequirementTest::with(['requirement', 'user'])
        ->latest()
        ->paginate(15);

    return Inertia::render('RequirementTests/Index', [ 
        'tests' => $tests,
        'message' => 'Hello Requirement Tests',         
    ]);
}


    public function create()
    {
        $requirements = Requirement::select('id', 'code', 'title')->get();

        return Inertia::render('RequirementTests/Create', [
            'requirements' => $requirements,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'requirement_id' => 'required|exists:requirements,id',
            'test_date'      => 'required|date',
            'status'         => 'required|in:compliant,non_compliant,partial,na',
            'comment'        => 'nullable|string',
            'evidence'       => 'nullable|array',
        ]);

        RequirementTest::create([
            'requirement_id' => $validated['requirement_id'],
            'user_id'        => auth()->id(),
            'test_date'      => $validated['test_date'],
            'status'         => $validated['status'],
            'comment'        => $validated['comment'],
            'evidence'       => $validated['evidence'],
        ]);

        return redirect()->route('requirement-tests.index')
            ->with('success', 'Test recorded successfully.');
    }

}