// Simulamos la tabla de usuarios que tendrías en Postgres
export const MOCK_USERS = [
  {
    id: 1,
    fullName: "Admin Cancha",
    email: "admin@cancha.com",
    password: "123", // En producción esto iría encriptado
    role: "admin_cancha", 
    avatar: "https://i.pravatar.cc/150?u=1"
  },
  {
    id: 2,
    fullName: "Juan Deportista",
    email: "juan@deporte.com",
    password: "123",
    role: "deportista",
    avatar: "https://i.pravatar.cc/150?u=2"
  },
  {
    id: 3,
    fullName: "Coach Carter",
    email: "coach@team.com",
    password: "123",
    role: "entrenador",
    avatar: "https://i.pravatar.cc/150?u=3"
  },
  {
    id: 4,
    fullName: "Super Admin",
    email: "root@system.com",
    password: "root",
    role: "super_admin",
    avatar: "https://i.pravatar.cc/150?u=4"
  }
];


export const MOCK_COURTS = [
  { 
    id: 1, 
    name: "Arena Central Pro", 
    location: "Polideportivo Norte", 
    image: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&q=80&w=1000", 
    availability: [true, true, false, true, false, true, true] 
  },
  { 
    id: 2, 
    name: "Cancha Urbana 05", 
    location: "Parque de los Héroes", 
    image: "https://images.unsplash.com/photo-1519861531473-920026393112?auto=format&fit=crop&q=80&w=1000", 
    availability: [false, false, true, true, true, true, false] 
  },
  { 
    id: 3, 
    name: "Domo Universitario", 
    location: "Campus Central", 
    image: "https://images.unsplash.com/photo-1505666287802-931dc83948e9?auto=format&fit=crop&q=80&w=1000", 
    availability: [true, true, true, true, true, false, false] 
  }
];
