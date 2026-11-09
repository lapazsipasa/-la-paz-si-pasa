<?php
/**
 * Carga el contenido de contenido.json en los CPT del micrositio.
 *
 * Esta carpeta se monta en /opt/seed (fuera del webroot: contiene PHP y no debe
 * ser accesible por HTTP). Corre de dos formas.
 *
 * Con wp-cli, en local:
 *   docker compose run --rm --user 33 wpcli wp eval-file /opt/seed/seed.php
 *   (el --user 33 no es opcional: la imagen wpcli es Alpine y ahí www-data es
 *   uid 82, pero la de WordPress es Debian y usa uid 33, dueño de uploads)
 *
 * Con PHP a secas, dentro del contenedor de WordPress, sin instalar nada:
 *   su -s /bin/sh www-data -c 'php /opt/seed/seed.php'
 *
 * Es idempotente: busca cada entrada por título y post_type, y la actualiza en
 * vez de duplicarla. Los medios se reconocen por nombre de archivo, así que si
 * ya los subiste por wp-admin no se duplican.
 */

// Arranca WordPress si nos invocaron con php a secas; con wp-cli ya está cargado.
if (!defined('ABSPATH')) {
    require_once '/var/www/html/wp-load.php';
}

/** Escribe por wp-cli si está, y si no por salida estándar. */
function aviso($texto, $error = false)
{
    if (class_exists('WP_CLI')) {
        $error ? WP_CLI::warning($texto) : WP_CLI::log($texto);
        return;
    }
    echo ($error ? '!! ' : '   ') . $texto . "\n";
}

$datos = json_decode(file_get_contents(__DIR__ . '/contenido.json'), true);
if (!$datos) {
    aviso('No se pudo leer contenido.json', true);
    exit(1);
}

require_once ABSPATH . 'wp-admin/includes/image.php';

/** Sube el archivo a la biblioteca de medios, o devuelve el que ya esté. */
function medio($ruta_relativa)
{
    // __DIR__ y no una variable de nivel de archivo: wp-cli incluye este script
    // dentro de una función, así que $base de arriba no es global.
    $ruta = __DIR__ . '/media/' . $ruta_relativa;
    if (!file_exists($ruta)) {
        aviso("falta el archivo: $ruta_relativa", true);
        return 0;
    }
    $nombre = basename($ruta);
    $previos = get_posts([
        'post_type' => 'attachment',
        'name' => sanitize_title(pathinfo($nombre, PATHINFO_FILENAME)),
        'posts_per_page' => 1,
        'post_status' => 'inherit',
    ]);
    if ($previos) {
        return $previos[0]->ID;
    }

    $subida = wp_upload_bits($nombre, null, file_get_contents($ruta));
    if (!empty($subida['error'])) {
        aviso("no se pudo subir $nombre: {$subida['error']}", true);
        return 0;
    }
    $id = wp_insert_attachment([
        'post_mime_type' => $subida['type'],
        'post_title' => pathinfo($nombre, PATHINFO_FILENAME),
        'post_status' => 'inherit',
    ], $subida['file']);
    wp_update_attachment_metadata($id, wp_generate_attachment_metadata($id, $subida['file']));
    return $id;
}

/** Crea o actualiza un post del CPT y le escribe los campos SCF. */
function upsert($post_type, $titulo, $campos)
{
    $previos = get_posts([
        'post_type' => $post_type,
        'title' => $titulo,
        'posts_per_page' => 1,
        'post_status' => 'any',
    ]);
    $id = $previos
        ? $previos[0]->ID
        : wp_insert_post([
            'post_type' => $post_type,
            'post_title' => $titulo,
            'post_status' => 'publish',
        ], true);

    if (is_wp_error($id)) {
        aviso("$post_type «$titulo»: {$id->get_error_message()}", true);
        return;
    }
    foreach ($campos as $nombre => $valor) {
        update_field($nombre, $valor, $id);
    }
    aviso(sprintf('%-13s %s  #%d %s', $post_type, $previos ? 'actualizado' : 'creado     ', $id, $titulo));
    return $id;
}

// Un argumento opcional limita la carga a una seccion. Sirve cuando el entorno
// corta la ejecucion por tiempo: cada pasada avanza sobre lo que falta.
$solo = $argv[1] ?? getenv('SEED_SOLO') ?: '';
$toca = fn($seccion) => $solo === '' || $solo === $seccion;

if ($toca('retratos')) foreach ($datos['retratos'] as $r) {
    upsert('retrato', $r['titulo'], [
        'foto' => medio($r['archivo']),
        'descripcion' => $r['descripcion'],
        'proyecto' => $r['proyecto'],
        'lugar' => $r['lugar'],
    ]);
}

if ($toca('videos')) foreach ($datos['videos'] as $v) {
    upsert('video', $v['titulo'], [
        'descripcion' => $v['descripcion'],
        'fuente_video' => 'youtube',
        'youtube_url' => $v['youtube_url'],
        'tags' => $v['tags'],
    ]);
}

if ($toca('ferias')) foreach ($datos['ferias'] as $f) {
    // Los ids en 0 son archivos que no se encontraron: medio() ya avisó de cada uno.
    $galeria = array_values(array_filter(array_map(
        fn($archivo) => medio("ferias/$archivo"),
        $f['galeria'] ?? []
    )));
    // Repetidor: una fila por video. Tres ferias no tienen ninguno y quedan vacías.
    $videos = array_map(
        fn($url) => ['fuente_video' => 'youtube', 'video_youtube' => $url],
        $f['videos'] ?? []
    );

    upsert('feria', $f['titulo'], [
        'descripcion' => $f['descripcion'],
        'galeria' => $galeria,
        'videos' => $videos,
        'orden' => $f['orden'],
        'abierta_por_defecto' => !empty($f['abierta_por_defecto']),
    ]);
}

// Subcuentas: el adapter las ordena por menu_order, que no es un campo SCF.
if ($toca('subcuentas')) foreach ($datos['subcuentas'] ?? [] as $s) {
    $id = upsert('subcuenta', $s['nombre'], ['icono' => medio($s['archivo'])]);
    if ($id) {
        wp_update_post(['ID' => $id, 'menu_order' => $s['orden']]);
    }
}

if ($toca('audio_relatos')) foreach ($datos['audio_relatos'] as $a) {
    upsert('audio_relato', $a['productor'] . ' — ' . $a['marca'], [
        'productor' => $a['productor'],
        'marca' => $a['marca'],
        'lugar' => $a['lugar'],
        'audio' => medio($a['archivo']),
        // subtitulos queda vacío: la transcripción no está en el Excel
        'orden' => $a['orden'],
    ]);
}

aviso('listo: ' . ($solo ?: 'contenido completo'));
