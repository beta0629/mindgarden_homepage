export function MapFrame({ src, title }: { src: string; title: string }) {
  return <iframe className="map-frame" src={src} title={title} loading="lazy" />;
}
