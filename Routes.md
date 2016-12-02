#Routes ``http://localhost:3005/api``

>##Working:

- POST `/register`		Registro de Usuario (Se añade a la BBDD)
- POST `/login	`		Logueo de Usuario (Se le da un token)
- POST `/logout`		Destrucción del token
- GET `/diets	`		Lista de dietas
- GET `/routines`		Lista de rutinas
- GET `/trainers`		Lista de entrenadores

>##/*/Protected\*\

- GET 		`/users	`						Lista de Usuarios
- GET 		`/users/:userid	`				Detalle de un usuario
- DELETE 	`/users/:userid`			    Eliminación de usuario de la BBDD


- DELETE 	`/diets/:dietid`				Eliminar una dieta
- POST	    `/diets	`						Crear una dieta
- GET 	    `/diets/:dietid`				Ver el detalle de una dieta segun la modalidad

>##Not Working:

###*----------------------------User Related----------------------------------------------*

- PUT 	`/users/:userid`				    Actualización del perfil
- GET 	`/users/:userid/diets/:actualweek`	Lista de dietas del usuario
- GET 	`/users/:userid/routines`			Lista de rutinas del usuario
- GET 	`/users/:userid/trainers`			Lista de entrenadores del usuario
###*----------------------------Diet Related----------------------------------------------*

- POST 	`/diets/:dietid/:userid`			Añadir dieta a usuario
- GET 	`/diets/:dietid/:week/`				Ver el detalle de una dieta y filtrar por semana
- PUT 	`/diets/:dietid	`				    Actualizar una dieta
###*------------------------------Trainer Related------------------------------------------*

- POST 	`/trainers/:trainerid/:userid`		Añadir entrenador a usuario
- POST	`/trainers		`					Registrar un entrenador
- GET 	`/trainers/:trainer	`				Ver el detalle de un entrenador
- GET 	`/trainers/:trainer/:discipline	`	Ver el detalle de un entrenador segun la modalidad
- PUT 	`/trainers/:trainer	`				Actualizar un entrenador
- DELETE `/trainers/:trainer	`			Eliminar un entrenador
###*-------------------------------Routine Related----------------------------------------*

- POST 	`/routines/:routineid/:userid	`		Añadir rutina a usuario
- POST	`/routines	`						Crear una rutina
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
