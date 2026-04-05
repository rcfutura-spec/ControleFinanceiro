export const DEFAULT_CATEGORIES = [
  { id: 'alimentacao', name: 'Alimentação', icon: 'UtensilsCrossed', color: '#f97316', limit: 800 },
  { id: 'transporte', name: 'Transporte', icon: 'Car', color: '#3b82f6', limit: 400 },
  { id: 'moradia', name: 'Moradia', icon: 'Home', color: '#8b5cf6', limit: 1500 },
  { id: 'lazer', name: 'Lazer', icon: 'Gamepad2', color: '#ec4899', limit: 300 },
  { id: 'saude', name: 'Saúde', icon: 'Heart', color: '#ef4444', limit: 300 },
  { id: 'educacao', name: 'Educação', icon: 'GraduationCap', color: '#14b8a6', limit: 500 },
  { id: 'assinaturas', name: 'Assinaturas', icon: 'Tv', color: '#a855f7', limit: 200 },
  { id: 'vestuario', name: 'Vestuário', icon: 'Shirt', color: '#f59e0b', limit: 250 },
  { id: 'outros', name: 'Outros', icon: 'Package', color: '#6b7280', limit: 500 },
]

export const ICON_OPTIONS = [
  'UtensilsCrossed', 'Car', 'Home', 'Gamepad2', 'Heart', 'GraduationCap',
  'Tv', 'Shirt', 'Package', 'ShoppingCart', 'Plane', 'CreditCard',
  'Music', 'PawPrint', 'Baby', 'Scissors', 'Wrench', 'Smartphone',
  'Gift', 'Lightbulb', 'Dumbbell', 'Wine', 'Coffee', 'Film',
  'Briefcase', 'Stethoscope', 'Globe', 'Bus', 'Laptop', 'BookOpen',
  'Building2', 'Key', 'Phone', 'Brush', 'Droplets', 'Fuel',
]

export const COLOR_OPTIONS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899',
  '#f43f5e', '#6b7280', '#78716c', '#0ea5e9',
]

export const DEFAULT_KEYWORDS = {
  alimentacao: [
    'ifood', 'uber eats', 'rappi', 'supermercado', 'mercado', 'padaria',
    'restaurante', 'lanchonete', 'açougue', 'hortifruti', 'pao de acucar',
    'extra', 'carrefour', 'atacadao', 'assai', 'big', 'dia', 'sams club',
    'pizzaria', 'burger', 'mcdonalds', 'mc donalds', 'bk ',
    'subway', 'habib', 'spoleto', 'giraffas', 'madero', 'outback',
    'starbucks', 'cafe', 'doceria', 'confeitaria', 'sorveteria',
    'food', 'refeicao', 'almoço', 'jantar', 'lanche',
    'feira', 'sacolao', 'quitanda', 'emporio',
    'bistek', 'angeloni', 'zaffari', 'bretas', 'mateus', 'guanabara',
  ],
  transporte: [
    'uber', '99 ', '99app', 'cabify', 'posto', 'shell', 'ipiranga',
    'br distribuidora', 'gasolina', 'etanol', 'combustivel', 'estacionamento',
    'parking', 'estapar', 'zona azul', 'pedagio', 'sem parar', 'conectcar',
    'move', 'veloe', 'metro', 'bilhete unico', 'sptrans', 'brt', 'vlt',
    'onibus', 'passagem', 'autopass', 'gol linhas', 'latam', 'azul linhas',
    'decolar', '123milhas', 'maxmilhas', 'bike', 'tembici',
  ],
  moradia: [
    'aluguel', 'condominio', 'iptu', 'luz', 'energia', 'enel', 'cpfl',
    'cemig', 'celesc', 'copel', 'agua', 'sabesp', 'sanepar', 'compesa',
    'gas', 'comgas', 'conserto', 'manutencao', 'reforma', 'pintura',
    'eletricista', 'encanador', 'imobiliaria', 'seguro residencial',
  ],
  lazer: [
    'cinema', 'teatro', 'show', 'ingresso', 'sympla', 'eventim',
    'ticketmaster', 'parque', 'viagem', 'hotel', 'airbnb', 'booking',
    'hospedagem', 'pousada', 'resort', 'bar ', 'balada', 'festa',
    'entretenimento', 'diversao', 'passeio', 'turismo', 'museu',
    'game', 'jogo', 'steam', 'playstation', 'xbox', 'nintendo',
  ],
  saude: [
    'farmacia', 'drogaria', 'droga raia', 'drogasil', 'pague menos',
    'panvel', 'ultrafarma', 'medico', 'consulta', 'exame', 'laboratorio',
    'hospital', 'clinica', 'dentista', 'ortodontia', 'fisioterapia',
    'psicolog', 'terapia', 'plano de saude', 'unimed', 'amil', 'sulamerica',
    'bradesco saude', 'hapvida', 'notredame', 'otica', 'oculos', 'lente',
    'academia', 'smartfit', 'smart fit', 'bluefit', 'bodytech',
  ],
  educacao: [
    'escola', 'faculdade', 'universidade', 'curso', 'udemy', 'alura',
    'coursera', 'rocketseat', 'origamid', 'descomplica', 'estrategia',
    'livro', 'livraria', 'amazon kindle', 'saraiva', 'cultura',
    'papelaria', 'material escolar', 'mensalidade', 'matricula',
    'hotmart', 'eduzz', 'domestika',
  ],
  assinaturas: [
    'netflix', 'spotify', 'disney', 'hbo', 'max ', 'prime video',
    'amazon prime', 'globoplay', 'paramount', 'apple tv', 'youtube premium',
    'youtube music', 'deezer', 'tidal', 'crunchyroll', 'microsoft 365',
    'office 365', 'adobe', 'google one', 'icloud', 'dropbox',
    'chatgpt', 'openai', 'github', 'notion', 'canva', 'figma',
    'linkedin premium', 'twitch', 'xbox game pass', 'ps plus',
  ],
  vestuario: [
    'renner', 'riachuelo', 'cea', 'marisa', 'hering', 'zara',
    'shein', 'shopee', 'mercado livre', 'amazon', 'aliexpress',
    'centauro', 'netshoes', 'nike', 'adidas', 'puma', 'havaianas',
    'arezzo', 'melissa', 'calcado', 'sapato', 'tenis', 'roupa',
    'camisa', 'calca', 'vestido', 'jaqueta', 'costura', 'lavanderia',
  ],
}
