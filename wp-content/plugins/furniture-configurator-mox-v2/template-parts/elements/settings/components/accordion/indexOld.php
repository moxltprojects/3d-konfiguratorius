<?php 
$allComponentCategories = get_furniture_component_categories();
$countSubcategories = count($allComponentCategories);
$lastIndex = $countSubcategories > 2 ? 2 : $countSubcategories - 1;
?>

<div class="config-accordion">
    <div class="config-accordion-inner">
        <?php foreach($allComponentCategories as $index => $category) : ?>

            <?php include __DIR__ . '/accordion-item.php'; ?>
            
        <?php endforeach; ?>
    </div>
</div>

<?php 

