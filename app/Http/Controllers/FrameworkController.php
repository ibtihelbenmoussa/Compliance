<?php

namespace App\Http\Controllers;

use App\Models\Framework;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Jurisdiction;


class FrameworkController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $currentOrgId = $user->current_organization_id;

        if (!$currentOrgId) {
            return redirect()->route('organizations.select.page')
                ->with('error', 'Please select an organization first.');
        }

        $frameworks = Framework::where('is_deleted', 0)
            ->where('organization_id', $currentOrgId)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Frameworks/Index', [
            'frameworks' => $frameworks
        ]);
    }

    public function create()
    {
       // $jurisdictions = Jurisdiction::all();
        return Inertia::render('Frameworks/Create', [
          //  'jurisdictions' => $jurisdictions,
        ]);

    }

    public function store(Request $request)
    {
        $user = auth()->user();
        $currentOrgId = $user->current_organization_id;

        $data = $request->validate([
            'code' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'version' => 'nullable|string|max:255',
            'type' => 'required|in:standard,regulation,contract,internal_policy',
            'publisher' => 'nullable|string|max:255',
           
            'tags' => 'nullable|string',
            'scope' => 'nullable|string',
            'status' => 'required|in:active,draft,deprecated,archived',
            'release_date' => 'nullable|date',
            'effective_date' => 'nullable|date',
            'retired_date' => 'nullable|date',
            'description' => 'nullable|string',
            'language' => 'nullable|string',
            'url_reference' => 'nullable|url',
        ]);

        $framework = Framework::create([
            'name' => $data['name'],
            'code' => $data['code'],
            'version' => $data['version'],
            'type' => $data['type'],
            'publisher' => $data['publisher'],
            'tags' => $data['tags'],
            'jurisdiction' => $request['jurisdiction'],
            'scope' => $data['scope'],
            'status' => $data['status'],
            'release_date' => $data['release_date'],
            'effective_date' => $data['effective_date'],
            'retired_date' => $data['retired_date'],
            'description' => $data['description'],
            'language' => $data['language'],
            'url_reference' => $data['url_reference'],
            'organization_id' => $currentOrgId,
        ]);

        // Si une Jurisdiction est choisie, on lui assigne le framework
        if (!empty($data['jurisdiction_id'])) {
            $jurisdiction = Jurisdiction::find($data['jurisdiction_id']);
            $jurisdiction->framework_id = $framework->id;
            $jurisdiction->save();
        }

        return redirect('/frameworks')
            ->with('success', 'Framework créé avec succès.');
    }

    public function edit(Framework $framework)
    {
        $framework->jurisdiction = is_string($framework->jurisdiction)
            ? explode(',', $framework->jurisdiction)
            : (array) $framework->jurisdiction;

        $framework->tags = is_string($framework->tags)
            ? explode(',', $framework->tags)
            : (array) $framework->tags;

        return Inertia::render('Frameworks/Edit', [
            'framework' => $framework
        ]);
    }

/*     public function show(Framework $framework)
    {
        $framework->jurisdiction = is_string($framework->jurisdiction)
            ? explode(',', $framework->jurisdiction)
            : (array) $framework->jurisdiction;

        $framework->tags = is_string($framework->tags)
            ? explode(',', $framework->tags)
            : (array) $framework->tags;

        return Inertia::render('Frameworks/Show', [
            'framework' => $framework
        ]);
    } */

    public function update(Request $request, Framework $framework)
    {
        $data = $request->validate([
            'code' => 'required|unique:frameworks,code,' . $framework->id,
            'name' => 'required|string|max:255',
            'version' => 'nullable|string|max:255',
            'type' => 'required|in:standard,regulation,contract,internal_policy',
            'publisher' => 'nullable|string|max:255',
            'jurisdiction_id' => 'nullable|exists:jurisdictions,id',
            'tags' => 'nullable|string',
            'scope' => 'nullable|string',
            'status' => 'required|in:active,draft,deprecated,archived',
            'release_date' => 'nullable|date',
            'effective_date' => 'nullable|date',
            'retired_date' => 'nullable|date',
            'description' => 'nullable|string',
            'language' => 'nullable|string',
            'url_reference' => 'nullable|url',
        ]);

        $framework->update($data);

        // Met à jour la Jurisdiction
        if (!empty($data['jurisdiction_id'])) {
            // Détache les anciennes Jurisdictions liées
            Jurisdiction::where('framework_id', $framework->id)
                ->update(['framework_id' => null]);

            // Assigne la nouvelle
            $jurisdiction = Jurisdiction::find($data['jurisdiction_id']);
            $jurisdiction->framework_id = $framework->id;
            $jurisdiction->save();
        }

        return redirect('/frameworks')
            ->with('success', 'Framework mis à jour avec succès.');
    }


    public function destroy(Framework $framework)
    {
        $framework->is_deleted = 1;
        $framework->save();

        return redirect('/frameworks')
            ->with('success', 'Framework supprimé avec succès.');
    }

    
}
