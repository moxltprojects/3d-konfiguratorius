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
// $right_height_percent = $bottom_height_percent + $top_height_percent + $default_display_vertical_space_percent;
// var_dump("largest_height_val: ". $largest_height_val);
// var_dump("default_display_vertical_space_percent: ". $default_display_vertical_space_percent);
// var_dump("default_display_vertical_space_px: ". $default_display_vertical_space_px);
// var_dump("bottom_height_percent: ". $bottom_height_percent);
// var_dump("top_height_percent: ". $top_height_percent);
// var_dump("default_display_vertical_space_percent: ". $default_display_vertical_space_percent);
?>

<div class="basic-settings-display-image">
    <div class="display-image-inner" style="height: <?php echo $image_block_height_px; ?>px">

        <div class="full-furniture" style='width: <?php echo $default_display_width_right_percent; ?>%; height: <?php echo $full_height_percent?>%;'>
            <div class="image-data-container">
                <div class="data-container-inner">
                    <span class="data-arrow-top">&#60;</span>
                    <span class="data-arrow-bottom">&#60;</span>
                    <span class="number"><?php echo $full_height_standard; ?></span>
                </div>
            </div>
            <div class="image-container-wrapper">
                <div class="image-container" style='<?php echo $border_css; ?>'>
                        <div class="image-container-inner" style='<?php echo $background_css; ?>;'>
                        <img src="<?php echo $full_height_image; ?>">
                    </div>
                </div>
            </div>
        </div>
        <div class="right-side" style='width: <?php echo $default_display_width_right_percent; ?>%'>

            <div class="top-furniture" style="height: <?php echo $top_height_percent?>%">
                <div class="image-data-container">
                    <div class="data-container-inner">
                        <span class="data-arrow-top">&#60;</span>
                        <span class="data-arrow-bottom">&#60;</span>
                        <span class="number"><?php echo $top_height_standard; ?></span>
                    </div>
                </div>
                <div class="image-container-wrapper">
                    <div class="image-container" style='<?php echo $border_css; ?>'>
                        <div class="image-container-inner" style='<?php echo $background_css; ?>;'>
                            <img src="<?php echo $top_height_image; ?>">
                        </div>
                    </div>
                </div>
            </div>

            <div class="space-container" style="height:<?php echo $default_display_vertical_space_percent; ?>%">
                <div class="image-data-container">
                    <div class="data-container-inner">
                        <span class="data-arrow-top">&#60;</span>
                        <span class="data-arrow-bottom">&#60;</span>
                        <span class="number"><?php echo $vertical_space_standard; ?></span>
                    </div>
                </div>
            </div>

            <div class="bottom-furniture" style="height: <?php echo $bottom_height_percent?>%">
                <div class="image-data-container">
                    <div class="data-container-inner">
                        <span class="data-arrow-top">&#60;</span>
                        <span class="data-arrow-bottom">&#60;</span>
                        <span class="number"><?php echo $vertical_space_standard; ?></span>
                    </div>
                </div>
                <div class="image-container-wrapper">
                    <div class="countertop"></div>
                    <div class="image-container" style='<?php echo $border_css; ?>'>
                        <div class="image-container-inner" style='<?php echo $background_css; ?>;'>
                            <img src="<?php echo $bottom_height_image; ?>">
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</div>