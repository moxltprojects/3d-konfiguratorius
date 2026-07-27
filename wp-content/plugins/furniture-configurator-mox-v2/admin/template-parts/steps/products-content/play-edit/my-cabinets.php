
<div class="tab-content dynamic-list my-cabinets-list current" data-type="<?php echo $MY_CABINETS_TYPE; ?>">  
    <div class="dynamic-list-inner my-cabinets-list-inner">
        <?php echo $productsListData['my_items_html'][$currentWallType] ?? ''; ?>
    </div>
</div>