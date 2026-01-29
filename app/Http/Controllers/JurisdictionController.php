<?php
namespace App\Http\Controllers;

use App\Models\Framework;
use App\Models\Jurisdiction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Http\RedirectResponse;

class JurisdictionController extends Controller
{
    public function index()
    {
        return Inertia::render('Jurisdictions/Index', [
            'jurisdictions' => Jurisdiction::orderBy('name')->get(),
        ]);
    }
    public function create()
    {
        $jurisdictions = Jurisdiction::all();

        return Inertia::render('Frameworks/Create', [
            'jurisdictions' => $jurisdictions,
        ]);
    }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:jurisdictions,name'
        ]);

        $jurisdiction = Jurisdiction::create($validated);

        return redirect()->back()->with('newJurisdiction', $jurisdiction);
    }


    public function update(Request $request, Jurisdiction $jurisdiction)
    {
        $request->validate([
            'name' => 'required|string|unique:jurisdictions,name,' . $jurisdiction->id,
        ]);

        $jurisdiction->update([
            'name' => trim($request->name),
        ]);

        return back()->with('success', 'Jurisdiction mise à jour');
    }

public function destroy(Jurisdiction $jurisdiction): RedirectResponse
{
    $framework = Framework::where('is_deleted', 0)
        ->where('jurisdiction', $jurisdiction->id)
        ->first();

    if ($framework) {
        return back()->with('error', 'La suppression de cette juridiction est impossible car elle est affectée à un framework.');
    }

    $jurisdiction->is_deleted = 1;
    $jurisdiction->save();

    // Retour Inertia avec message de succès
    return back()->with('success', 'Jurisdiction supprimée avec succès.');
}

}

