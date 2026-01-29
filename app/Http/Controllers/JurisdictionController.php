<?php
namespace App\Http\Controllers;

use App\Models\Jurisdiction;
use Illuminate\Http\Request;
use Inertia\Inertia;

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
        $request->validate([
            'name' => 'required|string|unique:jurisdictions,name',
        ]);

        Jurisdiction::create([
            'name' => trim($request->name),
        ]);

        return back()->with('success', 'Jurisdiction créée');
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

    public function destroy(Jurisdiction $jurisdiction)
    {
        $jurisdiction->delete();

        return back()->with('success', 'Jurisdiction supprimée');
    }
}

