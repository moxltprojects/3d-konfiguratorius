<?php 
    global $furniture_config_v2_template_parts_url, $furniture_type_bottom_corner_slug, $furniture_type_top_corner_slug, $furniture_type_full_corner_slug;
    
    $myItemsHtml = '';
    $summaryItemsHtml = '';

    $furniture_list_objects = [];
    $bottomCornerItemId = null;
    $topCornerItemId = null;
    $fullCornerItemId = null;
    $totals = 0;
    $discountTotals = 0;
?>

<?php foreach($productsList as $productItem): ?>
    <?php
        $productId = $productItem->product_id;
        $roomType = $productItem->room_type;
        $configId = $productItem->config_id;
        $customId = $productItem->custom_id;
        $productTitle = get_the_title($productId);
        $model_file_url = get_field('3d_image', $productId);
        $productFurnitureTypes = get_the_terms($productId, 'config-furniture-type');
        $itemWidth = $productItem->width;
        $itemHeight = $productItem->height;
        $itemDepth = $productItem->depth;
        $furniturePositionMm = $productItem->furniture_position_mm;

        $furnitureType = null;
        $furnitureTypeSlug = '';
        if(!empty($productFurnitureTypes)) {
            $furnitureType = $productFurnitureTypes[0];
            $furnitureTypeSlug = $furnitureType->slug;
        }

        switch($furnitureTypeSlug) {
            case $furniture_type_bottom_corner_slug: {
                $bottomCornerItemId = $productId;
                break;
            }
            case $furniture_type_top_corner_slug: {
                $topCornerItemId = $productId;
                break;
            }
            case $furniture_type_full_corner_slug: {
                $fullCornerItemId = $productId;
                break;
            }
            default: {
                break;
            }
        }

        // list(
        //     $height, 
        //     $depth,
        //     $heightMin,
        //     $heightMax,
        //     $depthMin,
        //     $depthMax,
        // ) = getFurnitureDimensionsByType( 
        //     $furnitureTypeSlug,
        //     $furnitureDimensions
        // );

        $width_obj = get_field('width', $productId);
        $itemWidthMin = $width_obj['min'];
        $itemWidthMax = $width_obj['max'];

        $dimensions = $furnitureDimensionsSortedByType[$furnitureTypeSlug];
        $itemHeight = $itemHeight ?? $dimensions['height'];
        $itemHeightMin = $dimensions['min_height'];
        $itemHeightMax = $dimensions['max_height'];

        $itemDepth = $itemDepth ?? $dimensions['depth'];
        $itemDepthMin = $dimensions['min_depth'];
        $itemDepthMax = $dimensions['max_depth'];

        if($itemWidth < $itemWidthMin || $itemWidth > $itemWidthMax) {
            $itemWidth = $itemWidthMin;
        }

        if($itemHeight < $itemHeightMin || $itemHeight > $itemHeightMax) {
            $itemHeight = $itemHeightMin;
        }

        if($itemDepth < $itemDepthMin || $itemDepth > $itemDepthMax) {
            $itemDepth = $itemDepthMin;
        }


        /****** totals *******/
        $priceData = getProductTotals(
           $productId, 
           $furnitureTypeSlug,
           $defaultTextures,
           $itemWidth,
           $itemHeight,
           $itemDepth,
        );
        $total = $priceData['regular_total'];
        $discount_total = $priceData['discount_total'];
        $display_total = $priceData['display_total'];

        $totals += $total;
        $discountTotals += $discount_total;

        /****** end totals *******/

        $dbData = [
            'custom_id' => $customId,
            'width' => $itemWidth,
            'height' => $itemHeight,
            'depth' => $itemDepth,
            'furniture_position_mm' => $furniturePositionMm,
            'model_original_size' => $productItem->model_original_size,
            'model_scaled_size' => $productItem->model_scaled_size,
            'model_position' => $productItem->model_position,
            'is_fitting' => $productItem->is_fitting,
        ];

        $furniture_list_objects[] = array(
            'id' => $productItem->id,
            'room_type' => $roomType, 
            'old_item' => true, 
            'config_id' => $configId, 
            'product_id' => $productId,
            'object_src' => $model_file_url,
            'furniture_type' => $furnitureTypeSlug,
            'db_data' => $dbData,
            'prices' => $priceData,
            'width' => $itemWidth,
            'height' => $itemHeight,
            'depth' => $itemDepth,
            'min_width' => $itemWidthMin,
            'max_width' => $itemWidthMax,
            'min_height' => $itemHeightMin,
            'max_height' => $itemHeightMax,
            'min_depth' => $itemDepthMin,
            'max_depth' => $itemDepthMax,
        );
    ?>
    <?php
        ob_start();
        include __DIR__ . "/my-cabinet-item.php";
        $myItemsHtml .= ob_get_clean();

        ob_start();
        include $furniture_config_v2_template_parts_url . "/room/steps/summary/summary-cabinet-item.php";
        $summaryItemsHtml .= ob_get_clean();
    ?>
<?php endforeach; ?>

<?php 
    $regular = number_format($totals, 2, '.', '');
    $discountTotal = number_format($discountTotals, 2, '.', '');
?>

