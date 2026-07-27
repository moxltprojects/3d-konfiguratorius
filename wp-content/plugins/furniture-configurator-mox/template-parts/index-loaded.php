<?php 

global $steps_content_data, $template_parts_url;

?>

<div 
    class="config-furniture-main-content" 
    data-progress="<?php echo $init_progress_step; ?>"
    data-imgfilename="<?php echo $image_file_name; ?>"
>
    <div class="config-furniture-main-content-inner">
        <?php include $template_parts_url .'/steps/header.php'; ?>

        <div class="progress-content">
            <div class="progress-content-inner">

                <?php include $template_parts_url .'/display/3d-model.php'; ?>

                <?php foreach($steps_content_data as $index => $data) : ?>
                    <?php 
                        $type = $data['type'];

                        $template = $template_parts_url ."/steps/$type.php";

                        if ( ! empty( $template ) ) {
                            require_once $template; 
                        } 
                    ?>

                <?php endforeach; ?>
            </div> 
        </div>

        <?php include $template_parts_url .'/steps/footer.php'; ?>

    </div>
</div>