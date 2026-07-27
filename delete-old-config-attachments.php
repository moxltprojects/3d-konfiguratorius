<?php 

$prefix = 'wp_';

$msqli = connectToDb($prefix);
deleteOldTempConfiguratorImages($msqli);
// $oldConfigs = getOldConfigs($mysqli, $prefix);
// $oldConfigProducts = getOldConfigProducts($oldConfigs, $mysqli, $prefix);

function connectToDb($prefix) 
{
    $host = 'localhost';
    $dbname = 'furniture-new2';
    $user = 'root';
    $pass = 'mysql'; // Your Joomla DB prefix

    $mysqli = new mysqli($host, $user, $pass, $dbname);
    if ($mysqli->connect_error) {
        die("Connection failed: " . $mysqli->connect_error);
    }

    return $mysqli;
}

// function getOldConfigs($mysqli, $prefix)
// {
//     $configs = [];

//     $stmt = $mysqli->prepare("
//         SELECT *
//         FROM {$prefix}config_user_settings
//         WHERE created_at <= DATE_SUB(NOW(), INTERVAL 1 MONTH)
//     ");

//     if (!$stmt) {
//         return [];
//     }

//     $stmt->execute();

//     $result = $stmt->get_result();

//     while ($row = $result->fetch_assoc()) {
//         $configs[] = $row;
//     }

//     $stmt->close();

//     return $configs;
// }

// function getOldConfigProducts($configs, $mysqli, $prefix)
// {
//     if (empty($configs)) {
//         return [];
//     }

//     $config_ids = array_column($configs, 'id');

//     $placeholders = implode(',', array_fill(0, count($config_ids), '?'));

//     $types = str_repeat('i', count($config_ids));

//     $sql = "
//         SELECT *
//         FROM {$prefix}config_user_setting_products
//         WHERE config_id IN ($placeholders)
//     ";

//     $stmt = $mysqli->prepare($sql);

//     if (!$stmt) {
//         return [];
//     }

//     $stmt->bind_param($types, ...$config_ids);

//     $stmt->execute();

//     $result = $stmt->get_result();

//     $products = [];

//     while ($row = $result->fetch_assoc()) {
//         $products[] = $row;
//     }

//     $stmt->close();

//     return $products;
// }

// function deleteOldTempConfiguratorImages($msqli, $months = 1)
// {
//     $dir = __DIR__ . '/wp-content/uploads/temp-configurator';

//     if (!is_dir($dir)) {
//         return;
//     }

//     $files = glob($dir . '/*');

//     if (!$files) {
//         return;
//     }

//     $threshold = strtotime("-{$months} month");

//     foreach ($files as $file) {

//         if (!is_file($file)) {
//             continue;
//         }

     

//         // File older than threshold
//         if (filemtime($file) < $threshold) {
//             unlink($file);
//         }
//     }
// }

function deleteOldTempConfiguratorImages($mysqli, $months = 1)
{
    global $prefix;

    $dir = __DIR__ . '/wp-content/uploads/temp-configurator';

    if (!is_dir($dir)) {
        return;
    }

    $files = glob($dir . '/*.{jpg,jpeg,png,webp}', GLOB_BRACE);

    if (!$files) {
        return;
    }

    $threshold = strtotime("-{$months} month");

    foreach ($files as $file) {
        if (!is_file($file)) {
            continue;
        }

        if (filemtime($file) >= $threshold) {
            continue;
        }

        $filename = basename($file);
        $relative_url = 'temp-configurator/' . $filename;

        $attachment_id = getAttachmentIdByRelativeUrl($mysqli, $prefix, $relative_url);

        if($attachment_id) {
            cleanupDeletedTempAttachmentRefs($mysqli, $prefix, $attachment_id);
        }

        unlink($file);

        echo "Deleted <br/>";
    }
}

function cleanupDeletedTempAttachmentRefs($mysqli, $prefix, $attachment_id)
{
     $attachment_id = (int) $attachment_id;

    // Update temp_ai_textures JSON
    $stmt = $mysqli->prepare("
        SELECT id, temp_ai_textures
        FROM {$prefix}config_user_settings
        WHERE temp_ai_textures LIKE ?
    ");

    $search = '%"attachment_id":' . $attachment_id . '%';

    if ($stmt) {
        $stmt->bind_param('s', $search);
        $stmt->execute();

        $result = $stmt->get_result();

        while ($row = $result->fetch_assoc()) {
            $textures = json_decode($row['temp_ai_textures'], true);

            if (!is_array($textures)) {
                continue;
            }

            foreach ($textures as $key => $texture) {
                $current_id = $texture['attachment']['attachment_id'] ?? null;

                if ((int) $current_id === $attachment_id) {
                    unset($textures[$key]); // deletes whole object
                }
            }

            $new_json = !empty($textures)
                ? json_encode($textures, JSON_UNESCAPED_SLASHES)
                : null;

            $update = $mysqli->prepare("
                UPDATE {$prefix}config_user_settings
                SET temp_ai_textures = ?
                WHERE id = ?
            ");

            if ($update) {
                $row_id = (int) $row['id'];
                $update->bind_param('si', $new_json, $row_id);
                $update->execute();
                $update->close();
            }
        }

        $stmt->close();
    }

    /**
     * config_user_setting_products
     */
    $stmt = $mysqli->prepare("
        UPDATE {$prefix}config_user_setting_products
        SET
            temp_attachment_id = NULL
        WHERE temp_attachment_id = ?
    ");

    if ($stmt) {
        $stmt->bind_param('i', $attachment_id);
        $stmt->execute();

        $found = $stmt->affected_rows > 0;
        $stmt->close();
    }
}


function getAttachmentIdByRelativeUrl($mysqli, $prefix, $relative_url)
{
    $stmt = $mysqli->prepare("
        SELECT post_id
        FROM {$prefix}postmeta
        WHERE meta_key = '_wp_attached_file'
          AND meta_value = ?
        LIMIT 1
    ");

    if (!$stmt) {
        return null;
    }

    $stmt->bind_param('s', $relative_url);
    $stmt->execute();

    $row = $stmt->get_result()->fetch_assoc();

    $stmt->close();

    return !empty($row['post_id']) ? (int) $row['post_id'] : null;
}