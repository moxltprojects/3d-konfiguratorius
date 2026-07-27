<?php

$base_type_args = array(
    'taxonomy' => 'furniture-texture-category',
    'orderby'      => 'name',
    'order'        => 'ASC',
    'parent'       => 0,
    'tax_query' => array(
        array(
            'taxonomy' => 'furniture-texture-type',
            'field' => 'slug', 
            'terms' => 'base',
            'include_children' => false
        )
    )
);

$frame_type_args = array(
    'taxonomy' => 'furniture-texture-category',
    'orderby'      => 'name',
    'order'        => 'ASC',
    'parent'       => 0,
    'tax_query' => array(
        array(
            'taxonomy' => 'furniture-texture-type',
            'field' => 'slug', 
            'terms' => 'frame',
            'include_children' => false
        )
    )
);

$base_type_loop = get_terms($base_type_args);
$frame_type_loop = get_terms($frame_type_args);

?>

<section class="basic-settings" data-step="1"> 
    <div class="basic-settings-inner">
        <div class="data-container">
            <?php include $template_parts_url ."/textures/index.php"; ?>
            <?php include $template_parts_url ."/dimensions/index.php"; ?>
        </div>
        <div class="display-container">
            <?php include $template_parts_url .'/display/basic-settings.php'; ?>
        </div>
    </div>
</section>