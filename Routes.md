#Routes# ``http://localhost:3005/api``

##Working:
POST `/register`		Registro de Usuario (Se añade a la BBDD)

POST `/login	`		Logueo de Usuario (Se le da un token)

POST `/logout`		Destrucción del token

GET `/diets	`		Lista de dietas

GET `/routines`		Lista de rutinas

GET `/trainers`		Lista de entrenadores


/**/Protected\**\

GET 		`/users	`						Lista de Usuarios

GET 		`/users/:userid	`				Detalle de un usuario

DELETE 		`/users/:userid`					Eliminación de usuario de la BBDD

POST 		`/publications	`				Crear una publicación identificandose con el token

GET 		`/users/:userid/publications` 	Devuelve la id de la publicaciones hechas por el usuario


##Not Working:

UPDATE 	`/users/:userid`						Actualización del perfil

GET 	`/users/:userid/diets`				Lista de dietas del usuario

GET 	`/users/:userid/routines`				Lista de rutinas del usuario

GET 	`/users/:userid/trainers`				Lista de entrenadores del usuario

GET 	`/publications/:publicationid`		Ver una publicación en concreto

UPDATE	`/publications/:publicationid`		Actualizar una publicación

DELETE	`/publications/:publicationid`		Eliminar una publicación
###*------------------------------------------------------------------------*
POST 	`/diets/addtouser/:userid`			Añadir dieta a usuario

POST	`/diets	`							Crear una dieta

GET 	`/diets/:dietid`						Ver el detalle de una dieta

UPDATE 	`/diets/:dietid	`					Actualizar una dieta

DELETE 	`/diets/:dietid`						Eliminar una dieta
###*------------------------------------------------------------------------*

POST 	`/trainers/addtouser/:userid`			Añadir entrenador a usuario
POST	`/trainers		`					Registrar un entrenador
GET 	`/trainers/:trainer	`				Ver el detalle de un entrenador
UPDATE 	`/trainers/:trainer	`				Actualizar un entrenador
DELETE 	`/trainers/:trainer	`				Eliminar un entrenador
###*------------------------------------------------------------------------*
POST 	`/routines/addtouser/:userid	`		Añadir rutina a usuario

POST	`/routines	`						Crear una rutina

GET 	`/routines/:routine	`				Ver el detalle de una rutina

UPDATE 	`/routines/:routine	`				Actualizar una rutina

DELETE 	`/routines/:routine	`				Eliminar una rutina
