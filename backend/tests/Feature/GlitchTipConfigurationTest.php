<?php

namespace Tests\Feature;

use Tests\TestCase;
use Sentry\ClientBuilder;
use Sentry\Event;
use Sentry\State\Hub;
use Sentry\Transport\Result;
use Sentry\Transport\ResultStatus;
use Sentry\Transport\TransportInterface;

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

    public function test_empty_dsn_leaves_local_logging_and_disables_remote_capture(): void
    {
        $this->assertNull(config('sentry.dsn'));
        $this->assertFalse(config('sentry.enable_logs'));
        $this->assertContains('single', config('logging.channels.stack.channels'));
        $this->assertNotContains('sentry_logs', config('logging.channels.stack.channels'));
        $this->assertFalse(config('sentry.send_default_pii'));
        $this->assertFalse(config('sentry.breadcrumbs.sql_bindings'));
    }

    public function test_sdk_captures_an_event_with_a_configured_dsn_without_network_access(): void
    {
        $transport = new class implements TransportInterface {
            /** @var list<Event> */
            public array $events = [];

            public function send(Event $event): Result
            {
                $this->events[] = $event;

                return new Result(ResultStatus::success(), $event);
            }

            public function close(?int $timeout = null): Result
            {
                return new Result(ResultStatus::success());
            }
        };

        $client = ClientBuilder::create([
            'dsn' => 'https://public@example.invalid/1',
            'sample_rate' => 1.0,
            'enable_logs' => true,
            'send_default_pii' => false,
        ])->setTransport($transport)->getClient();

        (new Hub($client))->captureMessage('local GlitchTip capture verification');

        $this->assertCount(1, $transport->events);
        $this->assertSame('local GlitchTip capture verification', $transport->events[0]->getMessage());
    }

    public function test_frontend_reads_the_runtime_dsn_from_the_backend_shell(): void
    {
        config(['sentry.dsn' => null]);
        $this->get('/')->assertOk()->assertSee('data-sentry-dsn=""', false);

        config(['sentry.dsn' => 'https://public@example.invalid/1']);
        $this->get('/')->assertOk()->assertSee('data-sentry-dsn="https://public@example.invalid/1"', false);

        config(['sentry.traces_sample_rate' => null]);
        $this->get('/')->assertOk()->assertSee('data-sentry-traces-sample-rate="0.01"', false);
    }
}
