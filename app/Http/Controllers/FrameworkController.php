<?php

namespace App\Http\Controllers;

use App\Models\Framework;
use App\Models\Tag;
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

        $frameworks = Framework::with('jurisdiction')->where('is_deleted', 0)
            ->where('organization_id', $currentOrgId)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Frameworks/Index', [
            'frameworks' => $frameworks
        ]);
    }

    public function create()
    {
        $user = auth()->user();
        $currentOrgId = $user->current_organization_id;
        $jurisdictions = Jurisdiction::where('is_deleted', '=', 0)->where('organization_id', $currentOrgId)
            ->get();
        $tags = Tag::where('is_deleted', '=', 0)->where('organization_id', $currentOrgId)
            ->get();
        return Inertia::render('Frameworks/Create', [
            'jurisdictions' => $jurisdictions,
            'tags' => $tags,
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
        'tags' => 'nullable|array', 
        'scope' => 'nullable|string',
        'status' => 'required|in:active,draft,deprecated,archived',
        'release_date' => 'nullable|date',
        'effective_date' => 'nullable|date',
        'retired_date' => 'nullable|date',
        'description' => 'nullable|string',
        'language' => 'nullable|string',
        'url_reference' => 'nullable|url',
        'jurisdiction_id' => 'nullable|exists:jurisdictions,id',
    ]);

    $framework = Framework::create([
        'name' => $data['name'],
        'code' => $data['code'],
        'version' => $data['version'] ?? null,
        'type' => $data['type'],
        'publisher' => $data['publisher'] ?? null,
        'scope' => $data['scope'] ?? null,
        'status' => $data['status'],
        'release_date' => $data['release_date'] ?? null,
        'effective_date' => $data['effective_date'] ?? null,
        'retired_date' => $data['retired_date'] ?? null,
        'description' => $data['description'] ?? null,
        'language' => $data['language'] ?? null,
        'url_reference' => $data['url_reference'] ?? null,
        'organization_id' => $currentOrgId,
        'tags' => !empty($data['tags']) ? json_encode($data['tags']) : null,
        'jurisdiction_id' => $data['jurisdiction_id'] ?? null,
    ]);

    return redirect('/frameworks')
        ->with('success', 'Framework créé avec succès.');
}


    public function edit(Framework $framework)
    {
        $jurisdictions = Jurisdiction::where('is_deleted', 0)->get();

        $framework->jurisdiction = is_string($framework->jurisdiction)
            ? explode(',', $framework->jurisdiction)
            : (array) $framework->jurisdiction;

        $framework->tags = is_string($framework->tags)
            ? explode(',', $framework->tags)
            : (array) $framework->tags;

        return Inertia::render('Frameworks/Edit', [
            'framework' => $framework,
            'jurisdictions' => $jurisdictions,
        ]);
    }


    public function show(Framework $framework)
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
    }

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
