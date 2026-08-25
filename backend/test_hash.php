<?php
$start = microtime(true);
$hash = password_hash('admin', PASSWORD_BCRYPT);
echo "Hash: " . (microtime(true) - $start) . "s\n";
$start2 = microtime(true);
password_verify('admin', $hash);
echo "Verify: " . (microtime(true) - $start2) . "s\n";
