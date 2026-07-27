<?php 
    global 
        $furniture_config_v2_template_parts_url, 
        $furniture_type_bottom_corner_slug, 
        $furniture_type_top_corner_slug, 
        $furniture_type_full_corner_slug,
        $FURNITURE_TYPE_WALL, 
        $FURNITURE_TYPE_WALL_TOP;
    
    $myItemsHtml = '';
    $summaryItemsHtml = '';
    $bottomSummaryItemsHtml = '';

    $furniture_list_objects = [];
    $bottomCornerItemId = null;
    $topCornerItemId = null;
    $fullCornerItemId = null;
    $totals = 0;
    $discountTotals = 0;
?>

<?php foreach($productsList as $index => $productItem): ?>
    <?php
        $productId = $productItem->product_id;
        $configId = $productItem->config_id ?? null;
        $postId = $productItem->post_id ?? null;
        $customId = $productItem->custom_id;
        $productTitle = get_the_title($productId);
        $model_file_url = get_field('3d_image', $productId);
        $productFurnitureTypes = get_the_terms($productId, 'config-furniture-type');
        $itemWidth = $productItem->width;
        $itemHeight = $productItem->height;
        $itemDepth = $productItem->depth;
        $itemDepth = $productItem->depth;
        $itemSpaceBottom = $productItem->space_bottom;
        $furniturePositionMm = $productItem->furniture_position_mm ?? '{}';
		$hasBrandTexture = get_field('has_brand_texture', $productId);
        $rotation = $productItem->rotation;

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

        $width_obj = get_field('width', $productId);
        $itemWidthMin = $width_obj['min'];
        $itemWidthMax = $width_obj['max'];

        // if($itemWidth < $itemWidthMin || $itemWidth > $itemWidthMax) {
        //     $itemWidth = $itemWidthMin;
        // }

        $currentDimensions = $furnitureDimensionsSortedByType[$furnitureTypeSlug];

        $height_obj = get_field('height', $productId);
        $itemHeightData = intval($height_obj['default']);
        $itemHeightMin = 0;
        $itemHeightMax = 0;
        if(!$currentDimensions || $itemHeightData && $itemHeightData > 0) {
            $itemHeightMin = $height_obj['min'];
            $itemHeightMax = $height_obj['max'];
        } else {
            $itemHeightMin = $currentDimensions['min_height'];
            $itemHeightMax = $currentDimensions['max_height'];
        }

        // if($itemHeight < $itemHeightMin || $itemHeight > $itemHeightMax) {
        //     $itemHeight = $itemHeightMin;
        // }

        $depth_obj = get_field('depth', $productId);
        $itemDepthData = intval($depth_obj['default']);
        $itemDepthMin = 0;
        $itemDepthMax = 0;
        if($itemDepthData && $itemDepthData > 0) {
            $itemDepthMin = $depth_obj['min'];
            $itemDepthMax = $depth_obj['max'];
        } else {
            $itemDepthMin = $currentDimensions['min_depth'];
            $itemDepthMax = $currentDimensions['max_depth'];
        }

        // if($itemDepth < $itemDepthMin || $itemDepth > $itemDepthMax) {
        //     $itemDepth = $itemDepthMin;
        // }

        $space_bottom_obj = get_field('space_bottom', $productId);
        $itemSpaceBottomData = isset($space_bottom_obj['default']) ? intval($space_bottom_obj['default']) : null;
        $itemSpaceBottomMin = 0;
        $itemSpaceBottomMax = 0;
        if($itemSpaceBottomData && $itemSpaceBottomData > 0) {
            $itemSpaceBottomMin = $space_bottom_obj['min'];
            $itemSpaceBottomMax = $space_bottom_obj['max'];
        } else {
            $itemSpaceBottomMin = $currentDimensions['min_space_bottom'];
            $itemSpaceBottomMax = $currentDimensions['max_space_bottom'];
        }

        // if($itemSpaceBottom < $itemSpaceBottomMin || $itemSpaceBottom > $itemSpaceBottomMax) {
        //     $itemSpaceBottom = $itemSpaceBottomMin;
        // }

        /****** totals *******/

        $priceData = getProductTotals(
           $productId, 
           $furnitureTypeSlug,
           $hasBrandTexture,
           $defaultTextures,
           $itemWidth,
           $itemHeight,
           $itemDepth,
           null,
           false,
           false,
        );

        $total = (float) $priceData['regular_total'];
        $discount_total = (float) $priceData['discount_total'];
        $display_total = (float) $priceData['display_total'];

        $totals += $total;
        $discountTotals += $discount_total;
        

        /****** end totals *******/

        $thumbnailData = getProductThumbnailData($standImageData, $productId);
        $attachmentUrl = $thumbnailData['url'] ?? null;
        $attachmentId = $thumbnailData['id'] ?? null;
        $attachmentType = $thumbnailData['attachmentType'] ?? null;

        // if(isset($standImageData->$furnitureTypeSlug)) {
        //     $thumbnailId = $standImageData->$furnitureTypeSlug;
        // } 

        // if($thumbnailId) {
        //     $thumbnail = wp_get_attachment_image_url( $thumbnailId, 'thumbnail' );
        // } else {
        //     $thumbnailId = get_post_thumbnail_id($productId);
        //     $thumbnail = wp_get_attachment_image_url( $thumbnailId, 'thumbnail' );
        // }

        $furniture_list_objects[] = array(
            'product_id' => $productId,
            'config_id' => $configId, 
            'post_id' => $postId, 
            'furniture_type' => $furnitureTypeSlug,
            'min_width' => $itemWidthMin,
            'max_width' => $itemWidthMax,
            'min_height' => $itemHeightMin,
            'max_height' => $itemHeightMax,
            'min_depth' => $itemDepthMin,
            'max_depth' => $itemDepthMax,
            'min_space_bottom' => $itemSpaceBottomMin,
            'max_space_bottom' => $itemSpaceBottomMax,
            'attachment_url' => $attachmentUrl,
            'db_data' => [
                'custom_id' => $customId,
                'width' => $itemWidth,
                'height' => $itemHeight,
                'depth' => $itemDepth,
                'space_bottom' => $itemSpaceBottom,
                'furniture_position_mm' => $furniturePositionMm,
                'is_fitting' => $productItem->is_fitting,
                'rotation' => $rotation,
                'prices' => $priceData,
                'object_src' => $model_file_url,
                'attachment_type' => $attachmentType,
                'attachment_id' => $attachmentId,
                'has_brand_texture' => $hasBrandTexture,
            ],
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

