<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\FrameworkController;
use App\Http\Controllers\JurisdictionController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\RequirementController;
use App\Http\Controllers\RequirementTestController;
use App\Http\Controllers\OverviewController;
use App\Http\Controllers\BusinessUnitController;
use App\Http\Controllers\MacroProcessController;
use App\Http\Controllers\ProcessController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\RiskCategoryController;
use App\Http\Controllers\RiskController;
use App\Http\Controllers\RiskConfigurationController;
use App\Http\Controllers\OrganizationController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\PermissionController;

// Page d'accueil publique
Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// Routes protégées (auth + verified)
Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Audit Universe
    Route::get('overview', [OverviewController::class, 'index'])->name('overview.index');

    Route::get('business-units/export', [BusinessUnitController::class, 'export'])->name('business-units.export');
    Route::resource('business-units', BusinessUnitController::class);

    Route::get('macro-processes/export', [MacroProcessController::class, 'export'])->name('macro-processes.export');
    Route::resource('macro-processes', MacroProcessController::class);

    Route::get('processes/export', [ProcessController::class, 'export'])->name('processes.export');
    Route::resource('processes', ProcessController::class);

    // Documents
    Route::get('documents/{document}/download', [DocumentController::class, 'download'])->name('documents.download');
    Route::delete('documents/{document}', [DocumentController::class, 'destroy'])->name('documents.destroy');

    // Risk Categories
    Route::get('risk-categories/export', [RiskCategoryController::class, 'export'])->name('risk-categories.export');
    Route::get('risk-categories/tree', [RiskCategoryController::class, 'tree'])->name('risk-categories.tree');
    Route::resource('risk-categories', RiskCategoryController::class);

    // Risks
    Route::get('risks/export', [RiskController::class, 'export'])->name('risks.export');
    Route::get('risks/matrix', [RiskController::class, 'matrix'])->name('risks.matrix');
    Route::resource('risks', RiskController::class);

    // Risk Configurations
    Route::prefix('risk-configurations')->name('risk-configurations.')->group(function () {
        Route::get('/', [RiskConfigurationController::class, 'index'])->name('index');
        Route::get('/create', [RiskConfigurationController::class, 'create'])->name('create');
        Route::post('/', [RiskConfigurationController::class, 'store'])->name('store');
        Route::get('/{riskConfiguration}', [RiskConfigurationController::class, 'show'])->name('show');
        Route::get('/{riskConfiguration}/edit', [RiskConfigurationController::class, 'edit'])->name('edit');
        Route::put('/{riskConfiguration}', [RiskConfigurationController::class, 'update'])->name('update');
        Route::delete('/{riskConfiguration}', [RiskConfigurationController::class, 'destroy'])->name('destroy');
        Route::post('/calculate-risk-score', [RiskConfigurationController::class, 'calculateRiskScore'])->name('calculate-risk-score');
        Route::get('/matrix-data', [RiskConfigurationController::class, 'getRiskMatrixData'])->name('matrix-data');
    });

    // Organizations
    Route::get('organizations/select', [OrganizationController::class, 'selectPage'])
        ->name('organizations.select.page');
    Route::post('organizations/{organization}/select', [OrganizationController::class, 'select'])
        ->name('organizations.select');

    Route::get('organizations/export', [OrganizationController::class, 'export'])->name('organizations.export');
    Route::resource('organizations', OrganizationController::class);

    Route::post('organizations/{organization}/users', [OrganizationController::class, 'addUser'])->name('organizations.users.add');
    Route::delete('organizations/{organization}/users/{user}', [OrganizationController::class, 'removeUser'])->name('organizations.users.remove');
    Route::patch('organizations/{organization}/users/{user}/role', [OrganizationController::class, 'updateUserRole'])->name('organizations.users.update-role');

    // Users
    Route::get('users/export', [UserController::class, 'export'])->name('users.export');
    Route::resource('users', UserController::class);

    // Roles & Permissions
    Route::resource('roles', RoleController::class);
    Route::resource('permissions', PermissionController::class)->only(['index', 'create', 'store', 'destroy']);

    // Admin Settings
    Route::prefix('admin-settings')->name('admin-settings.')->group(function () {
        Route::get('/', function () {
            return Inertia::render('admin-settings-general/index');
        })->name('index');
    });

    // Frameworks
    Route::get('frameworks/export', [FrameworkController::class, 'export'])->name('frameworks.export');
    Route::resource('frameworks', FrameworkController::class);

    // Jurisdictions
    Route::resource('jurisdictions', JurisdictionController::class)
        ->only(['index', 'create', 'store', 'update', 'destroy']);

    // Tags
    Route::resource('tags', TagController::class)
        ->only(['index', 'create', 'store', 'update', 'destroy']);

    // Requirements
    Route::get('requirements/export', [RequirementController::class, 'export'])->name('requirements.export');
    Route::resource('requirements', RequirementController::class);

    // Requirement Tests (liste + création depuis exigence)
    Route::get('req-testing', [RequirementController::class, 'getRequirementsForTesting'])
        ->name('req-testing.index');

    Route::get('/requirements/{requirement}/test/create', [RequirementTestController::class, 'createForRequirement'])
        ->name('requirements.test.create');

    Route::post('/requirements/{requirement}/test', [RequirementTestController::class, 'storeForRequirement'])
        ->name('requirements.test.store');

    Route::resource('requirement-tests', RequirementTestController::class)
        ->only(['index', 'show', 'edit', 'update', 'destroy']);
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/bpmn.php';