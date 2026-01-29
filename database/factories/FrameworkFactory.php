<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Framework;

class FrameworkFactory extends Factory
{
    protected $model = Framework::class;

    public function definition(): array
    {
        $types = ['standard', 'regulation', 'contract', 'internal_policy'];
        $statuses = ['active', 'deprecated', 'draft', 'archived'];
        $jurisdictions = ['International', 'Union Européenne', 'États-Unis', 'Tunisie'];
        $tagsList = [
            'Sécurité de l’information', 'Cybersécurité', 'Conformité', 'Audit', 
            'Gestion des risques', 'RGPD', 'Privacy', 'ISO 27001', 'NIST', 'PCI-DSS',
            'Gouvernance', 'Contrôle interne', 'Plan d’action', 'Reporting'
        ];

        return [
            'code' => strtoupper($this->faker->unique()->lexify('???-###')),
            'name' => $this->faker->catchPhrase(),
            'version' => $this->faker->numerify('v#.##'),
            'type' => $this->faker->randomElement($types),
            'status' => $this->faker->randomElement($statuses),
            'description' => $this->faker->sentence(10),
            'publisher' => $this->faker->company(),
            'jurisdiction' => $this->faker->randomElement($jurisdictions),
            'scope' => $this->faker->sentence(5),
            'release_date' => $this->faker->date(),
            'effective_date' => $this->faker->date(),
            'retired_date' => null,
            'language' => $this->faker->languageCode(),
            'url_reference' => $this->faker->url(),
            'tags' => $this->faker->randomElements($tagsList, rand(1, 3))
        ];
    }
}
