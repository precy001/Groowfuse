<?php
/**
 * api/ landing page. Handy when someone hits the API root directly —
 * tells them they're in the right place but should call specific
 * endpoints. Also serves as a quick smoke test for routing.
 */

declare(strict_types=1);

require_once __DIR__ . '/lib/response.php';

cors_or_die();

ok([
    'service' => 'GroowFuse API',
    'version' => 1,
    'docs'    => 'See README.md in this folder for endpoint reference.',
]);
