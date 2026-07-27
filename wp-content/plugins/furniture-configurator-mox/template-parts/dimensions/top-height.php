<?php
global $furniture_type_top_name, $furniture_type_top_slug, $HEIGHT_SLUG; 

$heading = __("$furniture_type_top_name Height", 'furniture-config');

$type = $furniture_type_top_slug;
$dimension_type = $HEIGHT_SLUG;

$standard = $top_height_standard;
$min = $top_height_min;
$max = $top_height_max;
$constant_name = 'topHeight';

?>

<?php include $template_parts_url .'/dimensions/slider-container.php'; ?>
