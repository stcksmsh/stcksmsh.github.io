// Embed URL convention (documented here since the schema field is just a
// free-form string):
//  - soundcloud: embedId is the track path after soundcloud.com/, e.g.
//    "artist-name/track-slug"
//  - bandcamp: embedId is the "album=<id>" or "track=<id>" fragment from
//    Bandcamp's own Share/Embed → Code panel
export function musicEmbedSrc(track: { source: "soundcloud" | "bandcamp"; embedId: string }) {
  if (track.source === "soundcloud") {
    const url = encodeURIComponent(`https://soundcloud.com/${track.embedId}`);
    return `https://w.soundcloud.com/player/?url=${url}&auto_play=false&hide_related=true&show_comments=false&show_reposts=false&show_teaser=false&visual=false`;
  }
  return `https://bandcamp.com/EmbeddedPlayer/${track.embedId}/size=large/bgcol=141a2e/linkcol=fa8231/tracklist=false/artwork=small/transparent=true/`;
}
