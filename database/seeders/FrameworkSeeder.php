<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Framework;
class FrameworkSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $frameworks = [
            [
                'code' => 'ISO27001',
                'name' => 'ISO/IEC 27001',
                'jurisdiction' => json_encode(['International']),
                'tags' => json_encode(['Sécurité de l’information', 'Cybersécurité', 'ISO 27001', 'Audit']),
                'type' => 'standard',
                'status' => 'active'
            ],
            [
                'code' => 'RGPD',
                'name' => 'RGPD',
                'jurisdiction' => json_encode(['Union Européenne']),
                'tags' => json_encode(['RGPD', 'Privacy', 'Conformité']),
                'type' => 'regulation',
                'status' => 'active'
            ],
            [
                'code' => 'PCI-DSS',
                'name' => 'PCI-DSS',
                'jurisdiction' => json_encode(['International']),
                'tags' => json_encode(['Sécurité de l’information', 'PCI-DSS', 'Audit']),
                'type' => 'standard',
                'status' => 'active'
            ],
            [
                'code' => 'HIPAA',
                'name' => 'HIPAA',
                'jurisdiction' => json_encode(['États-Unis']),
                'tags' => json_encode(['Privacy', 'Conformité']),
                'type' => 'regulation',
                'status' => 'active'
            ],
            [
                'code' => 'NIST-CSF',
                'name' => 'NIST CSF',
                'jurisdiction' => json_encode(['États-Unis']),
                'tags' => json_encode(['NIST', 'Sécurité de l’information', 'Gestion des risques']),
                'type' => 'standard',
                'status' => 'active'
            ],
            [
                'code' => 'Loi2004-63',
                'name' => 'Loi 2004-63',
                'jurisdiction' => json_encode(['Tunisie']),
                'tags' => json_encode(['Gouvernance', 'Conformité']),
                'type' => 'internal_policy',
                'status' => 'active'
            ],
            [
                'code' => 'SOX',
                'name' => 'SOX',
                'jurisdiction' => json_encode(['États-Unis']),
                'tags' => json_encode(['Reporting', 'Contrôle interne']),
                'type' => 'regulation',
                'status' => 'active'
            ],
        ];

        foreach ($frameworks as $data) {
    Framework::updateOrCreate(
        ['code' => $data['code']], // critère unique
        $data
    );
}

    }
}


