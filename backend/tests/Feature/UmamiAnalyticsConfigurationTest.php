<?php

namespace Tests\Feature;

use Tests\TestCase;

class UmamiAnalyticsConfigurationTest extends TestCase
{
    public function test_welcome_view_exposes_umami_config_without_loading_script_before_consent(): void
    {
        config([
            'analytics.umami.script_url' => 'https://analytics.example.test/script.js',
            'analytics.umami.website_id' => '2cf4009f-92c9-447a-b0bf-5032f2d905ef',
            'analytics.umami.host_url' => 'https://analytics.example.test',
            'analytics.umami.domains' => 'conta-na-massa.example.test',
        ]);

        $html = view('welcome')->render();

        $this->assertStringContainsString('data-umami-script-url="https://analytics.example.test/script.js"', $html);
        $this->assertStringContainsString('data-umami-website-id="2cf4009f-92c9-447a-b0bf-5032f2d905ef"', $html);
        $this->assertStringContainsString('data-umami-host-url="https://analytics.example.test"', $html);
        $this->assertStringContainsString('data-umami-domains="conta-na-massa.example.test"', $html);

        // LGPD compliance: the Umami script tag must never be statically embedded before explicit user consent.
        $this->assertStringNotContainsString('<script defer src="https://analytics.example.test/script.js"', $html);
        $this->assertStringNotContainsString('data-website-id="2cf4009f-92c9-447a-b0bf-5032f2d905ef"', $html);
    }

    public function test_welcome_view_handles_empty_umami_config_cleanly(): void
    {
        config([
            'analytics.umami.script_url' => null,
            'analytics.umami.website_id' => null,
            'analytics.umami.host_url' => null,
            'analytics.umami.domains' => null,
        ]);

        $html = view('welcome')->render();

        $this->assertStringContainsString('data-umami-script-url=""', $html);
        $this->assertStringContainsString('data-umami-website-id=""', $html);
    }
}
