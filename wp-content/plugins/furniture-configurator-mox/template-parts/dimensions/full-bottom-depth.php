<?php
global $furniture_type_bottom_name, $furniture_type_full_name, $furniture_type_full_bottom_slug, $DEPTH_SLUG; 

$heading = __("$furniture_type_full_name and $furniture_type_bottom_name Depth", 'furniture-config');

$type = $furniture_type_full_bottom_slug;
$dimension_type = $DEPTH_SLUG;

$standard = $bottom_full_depth_standard;
$min = $bottom_full_depth_min;
$max = $bottom_full_depth_max;
$constant_name = 'bottomFullDepth';

?>

<?php include $template_parts_url .'/dimensions/slider-container.php'; ?>
