
const levels = [
    // LEVEL 1 - GUESS THE WORD
    {
        id: 1,
        title: "L'entrepreneuriat",
        icon: "🏢",
        description: "Découvre les concepts de l'entrepreneuriat.",
        type: "image",
        questions: [
            {
                question: "Devine le mot !",
                description: "Une organisation qui propose des produits ou des services.",
                answer: "entreprise",
                image: "images/entreprise.jpg",
                hint: "Une organisation qui exerce une activité économique."
            },
            {
                question: "Devine le mot !",
                description: "Une personne qui crée et gère un projet.",
                answer: "entrepreneur",
                image: "images/entrepreneurss.png",
                hint: "Il transforme une idée en projet."
            },
            {
                question: "Devine le mot !",
                description: "Le processus de création et de développement des projets.",
                answer: "programme",
                image: "images/pie.png",
                hint: "prog**** d'inno***** *******eneuriale."
            }
        ]
    },

    // LEVEL 2 - UNSCRAMBLE LETTERS
    {
        id: 2,
        title: "L'entrepreneur",
        icon: "🧑‍💼",
        description: "Découvre les qualités d'un bon entrepreneur.",
        type: "scramble",
        questions: [
            {
                question: "Remets les lettres dans le bon ordre.",
                description: "V I T E A T I C R E",
                answer: "creativite",
                hint: "La capacité de produire des idées nouvelles."
            },
            {
                question: "Remets les lettres dans le bon ordre.",
                description: "S A B I L I T E P O N R E S",
                answer: "responsabilite",
                hint: "Assumer les conséquences de ses décisions."
            },
            {
                question: "Remets les lettres dans le bon ordre.",
                description: "C E P A N T I E",
                answer: "patience",
                hint: "La capacité d'attendre sans abandonner."
            }
        ]
    },

    // LEVEL 3 - WORD ORDER
    {
        id: 3,
        title: "Culture entrepreneuriale",
        icon: "💡",
        description: "Construis les phrases correctement.",
        type: "order",
        questions: [
            {
                question: "Mets les mots dans le bon ordre.",
                description: "initiative / La / encourage / culture / l' / entrepreneuriale",
                answer: "La culture entrepreneuriale encourage l'initiative",
                hint: "La phrase commence par « La culture »."
            },
            {
                question: "Mets les mots dans le bon ordre.",
                description: "innovation / favorise / L'entrepreneur / l'",
                answer: "L'entrepreneur favorise l'innovation",
                hint: "La phrase commence par « L'entrepreneur »."
            },
            {
                question: "Mets les mots dans le bon ordre.",
                description: "risques / accepte / entrepreneur / L' / les",
                answer: "L'entrepreneur accepte les risques",
                hint: "La phrase commence par « L'entrepreneur »."
            }
        ]
    },

    // LEVEL 4 - CROSSWORD
    {
        id: 4,
        title: "Les qualités de l'entrepreneur",
        icon: "🧩",
        description: "Découvre les qualités d'un bon entrepreneur.",
        type: "crossword",
        questions: [
            {
                question: "Complète les mots croisés !",
                description: "Trouve les qualités de l'entrepreneur à partir des définitions.",
                answer: "crossword",
                hint: "Pense à la créativité, à la responsabilité, à l'autonomie et à la patience."
            },
            {
                question: "Les qualités de l'entrepreneur",
                description: "Retrouve les quatre qualités dans la grille.",
                answer: "crossword",
                hint: "Un entrepreneur doit être créatif, responsable, autonome et patient."
            },
            {
                question: "Défi final : les qualités",
                description: "Complète toutes les cases de la grille.",
                answer: "crossword",
                hint: "Lis les définitions affichées sous la grille."
            }
        ]
    },

    // LEVEL 5 - FIND THE ODD ONE
    {
        id: 5,
        title: "Découverte de l'idée",
        icon: "🔎",
        description: "Trouve l'élément qui ne correspond pas.",
        type: "odd",

        questions: [
            {
                question: "Trouve l'intrus parmi les caractéristiques d'un entrepreneur.",
                description: "Quelle caractéristique ne correspond pas à un entrepreneur ?",
                options: [
                    "Créativité",
                    "Innovation",
                    "Initiative",
                    "Riche"
                ],
                answer: "Riche"
            },
            {
                question: "Trouve l'intrus parmi les caractéristiques d'un homme d'affaires.",
                description: "Quelle caractéristique ne correspond pas à un homme d'affaires ?",
                options: [
                    "Négociation",
                    "Gestion",
                    "Investissement",
                    "Désorganisation"
                ],
                answer: "Désorganisation"
            },
            {
                question: "Trouve l'intrus parmi les caractéristiques d'une personne entreprenante.",
                description: "Quelle caractéristique ne correspond pas à une personne entreprenante ?",
                options: [
                    "Dynamisme",
                    "Motivation",
                    "Persévérance",
                    "Inactivité"
                ],
                answer: "Inactivité"
            }
        ]
    },

    // LEVEL 6 - COMPLETE THE SENTENCE

    {
        id: 6,
        title: "PIE Magic Examination",
        icon: "📜",
        description: "Reconstitue un texte sur la recherche d'une idée de projet.",
        type: "exam",
        questions: []
    },

    // LEVEL 7 - MYSTERY WORD
    {
        id: 7,
        title: "Business Model",
        icon: "📊",
        description: "Trouve les mots secrets du modèle économique.",
        type: "mystery",
        questions: [
            {
                question: "Mot mystère : Qui achète les produits ou utilise les services ?",
                description: "Je représente les personnes ciblées par une entreprise.",
                answer: "clients",
                hint: "Une entreprise cherche à satisfaire leurs besoins."
            },
            {
                question: "Mot mystère : Comment appelle-t-on l'argent gagné par un projet ?",
                description: "Je représente l'argent obtenu grâce aux ventes ou aux services.",
                answer: "revenus",
                hint: "Ils permettent à l'entreprise de gagner de l'argent."
            },
            {
                question: "Mot mystère : Comment appelle-t-on les dépenses d'un projet ?",
                description: "Je représente l'argent dépensé pour faire fonctionner une entreprise.",
                answer: "couts",
                hint: "Ils peuvent comprendre les salaires et les achats."
            }
        ]
    }
];

