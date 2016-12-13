#Routes ``http://localhost:3005/api``



###*----------------------------User Related----------------------------------------------*
- POST `/register`		Registro de Usuario (Se añade a la BBDD)
- POST `/login	`		Logueo de Usuario (Se le da un token)
- POST `/logout`		Destrucción del token

- GET 	`/users	`						Lista de Usuarios
- GET 		`/users/:userid	`				Detalle de un usuario
- PUT 	`/users/:userid`				    Actualización del perfil
- DELETE 	`/users/:userid`			    Eliminación de usuario de la BBDD
- GET 	`/users/:userid/diets`	Lista de dietas del usuario   --> works
- GET 	`/users/:userid/diets/:day`	Lista de dietas del usuario del dia actual
- GET 	`/users/:userid/diets/:week`	Lista de dietas del usuario de la setmana actual
- GET 	`/users/:userid/routines`			Lista de rutinas del usuario   --> works
- GET 	`/users/:userid/routines/:day`	Lista de routines del usuario del día actual
- GET 	`/users/:userid/routines/:week`	Lista de routines del usuario de la setmana actual
- GET 	`/users/:userid/trainers`			Lista de entrenadores del usuario

###*------------------------------Trainer Related------------------------------------------*
- GET `/trainers`		Lista de entrenadores
- POST 	`/trainers/:trainerid/:userid`		Añadir entrenador a usuario
- POST	`/trainers/register		`					Registrar un entrenador    --> works
```json
{
    "name": "trainer1",
    "password": "trainer1",
    "email": "trainer1@web.com",
    "discipline": "running"
}
```
- POST	`/trainers/login		`					Login un entrenador    --> works
- GET 	`/trainers/:trainerid	`				Ver el detalle de un entrenador    --> works
- GET 	`/trainers/:trainer/:discipline	`	Ver el detalle de un entrenador segun la modalidad
- PUT 	`/trainers/:trainer	`				Actualizar un entrenador
- DELETE `/trainers/:trainer	`			Eliminar un entrenador

###*------------------------------Chef Related------------------------------------------*
- GET `/chefs`		Lista de chefs     --> works
- GET 	`/chefs/:chefid	`				Ver el detalle de un chef    --> works
- POST	`/chefs/register		`					Registrar un chef    --> works
```json
{
    "name": "chef1",
    "password": "chef1",
    "email": "chef1@web.com"
}
```
- POST	`/chefs/login		`					Login un chef    --> works

###*----------------------------Diet Related----------------------------------------------*

- GET `/diets	`		Lista de dietas      --> works
- POST 	`/diets/choose`			Añadir dieta a usuario     --> works
```json
{
  "dietid": "584447fff293433560872f74"
}
```
- DELETE 	`/diets/choose`			Quitar dieta a usuario     --> works

- POST 	`/diets/completeDay`			Un user completa un dia de dieta     --> only works gamification

- GET 	    `/diets/:dietid`				Ver el detalle de una dieta by id      --> works
```json
{
  "title": "dieta Marató",
  "description": "Amb aquesta dieta et prepares per fer una marató"
}
```
- POST 	`/diets	`				    crear nova dieta buida       --> works
```json
{
  "title": "dieta Marató",
  "description": "Amb aquesta dieta et prepares per fer una marató"
}
```
- POST 	`/diets/:dietid/days	`				    añadir dia a la dieta     --> works
```json
{
  "day": {
    "title": "day name",
    "description": "descripció del dia",
    "meals": [
      {
        "title": "esmorzar",
        "submeals": [
          {
            "title": "primer plat",
            "description": "description",
            "amount": {
              "unit": "Kg",
              "quantity": "3"
            }// potser també posar el parametre nutritional
          },
          {
            "title": "segon plat",
            "description": "description",
            "amount": {
              "unit": "Kg",
              "quantity": "3"
            }
          }
        ]
      },
      {
        "title": "dinar",
        "submeals": [
          {
            "title": "plat únic",
            "description": "description",
            "amount": {
              "unit": "Kg",
              "quantity": "3"
            }
          }
        ]
      }
    ]
  }
}
```


- PUT 	`/diets/:dietid	`				    Actualizar una dieta

- DELETE 	`/diets/:dietid`				Eliminar una dieta  --> no sé si aquí haurem de fer que s'esborra la dieta i també la referència a l'user

###*-------------------------------Routine Related----------------------------------------*


- GET `/routines	`		Lista de routines
- POST 	`/routines/choose`			Añadir rutina a usuario      --> works
```json
{
  "routineid": "584447fff293433560872f74"
}
```
- DELETE 	`/routines/choose`			Quitar rutina a usuario    --> works

- POST 	`/routines/completeDay`			Un user completa un dia de routine     --> only works gamification

- GET 	    `/routines/:routineid`				Ver el detalle de una routine by id
```json
{
  "title": "rutina Ironman",
  "description": "Amb aquesta rutina et prepares per fer un ironman"
}
```

- POST 	`/routines	`				    crear nova rutina buida
```json
{
  "title": "rutina Ironman",
  "description": "Amb aquesta rutina et prepares per fer un ironman"
}
```

- POST 	`/routines/:routineid/days	`				    añadir dia a la rutina
```json
{
  "day": {
    "title": "dia intens",
    "description": "avui et cansaràs molt",
    "exercises": [
      {
        "name": "curl bíceps",
        "description": "concentra't bé",
        "img": "noimg.png",
        "weight": "20kg",
        "distance": null,
        "reps": "10",
        "series": "4"
      }
    ]
  }
}
```

- PUT 	`/routines/:routineid	`				Actualizar una rutina
- DELETE `/routines/:routineid	`				Eliminar una rutina --> no sé si aquí haurem de fer que s'esborra la rutina i també la referència a l'user
- GET 	`/routines/:routineid/:discipline	`	Ver el detalle de una rutina segun la modalidad --> aquesta no l'entenc

##*-------------------------------------------------------------------------*
>###Publications

Aquí en realitat, potser no fer un REST de publicacions, sinó q els missatges interns podem fer que sigui:
- un sistema de xat intern, amb socketio, on cada missatge que s'envia, va per socketio però a més a més es registra a la DDBB. Així es manté un historial de la conversa.

- UPDATE	`/publications/:publicationid`		Actualizar una publicación
- DELETE	`/publications/:publicationid`		Eliminar una publicación
- GET 	`/publications/:publicationid`		Ver una publicación en concreto
- POST 		`/publications	`				Crear una publicación identificandose con el token
- GET 		`/users/:userid/publications` 	Devuelve la id de la publicaciones hechas por el usuario
