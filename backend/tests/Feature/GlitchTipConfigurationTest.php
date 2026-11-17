<?php

namespace Tests\Feature;

use Tests\TestCase;

class GlitchTipConfigurationTest extends TestCase
{
    /**
     * Test that the Sentry / GlitchTip configuration file exists and has expected keys.
     */
    public function test_sentry_config_file_exists_and_has_expected_keys(): void
    {
        $configFile = config_path('sentry.php');
        $this->assertFileExists($configFile);

        $config = config('sentry');
        $this->assertIsArray($config);
        $this->assertArrayHasKey('dsn', $config);
        $this->assertArrayHasKey('traces_sample_rate', $config);
    }

    /**
     * Test that Sentry DSN and sample rate read from environment variables properly.
     */
    public function test_sentry_reads_environment_variables(): void
    {
        $dummyDsn = 'https://key@errors.agilizia.com.br/4';
        config(['sentry.dsn' => $dummyDsn]);
        config(['sentry.traces_sample_rate' => 0.01]);

        $this->assertSame($dummyDsn, config('sentry.dsn'));
        $this->assertSame(0.01, config('sentry.traces_sample_rate'));
    }

    /**
     * Test that the Sentry integration class is available.
     */
    public function test_sentry_integration_class_is_available(): void
    {
        $this->assertTrue(class_exists(\Sentry\Laravel\Integration::class));
    }
}
