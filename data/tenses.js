// French verb tenses for our practice app
// Starting with 4 common tenses for MVP

export const TENSES = [
  {
    id: 'present',
    name: 'Présent',
    displayName: 'Present',
    description: 'Actions happening now or habitual actions'
  },
  {
    id: 'passe_compose',
    name: 'Passé Composé',
    displayName: 'Past Compound',
    description: 'Completed actions in the past'
  },
  {
    id: 'futur_simple',
    name: 'Futur Simple',
    displayName: 'Simple Future',
    description: 'Actions that will happen'
  },
  {
    id: 'imparfait',
    name: 'Imparfait',
    displayName: 'Imperfect',
    description: 'Ongoing or habitual actions in the past'
  }
];

// Helper function to get a random tense
export const getRandomTense = () => {
  const randomIndex = Math.floor(Math.random() * TENSES.length);
  return TENSES[randomIndex];
};

// Helper function to get tense by id
export const getTenseById = (id) => {
  return TENSES.find(tense => tense.id === id);
};

