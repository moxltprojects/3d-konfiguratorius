<?php 

$countTypes = count($furnitureTypes);
$lastIndex = $countTypes > 2 ? 3 : $countTypes;
$index = 0;
?>

<div class="config-accordion">
    <div class="config-accordion-inner">
        <?php foreach($furnitureTypes as $furnitureType) : ?>
            <?php include __DIR__ . '/accordion-item.php'; ?>
        <?php endforeach; ?>
    </div>
</div>