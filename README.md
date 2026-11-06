# menubazar

PROJECT: MENUBAZAR — IMMERSIVE 3D RESTAURANT DISCOVERY WEBSITE

Build a complete, functional, visually polished website called MenuBazar.

The website showcases three restaurants:

Chhotu Dhaba

Hub 360

Dragon Delight

The purpose is to let visitors explore restaurants and view their actual uploaded menus. This is NOT a food ordering website.

1. CORE EXPERIENCE

Create an immersive, cinematic 3D miniature Indian food street.

The opening screen should look like a tiny animated world, almost like a miniature animated movie set.

Include:

Three distinct restaurant buildings arranged along one street.

Clearly visible signboards with the exact restaurant names.

Beautiful Indian street architecture.

Warm evening atmosphere.

Glowing streetlights, restaurant lights and windows.

Road, sidewalks, plants and small decorative details.

Subtle animations such as moving environmental elements and flickering lights.

Attractive cinematic camera positioning.

The 3D street must occupy most of the screen. Do not use a conventional grid of restaurant cards.

2. USER INTERACTION

Visitors should be able to:

Explore the miniature street.

Rotate the view using mouse drag or touch.

Zoom in and out.

Click/tap each restaurant building.

When a restaurant is clicked:

Its exterior lights turn on.

Its signboard glows.

The camera smoothly zooms towards that restaurant.

A beautiful menu-viewing overlay opens.

Display that restaurant's original uploaded menu image.

Allow visitors to zoom into the image for readability.

Provide a clear close button to return to the 3D street.

The interaction must actually work, not just be a visual mockup.

3. ORIGINAL MENU IMAGES

Use the actual menu images uploaded by the project owner.

Create separate menu-image mappings for:

Chhotu Dhaba

Hub 360

Dragon Delight

IMPORTANT:

Never invent menu items, food photographs or prices.

Never generate replacement menus.

Never recreate the menu using HTML text.

Display the original uploaded menu images without changing their contents.

If an image is missing, show a clear placeholder explaining where to add it.

Organize the images in:
public/menus/chhotu-dhaba/
public/menus/hub-360/
public/menus/dragon-delight/

Support multiple menu images per restaurant, with previous/next navigation if multiple images exist.

4. VISUAL DESIGN

Style: cinematic 3D miniature world + storytelling.

Visual direction:

Warm golden-hour/evening lighting.

Rich but tasteful colors.

Detailed miniature buildings.

Soft shadows and ambient lighting.

Smooth camera transitions.

Elegant typography.

Subtle UI animations.

Premium, polished visual appearance.

Avoid:

Ordinary restaurant cards.

Generic SaaS dashboard layouts.

Excessive text.

Unnecessary sections.

Shopping cart and ordering buttons.

5. TECHNOLOGY

Use:

React

TypeScript

Vite

Three.js / React Three Fiber

Drei where useful

CSS for interface and transitions.

Use lightweight 3D assets and optimize performance for ordinary laptops and mobile devices.

If a complex 3D scene is too demanding, create a beautiful lightweight miniature scene rather than replacing it with restaurant cards.

6. WEBSITE STRUCTURE

Opening screen:

MenuBazar logo/title.

Small subtitle: "A little street. A lot of flavours."

Enter/Explore button.

3D miniature street.

Main experience:

Interactive 3D street.

Three clickable restaurant buildings.

Restaurant-specific light and camera animations.

Original menu image overlay.

Return-to-street button.

7. FUNCTIONAL REQUIREMENTS

Every restaurant must be clickable.

Each restaurant must open its own correct menu.

Menu images must be zoomable.

Closing the menu must return visitors to the 3D scene.

All controls must work on desktop and mobile.

Add loading and error states.

Ensure no broken links or nonfunctional buttons.

Add a simple responsive fallback if WebGL is unavailable.

No authentication.

No backend.

No database.

No ordering or payments.

8. FINAL REQUIREMENT

Build the complete website, not just a landing-page design or prototype.

Prioritize a working end-to-end experience:
Open website → Enter street → Explore → Tap restaurant → Lights turn on → Camera zooms in → Actual menu image appears → Zoom/read menu → Close → Return to street.

Do not stop after creating the first screen. Implement the entire experience.
for menu of chhotu dhaba attach 1st attached image ,for hub 360 2nd attached image , for  dragon delight 3rd  attached image

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/35bb1aa8-0880-4382-aff1-cafed6d8368e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
