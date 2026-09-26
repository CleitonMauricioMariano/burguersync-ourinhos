// BurguerSync Ourinhos - Firebase SDK v10 Configuration (Módulos ES6 via CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  doc, 
  updateDoc, 
  serverTimestamp, 
  query, 
  orderBy,
  limit 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCuX1GOHZ4v8cBL7VlOvOHrDx7vj0D_SKA",
  authDomain: "burguersynccleiton.firebaseapp.com",
  projectId: "burguersynccleiton",
  storageBucket: "burguersynccleiton.firebasestorage.app",
  messagingSenderId: "429729872083",
  appId: "1:429729872083:web:07668bc35ed2c452fcbc26"
};

// Inicialização da instância do Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Exportação das funções do Firestore para uso desacoplado
export { 
  collection, 
  addDoc, 
  onSnapshot, 
  doc, 
  updateDoc, 
  serverTimestamp, 
  query, 
  orderBy, 
  limit 
};
