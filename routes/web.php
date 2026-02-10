<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\FrameworkController;
use App\Http\Controllers\JurisdictionController;
use App\Exports\FrameworksExport;
use Maatwebsite\Excel\Facades\Excel;
use App\Http\Controllers\TagController;
use App\Http\Controllers\RequirementController;



Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Audit Universe
    Route::get('overview', [App\Http\Controllers\OverviewController::class, 'index'])->name('overview.index');
    Route::get('business-units/export', [App\Http\Controllers\BusinessUnitController::class, 'export'])->name('business-units.export');
    Route::resource('business-units', App\Http\Controllers\BusinessUnitController::class);
    Route::get('macro-processes/export', [App\Http\Controllers\MacroProcessController::class, 'export'])->name('macro-processes.export');
    Route::resource('macro-processes', App\Http\Controllers\MacroProcessController::class);
    Route::get('processes/export', [App\Http\Controllers\ProcessController::class, 'export'])->name('processes.export');
    Route::resource('processes', App\Http\Controllers\ProcessController::class);

    // Documents
    Route::get('documents/{document}/download', [App\Http\Controllers\DocumentController::class, 'download'])->name('documents.download');
    Route::delete('documents/{document}', [App\Http\Controllers\DocumentController::class, 'destroy'])->name('documents.destroy');

    // Risk Categories
    Route::get('risk-categories/export', [App\Http\Controllers\RiskCategoryController::class, 'export'])->name('risk-categories.export');
    Route::get('risk-categories/tree', [App\Http\Controllers\RiskCategoryController::class, 'tree'])->name('risk-categories.tree');
    Route::resource('risk-categories', App\Http\Controllers\RiskCategoryController::class);

    // Risks
    Route::get('risks/export', [App\Http\Controllers\RiskController::class, 'export'])->name('risks.export');
    Route::get('risks/matrix', [App\Http\Controllers\RiskController::class, 'matrix'])->name('risks.matrix');
    Route::resource('risks', App\Http\Controllers\RiskController::class);

    // Risk Configuration Routes (ORM)
    Route::prefix('risk-configurations')->name('risk-configurations.')->group(function () {
        Route::get('/', [App\Http\Controllers\RiskConfigurationController::class, 'index'])->name('index');
        Route::get('/create', [App\Http\Controllers\RiskConfigurationController::class, 'create'])->name('create');
        Route::post('/', [App\Http\Controllers\RiskConfigurationController::class, 'store'])->name('store');
        Route::get('/{riskConfiguration}', [App\Http\Controllers\RiskConfigurationController::class, 'show'])->name('show');
        Route::get('/{riskConfiguration}/edit', [App\Http\Controllers\RiskConfigurationController::class, 'edit'])->name('edit');
        Route::put('/{riskConfiguration}', [App\Http\Controllers\RiskConfigurationController::class, 'update'])->name('update');
        Route::delete('/{riskConfiguration}', [App\Http\Controllers\RiskConfigurationController::class, 'destroy'])->name('destroy');
        Route::post('/calculate-risk-score', [App\Http\Controllers\RiskConfigurationController::class, 'calculateRiskScore'])->name('calculate-risk-score');
        Route::get('/matrix-data', [App\Http\Controllers\RiskConfigurationController::class, 'getRiskMatrixData'])->name('matrix-data');
    });

    // Organizations - Select route moved outside to prevent circular dependency
    Route::get('organizations/select', [App\Http\Controllers\OrganizationController::class, 'selectPage'])
        ->name('organizations.select.page')
        ->middleware('auth');
    Route::post('organizations/{organization}/select', [App\Http\Controllers\OrganizationController::class, 'select'])
        ->name('organizations.select')
        ->middleware('auth');

    // Admin Settings Routes
    Route::name('admin-settings')->group(function () {
        // Index
        Route::get('admin-settings', function () {
            return Inertia::render('admin-settings-general/index');
        })->name('index');

        // Organizations
        Route::get('organizations/export', [App\Http\Controllers\OrganizationController::class, 'export'])->name('organizations.export');
        Route::resource('organizations', App\Http\Controllers\OrganizationController::class);

        // Organization User Management
        Route::post('organizations/{organization}/users', [App\Http\Controllers\OrganizationController::class, 'addUser'])->name('organizations.users.add');
        Route::delete('organizations/{organization}/users/{user}', [App\Http\Controllers\OrganizationController::class, 'removeUser'])->name('organizations.users.remove');
        Route::patch('organizations/{organization}/users/{user}/role', [App\Http\Controllers\OrganizationController::class, 'updateUserRole'])->name('organizations.users.update-role');

        // Users
        Route::get('users/export', [App\Http\Controllers\UserController::class, 'export'])->name('users.export');
        Route::resource('users', App\Http\Controllers\UserController::class);

        // Roles & Permissions
        Route::resource('roles', App\Http\Controllers\RoleController::class);
        Route::resource('permissions', App\Http\Controllers\PermissionController::class)->only(['index', 'create', 'store', 'destroy']);


    });


    //frameworks
    Route::get('frameworks', [FrameworkController::class, 'index'])->name('frameworks.index');
    Route::get('frameworks/create', [FrameworkController::class, 'create'])->name('frameworks.create');
    Route::post('frameworks', [FrameworkController::class, 'store'])->name('frameworks.store');
    Route::get('frameworks/{framework}/edit', [FrameworkController::class, 'edit'])->name('frameworks.edit');
    Route::put('frameworks/{framework}', [FrameworkController::class, 'update'])->name('frameworks.update');
    Route::delete('frameworks/{framework}', [FrameworkController::class, 'destroy'])->name('frameworks.destroy');
    Route::get('/frameworks/export', [FrameworkController::class, 'export'])
        ->name('frameworks.export');
    Route::get('/frameworks/{framework}', [FrameworkController::class, 'show']);



    //jurisdictions
    Route::resource('jurisdictions', JurisdictionController::class)
        ->only(['index', 'create', 'store', 'update', 'destroy']);



    Route::resource('tags', TagController::class)
        ->only(['index', 'create', 'store', 'update', 'destroy']);



    /*  Route::resource('requirements', RequirementController::class)
         ->only(['index', 'create', 'store', 'update', 'destroy']); */
    Route::get('requirements', [RequirementController::class, 'index'])->name('requirements.index');
        Route::get('/requirements/export', [RequirementController::class, 'export'])
    ->name('requirements.export');
    Route::post('StoreRequirements', [RequirementController::class, 'store'])->name('requirements.store');
    Route::get('requirements/create', [RequirementController::class, 'create'])->name('requirements.create');
    Route::get('/requirements/{requirement}', [RequirementController::class, 'show'])->name('requirements.show');
    Route::get('/requirements/{requirement}/edit', [RequirementController::class, 'edit'])->name('requirements.edit');
    Route::put('/requirements/{requirement}', [RequirementController::class, 'update'])->name('requirements.update');
    Route::delete('/requirements/{requirement}', [RequirementController::class, 'destroy'])->name('requirements.destroy');


});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/bpmn.php';
