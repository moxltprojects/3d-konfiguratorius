<?php 
global $ADD_CABINETS_TYPE;
$productPage = 1;
?>


<div class="tab-content furniture-types-list-container" data-type="<?php echo $ADD_CABINETS_TYPE; ?>">
    <div class="furniture-types-container-inner">
        <ul class="furniture-types-list">
            <?php foreach($furnitureTypes as $furnitureType) : ?>
                <?php 
                    include __DIR__ .'/add-cabinet-item.php'; 
                ?>
            <?php endforeach; ?>
        </ul>
    </div>
</div>