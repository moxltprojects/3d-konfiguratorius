<?php 
global $FURNITURE_TYPE_ALL_SLUG;
$typeSlug = $furnitureType->slug;
$typeName = $furnitureType->name;
$hiddenClass = $FURNITURE_TYPE_ALL_SLUG !== $typeSlug && !in_array($typeSlug, $defaultFurnitureTypes) ? ' hidden' : '';
if(!$hiddenClass) $index++;
$activeClass = $lastIndex === $index ? ' active' : '';
$keys = [];
?>

<div class="config-accordion-item<?php echo $activeClass; ?><?php echo $hiddenClass; ?>" data-type_slug="<?php echo $typeSlug; ?>">
    <div class="heading">
        <button><?php echo $typeName; ?><span></span></button>
    </div>
    <div class="content">
        <div class="content-inner">
            <?php include __DIR__ . '/item-content.php'; ?>
        </div>
    </div>
</div>