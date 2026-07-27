<?php
global $FURNITURE_TYPE_BASE;
?>

<div class="cabinet-item my-cabinet-item" 
    data-custom_id="<?php echo $customId; ?>"
>
    <div class="my-cabinet-item-inner">
        <div class="main-container">
            <h3><?php echo $productTitle; ?><?php echo getBrantTitleSuffrix($hasBrandTexture);?></h3>
            <div class="dimensions-info">
                <?php echo sprintf(
                     __('H: <span class="height-value">%s</span>(mm), D: <span class="depth-value">%s</span>(mm), W: <span class="width-value">%s</span>(mm)', 'furniture-config'), 
                    $itemHeight, $itemDepth, $itemWidth
                ); ?>
            </div>
        </div>
        <div class="item-actions-container">
            <button type="button" data-action_type="duplicate">
                <svg width="12" height="15" viewBox="0 0 12 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.023.043H2.647a.125.125 0 0 0-.125.125v.875c0 .07.057.125.125.125h7.75v10.75c0 .07.057.126.126.126h.875a.125.125 0 0 0 .125-.126V.543a.5.5 0 0 0-.5-.5Zm-2 2h-8a.5.5 0 0 0-.5.5v8.293a.5.5 0 0 0 .146.353l2.708 2.708a.515.515 0 0 0 .116.085v.03h.065c.055.02.113.031.172.031h5.292a.5.5 0 0 0 .5-.5v-11a.5.5 0 0 0-.5-.5ZM3.49 12.422l-1.345-1.347H3.49v1.347Zm4.906.496H4.491V10.7a.625.625 0 0 0-.625-.625H1.647V3.168h6.75v9.75Z" fill="currentColor"></path></svg>
            </button>
            <button type="button" data-action_type="edit">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.049 10.793a.63.63 0 0 0 .094-.007l2.628-.461a.153.153 0 0 0 .083-.044l6.623-6.623a.157.157 0 0 0 .034-.17.156.156 0 0 0-.034-.05L9.88.837a.155.155 0 0 0-.11-.045.155.155 0 0 0-.112.046L3.035 7.462a.159.159 0 0 0-.044.083l-.46 2.628a.523.523 0 0 0 .146.466.53.53 0 0 0 .372.155Zm1.053-2.725L9.77 2.403l1.146 1.145-5.668 5.666-1.389.245.244-1.39Zm8.67 4.038h-11.5a.5.5 0 0 0-.5.5v.563c0 .068.057.124.125.124h12.25a.125.125 0 0 0 .126-.124v-.563a.5.5 0 0 0-.5-.5Z" fill="currentColor"></path></svg>
            </button>
            <?php if(
                strpos($furnitureTypeSlug, $FURNITURE_TYPE_BASE) !== false
            ) : ?>
                <button type="button" data-action_type="rotate">
                    <svg fill="#000000" xmlns="http://www.w3.org/2000/svg" 
                        width="15px" height="15px" viewBox="0 0 52 52" enable-background="new 0 0 52 52" xml:space="preserve">
                        <g>
                            <path d="M48.5,2h-3C44.7,2,44,2.7,44,3.5v7c0,0.9-1,1.5-1.6,0.8l0,0C37.7,6.1,31,3.4,23.7,4.1
                                c-2.6,0.2-5.1,1-7.4,2.2c-1.2,0.6-2.4,1.3-3.4,2.1c-0.7,0.5-0.8,1.6-0.2,2.3l2.1,2.1c0.5,0.5,1.3,0.6,1.9,0.2
                                c1.2-0.8,2.5-1.5,3.9-2.1c0.6-0.2,1.3-0.4,2-0.6c6.3-1.2,12.3,1.3,15.7,5.4c1.2,1.4,0.3,2.3-0.7,2.3h-7c-0.8,0-1.6,0.7-1.6,1.5v3
                                c0,0.8,0.8,1.5,1.6,1.5h18.2c0.7,0,1.2-0.6,1.2-1.3V3.5C50,2.7,49.3,2,48.5,2z"/>
                            <path d="M39.4,37.4c-0.6-0.6-1.5-0.6-2.1,0c-1.6,1.6-3.6,2.9-5.8,3.7c-0.6,0.2-1.3,0.4-2,0.6
                                c-6.3,1.2-12.3-1.3-15.7-5.4c-1.2-1.4-0.3-2.3,0.7-2.3h7c0.8,0,1.5-0.7,1.5-1.5v-3c0-0.8-0.7-1.5-1.5-1.5H3.3C2.6,28,2,28.6,2,29.3
                                v19.2C2,49.3,2.7,50,3.5,50h3C7.3,50,8,49.3,8,48.5v-7c0-0.9,1-1.5,1.6-0.8l0,0c4.6,5.2,11.4,7.9,18.7,7.2c2.6-0.2,5.1-1,7.4-2.2
                                c2.2-1.1,4.1-2.5,5.7-4.1c0.6-0.6,0.6-1.6,0-2.1L39.4,37.4z"/>
                        </g>
                    </svg>
                </button>
            <?php endif; ?>
            <button type="button" data-action_type="remove">
                <svg width="13" height="14" viewBox="0 0 13 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.647 1.918h-.125a.125.125 0 0 0 .125-.125v.125h4.75v-.125c0 .07.057.125.125.125h-.125v1.125h1.125v-1.25a1 1 0 0 0-1-1h-5a1 1 0 0 0-1 1v1.25h1.125V1.918Zm7.876 1.125h-11a.5.5 0 0 0-.5.5v.5c0 .07.056.125.124.125h.944l.386 8.172a1 1 0 0 0 .999.954h7.093a.999.999 0 0 0 .999-.954l.386-8.172h.944a.125.125 0 0 0 .125-.125v-.5a.5.5 0 0 0-.5-.5ZM9.449 12.17H2.596l-.378-8h7.61l-.379 8Z" fill="currentColor"></path></svg>
            </button>
        </div>
    </div>

</div>