// CROSSWORD DATA

const entrepreneurCrosswords = [
    {
        title: "Les qualités personnelles",
        words: [
            {
                id: 1,
                word: "CREATIVITE",
                clue: "Capacité à imaginer des idées nouvelles."
            },
            {
                id: 2,
                word: "PATIENCE",
                clue: "Capacité à attendre sans abandonner."
            },
            {
                id: 3,
                word: "AUTONOMIE",
                clue: "Capacité à travailler de manière indépendante."
            },
            {
                id: 4,
                word: "RESPONSABILITE",
                clue: "Capacité à assumer ses décisions."
            }
        ]
    },
    {
        title: "L'esprit entrepreneurial",
        words: [
            {
                id: 1,
                word: "COURAGE",
                clue: "Force d'affronter les difficultés."
            },
            {
                id: 2,
                word: "INITIATIVE",
                clue: "Capacité à agir sans attendre les autres."
            },
            {
                id: 3,
                word: "CONFIANCE",
                clue: "Fait de croire en ses capacités."
            },
            {
                id: 4,
                word: "AMBITION",
                clue: "Volonté d'atteindre de grands objectifs."
            }
        ]
    },
    {
        title: "Les compétences entrepreneuriales",
        words: [
            {
                id: 1,
                word: "GESTION",
                clue: "Action d'organiser les ressources d'un projet."
            },
            {
                id: 2,
                word: "ECOUTE",
                clue: "Capacité à comprendre les besoins des autres."
            },
            {
                id: 3,
                word: "LEADERSHIP",
                clue: "Capacité à guider et motiver une équipe."
            },
            {
                id: 4,
                word: "DECISION",
                clue: "Choix effectué entre plusieurs possibilités."
            }
        ]
    }
];

