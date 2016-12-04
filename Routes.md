#Routes ``http://localhost:3005/api``

>##Working:

- POST `/register`		Registro de Usuario (Se añade a la BBDD)
- POST `/login	`		Logueo de Usuario (Se le da un token)
- POST `/logout`		Destrucción del token
- GET `/routines`		Lista de rutinas
- GET `/trainers`		Lista de entrenadores

>##/*/Protected\*\

- GET 		`/users	`						Lista de Usuarios
- GET 		`/users/:userid	`				Detalle de un usuario
- DELETE 	`/users/:userid`			    Eliminación de usuario de la BBDD


>##Not Working:

###*----------------------------User Related----------------------------------------------*

- PUT 	`/users/:userid`				    Actualización del perfil
- GET 	`/users/:userid/diets`	Lista de dietas del usuario   --> works
- GET 	`/users/:userid/diets/day`	Lista de dietas del usuario del dia actual
- GET 	`/users/:userid/diets/week`	Lista de dietas del usuario de la setmana actual
- GET 	`/users/:userid/routines`			Lista de rutinas del usuario   --> works
- GET 	`/users/:userid/routines/day`	Lista de routines del usuario del día actual
- GET 	`/users/:userid/routines/week`	Lista de routines del usuario de la setmana actual
- GET 	`/users/:userid/trainers`			Lista de entrenadores del usuario
###*----------------------------Diet Related----------------------------------------------*

- GET `/diets	`		Lista de dietas      --> works
- POST 	`/users/:userid/adddiet/:dietid`			Añadir dieta a usuario     --> works
```json
{
  "dietid": "584447fff293433560872f74"
}
```


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
- POST 	`/diets/:dietid/addday	`				    añadir dia a la dieta     --> works
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

- DELETE 	`/diets/:dietid`				Eliminar una dieta
###*------------------------------Trainer Related------------------------------------------*

- POST 	`/trainers/:trainerid/:userid`		Añadir entrenador a usuario
- POST	`/trainers		`					Registrar un entrenador
- GET 	`/trainers/:trainer	`				Ver el detalle de un entrenador
- GET 	`/trainers/:trainer/:discipline	`	Ver el detalle de un entrenador segun la modalidad
- PUT 	`/trainers/:trainer	`				Actualizar un entrenador
- DELETE `/trainers/:trainer	`			Eliminar un entrenador
###*-------------------------------Routine Related----------------------------------------*

- POST 	`/users/:userid/addroutine/:routineid	`		Añadir rutina a usuario
- POST	`/routines	`						Crear una rutina   --> a mig fer, però hem de definir com es creen noves rutines i dietes, si amb totes les dades de cop, o dia a dia, o setmana a setmana
- GET 	`/routines/:routineid	`				Ver el detalle de una rutina
- GET 	`/routines/:routineid/:discipline	`	Ver el detalle de una rutina segun la modalidad
- PUT 	`/routines/:routineid	`				Actualizar una rutina
- DELETE `/routines/:routineid	`				Eliminar una rutina
##*-------------------------------------------------------------------------*
>###Publications

- UPDATE	`/publications/:publicationid`		Actualizar una publicación
- DELETE	`/publications/:publicationid`		Eliminar una publicación
- GET 	`/publications/:publicationid`		Ver una publicación en concreto
- POST 		`/publications	`				Crear una publicación identificandose con el token
- GET 		`/users/:userid/publications` 	Devuelve la id de la publicaciones hechas por el usuario
