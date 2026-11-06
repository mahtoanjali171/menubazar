// Menu images live in public/menus/<slug>/. Add or reorder files here to change what visitors see.
export type Restaurant = {
  slug: "chhotu-dhaba" | "hub-360" | "dragon-delight";
  name: string;
  tagline: string;
  x: number; // position along the 3D street
  menus: string[];
};

export const RESTAURANTS: Restaurant[] = [
  {
    slug: "chhotu-dhaba",
    name: "Chhotu Dhaba",
    tagline: "Roadside favourites",
    x: -7.5,
    menus: ["/menus/chhotu-dhaba/menu-1.jpg"],
  },
  {
    slug: "hub-360",
    name: "Hub 360",
    tagline: "Cafe & hangout",
    x: 0,
    menus: ["/menus/hub-360/menu-1.jpg"],
  },
  {
    slug: "dragon-delight",
    name: "Dragon Delight",
    tagline: "Cafe & restaurant",
    x: 7.5,
    menus: ["/menus/dragon-delight/menu-1.jpg", "/menus/dragon-delight/menu-2.jpg"],
  },
];
