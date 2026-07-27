<?php

// $furniture_id = $furniture_list_objects['furniture_id'];
// $db_data = $furniture_list_objects['db_data'];
// $furniture_post = $furniture_list_objects['furniture_post'];

$model_file = get_field('3d_model', $furniture_id);
$model_file_url = $model_file['url'];
// $type = '';

// $item_woocommerce = get_field('woocommerce', $furniture_id);
// $item_price = $item_woocommerce['discount_price'] && floatval($item_woocommerce['discount_price']) > 0 ? 
//             $item_woocommerce['discount_price'] : 
//             $item_woocommewoocommerce['regular_price'];

// list(
//     $height, 
//     $depth,
// ) = get_furniture_dimensions_by_type( 
//     $item_type_slug,
//     $bottom_height_standard,
//     $top_height_standard,
//     $full_height_standard,
//     $bottom_full_depth_standard,
//     $top_depth_standard,
// );
$item_data = [
    'furniture_id' => $furniture_id,
    'type' => $type,
    'model_src' => $model_file_url,
    'min_width' => $item_width_min,
    'max_width' => $item_width_max,
];

?>

<div class="cabinet-item my-cabinet-item" 
    data-item_data="<?php echo htmlspecialchars(json_encode($item_data), ENT_QUOTES, 'UTF-8'); ?>"
    data-custom_id="<?php echo $custom_id; ?>"
    data-item_width="<?php echo $item_width; ?>"
    data-item_furniture_position="<?php echo $furniture_position_mm; ?>"
    data-display_price="<?php echo $display_price; ?>"
    data-display_price_cm3="<?php echo $display_price_cm3; ?>"
>
    <div class="my-cabinet-item-inner">
        <div class="main-container">
            <h3><?php echo $furniture_post->post_title; ?></h3>
            <div class="dimensions-info">
                <?php echo sprintf(
                    __('H: %s(mm), D: %s(mm), W: <span class="w-value">%s</span>(mm)', 'furniture-config'), 
                    $height, $depth, $item_width
                ); ?>
            </div>
        </div>
        <div class="item-actions-container">
            <button type="button" data-action_type="duplicate">
                <svg width="12" height="15" viewBox="0 0 12 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.023.043H2.647a.125.125 0 0 0-.125.125v.875c0 .07.057.125.125.125h7.75v10.75c0 .07.057.126.126.126h.875a.125.125 0 0 0 .125-.126V.543a.5.5 0 0 0-.5-.5Zm-2 2h-8a.5.5 0 0 0-.5.5v8.293a.5.5 0 0 0 .146.353l2.708 2.708a.515.515 0 0 0 .116.085v.03h.065c.055.02.113.031.172.031h5.292a.5.5 0 0 0 .5-.5v-11a.5.5 0 0 0-.5-.5ZM3.49 12.422l-1.345-1.347H3.49v1.347Zm4.906.496H4.491V10.7a.625.625 0 0 0-.625-.625H1.647V3.168h6.75v9.75Z" fill="currentColor"></path></svg>
            </button>
            <button type="button" data-action_type="edit">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.049 10.793a.63.63 0 0 0 .094-.007l2.628-.461a.153.153 0 0 0 .083-.044l6.623-6.623a.157.157 0 0 0 .034-.17.156.156 0 0 0-.034-.05L9.88.837a.155.155 0 0 0-.11-.045.155.155 0 0 0-.112.046L3.035 7.462a.159.159 0 0 0-.044.083l-.46 2.628a.523.523 0 0 0 .146.466.53.53 0 0 0 .372.155Zm1.053-2.725L9.77 2.403l1.146 1.145-5.668 5.666-1.389.245.244-1.39Zm8.67 4.038h-11.5a.5.5 0 0 0-.5.5v.563c0 .068.057.124.125.124h12.25a.125.125 0 0 0 .126-.124v-.563a.5.5 0 0 0-.5-.5Z" fill="currentColor"></path></svg>
            </button>
                <button type="button" data-action_type="remove">
                    <svg width="13" height="14" viewBox="0 0 13 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.647 1.918h-.125a.125.125 0 0 0 .125-.125v.125h4.75v-.125c0 .07.057.125.125.125h-.125v1.125h1.125v-1.25a1 1 0 0 0-1-1h-5a1 1 0 0 0-1 1v1.25h1.125V1.918Zm7.876 1.125h-11a.5.5 0 0 0-.5.5v.5c0 .07.056.125.124.125h.944l.386 8.172a1 1 0 0 0 .999.954h7.093a.999.999 0 0 0 .999-.954l.386-8.172h.944a.125.125 0 0 0 .125-.125v-.5a.5.5 0 0 0-.5-.5ZM9.449 12.17H2.596l-.378-8h7.61l-.379 8Z" fill="currentColor"></path></svg>
                </button>
        </div>
    </div>

    <div class="edit-container"></div>
    <!-- <php include $template_parts_url ."/play-edit/cabinets/cabinet-item-edit.php"; > -->

</div>
