## MIDELWARE DE VERIFICACIÓN

- Esta en la carpeta _middlewares_
- En Config y en _index_ principal para autenticar una llave para que se pueda hacer peticiones.

## HASGHING DE CONTRASEÑAS

- El hashing de contraseñas encripta (hashea) el password para poder guardarlo en la base de datos ya que por motivos de seguridad no es recomendado guardar el password en crudo.
- `npm i bcrypt`
- Para hashear una contraseña usando bcrypt se hace el uso de la función .hash(), esta función recibe como primer parámetro la contraseña y después el número de salt. Esta función devuelve una promesa que se puede manejar con async/await
- `const hash = await bcrypt.hash(myPassword, 10);`
- Para verificar la contraseña se necesita el password en crudo y el hash generado, con ello se hace el uso de la función .compare() que recibe como primer parámetro la contraseña en crudo y después el hash.
- `const isMatch = await bcrypt.compare(myPassword, hash);`

## HASHING PARA USUARIOS

- Passport.js es una serie de librerías y estrategias que nos brinda para hacer la capa de autenticación, permite generar varias estrategias (twitter, github, facebook, etc.) teniendo un código base para logearnos de diferentes maneras.
- [Página oficial](https://www.passportjs.org/)
- Instalando passport: `npm i passport`
- `passport-local` permite hacer un login básico usando username y password, su instalación es: `npm install passport-local`
- Se crea la carpeta **utils/auth/strategies** donde se colocarán las estrategias a implementar.
- Se crea el archivo **local.strategy.js**, ahí se crea una instancia de Strategy la cual recibe una función callback con la lógica de negocio. Recibe tres parámetros: email, password y la función done que se usará cuando todo salga bien o mal.
- En este mismo archivo se crea una serie de validaciones, en primer lugar valida si existe el email y en segundo lugar valida si la password es correcta.
- Para la primera validación se busca el email y si no se encuentra, se ejecuta la función **done** lanzando un error de tipo boom (unauthorized) con un false (no se pudo hacer la validación).
- En la segunda validación ya se encontraron los datos de usuario en la base de datos, por lo tanto, verifica que la contraseña que envía el usuario sea la misma que la que se encuentra en la BD (hace una comparación). Si las contraseñas no son iguales se ejecuta la función done lanzando un error de tipo boom con un false.
- Si todo es correcto se ejecuta done indicando que no hay error (null) y enviando el usuario (user).
- Por defecto, la estrategia local maneja username y password, es posible cambiar esos valores por email y password mandando esas opciones antes de la función asíncrona con el uso de **usernameField** y **passwordField**.
- En el archivo `utils/auth/index.js` se definen las estrategias a usar, cabe mencionar que puede tener muchas estrategias de autenticación. Algo muy importante es que debe implementarse en el **index.js** del proyecto con `require('./utils/auth')`.
- En `user.service.js` se hacen las modificaciones permanentes, en este caso se crea el método **findByEmail** para buscar por el email que es nuestro username.
- Para implementar la estrategia se crea un nuevo `routing auth.router.js`, cada estrategia tiene un nombre clave y debido a que funciona como un middleware, se necesita dejarlo pasar a la lógica de servicio o conectarlo a un servicio principal, pero antes hacer la validación. En este caso se usa _passport_ y con el método **authenticate** se indica cuál estrategia se va a autenticar diciéndole que no se desea manejar sesiones `(session: false)` ya que posteriormente se implementará **JWT** para manejar sesiones.

- Si todo bien, entonces en el siguiente middleware se le envía un request con el usuario `(req.user)`.
- Se implementa el nuevo router en `routes/index.js `

## JWT (JSON WEB TOKENS)
- Existen librerías para firmar (generar) y verificar un token, en el sitio oficial de JWT recomienda algunas. En este caso se usará jsonwebtoken instalándola con el comando `npm install jsonwebtoken`.
- Para firmar un token se crea la siguiente estructura (archivo) `token-sign.js`
- La llave secreta **(secret)** debe estar en el lado del backend por una variable de ambiente, no debe estar en el código, ni en el frontend.
- El _payload_ es lo que se va a encriptar con el token, _sub_ (subject) es la forma en la que se va a identificar el usuario. El _scope_ a veces se utiliza para los permisos, se puede agregar más cosas, por ejemplo _role_.
- A la función signToken se le envía el _payload_ y el _secret_, y con la librería jwt se ejecuta la función `.sign()` enviando el _payload_ y _secret_. Con ello, ya se estaría firmando un **token**.
- Para verificar un token se requiere el _token_ y el _secret_, a la función **verifyToken** se le envía el _token_ y el _secret_, y con la librería jwt se ejecuta la función **.verify()** enviando el token y secret. Con ello, ya se estaría verificando un token.
- Cualquier persona que tenga el token puede ver la información que viaja en el payload, por esa razón no se recomienda guardar información sensible (email, password, servicio, key, etc.).
- Para los refresh tokens hay que definir un tiempo de expiración, eso se puede lograr pasando un tercer argumento de configuración a la función **sign**. Para hacer que expire el token después de un cierto tiempo sería:
- ```javascript
    const jwt = require('jsonwebtoken')

    const jwtConfig = {
    expiresIn: '7d',
    };
    const payload = {
    sub: user.id,
    role: "customer"
    }

    const token = jwt.sign(payload, process.env.JWTSECRET, jwtConfig)
 ```
 
- Observaciones: 
    - user es la instancia del usuario obtenido del modelo que tenga la propiedad Id del usuario.
    - Se utiliza sub por conveniencia porque así lo maneja el standar de JWT pero puede usarse el nombre que uno quiera mas info sobre los [claims disponibles aquí](https://datatracker.ietf.org/doc/html/rfc7519#section-4)
- Si en **expiresIn** se pone sólo número entonces lo considera en segundo, pero si es un string entonces deberá llevar la unidad para definir el tiempo de expiración, ejemplo:

```
60 * 60 === '1h’
60 * 60 * 24 === ‘1d’

pero si por accidente se pone un string sin unidad de tiempo entonces lo tomará como milisegundos:
“60” === “60ms”
```

## JWT EN EL SERVICIO

- En el archivo `auth.route.js` se hace la implementación del **JWT**, primero se hace la autenticación con la estrategia local y con ello se tiene al usuario `(req.user)`, por lo tanto, se crea el payload con los datos del usuario, posteriormente se firma el **token** con la función `.sign()` y como respuesta se envía un JSON con el user y el token.
- El **secret** es necesario para firmar el token, por ello se asigna en el archivo `.env`, una página para generar passwords con diferentes algoritmos es https://keygen.io/.
- La nueva variable de entorno se agrega a la configuración `config/config.js`
## PROTECCIÓN DE RUTAS
- Para proteger las rutas se instala la estrategia **passport-jwt**, esta estrategia va a capturar el token que viene del header, si el token está firmado con nuestra firma entonces lo va a autorizar, de otro modo no tendrá acceso a la ruta.
- Comando de instalación: `npm install passport-jwt`.
- Se crea la nueva estrategia `jwt.strategy.js`. Se requiere la _Strategy_ y _ExtractJwt_ (dónde el token está para que extraiga el token).
- Se crean las options, estas contienen:
    - **jwtFromRequest** → Indica de dónde se saca el token, en este caso del header como **bearer token**
    - **secretOrKey** → Cuál es el **secreto**, necesario para poder verificar si la firma es válida o no.
- La nueva estrategia **(JwtStrategy)** recibe las **options** y una función callback que recibe el **payload** del JWT y la función **done** que retorna el payload que ya verificó.
- La nueva estrategia se agrega a **`utils/auth/index.js`**
- Implementando la nueva estrategia a la ruta para crear categorías será como decir * “los clientes que tengan un JWT válido van a poder crear categorías”. *
- Se requiere **passport**, después se utiliza el método authenticate que recibe el nombre de la estrategia _jwt_ sin un manejo de sesión `(session: false)` en `categories.router.js`
- En resumen, primero se identifica al usuario **(passport.authenticate)**, después se validan los datos **(validatorHandler)** y si todo bien, se conecta a la capa de servicios para poder crear la categoría.
- En thunderclient se envía el token a través de los headers o usando la opción Bearer de la pestaña Auth.
## CONTROL DE ROLES
- Se debe trabajar en la gestión de permisos y roles ya que no todos deben poder crear categorías o crear usuarios, únicamente un usuario administrador podría hacer eso. Se crea un **middleware** que verifique que tipo de rol es, y lo que lo deje seguir o no.
- En **`auth.handler.js`** se crea la función **checkAdminRole** la cual verificará si el rol del usuario es admin o customer, si es admin entonces pasa al siguiente middleware, de lo contrario lanza un error **unauthorized**.
- A la ruta se le agrega el middleware, la lógica es:
    - Autenticar, verificar el token y obtener los datos del user **(passport.authenticate)**
    - Verificar el tipo de rol de user **(checkAdminRole)**.
    - Validar los datos del body **(validatorHandler)**
    - Conectarse al servicio.
- Cuando se desea escalar y tener más roles, la función **checkAdminRole** se vuelve poco mantenible, por ello creamos la función ***checkRoles*** que recibirá los roles que tendrán acceso a ese endpoint.
- Si en los roles se encuentra el rol del usuario, devolverá **true** y tendrá acceso al endpoint, de lo contrario devolverá false y arrojará error unauthorized.
- En resumen, la función **checkRoles** recibe un array de roles, verifica que **user.role** se encuentre en ese array, y si todo bien procede al siguiente middleware.
- Haciendo la implementación del middleware en la ruta queda de la siguiente manera: 
```
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkRoles('admin', 'seller'),
  validatorHandler(createCategorySchema, 'body'),
  async (req, res, next) => { .....
  ```
- Se recomienda utilizar la librería [accesscontrol](https://www.npmjs.com/package/accesscontrol) donde realmente y de forma explicita se gestionan permisos de una forma más profunda y avanzada.

## ORDENES DE PERFIL
- Para poder ver las órdenes de compra de un usuario podemos usar el token que tiene, obtener el **sub** y obtener la información directamente sin necesidad de enviar el ID del usuario.
- Se crea un nuevo método en el servicio **orders**, el método **findByUser** recibe el **userId** y realiza una consulta respecto a éste donde se incluye la asociación de user y customer, y se desea obtener el **id** del **customer** ya que únicamente se cuenta con el id de usuario, es por ello que se utiliza ** `where: {'$customer.user.id$': userId},`** es decir, le estamos diciendo a qué asociaciones estamos haciendo la consulta (ver archivo *order.servise.js*).
- Más información sobre este tipo de consultas https://sequelize.org/master/manual/eager-loading.html#complex-where-clauses-at-the-top-level
- Se crea un nuevo router **profile.router.js**, aquí se obtiene el id del usuario que está en este momento con **sesión** **`(const orders = await service.findByUser(user.sub))`**, el **id** está en el **sub** del payload. Es decir, ya no es necesario enviar el user id porque ya viene en el **token** y se va a obtener de ahí.
- Agregamos la nueva ruta **profile.router.js** a **routes/index.js** 

## MANEJO DE LA AUTENTIFICACIÓN DESDE EL CLIENTE
- Consideraciones a tener en cuenta:
    - Al hacer un login en la **API** nos da la información del usuario, pero también envían el **token**. Lo más importante es guardar el token porque debe enviarse en todas las peticiones.
    - En el **cliente** deberíamos tener un estado de **login**, es decir, una vez hecho un login exitoso se debería guardar un estado de sesión iniciada en el frontend.
    - Deberíamos **guardar** el estado **(el token)** en algún lugar, se recomienda una cookie. También se puede en LocalStorage, pero no es la mejor practica.
    - Cada vez que se envíe una petición **(request)** se debería enviar el token. Si se manejan librerías para hacer requests **(ej. axios)**, hay formas de interceptar la petición y poner el token en el **header**.
    - El **token** debería tener una **expiración**, se recomienda que expire en **15-20 minutos**, se puede implementar una técnica de **refresh token**. 
    - La **API** nos puede dar un **access token** y otro token aparte **(refresh token)** que nos servirá para generar un nuevo token cuando el **access token ya expiró**.
    - Se recomienda estar haciendo requests continuamente para no salir de la sesión.
    - Se pueden validar **permisos**, con el token se puede preguntar al backend qué tipo de perfil es, aunque para más seguridad sería mejor hacer un **request** para **obtener** el **perfil** del usuario para no guardar nada en algún lugar.
    - Más información de la implementación de los refresh token [aquí](https://www.geeksforgeeks.org/jwt-authentication-with-refresh-tokens/)

## RECUPERACIÓN DE CONTRASEÑAS
- Para hacer la recuperación de contraseñas se utilizará la librería [Nodemailer](https://nodemailer.com/about/), el comando de instalación es `npm install nodemailer`. Nos brinda un código base que esta en la documentación.
- La librería tiene un servidor que emula pruebas de email **(testAccount)**, en **transporter** se ve por dónde se va a enviar el correo, qué servidor de **smtp**, se coloca la configuración del email. En un email real, se cambia el **port a 465**, se coloca **true** en **secure** y se cambian los datos de la propiedad **auth** por el **email y password** que se usará en la aplicación.
- En **info** se coloca de quíen, para quién, el asunto y cuerpo del mensaje.
- Para usar **gmail** como servidor smtp, en la opción de **Cuenta → Seguridad**, se crea una **contraseña** para aplicación (se debe tener configurada la verificación en dos pasos). Esa contraseña será únicamente para la aplicación y debe ser puesta como **variable de entorno** al igual que el **user (email)**. Por ejemplo: ver archivo **nodemailer.js**

## IMPLEMENTANDO EL ENVIO DE EMAILS
- Debido a que hay mucha lógica regada sobre autenticación, se crea un nuevo servicio para auth y hacer esto más mantenible.
- **auth.service.js**, el método **getUser** contiene la lógica para autenticar un usuario, **signToken** contiene la lógica para firmar un token y **sendMail** contiene la lógica para enviar un email con sus respectectivas variables de ambiente (ver archivo **auth.service.js** )
- Se hacen las modificaciones pertinentes en los archivos **auth.route.js** y **local.strategy.js** donde se hace el uso del nuevo servicio.
- **auth.route.js**, en el caso del endpoint **/recovery**, se obtiene el email del body, posteriormente se ejecuta el método **sendMail** que viene desde el servicio
- **local.strategy.js**, el método **getUser** contiene la lógica antes establecida en este archivo para autenticar un usuario

## GENERANDO LINKS DE RECUPERACION
- Se reacomoda un poco el servicio **auth.service.js** haciendo una separación de esponsabilidades, se crea el método **sendRecovery** el cual contiene la lógica para generar un link para recuperar la contraseña y el método **sendMail** contiene la configuración para poder enviar un email **(transporter)**.
- Lo que hace es:
    - Validar si el email se encuentra en la base de datos, si todo bien, se obtiene el **user**.
    - Se genera un payload con el **user.id**.
    - Se genera un **token** que expira en 15 minutos, incluye el **payload** con el **id** del usuario que solicita recuperar su contraseña. Por seguridad, el **token** debe **guardarse** en la **BD** y comprobarlo para evitar que envíen un token indeseado.
    - Se genera un link que incluye el **token** necesario para recuperar la contraseña. Desde el **frontend** debe haber una vista para ello.
    - Se llama el método **update** de **UserService** para actualizar los datos del usuario asignandole el token generado.
    - Se establece el cuerpo del email.
    - Se ejecuta el método **sendMail** que recibe el cuerpo del email.
- En el endpoint **/recovery** de **auth.router.js** se hace el cambio del método **sendMail** por **sendRecovery**
- Debido a que se necesita ingresar un nuevo campo, se requiere generar una nueva migración **(recovery-token-field)**, en el boilerplate de dicha migración se agrega una nueva columna a **USER_TABLE**. Esto contiene el nombre de la tabla, el nombre del nuevo campo y los tipos de datos, así como un método para hacer rollback **(removeColumn)**
- También es necesario agregar un nuevo campo al modelo **user.model.js**, este campo se llama **recoveryToken**
- Después de tener el boilerplate listo y haber modificado el modelo de usuario, se corre la migración con `npm run migrations:run`.
- Y ya esta listo para usarse el endpoint `localhost:3000/api/v1/auth/recovery`
- En el body va el `  "email":"tumail1@mail.com"`

## VALIDANDO TOKENS PARA CAMBIO DE CONTRASEÑA
- El email enviado al usuario para recuperar contraseña contiene un link para ello, al dar click en el link nos debe enviar a una vista para la recuperación de la contraseña y al dar click en Confirm, debemos recibir el **token** y la **nueva contraseña**. Por lo tanto, se debe hacer el proceso de **validación del token** (válido y sin expirar), si existe el usuario, etc.
- En el **auth.router.js** se crea un nuevo endpoint **/change-password** para cambiar el password. Este endpoint va a **obtener el token** y la **nueva contraseña del body**, y ejecuta el método **changePassword** para validar que el token y la nueva contraseña sean correctos.
- El método **changePassword** en el archivo **auth.serveice.js** recibe el **token** y la **nueva contraseña**, primero se hace una validación donde se verifica el token, esto retorna el payload que tiene ese token. Del payload se obtiene el **user (payload.sub)** y lo busca en la BD con el método **findOne**.
- Del usuario encontrado, se verifica que el campo **recoveryToken** sea el que está en la BD.
- Posteriormente, para actualizar la contraseña se necesita **borrar** el **token** y **hashear la nueva contraseña (service.update)**.
- Como buena practica evitemos atrapar errores en los proveedores o servicios, podemos lanzarlos desde los servicios, y debido a que ese **service** esta siendo llamado desde el **controller** dentro de un **try**, pues que el **controller o router** se encargue de **atraparlos y mostrarlos**. Por lo que la función **changePassword** del archivo **auth.service.js** quedaría así:

```javascript
  async changePassword(token, newPassword) {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userService.findOne(payload.sub); // id

    if (!user || user.recoveryToken !== token) {
      throw boom.unauthorized();
    }

    const hash = bcrypt.hash(newPassword, 10);
    await userService.update(user.id, { recoveryToken: null, password: hash });
    return { message: 'Password updated' }
  }
```