<?php
 
namespace App\Http\Controllers;
 
use App\Models\Jurisdiction;
use App\Models\Framework;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
 
class JurisdictionController extends Controller
{
    private function orgId()
    {
        return Auth::user()->current_organization_id;
    }
 
    private function activeJurisdictions()
    {
        return Jurisdiction::where('organization_id', $this->orgId())
            ->where('is_deleted', 0)
            ->orderBy('name')
            ->get();
    }
 

public function store(Request $request)
{
    $validated = $request->validate([
        'name' => [
            'required',
            'string',
            'max:255',
            \Illuminate\Validation\Rule::unique('jurisdictions', 'name')
                ->where('organization_id', $this->orgId())
                ->where('is_deleted', 0), // ✅ pas whereNull('deleted_at')
        ],
    ]);

    Jurisdiction::create([
        'name'            => trim($validated['name']),
        'organization_id' => $this->orgId(),
        'is_deleted'      => 0,
    ]);

    return redirect()->back()->with([
        'success'       => 'Jurisdiction created successfully',
        'jurisdictions' => $this->activeJurisdictions(),
    ]);
}
 
  
    public function update(Request $request, Jurisdiction $jurisdiction)
    {
        if ($jurisdiction->organization_id !== $this->orgId()) {
            abort(403);
        }
 
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:jurisdictions,name,' 
                . $jurisdiction->id 
                . ',id,organization_id,' 
                . $this->orgId(),
        ]);
 
        $jurisdiction->update([
            'name' => trim($validated['name']),
        ]);
 
        return redirect()->back()->with([
            'success' => 'Jurisdiction updated successfully',
            'jurisdictions' => $this->activeJurisdictions(),
        ]);
    }
 

    public function destroy(Jurisdiction $jurisdiction)
{
    if ($jurisdiction->organization_id !== $this->orgId()) {
        abort(403);
    }

    $used = $jurisdiction->frameworks()
        ->where('is_deleted', 0)
        ->exists();

    if ($used) {
        return redirect()->back()->with(
            'error',
            'This jurisdiction is assigned to one or more frameworks and cannot be deleted.'
        );
    }

    $jurisdiction->update(['is_deleted' => 1]);

    return redirect()->back()->with([
        'success'       => 'Jurisdiction deleted successfully',
        'jurisdictions' => $this->activeJurisdictions(),
    ]);
}
}
