<?php 
global $furniture_config_v2_template_parts_url
?>
<div class="tab-item<?php echo $currentClass; ?>" data-room_type="<?php echo $roomType; ?>">
    <div class="dynamic-list summary-cabinets-list">  
        <div class="dynamic-list-inner summary-cabinets-list-inner">
            <?php echo $productsListData['summary_items_html'][$roomType] ?? ''; ?>
        </div>
    </div>
</div>
