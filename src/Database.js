// database.js
import Dexie from 'dexie';

const db = new Dexie('database');

db.version(1).stores({
  character: '++id,level,name,race,class,mainspec,gearscore,primary,secodary,taskdone', // Tabla para los personajes
  task: '++id,task,gearscore,profession,exclude', // Tabla para las tareas
});

export default db;
