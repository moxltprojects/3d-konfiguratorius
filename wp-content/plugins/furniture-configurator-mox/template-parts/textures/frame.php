<?php

global $texture_frame_slug;

$loop = fetch_texture_list($texture_frame_slug);

$heading = __('Frame', 'furniture-config');

$current_texture = $default_frame_texture;

$texture_type = $texture_frame_slug;
?>

<?php include $template_parts_url .'/textures/section.php'; ?>
