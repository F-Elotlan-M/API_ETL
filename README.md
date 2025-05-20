Ejecutar los comando: 
# Dependencias principales
npm install express sequelize pg pg-hstore jsonwebtoken dotenv

# Dependencias de desarrollo
npm install --save-dev sequelize-cli nodemon

Copiar el .env

Creas la base de datos usando los datos de la cadena del .env

npm run db:migrate

