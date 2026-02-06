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
    {  $user = auth()->user();
        $currentOrgId = $user->current_organization_id;
        return Inertia::render('Jurisdictions/Index', [
            'jurisdictions' => Jurisdiction::orderBy('name')->where('is_deleted','=',0)->where('organization_id','=',$currentOrgId)->get(),
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
        $user = auth()->user();
        $currentOrgId = $user->current_organization_id;
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:jurisdictions,name',
            /*             'organization_id' => $currentOrgId
             */
        ]);
        $jurisdiction = new Jurisdiction();
        $jurisdiction->name = $request->name;
        $jurisdiction->organization_id = $currentOrgId;
        $jurisdiction->save();
        //   $jurisdiction = Jurisdiction::create($validated);

        // On garde le redirect, mais Inertia doit recevoir la nouvelle prop

        return redirect()->back()->with([
            'success' => 'Jurisdiction créée avec succès.'
        ]);
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
            ->where('jurisdiction_id', $jurisdiction->id)
            ->first();

        if ($framework) {
            return redirect()->back()
                ->with('error', 'Deletion of this jurisdiction is impossible because it is assigned to a framework.');
        }

        $jurisdiction->is_deleted = 1;
        $jurisdiction->save();

        return redirect()->back()
            ->with('success', 'The jurisdiction has been successfully deleted.');
    }





}
