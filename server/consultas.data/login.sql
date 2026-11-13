-- Sentencia para poder obtener un usuario por su nombre de usuario y contraseña ----
SELECT * FROM usuarios 
where
	usuarios.usuario = "josesion" and
    usuarios.contrasena = "$2b$10$H06H4pBTflaIKIhV11OLrOWYPPM2yy2IFwvzL7SCuUKqVrCuzgyPu" ;
