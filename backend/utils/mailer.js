const nodemailer = require('nodemailer');
const path = require('path');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'templi.contacto@gmail.com',
    pass: 'dpes ggyq lqwr wwce'
  }
});

const sendMail = async (to) => {
  const mailOptions = {
    from: 'templi.contacto@gmail.com',
    to,
    subject: '¡Bienvenido a Templi!',
    html: `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>¡Gracias por unirte a Templi!</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Inter', Arial, sans-serif;
          background-color: #fff;
          color: #1a1a1a;
          text-align: center;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 30px 20px;
        }
        .logo img {
          width: 140px;
          margin-bottom: 20px;
        }
        h1 {
          font-size: 22px;
          font-weight: 600;
          margin: 0 0 15px;
        }
        .subtitle {
          color: #777;
          font-size: 16px;
          line-height: 1.5;
          margin-bottom: 25px;
        }
        .wave {
          display: block;
          margin: 20px auto;
          width: 120px;
        }
        .section-text {
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 20px;
        }
        .highlight {
          font-weight: 500;
          color: #000;
        }
        .help {
          font-size: 16px;
          margin-top: 25px;
          line-height: 1.6;
        }
        .signature {
          margin-top: 8px;
          font-weight: 500;
        }
        .team {
          font-size: 14px;
          color: #888;
        }
        .footer {
          font-size: 12px;
          color: #9ca3af;
          margin-top: 30px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">
          <img src="cid:templilogo" alt="Templi">
        </div>
        <h1>¡Gracias por unirte a Templi! 🎉</h1>
        <p class="subtitle">
          Ya eres parte de una comunidad donde podrás comprar o vender recursos digitales como PDFs, <br> 
          plantillas editables, imágenes y mucho más.
        </p>

        <img class="wave" src="cid:yellowwave" alt="decoración">

        <p class="section-text">
          Desde tu cuenta podrás: <br>
          Explorar cientos de archivos listos para descargar y si eres vendedor, <br> 
          subir y gestionar tus propios archivos fácilmente.
        </p>

        <img class="wave" src="cid:yellowwave" alt="decoración">

        <p class="help">
          Si tienes alguna pregunta, estamos aquí para ayudarte en todo momento.
        </p>
        <p class="signature">¡Nos encanta tenerte aquí!</p>
        <p class="team">El equipo de Templi.</p>

        <div class="footer">
          Si tú no creaste esta cuenta, por favor ignora este mensaje o contáctanos.
        </div>
      </div>
    </body>
    </html>
    `,
    attachments: [
      {
        filename: 'templi-logo.PNG',
        path: path.join(__dirname, '../../frontend/public/images/templi-logo.PNG'),
        cid: 'templilogo'
      },
      {
        filename: 'yellow-wave.png',
        path: path.join(__dirname, '../../frontend/public/images/yellow-wave.png'),
        cid: 'yellowwave'
      }
    ]
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    throw error;
  }
};

module.exports = { sendMail };
