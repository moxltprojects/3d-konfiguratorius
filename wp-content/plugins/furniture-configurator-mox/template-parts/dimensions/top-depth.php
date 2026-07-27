<?php
global $furniture_type_top_name, $furniture_type_top_slug, $DEPTH_SLUG; 

$heading = __("$furniture_type_top_name Depth", 'furniture-config');

$type = $furniture_type_top_slug;
$dimension_type = $DEPTH_SLUG;

$standard = $top_depth_standard;
$min = $top_depth_min;
$max = $top_depth_max;
$constant_name = 'topDepth';

?>

<?php include $template_parts_url .'/dimensions/slider-container.php'; ?>
