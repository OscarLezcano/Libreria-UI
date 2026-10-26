export interface ParaguayanDepartment {
  name: string;
  cities: string[];
}

export const DEPARTAMENTOS: ParaguayanDepartment[] = [
  {
    name: "Alto Paraguay",
    cities: ["Fuerte Olimpo", "Bahía Negra", "Carmelo Peralta", "Mariscal J. F. Estigarribia"],
  },
  {
    name: "Alto Paraná",
    cities: [
      "Ciudad del Este",
      "Hernandarias",
      "Minga Guazú",
      "Presidente Franco",
      "Santa Rita",
      "Yguazú",
    ],
  },
  {
    name: "Amambay",
    cities: ["Pedro Juan Caballero", "Bella Vista Norte", "Capitán Bado", "Karapa'i", "Cerro Corá"],
  },
  {
    name: "Asunción",
    cities: ["Asunción"],
  },
  {
    name: "Boquerón",
    cities: ["Filadelfia", "Loma Plata", "Neuland"],
  },
  {
    name: "Caaguazú",
    cities: [
      "Coronel Oviedo",
      "Caaguazú",
      "Juan E. O'Leary",
      "Repatriación",
      "San Joaquín",
      "Vaquería",
    ],
  },
  {
    name: "Caazapá",
    cities: [
      "Caazapá",
      "Abaí",
      "Dr. Moisés Bertoni",
      "Gral. Higinio Morínigo",
      "San Juan Nepomuceno",
      "Yuty",
    ],
  },
  {
    name: "Canindeyú",
    cities: ["Salto del Guairá", "Corpus Christi", "Yby Pytã", "Katuete", "Yby Yaú"],
  },
  {
    name: "Central",
    cities: [
      "Areguá",
      "Capiatá",
      "Fernando de la Mora",
      "Lambaré",
      "Limpio",
      "Luque",
      "Mariano Roque Alonso",
      "Ñemby",
      "San Antonio",
      "San Lorenzo",
      "Villeta",
      "Itá",
    ],
  },
  {
    name: "Concepción",
    cities: ["Concepción", "Horqueta", "Belén", "Loreto", "San Lázaro", "Yby Yaú"],
  },
  {
    name: "Guairá",
    cities: [
      "Villarrica",
      "Borja",
      "Cap. M. J. Troche",
      "Félix Pérez Cardozo",
      "Iturbe",
      "Paso Yobái",
      "Yegros",
    ],
  },
  {
    name: "Itapúa",
    cities: [
      "Encarnación",
      "Coronel Bogado",
      "Cambyretá",
      "Capitán Meza",
      "Carmen del Paraná",
      "Jesús",
      "San Juan Bautista",
      "Trinidad",
    ],
  },
  {
    name: "Misiones",
    cities: [
      "San Juan Bautista",
      "Ayolas",
      "Villa Florida",
      "San Ignacio",
      "Santa María de Fe",
    ],
  },
  {
    name: "Ñeembucú",
    cities: ["Pilar", "Alberdi", "Villalbín", "General Díaz", "Mayor José Martínez", "Tacuara"],
  },
  {
    name: "Paraguarí",
    cities: ["Paraguarí", "Carapeguá", "Ybycuí", "Acahay", "Quiindy", "La Colmena", "Yaguarón"],
  },
  {
    name: "Presidente Hayes",
    cities: ["Villa Hayes", "Benjamín Aceval", "Puerto Pinasco", "Nanawa", "Puerto Ellis"],
  },
  {
    name: "San Pedro",
    cities: [
      "San Pedro de Ycuamandyyú",
      "Santa Rosa del Aguará",
      "San Estanislao",
      "Itacurubí del Rosario",
      "Liberación",
      "Villa del Rosario",
    ],
  },
];

export function getCities(departmentName: string): string[] {
  return DEPARTAMENTOS.find((department) => department.name === departmentName)?.cities ?? [];
}
