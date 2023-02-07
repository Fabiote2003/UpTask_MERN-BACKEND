import nodemailer from "nodemailer";

const emailRegistro = async (datos) => {
    const {email, nombre, token} = datos;

  //Mover hacia variables de entorno
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
      const info = await transport.sendMail({
        from: '"UpTask - Administrador de Proyectos" <fabiote2003@gmail.com>',
        to: email,
        subject: "UpTask - Comprueba tu cuenta",
        text: "Comprueba tu cuenta en UpTask",
        html: `<p>Hola ${nombre}, comprueba tu cuenta en UpTask</p>
        <p>Tu cuenta ya esta casi lista, solo debes comprobarla en el siguiente enlace:
          <a href="${process.env.FRONTEND_URL}/confirmar/${token}">Confirmar Cuenta</a>
        </p>
          <p>Si tu no creaste esta cuenta, puedes ignorar este email.</p>
        </p>
        
        `
      })
}

const emailOlvidePassword = async (datos) => {
  const {email, nombre, token} = datos;

  //Mover hacia variables de entorno
  const transport = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const info = await transport.sendMail({
      from: '"UpTask - Administrador de Proyectos" <fabiote2003@gmail.com>',
      to: email,
      subject: "UpTask - Reestablece tu Contraseña",
      text: "Reestablece tu password",
      html: `<p>Hola ${nombre}, has solicitado reestablecer tu contraseña</p>
      <p>Sigue el siguiente enlace para generar un nuevo password:
        <a href="${process.env.FRONTEND_URL}/olvide-password/${token}">Reestablecer password</a>
      </p>
        <p>Si tu no solicitaste este email, puedes ignorar este mensaje.</p>
      </p>
      
      `
    })
}

export {
    emailRegistro,
    emailOlvidePassword
}