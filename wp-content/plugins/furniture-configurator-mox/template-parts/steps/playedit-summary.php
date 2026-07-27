<?php 
    global $furniture_type_bottom_corner_slug, $furniture_type_top_corner_slug, $furniture_type_full_corner_slug;
    
    $my_items_html = '';
    $summary_items_html = '';

    $furniture_list_objects = [];
    $bottom_corner_item_id = null;
    $top_corner_item_id = null;
    $full_corner_item_id = null;
    $totals = 0;
?>

<?php foreach($furniture_list as $furniture_item): ?>
    <?php
        $id = $furniture_item->id;
        $furniture_id = $furniture_item->furniture_id;
        $furniture_post = get_post( $furniture_id );

        if(!$furniture_post || $furniture_post->post_status !== 'publish') {
            continue;
        }

        $model_src = get_field('3d_model', $furniture_id);
        $object_type = get_furniture_type($furniture_id);

        switch($object_type) {
            case $furniture_type_bottom_corner_slug: {
                $bottom_corner_item_id = $furniture_id;
                break;
            }
            case $furniture_type_top_corner_slug: {
                $top_corner_item_id = $furniture_id;
                break;
            }
            case $furniture_type_full_corner_slug: {
                $bottom_full_item_id = $furniture_id;
                break;
            }
            default: {
                break;
            }
        }

        //
        //
        // $furniture_id = $furniture_item['furniture_id'];
        // $db_data = $furniture_item;
        $custom_id = $furniture_item->custom_id;
        
        // $item_type = get_furniture_type($furniture_id);
        // $item_type_slug = $item_type->slug;
        $item_type_slug = $object_type ? $object_type->slug : null;
        $type = $item_type_slug;
        $item_width = $furniture_item->width;
        $furniture_position_mm = $furniture_item->furniture_position_mm;

        list(
            $height, 
            $depth,
            $height_min,
            $height_max,
            $depth_min,
        ) = get_furniture_dimensions_by_type( 
            $item_type_slug,
            $bottom_height_standard,
            $top_height_standard,
            $full_height_standard,
            $bottom_full_depth_standard,
            $top_depth_standard,
            $bottom_height_min,
            null,
            $top_height_min,
            null,
            $full_height_min,
            null,
            $bottom_full_depth_min,
            null,
            $top_depth_min,
        );

        $width_obj = get_field('width', $furniture_id);
        $item_width_min = $width_obj['min'];
        $item_width_max = $width_obj['max'];

        if($item_width < $item_width_min || $item_width > $item_width_max) {
            $item_width = $item_width_min;
        }

        /****** totals *******/
        list(
            $item_total,
            $display_price,
            $regular_price,
            $discount_price,
            $display_price_cm3,
            $regular_price_cm3,
            $discount_price_cm3
        ) = calculateItemPrice(
            $furniture_id, 
            $item_width_min, 
            $height_min, 
            $depth_min,
            $item_width,
            $height,
            $depth,
            $default_base_texture_price, 
            $default_frame_texture_price
        );

        $totals += $item_total;

        // list(
        //     $display_price,
        //     $regular_price,
        //     $discount_price,
        //     $display_price_cm3,
        //     $regular_price_cm3,
        //     $discount_price_cm3,
        // ) = get_item_prices($furniture_id);

        // $min_cm3 = $item_width_min * $height_min * $depth_min;
        // $current_cm3 = $item_width * $height * $depth;
        // $cm3_mm = ($current_cm3 - $min_cm3) / 10;  
        // $cm3_m = $cm3_mm / 100;  

        // $cm3_total = $cm3_m * $display_price_cm3;

        // $item_total = floatval($cm3_total + $display_price + $default_base_texture_price + $default_frame_texture_price);
        // $totals += $item_total;

        // $item_total = number_format($item_total, 2, '.', '');
        /****** end totals *******/

        $furniture_list_objects[] = array(
            'old_item' => true, 
            'config_id' => $id, 
            'furniture_id' => $furniture_id,
            'object_src' => $model_src ? $model_src['url'] : null,
            'object_type' => $item_type_slug,
            'db_data' => $furniture_item,
            'furniture_post' => $furniture_post,
            'display_price' => $display_price_cm3,
            'display_price_cm3' => $display_price_cm3,
            'regular_price' => $regular_price,
            'discount_price' => $discount_price,
            'width' => $item_width,
            'height' => $height,
            'depth' => $depth,
            'min_width' => $item_width_min,
            'min_height' => $height_min,
            'min_depth' => $depth_min,
        );
    ?>
    <?php
        ob_start();
        include $template_parts_url . "/play-edit/cabinets/my-cabinet-item.php";
        $my_items_html .= ob_get_clean();

        ob_start();
        include $template_parts_url . "/summary/summary-cabinet-item.php";
        $summary_items_html .= ob_get_clean();
    ?>
<?php endforeach; ?>

<?php 
    $total = number_format($totals, 2, '.', '');
?>


<section class="play-edit-summary" data-step="3,4">
    <div class="play-edit-summary-inner">
        <!-- <php include __DIR__ .'/template-parts/display/3d-model.php'); > -->
        <div class="main-container-wrap">
            <div data-step-data="3">
                <?php include $template_parts_url .'/play-edit/index.php'; ?>
            </div>
            <div data-step-data="4">
                <?php include $template_parts_url .'/summary/index.php'; ?>
            </div>
        </div>
        <div class="total-container">
            <div class="price-label"><?php echo __('Total cost', 'furniture-config'); ?></div>
            <div class="price-block">
                <span class="number"><?php echo $total; ?></span> <?php echo $currency_symbol; ?>
            </div>
        </div>
    </div>
</section>