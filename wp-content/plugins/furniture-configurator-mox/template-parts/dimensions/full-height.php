<?php
global $furniture_type_full_name, $furniture_type_full_slug, $HEIGHT_SLUG; 

$heading = __("$furniture_type_full_name Height", 'furniture-config');
$type = $furniture_type_full_slug;
$dimension_type = $HEIGHT_SLUG;

$standard = $full_height_standard;
$min = $full_height_min;
$max = $full_height_max;
$constant_name = 'fullHeight';

?>

<?php include $template_parts_url .'/dimensions/slider-container.php'; ?>
