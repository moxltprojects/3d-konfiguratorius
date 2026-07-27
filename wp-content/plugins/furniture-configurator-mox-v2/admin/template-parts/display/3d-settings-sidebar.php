<?php 
global $furniture_config_v2_template_parts_url;

?>

<div class="model-settings-sidebar">
    <div class="model-settings-sidebar-inner">
        <?php 
            $type = 'show-dimensions';
            $image = '<svg width="22" height="19" viewBox="0 0 22 19" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.062.206H.455A.215.215 0 0 0 .24.42V17.99c0 .118.097.215.215.215h1.607a.215.215 0 0 0 .214-.215V.42a.215.215 0 0 0-.214-.214Zm19.392 0h-1.607a.215.215 0 0 0-.214.214V17.99c0 .118.097.215.214.215h1.607a.215.215 0 0 0 .215-.215V.42a.215.215 0 0 0-.215-.214Zm-3.179 8.793-3.418-2.697a.194.194 0 0 0-.313.153V8.24H7.365V6.56a.194.194 0 0 0-.313-.153l-3.418 2.7a.191.191 0 0 0 0 .303l3.415 2.7c.126.1.314.01.314-.152V10.17h7.178v1.682c0 .16.188.252.313.153l3.416-2.7a.194.194 0 0 0 .005-.306Z" fill="currentColor"></path></svg>';
            $title = __('Dimensions', 'furniture-config');
        ?>
        <?php include $furniture_config_v2_template_parts_url ."/elements/button-with-image.php"; ?>
        
        <?php 
            $type = 'reset-view';
            $image = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.028 9.436h-1.574l-.375-.997a.355.355 0 0 0-.136-.17.385.385 0 0 0-.213-.063h-3.551a.37.37 0 0 0-.349.233l-.376.997H7.88c-.512 0-.926.394-.926.88v5.01c0 .486.414.88.926.88h8.148c.512 0 .926-.394.926-.88v-5.01c0-.486-.414-.88-.926-.88Zm.093 5.89a.09.09 0 0 1-.093.088H7.88a.09.09 0 0 1-.093-.088v-5.01a.09.09 0 0 1 .093-.089h2.16l.199-.525.265-.705h2.9l.264.705.198.525h2.162c.051 0 .093.04.093.088v5.011Zm-4.167-4.395c-1.023 0-1.852.787-1.852 1.758 0 .972.829 1.758 1.852 1.758 1.023 0 1.852-.786 1.852-1.758 0-.971-.829-1.758-1.852-1.758Zm0 2.813c-.613 0-1.111-.473-1.111-1.055s.498-1.055 1.111-1.055c.614 0 1.111.473 1.111 1.055s-.497 1.055-1.11 1.055Z" fill="currentColor"></path><path d="M2.74 11.997a9.194 9.194 0 0 1 2.695-6.305 9.167 9.167 0 0 1 6.517-2.7 9.147 9.147 0 0 1 6.512 2.7c.264.264.513.546.744.84l-1.613 1.26a.214.214 0 0 0-.022.318c.028.029.063.05.103.059l4.706 1.152a.215.215 0 0 0 .265-.207l.022-4.845a.213.213 0 0 0-.346-.169l-1.51 1.181A11.22 11.22 0 0 0 11.948.956C5.812.956.819 5.873.704 11.986a.214.214 0 0 0 .214.22h1.608a.214.214 0 0 0 .214-.21Zm20.25.209h-1.607a.214.214 0 0 0-.214.209 9.151 9.151 0 0 1-.721 3.375 9.167 9.167 0 0 1-1.974 2.93 9.173 9.173 0 0 1-6.517 2.7 9.168 9.168 0 0 1-6.514-2.7 9.241 9.241 0 0 1-.745-.841l1.612-1.26a.215.215 0 0 0-.08-.377L1.524 15.09a.215.215 0 0 0-.265.207l-.02 4.848c0 .18.207.281.346.169l1.511-1.182a11.225 11.225 0 0 0 8.864 4.324c6.139 0 11.129-4.921 11.244-11.03a.213.213 0 0 0-.214-.22Z" fill="currentColor"></path></svg>';
            $title = __('Reset view', 'furniture-config');
        ?>
        <?php include $furniture_config_v2_template_parts_url ."/elements/button-with-image.php"; ?>

        <div class="zoom-settings">
            <?php 
                $type = 'zoom-in';
                $image = '<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.472 9.306v.7H13.566v.466H10.472v3.487h-.466v-3.487H6.912v-.466H10.006V6.519h.466v2.787Zm6.444 6.382-.402.49.449.449 3.224 3.225-.335.336-3.225-3.225-.449-.449-.49.402c-3.38 2.772-8.39 2.58-11.559-.591-3.362-3.36-3.364-8.82 0-12.196 3.376-3.364 8.835-3.362 12.195 0 3.171 3.169 3.364 8.18.592 11.559Zm-.903.325a8.167 8.167 0 0 0 0-11.548 8.167 8.167 0 0 0-11.548 0 8.167 8.167 0 0 0 0 11.548 8.167 8.167 0 0 0 11.548 0Z" fill="currentColor" stroke="currentColor" stroke-width="1.4"></path></svg>';
                $title = __('Zoom in', 'furniture-config');
            ?>
            <?php include $furniture_config_v2_template_parts_url ."/elements/button-with-image.php"; ?>

            <div class="zoom-slider">
                <input 
                    type="range" 
                    id="zoom-slider"
                    name="zoom-slider"
                    value="<?php echo $model_default_zoom; ?>"  
                    min="<?php echo $model_zoom_min; ?>" 
                    max="<?php echo $model_zoom_min; ?>"
                />
            </div>

            <?php 
                $type = 'zoom-out';
                $image = '<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="m16.916 15.687-.402.49.449.45 3.224 3.224-.335.336-3.225-3.225-.449-.448-.49.402c-3.38 2.771-8.39 2.58-11.559-.592-3.362-3.36-3.364-8.82 0-12.195 3.376-3.364 8.835-3.363 12.195 0 3.171 3.168 3.364 8.179.592 11.558Zm-.903.326a8.167 8.167 0 0 0 0-11.548 8.167 8.167 0 0 0-11.548 0 8.167 8.167 0 0 0 0 11.547 8.167 8.167 0 0 0 11.548 0ZM6.912 10.47v-.466h6.654v.466H6.912Z" fill="currentColor" stroke="currentColor" stroke-width="1.4"></path></svg>';
                $title = __('Zoom out', 'furniture-config');
            ?>
            <?php include $furniture_config_v2_template_parts_url ."/elements/button-with-image.php"; ?>
        </div>
    </div>
</div>