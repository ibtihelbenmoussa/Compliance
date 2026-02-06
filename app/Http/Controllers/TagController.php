<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use App\Models\Framework;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Http\RedirectResponse;

class TagController extends Controller
{
    public function index()
    {
        return Inertia::render('Tags/Index', [
            'tags' => Tag::orderBy('name')->get(),
        ]);
    }

    public function create()
    {
        $tags = Tag::all();

        return Inertia::render('Tags/Create', [
            'tags' => $tags,
        ]);


    }

    public function store(Request $request)
    {
        $user = auth()->user();
        $currentOrgId = $user->current_organization_id;

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:tags,name',
        ]);

        $tag = new Tag();
        $tag->name = $request->name;
        $tag->organization_id = $currentOrgId;
        $tag->save();

        return Inertia::render('Frameworks/Create', [
            'tags' => Tag::where('organization_id', $user->current_organization_id)
                ->where('is_deleted', 0)->get(),
            'tag' => $tag, 
            'flash' => ['success' => 'Tag created successfully']
        ]);
    }



    public function update(Request $request, Tag $tag)
    {
        $request->validate([
            'name' => 'required|string|unique:tags,name,' . $tag->id,
        ]);

        $tag->update([
            'name' => trim($request->name),
        ]);

        return back()->with('success', 'tag mise à jour');
    }


    public function destroy(Tag $tag): RedirectResponse
    {
        $framework = Framework::where('is_deleted', 0)
            ->where('tags', $tag->id)
            ->first();

        if ($framework) {
            return redirect()->back()
                ->with('error', 'Deletion of this tag is impossible because it is assigned to a framework.');
        }

        $tag->is_deleted = 1;
        $tag->save();

        return redirect()->back()
            ->with('success', 'The tag has been successfully deleted.');
    }

}