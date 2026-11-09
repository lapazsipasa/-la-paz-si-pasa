<?php
/**
 * Datos de videos (CPT `video`): Actualidad en la portada y, más adelante, Productores PaisSana.
 * Port de apps/frontend/src/adapters/youtube.js y del mapper mapVideo.ts.
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

/**
 * ID de YouTube de una URL (youtu.be, youtube.com/watch, /embed/, /shorts/, /live/,
 * m., music. y youtube-nocookie). '' si no es un video de YouTube válido.
 *
 * @param string $url URL del video.
 */
function lapaz_youtube_id( string $url ): string {
	$partes = wp_parse_url( trim( $url ) );
	if ( ! is_array( $partes ) || empty( $partes['host'] ) ) {
		return '';
	}
	$host  = strtolower( $partes['host'] );
	$path  = array_values( array_filter( explode( '/', $partes['path'] ?? '' ) ) );
	$hosts = array( 'youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com' );
	$id    = '';

	if ( 'youtu.be' === $host ) {
		$id = $path[0] ?? '';
	} elseif ( in_array( $host, $hosts, true ) ) {
		if ( '/watch' === ( $partes['path'] ?? '' ) ) {
			parse_str( $partes['query'] ?? '', $query );
			$id = is_string( $query['v'] ?? null ) ? $query['v'] : '';
		} elseif ( in_array( $path[0] ?? '', array( 'embed', 'shorts', 'live' ), true ) ) {
			$id = $path[1] ?? '';
		}
	}

	return 1 === preg_match( '/^[\w-]{11}$/', $id ) ? $id : '';
}

/**
 * Fuente reproducible de un video, como videoSource(): YouTube primero, luego el MP4 subido.
 *
 * @param string $youtube_url URL de YouTube del campo SCF.
 * @param string $file_url    URL del MP4 del campo SCF.
 * @return array{fuente: string, estado: string, video_url: string, thumbnail_url: string}
 */
function lapaz_video_source( string $youtube_url, string $file_url ): array {
	$id = lapaz_youtube_id( $youtube_url );
	if ( '' !== $id ) {
		return array(
			'fuente'        => 'youtube',
			'estado'        => 'disponible',
			'video_url'     => "https://www.youtube-nocookie.com/embed/{$id}",
			'thumbnail_url' => "https://i.ytimg.com/vi/{$id}/hqdefault.jpg",
		);
	}
	if ( '' !== $file_url ) {
		return array(
			'fuente'        => 'wordpress',
			'estado'        => 'disponible',
			'video_url'     => $file_url,
			'thumbnail_url' => '',
		);
	}

	return array(
		'fuente'        => '' !== $youtube_url ? 'youtube' : 'wordpress',
		'estado'        => 'no-disponible',
		'video_url'     => '',
		'thumbnail_url' => '',
	);
}

/**
 * Videos publicados en el orden de getVideos() (fecha, más reciente primero), como mapVideo.ts.
 * La miniatura del campo SCF manda; si no hay, la de YouTube.
 *
 * @return list<array{id: int, titulo: string, descripcion: string, fuente: string, estado: string, video_url: string, thumbnail_url: string, thumbnail_id: int, tags: list<string>}>
 */
function lapaz_get_videos(): array {
	$posts  = get_posts(
		array(
			'post_type'      => 'video',
			'post_status'    => 'publish',
			'posts_per_page' => 100,
		)
	);
	$videos = array();
	foreach ( $posts as $post ) {
		$archivo      = function_exists( 'get_field' ) ? get_field( 'video_file', $post->ID ) : null;
		$file_url     = is_array( $archivo ) && is_string( $archivo['url'] ?? null ) ? $archivo['url'] : '';
		$source       = lapaz_video_source( lapaz_field_text( 'youtube_url', $post->ID ), $file_url );
		$thumbnail_id = lapaz_field_image_id( 'thumbnail', $post->ID );
		// Si la miniatura se borró de la biblioteca, se cae a la de YouTube.
		$thumbnail_id = $thumbnail_id > 0 && wp_attachment_is_image( $thumbnail_id ) ? $thumbnail_id : 0;
		$tags_raw     = function_exists( 'get_field' ) ? get_field( 'tags', $post->ID ) : array();
		$tags         = array();
		foreach ( is_array( $tags_raw ) ? $tags_raw : array() as $tag ) {
			if ( is_string( $tag ) ) {
				$tags[] = $tag;
			} elseif ( is_array( $tag ) && is_string( $tag['name'] ?? null ) ) {
				$tags[] = $tag['name'];
			}
		}
		$thumbnail_url = $thumbnail_id > 0 ? wp_get_attachment_image_url( $thumbnail_id, '1536x1536' ) : false;

		$videos[] = array(
			'id'            => $post->ID,
			'titulo'        => get_the_title( $post ),
			'descripcion'   => lapaz_field_text( 'descripcion', $post->ID ),
			'fuente'        => $source['fuente'],
			'estado'        => $source['estado'],
			'video_url'     => $source['video_url'],
			'thumbnail_url' => is_string( $thumbnail_url ) ? $thumbnail_url : $source['thumbnail_url'],
			'thumbnail_id'  => $thumbnail_id,
			'tags'          => $tags,
		);
	}

	return $videos;
}

