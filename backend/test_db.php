<?php
$start = microtime(true);
try {
    $pdo = new PDO('pgsql:host=postgres;dbname=conta_na_massa', 'postgres', 'E@rtdesign23');
    echo "Connected successfully.\n";
} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage() . "\n";
}
echo "Time: " . (microtime(true) - $start) . "s\n";
