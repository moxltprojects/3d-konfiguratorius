

<?php 
    
list (
    $bottomItems,
    $bottomCornerItems,
    $topItems,
    $topCornerItems,
    $fullItems,
    $fullCornerItems
) = get_furniture_filtered_by_type($config_ids);

function render_term_item($heading, $children)
{
    global 
        $template_parts_url,
        $currency_symbol,
        $bottom_height_standard,
        $top_height_standard,
        $full_height_standard,
        $bottom_full_depth_standard,
        $top_depth_standard,
        $bottom_height_min,
        $bottom_height_max,
        $top_height_min,
        $top_height_max,
        $full_height_min,
        $full_height_max,
        $bottom_full_depth_min,
        $bottom_full_depth_max,
        $top_depth_min,
        $top_depth_max;

    if(!$children || count($children) == 0) return;
    ?>

    <li class="furniture-type-term">
        <button type="button"><?php echo $heading; ?></button>
        <div class="furniture-list-container">
            <button type="button" data-type="go-back"><?php echo __('Go Back', 'furniture-config'); ?></button>
            <ul class="furniture-list">
                <?php foreach($children as $child): ?>
                    <li>
                        <?php include $template_parts_url ."/play-edit/cabinets/add-cabinet-item.php"; ?>
                    </li>
                <?php endforeach; ?>
            </ul>
        </div>
    </li>

    <?php
}

?>

<div class="tab-content furniture-types-list-container" data-type="<?php echo $ADD_CABINETS_TYPE; ?>">
    <div class="furniture-types-container-inner">
        <ul class="furniture-types-list">
           <?php render_term_item(__('Bottom', 'furniture-config'), $bottomItems); ?>
           <?php render_term_item(__('Bottom Corner', 'furniture-config'), $bottomCornerItems); ?>
           <?php render_term_item(__('Top', 'furniture-config'), $topItems); ?>
           <?php render_term_item(__('Top Corner', 'furniture-config'), $topCornerItems); ?>
           <?php render_term_item(__('Full', 'furniture-config'), $fullItems); ?>
           <?php render_term_item(__('Full Corner', 'furniture-config'), $fullCornerItems); ?>
        </ul>
    </div>
</div>