/**
 * <img> de la miniatura de un video: de la biblioteca (con srcset) o la de YouTube (480×360).
 * Devuelve '' si el video no tiene miniatura.
 *
 * @param array{titulo: string, thumbnail_url: string, thumbnail_id: int} $video Video.
 * @param string                                                          $alt   Texto alternativo.
 * @param string                                                          $sizes Atributo sizes.
 * @param string                                                          $extra Atributos extra ya escapados (p. ej. data-campo).
 */
function lapaz_video_thumb( array $video, string $alt, string $sizes, string $extra = '' ): string {
	if ( $video['thumbnail_id'] > 0 ) {
		$html = wp_get_attachment_image(
			$video['thumbnail_id'],
			'1536x1536',
			false,
			array(
				'alt'     => $alt,
				'sizes'   => $sizes,
				'loading' => 'lazy',
			)
		);

		return '' !== $extra ? str_replace( '<img ', '<img ' . $extra . ' ', $html ) : $html;
	}
	if ( '' === $video['thumbnail_url'] ) {
		return '';
	}

	return sprintf(
		'<img %s src="%s" alt="%s" width="480" height="360" loading="lazy" decoding="async" />',
		$extra,
		esc_url( $video['thumbnail_url'] ),
		esc_attr( $alt )
	);
}

/**
 * Videos con el sello PaisSana (lo que la página de Astro pasaba a ProductoresVideos).
 *
 * @return list<array{id: int, titulo: string, descripcion: string, fuente: string, estado: string, video_url: string, thumbnail_url: string, thumbnail_id: int, tags: list<string>}>
 */
function lapaz_get_videos_paisana(): array {
	return array_values(
		array_filter(
			lapaz_get_videos(),
			static fn( array $video ): bool => in_array( 'PaisSana', $video['tags'], true )
		)
	);
}

/**
 * URL del reproductor (playerUrl de PaisSanaProductoresVideos.astro): en YouTube agrega
 * playsinline, rel=0, la API de JS y el origin del sitio, que Plyr necesita.
 *
 * @param array{fuente: string, video_url: string} $video Video.
 */
function lapaz_player_url( array $video ): string {
	if ( 'youtube' !== $video['fuente'] ) {
		return $video['video_url'];
	}
	$partes = wp_parse_url( home_url() );
	$origin = is_array( $partes ) ? ( $partes['scheme'] ?? 'https' ) . '://' . ( $partes['host'] ?? '' ) . ( isset( $partes['port'] ) ? ':' . $partes['port'] : '' ) : '';

	return add_query_arg(
		array(
			'playsinline' => '1',
			'rel'         => '0',
			'enablejsapi' => '1',
			'origin'      => rawurlencode( $origin ),
		),
		$video['video_url']
	);
}

/**
 * Marca que la página muestra miniaturas de YouTube (la llaman los render.php de los bloques
 * con video, que en temas de bloques corren antes de wp_head). Sin argumento, solo consulta.
 *
 * @param bool $usar Si la página las usa.
 */
function lapaz_usa_ytimg( bool $usar = false ): bool {
	/**
	 * Si alguna parte de la página muestra miniaturas de YouTube.
	 *
	 * @var bool $usa
	 */
	static $usa = false;
	if ( $usar ) {
		$usa = true;
	}

	return $usa;
}

/**
 * Agrega preconnect a i.ytimg.com en páginas con miniaturas de YouTube (Lighthouse: ~340 ms).
 *
 * @param array<int, mixed> $urls          URLs de la pista.
 * @param string            $relation_type Tipo de pista.
 * @return array<int, mixed>
 */
function lapaz_preconnect_ytimg( array $urls, string $relation_type ): array {
	if ( 'preconnect' === $relation_type && lapaz_usa_ytimg() ) {
		$urls[] = 'https://i.ytimg.com';
	}

	return $urls;
}
add_filter( 'wp_resource_hints', 'lapaz_preconnect_ytimg', 10, 2 );
