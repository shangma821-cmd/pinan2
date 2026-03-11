# Preset Courses

This folder stores fixed preset courses bundled with the app.

## Folder Layout

```text
public/
  preset-courses/
    index.json
    _template/
      course.json
    <course-id>/
      course.json
      cover.jpg
      audio/
        001.txt
      slides/
        001.jpg
        002.jpg
```

## `index.json` Format

```json
{
  "courses": [
    {
      "id": "nutrition-basics",
      "title": "Nutrition Basics",
      "description": "Sample preset course",
      "slideCount": 15,
      "coverImage": "/preset-courses/nutrition-basics/cover.jpg",
      "updatedAt": "2026-02-19",
      "dataFile": "/preset-courses/nutrition-basics/course.json"
    }
  ]
}
```

## `course.json` Format

```json
{
  "id": "nutrition-basics",
  "title": "Nutrition Basics",
  "description": "Sample preset course",
  "sourcePdf": "nutrition-basics.pdf",
  "updatedAt": "2026-02-19",
  "slides": [
    {
      "id": 1,
      "image": "slides/001.jpg",
      "script": "Slide script text",
      "audioFile": "audio/001.txt",
      "audioData": "BASE64_PCM_16K_OR_24K"
    }
  ]
}
```

Notes:
- `image` can be relative path (recommended) or data URL.
- `audioFile` is recommended for large preset bundles.
- `audioData` is optional inline content.
- If both are empty, app can generate audio at playback time.
