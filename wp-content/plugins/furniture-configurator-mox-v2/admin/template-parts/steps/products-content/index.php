<?php 
global $admin_furniture_config_v2_template_parts_url;
?>
<section class="cabinet-settings" data-step="<?php echo $listItem['step']; ?>">
    <div class="cabinet-settings-inner">
        <div class="main-container">
            
            <?php include __DIR__ .'/sidebar.php'; ?>

            <div class="cabinets-content">
                <div class="cabinets-content-inner">
                    <?php include __DIR__ .'/tabs.php'; ?>
                    <div class="tabs-content">
                        <div class="tabs-content-inner">
                            <div class="tab-item current" data-room_type="<?php echo $WALL_SINGLE; ?>">
                                <div class="content">
                                    <div class="content-inner">
                                        <?php 
                                            $currentWallType = $WALL_SINGLE;
                                            $productsListData = $singleWallProductsData;
                                        ?>

                                        <?php include __DIR__ .'/play-edit/index.php'; ?>
                                        <?php include __DIR__ .'/summary/index.php'; ?>
                                    </div>
                                    <?php include __DIR__ .'/total-container.php'; ?>
                                </div>
                            </div>
                            <div class="tab-item" data-room_type="<?php echo $WALL_DOUBLE; ?>">
                                <div class="content">
                                    <div class="content-inner">
                                        <?php 
                                            $currentWallType = $WALL_DOUBLE;
                                            $productsListData = $doubleWallProductsData;
                                        ?>

                                        <?php include __DIR__ .'/play-edit/index.php'; ?>
                                        <?php include __DIR__ .'/summary/index.php'; ?>
                                    </div>
                                    <?php include __DIR__ .'/total-container.php'; ?>
                                </div>
                            </div>
                        </div>
                        <div class="edit-container"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="config-loader-container">
        <span class="loader"></span>
    </div>
</section>