#!/usr/bin/env python3
"""
Generate gallery.json from photos in the photos/ folder.
Usage: python generate_gallery.py
Place photos in subdirectories by category:
    photos/portraits/
    photos/landscapes/
    photos/street/
Each subdirectory name becomes a category slug.
"""

import os
import json
from pathlib import Path

VALID_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"}
PHOTOS_DIR = Path("photos")
DATA_DIR = Path("data")
OUTPUT_FILE = DATA_DIR / "gallery.json"

# Category display names (slug -> display name)
CATEGORY_NAMES = {
    "portraits": "人像",
    "landscapes": "风景",
    "street": "街拍",
    "travel": "旅行",
    "nature": "自然",
    "abstract": "抽象",
    "architecture": "建筑",
    "food": "美食",
    "animals": "动物",
    "events": "活动",
}


def slug_to_name(slug: str) -> str:
    return CATEGORY_NAMES.get(slug, slug.replace("-", " ").title())


def scan_photos():
    categories = []
    photos = []

    if not PHOTOS_DIR.exists():
        print(f"[!] '{PHOTOS_DIR}/' folder not found. Creating...")
        PHOTOS_DIR.mkdir(exist_ok=True)
        OUTPUT_FILE.parent.mkdir(exist_ok=True)
        OUTPUT_FILE.write_text(json.dumps({"categories": [], "photos": []}, ensure_ascii=False, indent=2))
        print("[+] Created empty gallery.json")
        return

    for category_dir in sorted(PHOTOS_DIR.iterdir()):
        if not category_dir.is_dir() or category_dir.name.startswith("."):
            continue

        slug = category_dir.name.lower()
        name = slug_to_name(slug)

        # Check if this category already exists
        existing = next((c for c in categories if c["slug"] == slug), None)
        if not existing:
            categories.append({"slug": slug, "name": name})

        # Scan photos in this category
        for photo_file in sorted(category_dir.iterdir()):
            if photo_file.suffix.lower() not in VALID_EXTENSIONS:
                continue

            rel_path = f"photos/{category_dir.name}/{photo_file.name}"
            photos.append({
                "src": rel_path,
                "category": slug,
                "title": photo_file.stem.replace("-", " ").replace("_", " ").title(),
                "filename": photo_file.name,
            })

    # Sort: by filename order (default), but first by category
    photos.sort(key=lambda p: (p["category"], p["filename"]))

    return categories, photos


def main():
    print("📸 Scanning photos...")
    categories, photos = scan_photos()

    DATA_DIR.mkdir(exist_ok=True)
    gallery = {
        "categories": categories,
        "photos": photos,
    }

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(gallery, f, ensure_ascii=False, indent=2)

    print(f"\n✅ Done: {len(photos)} photos in {len(categories)} categories")
    for cat in categories:
        count = sum(1 for p in photos if p["category"] == cat["slug"])
        print(f"   📁 {cat['name']} ({cat['slug']}): {count} photos")
    print(f"\n📄 Output: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
