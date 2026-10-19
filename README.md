# Northmark 360 Splat Map

[Open the viewer](https://kmoserjacobs.github.io/northmark-360-splat-map/)

Explore Northmark's September 24, 2026 generator-yard and interior recordings.
088 has a clickable recording path inside its streamed Gaussian splat. Clicking
the line seeks the 360 video; its current-position marker follows playback.
082 omits the unreliable indoor GPS path.

The viewer starts with Fast 2K video. Choose **Original 8K** to stream the original
7680 × 3840, approximately 30 fps HEVC recording from Alluvial storage. Both quality
levels retain 360 look controls, fullscreen playback, and synchronized seeking.
Switching quality preserves video time, look direction, and play/pause state.
8K playback requires a compatible browser/device; unsupported playback falls back
to the fast preview, and the original file remains available through its link.

## Alignment

**Align** opens the editing box. Drag inside to move, corners to resize, or the
round handle to rotate. **Lock proportions** preserves the current aspect ratio;
unlock it for independent width/depth scaling. Close the tool to hide/deactivate
the box and restore orbit and click-to-seek. Adjustments save in the browser.

The defaults are the user's checked settings: Across −25.4175, Along 27.9274,
Scale 0.78, Heading 171°, Height 1.2. Reset restores these values. The line remains
an estimated registration of outdoor GPS, not recovered reconstruction poses.

## Hosting and maintenance

GitHub Pages hosts only the viewer, configuration, libraries and small posters.
The four video files live in Alluvial storage under
`HTML/experiments/360-splat-maps/northmark/media`.
The Gaussian model streams from the existing public SuperSplat scenes.
No full PLY, INSV, or MP4 is committed to this repository.

Video URLs in `recordings.json` are intentionally public **read-only, single-file**
SAS links. They expire on **January 17, 2027** and must be replaced before then.
The directory upload credential is not included. Replace the matching
`video_sources[].url`, its `expires_at`, and the legacy `video` preview URL when
renewing links. Update the footer expiry date as well.

Serve this directory with any static HTTP server for local development.
GitHub Pages publishes the `main` branch root; `.nojekyll` disables Jekyll.

Third-party license notices are in `vendor/THIRD_PARTY_LICENSES.txt`.
