import { QuizQuestion } from '../types';

export type QuizTopic =
  | 'Ganesh Chaturthi'
  | 'Lord Ganesha'
  | 'Modak'
  | 'Festival Traditions'
  | 'Decorations'
  | 'Cultural Facts';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // --- TOPIC: MODAK ---
  {
    id: 1,
    question: "What sweet delicacy is most beloved by Lord Ganesha and traditionally prepared with steamed rice flour, fresh coconut, and jaggery?",
    options: ["Jalebi", "Ukadiche Modak", "Gulab Jamun", "Rasgulla"],
    correctIndex: 1,
    explanation: "Ukadiche Modak is Bappa's supreme favorite sweet. The steamed outer rice shell represents purity, while the inner coconut-jaggery filling signifies inner divine sweetness and spiritual bliss.",
    category: "Modak"
  },
  {
    id: 2,
    question: "How many modaks are traditionally offered to Lord Ganesha during auspicious puja rituals (Naivedya)?",
    options: ["11", "21", "51", "108"],
    correctIndex: 1,
    explanation: "Offering 21 modaks is the sacred count during Ganeshotsav, corresponding to the 21 principles of creation and 21 names of Lord Ganesha.",
    category: "Modak"
  },
  {
    id: 3,
    question: "What does the pointed tip (apex) and round base of the Modak spiritually symbolize?",
    options: [
      "One-pointed focus of the intellect (Ekagrata) leading to divine wisdom",
      "The physical shape of Mount Kailash",
      "The sun's morning rays",
      "The phases of the moon"
    ],
    correctIndex: 0,
    explanation: "Philosophically, the modak's tapering apex signifies the one-pointed concentration of the spiritual seeker, which opens into the boundless sweetness of self-realization.",
    category: "Modak"
  },
  {
    id: 4,
    question: "Which variety of modak is popular for longevity, often prepared by deep-frying with wheat flour dough?",
    options: ["Fried Modak (Talalela Modak)", "Chilled Modak", "Dry Fruit Barfi", "Mawa Peda"],
    correctIndex: 0,
    explanation: "Talalela (fried) modaks have a crisp golden wheat crust and can be preserved for several days, making them a festive staple to share with visiting relatives and neighbors.",
    category: "Modak"
  },
  {
    id: 5,
    question: "Which ancient sage's wife, Anasuya, served Lord Ganesha a modak that finally satisfied his cosmic hunger?",
    options: ["Sage Agastya", "Sage Atri", "Sage Vashistha", "Sage Vishwamitra"],
    correctIndex: 1,
    explanation: "Legend says after consuming a grand feast, Lord Ganesha was still hungry. Devi Anasuya (wife of Sage Atri) lovingly offered a single modak, which caused Bappa to burp in absolute contentment, satisfying the entire cosmos.",
    category: "Modak"
  },

  // --- TOPIC: LORD GANESHA ---
  {
    id: 6,
    question: "What is the name of Lord Ganesha's humble and faithful vahana (divine vehicle)?",
    options: ["Nandi the Bull", "Mooshaka (The Mouse)", "Garuda the Celestial Eagle", "Mayura the Peacock"],
    correctIndex: 1,
    explanation: "Mooshaka the mouse represents the restless, wandering human ego and desiring mind. Lord Ganesha riding upon Mooshaka demonstrates absolute mastery over ego and sensory desire.",
    category: "Lord Ganesha"
  },
  {
    id: 7,
    question: "Why is Lord Ganesha endowed with large ears (Surpa-karna)?",
    options: [
      "To listen more, speak wisely, and hear every devotee's heartfelt prayer",
      "To ward off insects during meditation",
      "To fan the sacrificial fire",
      "To distinguish high and low musical octaves"
    ],
    correctIndex: 0,
    explanation: "Large winnowing-basket ears symbolize patience in listening, filtering truth from falsehood, and listening more than one speaks.",
    category: "Lord Ganesha"
  },
  {
    id: 8,
    question: "Why is Lord Ganesha affectionately called 'Ekadanta' (The Single-Tusked One)?",
    options: [
      "He broke his tusk to continue transcribing the epic Mahabharata without pause",
      "He sacrificed it in a duel with a celestial serpent",
      "He was born with only one tusk",
      "He gifted it to Lord Kubera"
    ],
    correctIndex: 0,
    explanation: "When Sage Vyasa dictated the grand epic Mahabharata on condition of non-stop recitation, Ganesha's feather pen broke. Bappa unhesitatingly snapped his own tusk to maintain the uninterrupted flow of wisdom.",
    category: "Lord Ganesha"
  },
  {
    id: 9,
    question: "What divine weapon or tool in Ganesha's upper right hand symbolizes severing worldly attachments?",
    options: ["Ankusha (Axe or Goad)", "Trishula (Trident)", "Chakra (Discus)", "Gada (Mace)"],
    correctIndex: 0,
    explanation: "The Ankusha represents cutting away delusions, attachments, and negative tendencies, steering the spiritual seeker towards higher consciousness.",
    category: "Lord Ganesha"
  },
  {
    id: 10,
    question: "Who are Lord Ganesha's divine parents residing on sacred Mount Kailash?",
    options: [
      "Lord Shiva (Mahadeva) and Goddess Parvati (Shakti)",
      "Lord Vishnu and Goddess Lakshmi",
      "Lord Brahma and Goddess Saraswati",
      "Sage Kashyapa and Goddess Aditi"
    ],
    correctIndex: 0,
    explanation: "Lord Ganesha is the beloved son of Lord Shiva and Goddess Parvati, embodying the union of supreme consciousness and dynamic spiritual energy.",
    category: "Lord Ganesha"
  },
  {
    id: 11,
    question: "What does the magnificent stomach (Lambodara) of Lord Ganesha symbolize?",
    options: [
      "Equanimous digestion of all experiences in life—both joyful and painful",
      "Abundance of heavenly delicacies",
      "Physical might and strength",
      "The passage of worldly seasons"
    ],
    correctIndex: 0,
    explanation: "Lambodara represents the boundless cosmos contained within Bappa, teaching devotees to gracefully absorb both praise and blame, sorrow and happiness, without losing balance.",
    category: "Lord Ganesha"
  },
  {
    id: 12,
    question: "What is the meaning of Lord Ganesha's left-turned trunk (Vamamukhi)?",
    options: [
      "Associated with Ida Nadi (lunar, peaceful, gentle grace suitable for homes)",
      "Associated with fiery sun rays",
      "Associated with martial victory",
      "Associated with stormy winds"
    ],
    correctIndex: 0,
    explanation: "A left-turned trunk represents the cooling, compassionate Ida Nadi (Chandra channel), showering gentle blessings, calm domestic bliss, and family peace.",
    category: "Lord Ganesha"
  },

  // --- TOPIC: GANESH CHATURTHI ---
  {
    id: 13,
    question: "Who transformed the private domestic worship of Ganesh Chaturthi into a grand Sarvajanik (public) festival in 1893?",
    options: [
      "Lokmanya Bal Gangadhar Tilak",
      "Mahatma Gandhi",
      "Swami Vivekananda",
      "Gopal Krishna Gokhale"
    ],
    correctIndex: 0,
    explanation: "Lokmanya Bal Gangadhar Tilak recognized Ganeshotsav's power to bridge social divides and unite freedom fighters across communities through public pandals, intellectual discourses, and cultural programs in 1893.",
    category: "Ganesh Chaturthi"
  },
  {
    id: 14,
    question: "On which Hindu calendar month does Ganesh Chaturthi begin?",
    options: [
      "Bhadrapada (Shukla Chaturthi)",
      "Kartik (Krishna Paksha)",
      "Chaitra (Navratri)",
      "Shravan (Purnima)"
    ],
    correctIndex: 0,
    explanation: "Ganesh Chaturthi begins on Shukla Chaturthi (the fourth lunar day of the bright fortnight) of the month of Bhadrapada, usually during August-September.",
    category: "Ganesh Chaturthi"
  },
  {
    id: 15,
    question: "What is the 10th and concluding day of Ganeshotsav called, renowned for joyful Visarjan processions?",
    options: [
      "Anant Chaturdashi",
      "Sharad Purnima",
      "Dhanteras",
      "Vijayadashami"
    ],
    correctIndex: 0,
    explanation: "Anant Chaturdashi marks the emotional culmination of the 10-day festival where idols are bid farewell with music, dancing, and heartfelt prayers for Bappa's early return.",
    category: "Ganesh Chaturthi"
  },
  {
    id: 16,
    question: "What heartfelt Marathi slogan echoes during Ganesh Visarjan processions?",
    options: [
      "Ganpati Bappa Morya, Pudhchya Varshi Lavkar Ya!",
      "Jai Shri Ram, Har Har Mahadev",
      "Radhe Radhe Govinda",
      "Om Namah Shivaya Shambho"
    ],
    correctIndex: 0,
    explanation: "'Ganpati Bappa Morya, Pudhchya Varshi Lavkar Ya' means 'O Lord Ganesha, our protector and father, please come back soon to us next year!'.",
    category: "Ganesh Chaturthi"
  },
  {
    id: 17,
    question: "How many days is the traditional Sarvajanik Ganeshotsav observed before the grand Visarjan?",
    options: ["10 days", "3 days", "7 days", "21 days"],
    correctIndex: 0,
    explanation: "The festival spans 10 joyous days from Ganesh Chaturthi to Anant Chaturdashi, filled with daily aartis, cultural exhibitions, and charity drives.",
    category: "Ganesh Chaturthi"
  },

  // --- TOPIC: FESTIVAL TRADITIONS ---
  {
    id: 18,
    question: "Which sacred grass blade is offered to Lord Ganesha in holy clusters of 21?",
    options: ["Durva (Bermuda grass)", "Tulsi leaves", "Kusha grass", "Neem sprigs"],
    correctIndex: 0,
    explanation: "Durva grass is sacred to Ganesha. Mythology recounts how 21 blades of Durva cooled the divine fever inside Bappa after he swallowed the demon Analasura to save the universe.",
    category: "Festival Traditions"
  },
  {
    id: 19,
    question: "Which vibrant flower is considered especially dear to Lord Ganesha and offered during puja?",
    options: ["Red Hibiscus (Jaswand)", "White Rose", "Sunflower", "Blue Orchid"],
    correctIndex: 0,
    explanation: "The bright red Hibiscus (Jaswand) represents radiant solar energy, courage, and vitality, harmonizing deeply with Lord Ganesha's Muladhara chakra.",
    category: "Festival Traditions"
  },
  {
    id: 20,
    question: "What is the opening Vedic ritual of installing the idol and invoking divine breath called?",
    options: ["Prana Pratishtha", "Visarjan", "Uttarpuja", "Homa"],
    correctIndex: 0,
    explanation: "Prana Pratishtha is the sacred consecration where Vedic mantras invoke the living cosmic presence of Lord Ganesha into the murti for the festival duration.",
    category: "Festival Traditions"
  },
  {
    id: 21,
    question: "Which beloved Marathi aarti composed by saint Samarth Ramdas in the 17th century is sung in every home?",
    options: [
      "Sukh Karta Dukh Harta",
      "Jai Ganesh Deva",
      "Om Jai Jagdish Hare",
      "Hanuman Chalisa"
    ],
    correctIndex: 0,
    explanation: "'Sukh Karta Dukh Harta, Varta Vighnachi' (Creator of Joy, Dispeller of Sorrows and Obstacles) was composed by Samarth Ramdas upon seeing the Kasba Ganpati in Pune.",
    category: "Festival Traditions"
  },
  {
    id: 22,
    question: "Which auspicious leafy decoration (Toran) is hung at the doorway of homes during Ganeshotsav?",
    options: [
      "Mango leaves and Marigold flowers",
      "Bamboo shoots and Ferns",
      "Pine needles and Ribbons",
      "Eucalyptus leaves"
    ],
    correctIndex: 0,
    explanation: "Torans crafted from fresh mango leaves (representing spiritual grounding) and yellow/orange marigolds (representing solar light) welcome auspicious vibrations and ward off negative energies.",
    category: "Festival Traditions"
  },

  // --- TOPIC: DECORATIONS ---
  {
    id: 23,
    question: "What is the decorative canopy or pavilion created to enshrine Bappa's idol called?",
    options: ["Mandap (or Makhar)", "Gopuram", "Vimana", "Stupa"],
    correctIndex: 0,
    explanation: "The Mandap or Makhar is the elaborate decorative temple pavilion built with wooden frames, fabric drapes, lights, and flower garlands inside homes and public pandals.",
    category: "Decorations"
  },
  {
    id: 24,
    question: "Why are eco-friendly idols made of Shadu Mati (natural river clay) widely celebrated today?",
    options: [
      "They dissolve naturally in water without poisoning lakes, rivers, and aquatic life",
      "They are unbreakable during transit",
      "They do not require painting",
      "They are lighter than paper"
    ],
    correctIndex: 0,
    explanation: "Shadu clay idols return harmoniously to mother nature upon immersion, preventing chemical pollution and honoring the sacred cycle of creation and dissolution.",
    category: "Decorations"
  },
  {
    id: 25,
    question: "What sacred art form uses colored powders, rice flour, or flower petals at the entrance of the mandap?",
    options: ["Rangoli (or Kolam)", "Warli Art", "Madhubani Painting", "Tanjore Gold Art"],
    correctIndex: 0,
    explanation: "Rangoli welcomes guests and deities with harmonious geometric symmetry, symbolizing hospitality, prosperity, and celebratory warmth.",
    category: "Decorations"
  },
  {
    id: 26,
    question: "What is the spiritual significance of lighting oil diyas (Samai / Niranjan) before Bappa's mandap?",
    options: [
      "Dispelling darkness of ignorance and kindling divine inner illumination",
      "Heating the sanctum",
      "Preventing drafts",
      "Pleasing the rain gods"
    ],
    correctIndex: 0,
    explanation: "The steady flame of the brass Diya represents the dispel of spiritual darkness, purity of intent, and the radiant light of knowledge.",
    category: "Decorations"
  },

  // --- TOPIC: CULTURAL FACTS ---
  {
    id: 27,
    question: "What traditional rhythmic drumming troupes perform thunderous beats during Ganeshotsav in Maharashtra?",
    options: ["Dhol Tasha Pathak", "Sitar Ensemble", "Qawwali Troupes", "Jazz Marching Band"],
    correctIndex: 0,
    explanation: "Dhol Tasha Pathaks—comprising hundreds of enthusiastic youth playing large barrel dhols, brass tashas, and bronze cymbals—create an electric, synchronized festive heartbeat.",
    category: "Cultural Facts"
  },
  {
    id: 28,
    question: "Which festival closely follows Ganesh Chaturthi to welcome Ganesha's divine mother / sisters into homes?",
    options: ["Gauri Avahan & Pujan", "Kojagiri Purnima", "Karwa Chauth", "Ahoi Ashtami"],
    correctIndex: 0,
    explanation: "Gauri Avahan honors Goddess Gauri (Mahalaxmi), installed with great celebration as Ganesha's loving protectors, showering homes with prosperity and harvest bounty.",
    category: "Cultural Facts"
  },
  {
    id: 29,
    question: "Why is Lord Ganesha honored as 'Prathama-Pujya' (First to be Worshipped in all rituals)?",
    options: [
      "He was blessed by Lord Shiva that no endeavor succeeds without first invoking the remover of obstacles",
      "He is the oldest deity in Vedic texts",
      "He requested it during a debate",
      "It was established by historic emperors"
    ],
    correctIndex: 0,
    explanation: "By circumambulating his parents with deep devotion, Ganesha proved true wisdom. Lord Shiva bestowed the eternal boon that all pujas, journeys, and ventures must begin with Ganesha's invocation (Shri Ganesh).",
    category: "Cultural Facts"
  },
  {
    id: 30,
    question: "What profound Vedic hymn from the Atharva Veda is chanted to invoke Ganesha's ultimate cosmic form?",
    options: ["Ganapati Atharvashirsha", "Purusha Suktam", "Shri Suktam", "Rudra Prashna"],
    correctIndex: 0,
    explanation: "The Ganapati Atharvashirsha is the sacred Upanishadic text identifying Ganesha as the supreme reality (Brahman), declaring 'Tvam Eva Pratyaksham Tattvam Asi' (You alone are the perceptible absolute truth).",
    category: "Cultural Facts"
  }
];

/**
 * Returns a randomized subset of 10 questions with balanced category distribution.
 */
export function getRandomQuizRound(count: number = 10): QuizQuestion[] {
  // Shuffle array thoroughly using Fisher-Yates
  const shuffled = [...QUIZ_QUESTIONS];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Ensure diverse topics across rounds
  const selected: QuizQuestion[] = [];
  const categoriesSeen = new Set<string>();

  // Pass 1: pick 1 question per category first
  for (const q of shuffled) {
    if (!categoriesSeen.has(q.category) && selected.length < count) {
      selected.push(q);
      categoriesSeen.add(q.category);
    }
  }

  // Pass 2: fill remaining slots
  for (const q of shuffled) {
    if (selected.length >= count) break;
    if (!selected.some(s => s.id === q.id)) {
      selected.push(q);
    }
  }

  // Final shuffle of the selected round questions
  return selected.sort(() => Math.random() - 0.5);
}
