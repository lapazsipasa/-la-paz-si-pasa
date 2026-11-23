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

/** IDs de los términos (los crea si faltan); '' o [] no dan términos. */
function terminos($taxonomia, $nombres)
{
    $ids = [];
    foreach ((array) $nombres as $nombre) {
        if ($nombre === '') {
            continue;
        }
        $t = term_exists($nombre, $taxonomia) ?: wp_insert_term($nombre, $taxonomia);
        // term_exists ignora tildes y mayúsculas: si ya había uno con otra grafía, se corrige el nombre.
        if (!is_wp_error($t) && get_term((int) $t['term_id'], $taxonomia)->name !== $nombre) {
            $t = wp_update_term((int) $t['term_id'], $taxonomia, ['name' => $nombre]);
        }
        if (is_wp_error($t)) {
            aviso("término «$nombre» ($taxonomia): {$t->get_error_message()}", true);
            continue;
        }
        $ids[] = (int) $t['term_id'];
    }
    return $ids;
}

// Catálogo PaisSana: 316 productores con sus taxonomías.
if ($toca('productores')) {
    wp_defer_term_counting(true);
    $lista = json_decode(file_get_contents(__DIR__ . '/productores.json'), true);
    foreach ($lista as $i => $p) {
        $id = upsert('productor', $p['nombre'], [
            'municipio' => $p['municipio'],
            'productos' => implode("\n", $p['productos']),
            'enlace' => $p['enlace'],
        ]);
        if (!$id) {
            continue;
        }
        wp_set_object_terms($id, terminos('departamento', $p['departamento']), 'departamento');
        wp_set_object_terms($id, terminos('categoria_productor', $p['categorias']), 'categoria_productor');
        wp_set_object_terms($id, terminos('tiempo_operacion', $p['tiempo']), 'tiempo_operacion');
        wp_set_object_terms($id, terminos('etnia', $p['etnia']), 'etnia');
        wp_set_object_terms($id, terminos('poblacion', $p['poblaciones']), 'poblacion');
        // Lo escribe el mu-plugin lapaz-catalogo: genera el texto de búsqueda.
        if (function_exists('lapaz_catalogo_indexar')) {
            lapaz_catalogo_indexar($id);
        }
        if (($i + 1) % 50 === 0) {
            aviso('productores: ' . ($i + 1) . '/' . count($lista));
        }
    }
    wp_defer_term_counting(false);
}

/**
 * Cambia cada {archivo, alt, pie, credito} del JSON por el ID del adjunto, a
 * cualquier profundidad (filas de secciones, repetidores, galería).
 * El alt va en el meta del adjunto; el pie en la leyenda y el crédito en la descripción.
 */
function adjuntos($valor)
{
    if (!is_array($valor)) {
        return $valor;
    }
    if (isset($valor['archivo'])) {
        $id = medio($valor['archivo']);
        if ($id) {
            if (($valor['alt'] ?? '') !== '') {
                update_post_meta($id, '_wp_attachment_image_alt', $valor['alt']);
            }
            if (isset($valor['pie']) || isset($valor['credito'])) {
                wp_update_post(['ID' => $id, 'post_excerpt' => $valor['pie'] ?? '', 'post_content' => $valor['credito'] ?? '']);
            }
        }
        return $id;
    }
    return array_map('adjuntos', $valor);
}

/** Carga un JSON de una sola entrada: el título es la clave, el resto son campos. */
function entrada_json($post_type, $archivo)
{
    $campos = json_decode(file_get_contents(__DIR__ . '/' . $archivo), true);
    $titulo = $campos['titulo'];
    unset($campos['titulo']);
    return upsert($post_type, $titulo, adjuntos($campos));
}

if ($toca('boletines')) {
    entrada_json('boletin', 'boletin-02.json');
}

if ($toca('historias')) {
    entrada_json('historia', 'historia-asocafe.json');
}

aviso('listo: ' .($solo ?: 'contenido completo'));
