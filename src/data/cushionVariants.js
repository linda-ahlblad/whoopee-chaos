// src/data/cushionVariants.js
// This file contains the different types of cushions

export const cushionVariants = [
  {
    id: 0,
    name: "The Thundercloud",
    description: "A rumbling storm of divine flatulence",
    color: "#4a6da7",
    scoreValue: 1,
    theme: "thunder"
  },
  {
    id: 1,
    name: "The Royal Roar",
    description: "Fit for the throne of the gods",
    color: "#8e2de2",
    scoreValue: 2,
    theme: "royal"
  },
  {
    id: 2,
    name: "The Crimson Calamity",
    description: "A blazing inferno of intestinal fury",
    color: "#e94822",
    scoreValue: 3,
    theme: "crimson"
  },
  {
    id: 3,
    name: "The Emerald Eruption",
    description: "A verdant explosion of mythic proportions",
    color: "#1eb980",
    scoreValue: 2,
    theme: "emerald"
  },
  {
    id: 4,
    name: "The Golden Gale",
    description: "A windstorm of legendary opulence",
    color: "#ffcb47",
    scoreValue: 4,
    theme: "golden"
  },
  {
    id: 5,
    name: "The Obsidian Outburst",
    description: "The dark whispers of the underworld",
    color: "#212121",
    scoreValue: 5,
    theme: "obsidian"
  }
];

// Helper function to get random variant
export const getRandomVariant = () => {
  const index = Math.floor(Math.random() * cushionVariants.length);
  return cushionVariants[index];
};

// Helper function to get variant by ID
export const getVariantById = (id) => {
  return cushionVariants.find(variant => variant.id === id) || cushionVariants[0];
};
