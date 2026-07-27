<?php 

$border_css = 'background-image:url("'. $default_frame_texture_img .'")';
$background_css = 'background-image:url("'. $default_base_texture_img .'")';


$full_height_percent = $full_height_standard * 100 / $largest_height_val;
$bottom_height_percent = $bottom_height_standard * 100 / $largest_height_val;
$top_height_percent = $top_height_standard * 100 / $largest_height_val;

$default_display_width_right = $top_height_standard + $top_height_standard / 4;
$default_display_width_right_percent = $default_display_width_right * 100 / $largest_height_val;
$default_display_width_full = $top_height_standard + $top_height_standard / 6;
$default_display_width_full_percent = $default_display_width_full * 100 / $largest_height_val;

$default_display_vertical_space_percent = $vertical_space_standard * 100 / $largest_height_val;

?>

<div class="basic-settings-display-image">
    <div class="display-image-inner">
    </div>
</div>