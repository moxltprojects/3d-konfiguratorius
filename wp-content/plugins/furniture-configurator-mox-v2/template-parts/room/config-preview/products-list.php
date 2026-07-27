<?php 
    global $furniture_config_v2_template_parts_url;

    $summaryItemsHtml = '';

    $furniture_list_objects = [];
    $totals = 0;
    $discountTotals = 0;
?>

<div class="summary cabinet-settings">
    <div class="summary-inner cabinet-settings-inner">
        <div class="summary-cabinets-list main-container-wrap">
        <?php foreach($productsList as $productItem): ?>
            <?php
                $productId = $productItem->product_id;
                $configId = $productItem->config_id;
                $customId = $productItem->custom_id;
                $productTitle = get_the_title($productId);
                $model_file_url = get_field('3d_image', $productId);
                $furnitureTypes = get_the_terms($productId, 'config-furniture-type');
                $itemWidth = $productItem->width;
                $furniturePositionMm = $productItem->furniture_position_mm;

                $furnitureType = null;
                $furnitureTypeSlug = '';
                if(!empty($furnitureTypes)) {
                    $furnitureType = $furnitureTypes[0];
                    $furnitureTypeSlug = $furnitureType->slug;
                }

                list(
                    $height, 
                    $depth,
                    $heightMin,
                    $heightMax,
                    $depthMin,
                    $depthMax,
                ) = getFurnitureDimensionsByType( 
                    $furnitureTypeSlug,
                    $furnitureDimensions
                );

                $width_obj = get_field('width', $productId);
                $itemWidthMin = $width_obj['min'];
                $itemWidthMax = $width_obj['max'];

                if($itemWidth < $itemWidthMin || $itemWidth > $itemWidthMax) {
                    $itemWidth = $itemWidthMin;
                }

                /****** totals *******/
                $priceData = getProductTotals(
                    $productId, 
                    $furnitureTypeSlug,
                    $defaultTextures,
                    $itemWidth,
                    $height,
                    $depth,
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
                    'furniture_position_mm' => $furniturePositionMm,
                    'model_original_size' => $productItem->model_original_size,
                    'model_scaled_size' => $productItem->model_scaled_size,
                    'model_position' => $productItem->model_position,
                    'is_fitting' => $productItem->is_fitting,
                ];

                $furniture_list_objects[] = array(
                    'id' => $productItem->id,
                    'old_item' => true, 
                    'config_id' => $configId, 
                    'product_id' => $productId,
                    'object_src' => $model_file_url,
                    'furniture_type' => $furnitureTypeSlug,
                    'db_data' => $dbData,
                    'prices' => $priceData,
                    'width' => $itemWidth,
                    'height' => $height,
                    'depth' => $depth,
                    'min_width' => $itemWidthMin,
                    'min_height' => $heightMin,
                    'min_depth' => $depthMin,
                );
            ?>
            <?php
                include $furniture_config_v2_template_parts_url . "/room/steps/summary/summary-cabinet-item.php";
            ?>
        <?php endforeach; ?>
        </div>
    </div>
</div>

<?php 
    $regular = number_format($totals, 2, '.', '');
    $discount = number_format($discountTotals, 2, '.', '');
?>

