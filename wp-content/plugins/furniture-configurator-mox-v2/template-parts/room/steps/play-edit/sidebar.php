<?php
global $furniture_config_v2_template_parts_url;
?>

<div class="main-settings-sidebar" data-step="<?php echo $listItem['step']; ?>">
    <div class="main-settings-sidebar-inner">
        <div class="main-tabs">
            <?php 
                $current_button = true;
                $type = 'cabinets';
                $image = '<svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21.023 4.794v-2h-18v20h18v-18Zm-16 0h14v7h-14v-7Zm0 16v-7h14v7h-14Z" fill="currentColor"></path><path d="M14.023 7.794h-4v-1h-2v3h8v-3h-2v1Zm0 8v1h-4v-1h-2v3h8v-3h-2Z" fill="currentColor"></path></svg>';
                $title = __('Cabinets', 'furniture-config');
            ?>
            <?php include $furniture_config_v2_template_parts_url ."/elements/button-with-image.php"; ?>

            <?php 
                $current_button = false;
                $type = 'textures';
                $image = '<svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20.797 14.8a9.023 9.023 0 0 0 .225-2.08c-.037-4.96-4.143-8.973-9.093-8.926A9 9 0 0 0 9.022 21.28a2.241 2.241 0 0 0 3-2.119v-.366a2.24 2.24 0 0 1 2.25-2.25h4.332a2.25 2.25 0 0 0 2.193-1.743v0Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M12.023 9.044a1.125 1.125 0 1 0 0-2.25 1.125 1.125 0 0 0 0 2.25ZM7.804 11.482a1.125 1.125 0 1 0 0-2.25 1.125 1.125 0 0 0 0 2.25ZM7.804 16.357a1.125 1.125 0 1 0 0-2.25 1.125 1.125 0 0 0 0 2.25ZM16.241 11.482a1.125 1.125 0 1 0 0-2.25 1.125 1.125 0 0 0 0 2.25Z" fill="currentColor"></path></svg>';
                $title = __('Colors', 'furniture-config');
            ?>
            <?php include $furniture_config_v2_template_parts_url ."/elements/button-with-image.php"; ?>

            <?php 
                $type = 'dimensions';
                $image = '<svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 5.21v5H9v-5H5v8h4v-1h1v5H9v-3H5v5h7v-2h1v2h6v-2h2v4H3v-18h18v12h-2v-5h-6v5h-1v-6h7v-4h-9Z" fill="currentColor"></path></svg>';
                $title = __('Dimensions', 'furniture-config');
            ?>
            <?php include $furniture_config_v2_template_parts_url ."/elements/button-with-image.php"; ?>
        </div>
        <div class="main-content">
            <div class="content-item current">
                <?php include __DIR__ ."/cabinets/index.php"; ?>
            </div>
        </div>
    </div>
</div>