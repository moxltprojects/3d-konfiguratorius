<?php

global $HEIGHT_SLUG, $DEPTH_SLUG, $WIDTH_SLUG;

?>

<div class="edit-container">   
    <div class="edit-container-inner"> 

        <button type="button" data-type="go-back"><?php echo __('Go Back', 'furniture-config'); ?></button>

        <?php 
            $heading = __('Height', 'furniture-config');

            $type = $HEIGHT_SLUG;
            $dimension_type = $HEIGHT_SLUG;

            $standard = $height;
            $min = $height_min;
            $max = $height_max;
        ?>
        <?php include $template_parts_url ."/dimensions/slider-container.php"; ?>

        <?php 
            $heading = __('Depth', 'furniture-config');

            $type = $DEPTH_SLUG;
            $dimension_type = $DEPTH_SLUG;

            $standard = $depth;
            $min = $depth_min;
            $max = $depth_max;
        ?>
        <?php include $template_parts_url ."/dimensions/slider-container.php"; ?>


        <?php 
            $heading = __('Width', 'furniture-config');

            $type = $WIDTH_SLUG;
            $dimension_type = $WIDTH_SLUG;

            $standard = $item_width;
            $min = $item_width_min;
            $max = $item_width_max;
        ?>
        <?php include $template_parts_url ."/dimensions/slider-container.php"; ?>

        <?php if(!isset($is_my_cabinet_item)): ?>

            <button type="button" data-type="add">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="0.5" y="0.5" width="15" height="15" rx="8" fill="#2a568d" stroke="#2a568d"></rect><path d="M4.266 8L7.066 10.8L11.73 5.2" stroke="#ffffff" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dashoffset="0px" stroke-dasharray="1px 1px"></path></svg>
                <span><?php echo __('Add', 'furniture-config'); ?></span>
            </button>

        <?php endif; ?>
    </div>
</div>