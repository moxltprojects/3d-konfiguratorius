<?php 
$categoryName = $category->name;
$activeClass = $lastIndex === $index ? ' active' : '';
?>

<div class="config-accordion-item<?php echo $activeClass; ?>">
    <div class="heading">
        <button><?php echo $categoryName; ?><span></span></button>
    </div>
    <div class="content">
        <div class="content-inner">
            <?php include __DIR__ . '/item-content.php'; ?>
        </div>
    </div>
</div>