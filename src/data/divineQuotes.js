// src/data/divineQuotes.js
// This file contains all the divine quotes we'll use instead of fetching from an API

export const divineQuotes = [
  {
    deity: "Zeus",
    quote: "My thunderous expulsions shake the heavens themselves!",
    theme: "thunder"
  },
  {
    deity: "Odin",
    quote: "By my throne in Asgard, what a magnificent release!",
    theme: "royal"
  },
  {
    deity: "Pele",
    quote: "My volcanic emissions flow like lava through the divine realm!",
    theme: "crimson"
  },
  {
    deity: "Pan",
    quote: "The forest spirits dance when I release my sylvan zephyrs!",
    theme: "emerald"
  },
  {
    deity: "Midas",
    quote: "Even my gaseous emissions turn to gold in their opulence!",
    theme: "golden"
  },
  {
    deity: "Hades",
    quote: "From the depths of the underworld comes this miasmic greeting!",
    theme: "obsidian"
  },
  {
    deity: "Eris",
    quote: "Chaos is my domain, and chaos I shall release!",
    theme: "chaos"
  },
  {
    deity: "Athena",
    quote: "Even wisdom acknowledges the necessity of release!",
    theme: "wisdom"
  },
  {
    deity: "Thor",
    quote: "My intestinal lightning strikes with godly precision!",
    theme: "thunder"
  },
  {
    deity: "Poseidon",
    quote: "The seas boil when I unleash my oceanic bubbles!",
    theme: "water"
  },
  {
    deity: "Anubis",
    quote: "The afterlife trembles at my ceremonial outbursts!",
    theme: "obsidian"
  },
  {
    deity: "Freya",
    quote: "My divine perfume enchants all who are blessed to experience it!",
    theme: "royal"
  }
];

// Get random quote
export const getRandomQuote = () => {
  const index = Math.floor(Math.random() * divineQuotes.length);
  return divineQuotes[index];
};

// Get quote by theme
export const getQuoteByTheme = (theme) => {
  const themed = divineQuotes.filter(quote => quote.theme === theme);
  
  if (themed.length === 0) {
    return getRandomQuote();
  }
  
  const index = Math.floor(Math.random() * themed.length);
  return themed[index];
};
