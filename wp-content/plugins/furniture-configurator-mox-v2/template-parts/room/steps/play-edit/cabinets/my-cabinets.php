<?php 
global $furniture_config_v2_template_parts_url;
?>

<div class="tab-content dynamic-list my-cabinets-list current" data-type="<?php echo $MY_CABINETS_TYPE; ?>">  
    <div class="dynamic-list-inner my-cabinets-list-inner">
        <?php echo $productsListData['my_items_html'] ?? ''; ?>
    </div>
    <?php include $furniture_config_v2_template_parts_url .'/room/steps/play-edit/total-container.php'; ?>
</div>