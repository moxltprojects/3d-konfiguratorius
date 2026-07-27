<?php 
global $furniture_config_v2_template_parts_url;
// $defaultTexturesCategories = get_default_config_settings_texture_ids($textureCategories);

// $galleries = get_field('galleries', $defaultFrontTextureId);
// $all_gallery = $galleries['all'];
// $image1 = $all_gallery ? $all_gallery['image_1'] : null;
// $image2 = $all_gallery ? $all_gallery['image_2'] : null;
// $image3 = $all_gallery ? $all_gallery['image_3'] : null;

?>

<div class="settings-container settings-gallery-container">
    <div class="settings-gallery-container-inner">
        <div class="gallery-wrapper">
            <div class="swiper settings-gallery">
                <div class="swiper-wrapper">
                    <?php 
                        $imageSlug = 'image_1';
                    ?>
                    <div class="swiper-slide image-1">
                        <?php include __DIR__  .'/texture-image.php';?>
                    </div>
                    <?php 
                        $imageSlug = 'image_2';
                    ?>
                    <div class="swiper-slide image-2">
                        <?php include __DIR__  .'/texture-image.php';?>
                    </div>
                    <?php 
                        $imageSlug = 'image_3';
                    ?>
                    <div class="swiper-slide image-3">
                        <?php include __DIR__  .'/texture-image.php';?>
                    </div>
                </div>
            </div>
            <div class="swiper-pagination"></div>
            <div class="swiper-button swiper-button-prev"></div>
            <div class="swiper-button swiper-button-next"></div>
        </div>
        <?php include $furniture_config_v2_template_parts_url .'/elements/settings/textures/index.php'; ?>
    </div>
</div>