import { Product, Category } from "@/types/menu";

export const categories: Category[] = [
  { id: "acai", name: "Açaí" },
  { id: "lanches", name: "Lanches" },
  { id: "hotdog", name: "Hot-Dog" },
  { id: "porcoes", name: "Porções" },
  { id: "batata", name: "Batata Frita" },
  { id: "pasteis", name: "Pastéis" },
  { id: "bebidas", name: "Bebidas" },
];

export const products: Product[] = [
  // Açaí
  {
    id: "acai-200",
    name: "Açaí no Copo 200ml",
    description: "1 fruta + leite condensado + 3 acompanhamentos",
    price: 9.00,
    category: "acai",
  },
  {
    id: "acai-300",
    name: "Açaí no Copo 300ml",
    description: "2 frutas + leite condensado + 3 acompanhamentos",
    price: 12.00,
    category: "acai",
  },
  {
    id: "acai-500",
    name: "Açaí no Copo 500ml",
    description: "3 frutas + leite condensado + 3 acompanhamentos",
    price: 20.00,
    category: "acai",
  },
  {
    id: "suco-acai-300",
    name: "Suco de Açaí 300ml",
    description: "Acompanha leite condensado",
    price: 9.00,
    category: "acai",
  },
  {
    id: "suco-acai-500",
    name: "Suco de Açaí 500ml",
    description: "Acompanha leite condensado",
    price: 12.00,
    category: "acai",
  },
  {
    id: "suco-acai-1l",
    name: "Suco de Açaí 1 Litro",
    description: "Acompanha leite condensado",
    price: 20.00,
    category: "acai",
  },

  // Lanches
  {
    id: "x-burguer",
    name: "X-Burguer",
    description: "Hambúrguer, alface, tomate, mussarela, ketchup e maionese",
    price: 15.00,
    category: "lanches",
  },
  {
    id: "combo-x-burguer",
    name: "Combo X-Burguer",
    description: "X-Burguer + Batata frita + Refrigerante 350ml",
    price: 22.00,
    category: "lanches",
  },

  // Hot-Dog
  {
    id: "dog-simples",
    name: "Dog Simples",
    description: "1 salsicha, purê, salada, batata palha, ketchup, mostarda, barbecue e maionese",
    price: 8.00,
    category: "hotdog",
  },
  {
    id: "dog-duplo",
    name: "Dog Duplo",
    description: "2 salsichas, purê, salada, batata palha, ketchup, mostarda, barbecue e maionese",
    price: 12.00,
    category: "hotdog",
  },
  {
    id: "dog-marmita",
    name: "Dog na Marmita",
    description: "2 salsichas, purê, salada, batata palha, cheddar e queijo ralado",
    price: 17.00,
    category: "hotdog",
  },

  // Porções
  {
    id: "calabresa-acebolada",
    name: "Calabresa Acebolada",
    description: "Linguiça calabresa, cebola e farofa",
    price: 26.00,
    category: "porcoes",
  },
  {
    id: "frango-passarinho",
    name: "Frango à Passarinho",
    description: "Frango temperado e alho frito",
    price: 40.00,
    category: "porcoes",
  },
  {
    id: "costelinha",
    name: "Costelinha",
    description: "Costela, cebola e barbecue",
    price: 47.00,
    category: "porcoes",
  },
  {
    id: "codorninha",
    name: "Codorninha",
    description: "4 codorninhas, farofa e vinagrete",
    price: 32.00,
    category: "porcoes",
  },

  // Batata Frita
  {
    id: "batata-classica-p",
    name: "Batata Clássica Pequena",
    description: "Batata frita com sal",
    price: 12.00,
    category: "batata",
  },
  {
    id: "batata-classica-g",
    name: "Batata Clássica Grande",
    description: "Batata frita com sal",
    price: 17.00,
    category: "batata",
  },
  {
    id: "batata-cremosa-p",
    name: "Batata Cremosa Pequena",
    description: "Cheddar, ketchup, maionese, orégano e queijo parmesão",
    price: 14.00,
    category: "batata",
  },
  {
    id: "batata-cremosa-g",
    name: "Batata Cremosa Grande",
    description: "Cheddar, ketchup, maionese, orégano e queijo parmesão",
    price: 20.00,
    category: "batata",
  },
  {
    id: "batata-bacon-p",
    name: "Batata Bacon Supreme Pequena",
    description: "Cheddar, ketchup, maionese, orégano, queijo parmesão e bacon",
    price: 16.00,
    category: "batata",
  },
  {
    id: "batata-bacon-g",
    name: "Batata Bacon Supreme Grande",
    description: "Cheddar, ketchup, maionese, orégano, queijo parmesão e bacon",
    price: 25.00,
    category: "batata",
  },

  // Pastéis
  {
    id: "pastel-frango-catupiry",
    name: "Pastel Frango com Catupiry",
    description: "Frango, catupiry, azeitona verde e orégano",
    price: 12.00,
    category: "pasteis",
  },
  {
    id: "pastel-frango-queijo",
    name: "Pastel Frango com Queijo",
    description: "Frango, mussarela, azeitona verde e orégano",
    price: 12.00,
    category: "pasteis",
  },
  {
    id: "pastel-carne",
    name: "Pastel de Carne",
    description: "Carne, azeitona verde e orégano",
    price: 12.00,
    category: "pasteis",
  },
  {
    id: "pastel-carne-queijo",
    name: "Pastel Carne com Queijo",
    description: "Carne, mussarela, azeitona verde e orégano",
    price: 12.00,
    category: "pasteis",
  },
  {
    id: "pastel-queijo",
    name: "Pastel de Queijo",
    description: "Mussarela, azeitona verde e orégano",
    price: 12.00,
    category: "pasteis",
  },
  {
    id: "pastel-pizza",
    name: "Pastel de Pizza",
    description: "Mussarela, tomate, azeitona verde e orégano",
    price: 12.00,
    category: "pasteis",
  },

  // Bebidas
  {
    id: "refri-lata",
    name: "Refrigerante Lata 350ml",
    description: "Coca-Cola, Guaraná, Fanta ou Sprite",
    price: 6.00,
    category: "bebidas",
  },
  {
    id: "suco-lata",
    name: "Suco Lata Del Valle 290ml",
    description: "Diversos sabores",
    price: 6.00,
    category: "bebidas",
  },
  {
    id: "refri-2l",
    name: "Refrigerante 2 Litros",
    description: "Coca-Cola, Guaraná ou Fanta",
    price: 15.00,
    category: "bebidas",
  },
  {
    id: "agua-mineral",
    name: "Água Mineral 500ml",
    description: "Com ou sem gás",
    price: 4.00,
    category: "bebidas",
  },
];
